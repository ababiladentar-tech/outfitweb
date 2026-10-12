import { NextRequest, NextResponse } from 'next/server';
import { OFTEA_POSTS } from '@/data/umkm-products';

export async function GET() {
  return NextResponse.json({ success: true, posts: OFTEA_POSTS });
}

export async function POST(req: NextRequest) {
  try {
    const profile = await req.json();
    return NextResponse.json({ success: true, posts: OFTEA_POSTS });
  } catch (err: unknown) {
    return NextResponse.json({ success: true, posts: OFTEA_POSTS });
  }
}
