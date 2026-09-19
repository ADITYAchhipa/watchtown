import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'ap-south-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET;
const customDomain = process.env.AWS_S3_CUSTOM_DOMAIN; // e.g., cdn.watchtown.in
const customEndpoint = process.env.AWS_S3_ENDPOINT; // e.g., for Cloudflare R2 or local S3

export function isS3Configured(): boolean {
  return Boolean(
    accessKeyId &&
    secretAccessKey &&
    bucketName
  );
}

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client | null {
  if (!isS3Configured()) {
    return null;
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
      ...(customEndpoint ? { endpoint: customEndpoint } : {}),
    });
  }

  return s3ClientInstance;
}

export interface UploadS3Options {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}

export async function uploadToS3({
  buffer,
  fileName,
  contentType,
  folder = 'products',
}: UploadS3Options): Promise<{ url: string; key: string }> {
  const client = getS3Client();
  if (!client || !bucketName) {
    throw new Error('AWS S3 is not configured. Missing AWS credentials or bucket name.');
  }

  // Clean filename and generate path
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = folder ? `${folder}/${Date.now()}-${sanitizedName}` : `${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  let publicUrl: string;
  if (customDomain) {
    const domain = customDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    publicUrl = `https://${domain}/${key}`;
  } else if (region === 'us-east-1') {
    publicUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
  } else {
    publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  return { url: publicUrl, key };
}
