import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const backendResponse = await fetch(`http://localhost:8000/api/platform/session/analyse/${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await backendResponse.json();

        return NextResponse.json(data, { status: backendResponse.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to analyse session', error: (error as Error).message },
            { status: 500 }
        );
    }
}