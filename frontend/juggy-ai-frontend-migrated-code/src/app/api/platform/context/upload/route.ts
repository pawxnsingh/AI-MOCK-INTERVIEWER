import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const backendRes = await fetch('http://localhost:8000/api/platform/context/upload', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: await req.text(),
  });

  const data = await backendRes.text();

  return new NextResponse(data, {
    status: backendRes.status,
    headers: {
      'content-type': backendRes.headers.get('content-type') || 'application/json',
    },
  });
}