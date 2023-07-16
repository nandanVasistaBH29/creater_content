import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

async function getVideoStream(req, res) {
  const range = req.headers.range;
  const videoId = req.query.video_id;

  const CHUNK_SIZE = 10 ** 6; // 1MB (adjust as needed)

  if (!range) {
    return res.status(400).send("Range must be provided. Browser issue.");
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${videoId}.mp4`,
  };

  try {
    const data = await s3.getObject(params).promise();
    const videoSizeInBytes = data.ContentLength;

    const chunkStart = Number(range.replace(/\D/g, ""));
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, videoSizeInBytes - 1);
    const contentLength = chunkEnd - chunkStart + 1;

    const headers = {
      "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${videoSizeInBytes}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
      Connection: "close",
    };

    res.writeHead(206, headers); //still data has to come 206
    res.end(data.Body.slice(chunkStart, chunkEnd + 1));
  } catch (err) {
    console.error("Error retrieving video from S3:", err);
    return res.status(500).send("Internal Server Error");
  }
}

export default function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    return getVideoStream(req, res);
  }

  // 405 -> Method not allowed
  return res.status(405).json({ err: `Method ${method} not allowed` });
}
