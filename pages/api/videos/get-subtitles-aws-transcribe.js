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
    // Create an instance of the AWS Transcribe service
    const transcribe = new AWS.TranscribeService();

    // Configure the parameters for the transcription job
    const params = {
      Media: {
        MediaFileUri: `s3://${process.env.S3_BUCKET_NAME}/${videoId}.wav`,
      },
      MediaFormat: "wav", // Specify the format of the audio file
      OutputBucketName: process.env.S3_BUCKET_NAME,
      OutputKey: `${videoId}.srt`,
      LanguageCode: "en-US",
      TranscriptionJobName: `${videoId}-subtitles-generation`,
    };

    // Start the transcription job
    const response = await transcribe.startTranscriptionJob(params).promise();
    console.log(
      "Transcription job started:",
      response.TranscriptionJob.TranscriptionJobName
    );

    const transcriptionJobName = response.TranscriptionJob.TranscriptionJobName;

    // Wait for the transcription job to complete
    const data = await transcribe
      .waitFor("transcriptionJobCompleted", {
        TranscriptionJobName: transcriptionJobName,
      })
      .promise();

    console.log("Subtitles file downloaded.");
    console.log("Transcription job completed.");
  } catch (error) {
    console.error("Error generating subtitles:", error);
  } finally {
    await downloadFileFromS3(`${videoId}.srt`, subtitlesFolderPath_op);
  }
}
