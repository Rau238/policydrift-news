import { NextRequest, NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  const category = params.category || '';
  const search = req.nextUrl.search || '';
  const target = absoluteUrl(`/feed/${category}${search}`);
  return NextResponse.redirect(target, 301);
}
