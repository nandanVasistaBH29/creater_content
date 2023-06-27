import type { NextApiRequest, NextApiResponse } from "next";
import { promises } from "fs";
import { IncomingForm } from "formidable";
import { v4 as uuidv4 } from "uuid";
import { convertVideo, RESOLUTIONS } from "../../../ffmpeg/config";
import path from "path";

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

    const { filepath, originalFilename } = files.video[0];

    if (!originalFilename) {
      res.status(500).json(`There's no originalFilename...?`);
      return;
    }

    const rootFolder = path.resolve("./");
    const videosFolder = path.join(rootFolder, "videos");
    const videoId = uuidv4(); // Generate unique video ID
    const originalFileExt = path.extname(originalFilename);
    const originalFilePath = path.join(
      videosFolder,
      `${videoId}${originalFileExt}`
    );

    try {
      // Create the "videos" folder if it doesn't exist
      await promises.mkdir(videosFolder, { recursive: true });
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

      await Promise.all(
        resolutionPaths.map(({ filePath, dimensions }) =>
          convertVideo(originalFilePath, filePath, dimensions)
        )
      );

      res
        .status(200)
        .json({ success: "Video uploaded successfully.", video_id: videoId });
    } catch (error) {
      console.error(error);
      res.status(500).json("An error occurred while uploading the video.");
    }
  });
}
