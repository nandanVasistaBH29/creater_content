import path from "path";
// import fs from "fs";
import AWS from "aws-sdk";
const THUMBNAIL_404_KEY = "404-thumbnail-not-found.png";

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

export default async function handler(req, res) {
  const { video_id } = req.query;

  //non cloud
  // const thumbnailPath = path.join(
  //   process.cwd(),
  //   "thumbnails",
  //   `${video_id}.png`
  // );

  try {
    // const thumbnail = fs.readFileSync(thumbnailPath);
    const thumbnail = await readImageFromS3(`${video_id}_thumbnail.png`);
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(thumbnail);
  } catch (error) {
    try {
      const error_thumbnail = await readImageFromS3(THUMBNAIL_404_KEY);
      res.status(200).send(error_thumbnail);
    } catch (err) {
      res.status(400).json({ err });
    }
  }
}

async function readImageFromS3(key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });
}
