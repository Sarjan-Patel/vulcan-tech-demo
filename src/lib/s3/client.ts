// S3 Client configuration
import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('Missing AWS credentials in environment variables');
}

if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_S3_REGION) {
  throw new Error('Missing AWS S3 configuration in environment variables');
}

export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
export const S3_REGION = process.env.AWS_S3_REGION;
