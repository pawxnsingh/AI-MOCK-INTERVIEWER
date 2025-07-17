import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://localhost:8000/api/agents/set-active';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentUuid: string }> }
) {
  try {
    const { agentUuid } = await params;

    if (!agentUuid) {
      return NextResponse.json({ error: 'agentUuid is required' }, { status: 400 });
    }

    const res = await fetch(`${BASE_URL}/${agentUuid}`, {
      method: 'GET',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to set agent as active' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error setting agent as active:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}