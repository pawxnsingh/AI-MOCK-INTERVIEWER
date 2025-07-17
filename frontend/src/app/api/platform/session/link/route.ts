import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { callId, sessionId } = body;

        const backendResponse = await fetch('http://localhost:8000/api/platform/session/link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ callId, sessionId }),
        });

        const data = await backendResponse.json();

        return NextResponse.json(data, { status: backendResponse.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to link session and call', error: (error as Error).message },
            { status: 500 }
        );
    }
}