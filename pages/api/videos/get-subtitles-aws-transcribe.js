import AWS from "aws-sdk";
import fs from "fs";

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});
import path from "path";

import { downloadFileFromS3 } from "./upload-video-multiple-version-s3";
import srtConvert from "aws-transcription-to-srt";

//its important to note that AWS transcribe need the audio file in S3 ( it can be even video file ) but it has to be in s3
//and it doesn't return the srt it does json file

const rootFolder = path.resolve("./");

export default async function generateSubtitles(
  videoId,
  selectedLanguageOption
) {
  try {
    const transcribe = new AWS.TranscribeService({
      region: process.env.S3_BUCKET_REGION,
    });

    const params = {
      Media: {
        MediaFileUri: `s3://${process.env.S3_BUCKET_NAME}/${videoId}.wav`,
      },
      MediaFormat: "wav",
      OutputBucketName: process.env.S3_BUCKET_NAME,
      OutputKey: `${videoId}.json`,
      LanguageCode: selectedLanguageOption,
      TranscriptionJobName: `${videoId}-subtitles-generation`,
    };

    const response = await transcribe.startTranscriptionJob(params).promise();
    console.log(
      "Transcription job started:",
      response.TranscriptionJob.TranscriptionJobName
    );

    const transcriptionJobName = response.TranscriptionJob.TranscriptionJobName;

    let jobStatus;
    do {
      const { TranscriptionJob } = await transcribe
        .getTranscriptionJob({ TranscriptionJobName: transcriptionJobName })
        .promise();
      jobStatus = TranscriptionJob.TranscriptionJobStatus;
      console.log("Transcription job status:", jobStatus);
      if (jobStatus !== "COMPLETED") {
        // Wait for 5 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    } while (jobStatus !== "COMPLETED");
    await downloadFileFromS3(
      `${videoId}.json`,
      rootFolder + `/subtitles/${videoId}.json`
    );
    console.log(" Subtitles file downloaded. Transcription job completed.");
    const data = fs.readFileSync(rootFolder + `/subtitles/${videoId}.json`);
    const json = JSON.parse(data);
    const srt_data = srtConvert(json);
    fs.writeFile(
      rootFolder + `/subtitles/${videoId}.srt`,
      srt_data,
      async (err) => {
        if (err) {
          console.error(err);
        }
        console.log("done srt");
      }
    );
  } catch (error) {
    console.error("Error generating subtitles:", error);
  }
}
