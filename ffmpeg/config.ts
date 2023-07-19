import { execFile } from "child_process";

const FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg";

export function convertVideo(
  src: string,
  out: string,
  resolution: string
): Promise<string> {
  const args = [
    "-i",
    src, // input video
    "-c:v",
    "libx264", // copy video with codec h264
    "-crf",
    "26", // quality, the higher the worse (but better compression), 51 max
    "-s",
    resolution, // convert resolution
    "-pix_fmt",
    "yuv420p", // pixel color format
    "-map",
    "0", // include all streams from the input into the output
    out, // output file
  ];

  return new Promise((resolve, reject) => {
    execFile(FFMPEG_PATH, args, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stderr);
    });
  });
}

export const RESOLUTIONS = [
  { size: "720p", dimensions: "1280x720" },
  { size: "360p", dimensions: "640x360" },
  { size: "144p", dimensions: "256x144" },
];

export async function convertVideoToThumbnail(
  src: string,
  out: string,
  resolution: string
): Promise<string> {
  const args = [
    "-i",
    src, // input video
    "-ss",
    "00:00:01", // capture the thumbnail at 1 second into the video
    "-vframes",
    "1", // generate a single frame (thumbnail)
    "-s",
    resolution, // thumbnail resolution
    out, // output thumbnail file
  ];

  return new Promise((resolve, reject) => {
    execFile("ffmpeg", args, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(out);
    });
  });
}

export async function extractAudio(src: string, out: string): Promise<string> {
  const args = [
    "-i",
    src, // input video
    "-vn", // disable video
    "-acodec",
    "pcm_s16le", // audio codec
    "-ar",
    "44100", // audio sample rate
    "-ac",
    "2", // number of audio channels
    "-f",
    "wav", // output format
    out, // output audio file
  ];

  return new Promise((resolve, reject) => {
    execFile(FFMPEG_PATH, args, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(out);
    });
  });
}

export async function burnSubtitles(
  videoFilePath: string,
  subtitlesFilePath: string,
  outputFilePath: string
): Promise<void> {
  const args = [
    "-i",
    videoFilePath,
    "-vf",
    `subtitles=${subtitlesFilePath}:force_style='Fontsize=14'`,
    "-c:v",
    "libx264",
    "-crf",
    "26",
    "-pix_fmt",
    "yuv420p",
    "-map",
    "0",
    "-y", // Overwrite output file if it already exists
    outputFilePath,
  ];

  await new Promise<void>((resolve, reject) => {
    execFile(FFMPEG_PATH, args, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
