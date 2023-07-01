import path from "path";
import fs from "fs";

export default function handler(req, res) {
  const { video_id } = req.query;
  const thumbnailPath = path.join(
    process.cwd(),
    "thumbnails",
    `${video_id}.png`
  );

  try {
    const thumbnail = fs.readFileSync(thumbnailPath);
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(thumbnail);
  } catch (error) {
    try {
      const err_thumbnailPath = path.join(
        process.cwd(),
        "thumbnails",
        `404-thumbnail-not-found.png`
      );
      const err_thumbnail = fs.readFileSync(err_thumbnailPath);
      res.setHeader("Content-Type", "image/png");
      res.status(200).send(err_thumbnail);
    } catch (err) {
      res.status(400).json({ err });
    }
  }
}
