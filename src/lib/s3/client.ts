// S3 Client configuration
import { S3Client } from '@aws-sdk/client-s3';

function getS3Client() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing AWS credentials in environment variables: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required');
  }

  if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_S3_REGION) {
    throw new Error('Missing AWS S3 configuration in environment variables: AWS_S3_BUCKET_NAME and AWS_S3_REGION are required');
  }

  return new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Lazy initialization to avoid build-time errors
let s3ClientInstance: S3Client | null = null;

export const s3Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    if (!s3ClientInstance) {
      s3ClientInstance = getS3Client();
    }
    const value = s3ClientInstance[prop as keyof S3Client];
    return typeof value === 'function' ? value.bind(s3ClientInstance) : value;
  },
});

export function getS3BucketName(): string {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error('Missing AWS_S3_BUCKET_NAME environment variable');
  }
  return process.env.AWS_S3_BUCKET_NAME;
}

export function getS3Region(): string {
  if (!process.env.AWS_S3_REGION) {
    throw new Error('Missing AWS_S3_REGION environment variable');
  }
  return process.env.AWS_S3_REGION;
}
