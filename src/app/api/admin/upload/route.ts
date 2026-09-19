import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getSession } from '@/lib/auth';
import { uploadToS3, isS3Configured } from '@/lib/s3';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type (${file.type}). Allowed: JPG, PNG, WEBP, GIF, SVG, AVIF.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 10MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If AWS S3 is configured, upload to S3
    if (isS3Configured()) {
      const { url, key } = await uploadToS3({
        buffer,
        fileName: file.name,
        contentType: file.type,
        folder,
      });

      return NextResponse.json({
        success: true,
        url,
        key,
        provider: 's3',
      });
    }

    // Local fallback when S3 environment variables are not yet provided
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const localFileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, localFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${localFileName}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      provider: 'local',
      notice: 'AWS S3 not configured. Saved locally to public/uploads.',
    });
  } catch (err: any) {
    console.error('Error uploading image:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to upload image.' },
      { status: 500 }
    );
  }
}
