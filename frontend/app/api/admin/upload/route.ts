import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Check auth
  const cookieStore = cookies();
  const cookieVal = cookieStore.get('pd_admin')?.value?.trim();
  const headerSecret = req.headers.get('x-admin-secret')?.trim();
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  const isAuthed =
    verifyAdminSessionToken(cookieVal) ||
    verifyAdminSessionToken(headerSecret) ||
    verifyAdminSessionToken(authHeader);

  if (!isAuthed) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized. Please log in at /admin/login.' },
      { status: 401 }
    );
  }

  const uploadDir = path.resolve(process.cwd(), 'public/uploads/articles');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const contentType = req.headers.get('content-type') || '';
  const uploadedFiles: Array<{ url: string; filename: string; name: string; size: number; type: string }> = [];

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];
      const singleFile = formData.get('file') as File | null;
      const allFiles = [...files, ...(singleFile ? [singleFile] : [])];

      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];
        if (!file || typeof file.arrayBuffer !== 'function') continue;

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name || `upload-${i + 1}`;
        let ext = 'jpg';
        const match = originalName.match(/\.([a-zA-Z0-9]+)$/);
        if (match) {
          ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
        }

        const safeFilename = `art-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
        const filePath = path.join(uploadDir, safeFilename);
        fs.writeFileSync(filePath, buffer);

        uploadedFiles.push({
          url: `/uploads/articles/${safeFilename}`,
          filename: safeFilename,
          name: originalName,
          size: buffer.length,
          type: file.type || `image/${ext}`,
        });
      }
    } else {
      // JSON payload containing array of base64 items
      const json = await req.json();
      const items = Array.isArray(json.images) ? json.images : Array.isArray(json.files) ? json.files : [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let base64Data = '';
        let ext = 'jpg';
        let originalName = (item && item.name) || `image-${i + 1}`;

        if (typeof item === 'string') {
          base64Data = item;
        } else if (item && typeof item === 'object') {
          base64Data = item.data || item.base64 || item.url || '';
          if (item.type) {
            const matchType = String(item.type).match(/image\/(png|jpeg|jpg|webp|gif|svg\+xml|svg)/i);
            if (matchType) {
              ext = matchType[1] === 'jpeg' ? 'jpg' : matchType[1] === 'svg\+xml' ? 'svg' : matchType[1];
            }
          }
        }

        if (!base64Data) continue;

        const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        let rawBase64 = base64Data;
        if (matches) {
          const mimeExt = matches[1].toLowerCase();
          ext = mimeExt === 'jpeg' ? 'jpg' : mimeExt === 'svg+xml' ? 'svg' : mimeExt;
          rawBase64 = matches[2];
        }

        const buffer = Buffer.from(rawBase64, 'base64');
        const safeFilename = `art-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
        const filePath = path.join(uploadDir, safeFilename);
        fs.writeFileSync(filePath, buffer);

        uploadedFiles.push({
          url: `/uploads/articles/${safeFilename}`,
          filename: safeFilename,
          name: originalName,
          size: buffer.length,
          type: `image/${ext}`,
        });
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No valid image files were provided.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully uploaded ${uploadedFiles.length} image(s)`,
      files: uploadedFiles,
      urls: uploadedFiles.map((f) => f.url),
    });
  } catch (err: any) {
    console.error('[Upload Error]:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}
