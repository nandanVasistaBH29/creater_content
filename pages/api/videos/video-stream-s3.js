import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: "YOUR_ACCESS_KEY",
  secretAccessKey: "YOUR_SECRET_KEY",
  region: "YOUR_REGION",
});

function getVideoStream(req, res) {
  const range = req.headers.range;
  const videoId = req.query.video_id;

  if (!range) {
    return res.status(400).send("Range must be provided. Browser issue.");
  }

  const params = {
    Bucket: "YOUR_BUCKET_NAME",
    Key: `${videoId}.mp4`,
  };

  s3.headObject(params, (err, data) => {
    if (err) {
      console.error("Error retrieving video from S3:", err);
      return res.status(500).send("Internal Server Error");
    }

    const videoSizeInBytes = data.ContentLength;

    const CHUNK_SIZE = 10 ** 6; // 1MB (adjust as needed)

    const chunkStart = Number(range.replace(/\D/g, ""));
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, videoSizeInBytes - 1);
    const contentLength = chunkEnd - chunkStart + 1;

    const headers = {
      "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${videoSizeInBytes}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = s3.getObject(params).createReadStream({
      start: chunkStart,
      end: chunkEnd,
    });

    videoStream.pipe(res);
  });
}

export default function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    return getVideoStream(req, res);
  }

  // 405 -> Method not allowed
  return res.status(405).json({ err: `Method ${method} not allowed` });
}
