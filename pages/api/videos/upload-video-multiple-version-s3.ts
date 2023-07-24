import type { NextApiRequest, NextApiResponse } from "next";
import { promises } from "fs";
import { IncomingForm } from "formidable";
import { v4 as uuidv4 } from "uuid";
import {
  convertVideo,
  RESOLUTIONS,
  convertVideoToThumbnail,
  extractAudio,
} from "../../../ffmpeg/config";
import path from "path";
import AWS from "aws-sdk";
import generateSubtitles from "./get-subtitles-aws-transcribe";
import { burnSubtitles } from "../../../ffmpeg/config";

import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json(`${err}`);
      return;
    }

    if (!Array.isArray(files.video)) {
      res.status(400).json(`Give a file`);
      return;
    }

    const selectedLanguageOption = fields.selectedLanguageOption[0];
    const timestamp_thumbnail = fields.timestamp[0];

    let { filepath, originalFilename } = files.video[0];

    if (!originalFilename) {
      res.status(500).json(`There's no originalFilename...?`);
      return;
    }

    const rootFolder = path.resolve("./");
    const videosFolder = path.join(rootFolder, "videos");
    const videoId = uuidv4(); // Generate unique video ID
    const originalFileExt = path.extname(originalFilename);
    let originalFilePath = path.join(
      videosFolder,
      `${videoId}${originalFileExt}`
    );
    const thumbnailFolder = path.join(rootFolder, "thumbnails");
    const audioFolder = path.join(rootFolder, "audios");
    const subtitlesFolder = path.join(rootFolder, "subtitles");
    try {
      await promises.mkdir(videosFolder, { recursive: true });
      await promises.mkdir(thumbnailFolder, { recursive: true });
      await promises.mkdir(audioFolder, { recursive: true });
      await promises.mkdir(subtitlesFolder, { recursive: true });
      // Rename file to the generated video ID
      await promises.rename(filepath, originalFilePath);
      await extractAudio(originalFilePath, audioFolder + `/${videoId}.wav`);
      await uploadFile(audioFolder + `/${videoId}.wav`, `${videoId}.wav`); //upload the audio file to s3 so that AWS transcriber can generate subtitles
      try {
        await generateSubtitles(videoId, selectedLanguageOption);
        const videosFolder = path.join(rootFolder, "videos");
        await burnSubtitles(
          videosFolder + `/${videoId}.mp4`,
          rootFolder + `/subtitles/${videoId}.srt`,
          videosFolder + `/${videoId}_burnt.mp4`
        );
        fs.unlinkSync(videosFolder + `/${videoId}.mp4`);
        fs.renameSync(
          videosFolder + `/${videoId}_burnt.mp4`,
          videosFolder + `/${videoId}.mp4`
        );
        console.log("burrning video is done");
      } catch (err) {
        console.log(err);
      }
      // Convert video to 720p & 360p & 144p (assuming it's 1080p)
      const resolutionPaths = RESOLUTIONS.map(({ size, dimensions }) => {
        const convertedFilename = `${videoId}__${size}${originalFileExt}`;
        return {
          size,
          dimensions,
          filePath: path.join(videosFolder, convertedFilename),
        };
      });
      let i = 2; //3 versions are there with index 2,1,0 -> 720,360,144p
      await Promise.all(
        resolutionPaths.map(async ({ filePath, dimensions }) => {
          await convertVideo(originalFilePath, filePath, dimensions);
          await uploadFile(filePath, `${videoId}_${RESOLUTIONS[i--].size}.mp4`);
          deleteLocalserverFile(filePath);
        })
      );
      await convertVideoToThumbnail(
        videosFolder + `/${videoId}.mp4`,
        thumbnailFolder + "/" + videoId + ".png",
        RESOLUTIONS[0].dimensions,
        timestamp_thumbnail
      )
        .then(async (outputPath) => {
          await uploadFile(
            thumbnailFolder + "/" + videoId + ".png",
            `${videoId}_thumbnail.png`
          );
          deleteLocalserverFile(thumbnailFolder + "/" + videoId + ".png");
        })
        .catch((error) => {
          console.error("Error generating thumbnail:", error);
        });

      //deleting the original files in the local server
      deleteLocalserverFile(videosFolder + `/${videoId}.mp4`);
      deleteLocalserverFile(audioFolder + `/${videoId}.wav`);
      deleteLocalserverFile(subtitlesFolder + `/${videoId}.srt`);
      deleteLocalserverFile(subtitlesFolder + `/${videoId}.json`);
      console.log("deleted video audio and subtitles from server");
      await deleteFileFromS3(`${videoId}.wav`);
      await deleteFileFromS3(`${videoId}.json`);
      console.log("audio and transcribe from s3 deleted");
      res
        .status(200)
        .json({ success: "Video uploaded successfully.", video_id: videoId });
    } catch (error) {
      console.error(error);
      res.status(500).json("An error occurred while uploading the video.");
    }
  });
}
const deleteLocalserverFile = (localFileName: string) => {
  fs.unlink(localFileName, (err) => {
    if (err) {
      console.error("Error deleting original video file", err);
      return;
    }
  });
};
const uploadFile = async (fileName: string, key_s3: string): Promise<void> => {
  const fileContent = fs.readFileSync(fileName);
  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key_s3, // File name you want to save as in S3
    Body: fileContent,
  };

  try {
    const s3 = new AWS.S3();
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully: ${fileName}`);
  } catch (err) {
    console.log(err);
  }
};

export async function downloadFileFromS3(
  key: string,
  localFilePath: string
): Promise<void> {
  const s3 = new AWS.S3();

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  const fileStream = fs.createWriteStream(localFilePath);

  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .on("error", (error: Error) => {
        reject(error);
      })
      .pipe(fileStream)
      .on("error", (error: Error) => {
        reject(error);
      })
      .on("close", () => {
        resolve();
      });
  });
}
async function deleteFileFromS3(s3Key: string): Promise<void> {
  try {
    const s3 = new AWS.S3({ region: process.env.S3_BUCKET_REGION });

    const deleteParams: AWS.S3.DeleteObjectRequest = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    };

    await s3.deleteObject(deleteParams).promise();

    console.log(`File deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}
