import { NextResponse } from 'next/server';

const BASE_URL = 'http://localhost:8000/api/agents/update';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to update agent' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}