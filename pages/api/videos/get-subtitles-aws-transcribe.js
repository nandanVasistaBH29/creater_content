import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

import { downloadFileFromS3 } from "./upload-video-multiple-version-s3";

export default async function generateSubtitles(
  subtitlesFolderPath_op,
  videoId
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
      OutputKey: `${videoId}.srt`,
      LanguageCode: "en-US",
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
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } while (jobStatus !== "COMPLETED");

    console.log("Subtitles file downloaded.");
    console.log("Transcription job completed.");
  } catch (error) {
    console.error("Error generating subtitles:", error);
  } finally {
    await downloadFileFromS3(`${videoId}.srt`, subtitlesFolderPath_op);
  }
}
