import type { NextApiRequest, NextApiResponse } from "next";
import { promises } from "fs";
import { IncomingForm } from "formidable";
import { v4 as uuidv4 } from "uuid";
import {
  convertVideo,
  RESOLUTIONS,
  convertVideoToThumbnail,
} from "../../../ffmpeg/config";
import path from "path";
import AWS from "aws-sdk";
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
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

    try {
      // Create the "videos" folder if it doesn't exist
      await promises.mkdir(videosFolder, { recursive: true });
      await promises.mkdir(thumbnailFolder, { recursive: true });
      // Rename file to the generated video ID
      await promises.rename(filepath, originalFilePath);
      // Convert video to 720p & 360p & 144p (assuming it's 1080p)
      const resolutionPaths = RESOLUTIONS.map(({ size, dimensions }) => {
        const convertedFilename = `${videoId}__${size}${originalFileExt}`;
        return {
          size,
          dimensions,
          filePath: path.join(videosFolder, convertedFilename),
        };
      });
      let i = 0;
      await Promise.all(
        resolutionPaths.map(async ({ filePath, dimensions }) => {
          await convertVideo(originalFilePath, filePath, dimensions);
          await uploadFile(filePath, `${videoId}_${RESOLUTIONS[i++].size}.mp4`);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting  temp file", err);
              return;
            }
          });
        })
      );

      await convertVideoToThumbnail(
        videosFolder + `/${videoId}.mp4`,
        thumbnailFolder + "/" + videoId + ".png",
        RESOLUTIONS[0].dimensions
      )
        .then(async (outputPath) => {
          await uploadFile(
            thumbnailFolder + "/" + videoId + ".png",
            `${videoId}_thumbnail.png`
          );
          fs.unlink(thumbnailFolder + "/" + videoId + ".png", (err) => {
            if (err) {
              console.error("Error deleting original video file", err);
              return;
            }
          });
        })
        .catch((error) => {
          console.error("Error generating thumbnail:", error);
        });

      //uploading the original version
      await uploadFile(videosFolder + `/${videoId}.mp4`, `${videoId}.mp4`);
      //deleting the original file in the local server
      fs.unlink(videosFolder + `/${videoId}.mp4`, (err) => {
        if (err) {
          console.error("Error deleting original video file", err);
          return;
        }
      });
      res
        .status(200)
        .json({ success: "Video uploaded successfully.", video_id: videoId });
    } catch (error) {
      console.error(error);
      res.status(500).json("An error occurred while uploading the video.");
    }
  });
}

const uploadFile = async (fileName, key_s3) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key_s3, // File name you want to save as in S3
    Body: fileContent,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully`);
  });
};
