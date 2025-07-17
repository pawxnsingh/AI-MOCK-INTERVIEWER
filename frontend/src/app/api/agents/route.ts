import { NextResponse } from 'next/server';

const BASE_URL = 'http://localhost:8000/api/agents/';

export async function GET() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}