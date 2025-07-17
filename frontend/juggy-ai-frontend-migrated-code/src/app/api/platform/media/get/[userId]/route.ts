import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const backendRes = await fetch(`http://localhost:8000/api/platform/media/get/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await backendRes.json();

  return NextResponse.json(data, { status: backendRes.status });
}