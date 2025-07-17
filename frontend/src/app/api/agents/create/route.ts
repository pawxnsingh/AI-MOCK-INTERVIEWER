import { NextResponse } from 'next/server';

const BASE_URL = 'http://localhost:8000/api/agents/create';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to create agent' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}