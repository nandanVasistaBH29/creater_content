import busboy from "busboy";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
export const config = {
  api: {
    bodyParser: false, //if bodyParser is enabled it is giving max limit of 1mb size
  },
};
const CHUNK_START_IN_BYTES = 1000000; //1M bytes in 1Mb
async function uploadVideoStream(req, res) {
  const video_id = uuidv4();
  const bb = busboy({ headers: req.headers });
  bb.on("file", async (_, file, info) => {
    //passing _ as first arg will ignore the first arg
    const filePath = `./videos/${video_id}.mp4`;
    const stream = fs.createWriteStream(filePath);
    file.pipe(stream);
  });
  bb.on("close", () => {
    res.writeHead(200, { Connection: "close" });
    res.end(JSON.stringify({ success: "Uploaded Successfully", video_id }));
  });
  req.pipe(bb);
  return;
}
function getVideoStream(req, res) {
  const range = req.headers.range;
  const video_id = req.query.video_id; //API is /api/videos/video?video_id=
  if (!range) {
    return res.status(400).send("Range must be provided Browser issue");
  }
  const video_path = `./videos/${video_id}.mp4`;
  const video_size_in_bytes = fs.statSync(video_path).size;
  // console.log(video_size_in_bytes);
  const chunck_start = Number(range.replace(/\D/g, ""));

  //calc end of the chunck
  const chunck_end = Math.min(
    chunck_start + CHUNK_START_IN_BYTES,
    video_size_in_bytes - 1
  );
  const content_length = chunck_end - chunck_start + 1;

  const headers = {
    "Content-Range": `bytes ${chunck_start}-${chunck_end}/${video_size_in_bytes}`,
    "Accept-Ranges": "bytes",
    "Content-Length": content_length,
    "Content-Type": "video/mp4",
  };
  //Partial Response is 206 you're not sending entire data
  res.writeHead(206, headers);

  const videostream = fs.createReadStream(video_path, {
    start: chunck_start,
    end: chunck_end,
  });
  videostream.pipe(res);
}
export default function handler(req, res) {
  const method = req.method;
  if (method === "GET") {
    return getVideoStream(req, res);
  }
  if (method === "POST") {
    return uploadVideoStream(req, res);
  }

  //405-> Method not allowed
  return res.status(405).json({ err: `Method ${method} not allowed` });
}
