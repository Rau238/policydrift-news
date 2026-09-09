import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.redirect(absoluteUrl('/rss'), 301);
}
