// API route for S3 file upload
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from '@/lib/s3/client';
import crypto from 'crypto';
import type { CorpusSource } from '@/lib/ingestion/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const source = formData.get('source') as CorpusSource | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!source) {
      return NextResponse.json({ error: 'No source provided' }, { status: 400 });
    }

    // Validate source
    const validSources: CorpusSource[] = ['us-code', 'ecfr', 'texas-statutes', 'austin-ordinances'];
    if (!validSources.includes(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('utf-8');

    // Generate checksum
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    // Generate S3 key: {source}/{timestamp}_{filename}
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${source}/${timestamp}_${sanitizedFilename}`;

    // Determine content type
    let contentType = file.type || 'text/plain';
    if (file.name.endsWith('.json')) contentType = 'application/json';
    else if (file.name.endsWith('.xml')) contentType = 'text/xml';
    else if (file.name.endsWith('.html')) contentType = 'text/html';
    else if (file.name.endsWith('.txt')) contentType = 'text/plain';

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        source: source,
        originalFilename: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Return upload result
    return NextResponse.json({
      success: true,
      key,
      source,
      checksum,
      contentType,
      fileSizeBytes: buffer.length,
      content, // Return content for immediate processing
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve file content from S3
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();

    return NextResponse.json({
      success: true,
      key,
      content,
      contentType: response.ContentType,
    });
  } catch (error) {
    console.error('S3 get error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}
