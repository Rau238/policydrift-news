import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image format with Sharp
    const metadata = await sharp(buffer).metadata();
    if (!metadata.format || !['jpeg', 'png', 'webp', 'gif', 'svg'].includes(metadata.format)) {
      return NextResponse.json({ error: 'Invalid or unsupported image format' }, { status: 400 });
    }

    // Optimize and convert to WebP / Base64 for safe client-side consumption
    const optimizedBuffer = await sharp(buffer)
      .rotate() // auto-orient from EXIF
      .toFormat('webp', { quality: 90 })
      .toBuffer();

    const base64 = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: base64,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload processing failed' },
      { status: 500 }
    );
  }
}
