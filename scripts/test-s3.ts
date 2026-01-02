import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function test() {
  const result = await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: "ingestion-test/hello.txt",
      Body: "Hello from Vulcan ingestion pipeline",
      ContentType: "text/plain",
    })
  );

  console.log("✅ S3 upload successful", result);
}

test().catch(console.error);
