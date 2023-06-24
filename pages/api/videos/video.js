import busboy from "busboy";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
export const config = {
  api: {
    bodyParser: false, //if bodyParser is enabled it is giving max limit of 1mb size
  },
};
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
export default function handler(req, res) {
  const method = req.method;
  if (method === "GET") {
    return res.status(200).json({ name: "hello world" });
  }
  if (method === "POST") {
    return uploadVideoStream(req, res);
  }

  //405-> Method not allowed
  return res.status(405).json({ err: `Method ${method} not allowed` });
}
