import AWS from "aws-sdk";

const config = new AWS.Config({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.YOUR_S3_BUCKET_REGION,
});

export const S3 = new AWS.S3(config);
