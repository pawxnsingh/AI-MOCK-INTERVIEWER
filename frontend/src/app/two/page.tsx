'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi('d04ab268-8dcc-4550-9cc4-5b4916501101');

interface Report {
    patience: string;
    preparedness: string;
    confidence: string;
    fluency: string;
    top_strengths: string;
    key_improvements: string;
    feedback: string;
}

function VapiCallContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const [isCalling, setIsCalling] = useState(false);
    const [callId, setCallId] = useState<any>();
    const [showReport, setShowReport] = useState(false);
    const [report, setReport] = useState<Report | null>(null);
    const [callEnded, setCallEnded] = useState(false);
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    useEffect(() => {
        if (sessionId) {
            console.log('sessionId from previous page:', sessionId); // this sessionId is what we need to link the callId with  
        }
    }, [sessionId]);

    const startCallHandler = async () => {
        try {
            await vapi.start('cfd12150-2c72-4bea-b9f7-ff19d8d7b83c');
            setIsCalling(true);

            // If we have a sessionId, make the API call
            if (sessionId) {
                // Set up event listener for call start to get the call ID
                vapi.on('call-start', (data) => {
                    if (data?.id) {
                        setCallId(data.id);
                    }
                });
                // as soon as we have the call id from vapi we need to link it with the session in our
                // backend so backend has the context ready for the interview
                // handling the linking asynchronously so we dont interrupt vapi 
                fetch(`${API}/api/platform/session/link`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        callId: callId,
                        sessionId: sessionId
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Successfully linked session and call:', data);
                    })
                    .catch(error => {
                        console.error('Error linking session and call:', error);

                    });
            }

        } catch (error) {
            console.error('Error starting call:', error);
            setIsCalling(false);
        }
    };

    const endCallHandler = async () => {
        vapi.stop();
        setCallEnded(true);

        // Only make the API call if we have a sessionId
        if (sessionId) {
            try {
                const response = await fetch(`${API}/api/platform/session/end/${sessionId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to end session');
                }

                const data = await response.json();
                console.log('Session ended successfully:', data);
            } catch (error) {
                console.error('Error ending session:', error);
            }
        }
    };

    const generateReportHandler = async () => {
        if (sessionId) {
            try {
                    const response = await fetch(`${API}/api/platform/session/analyse/${sessionId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to generate report');
                }

                const data = await response.json();
                setReport(data);
                setShowReport(true);
            } catch (error) {
                console.error('Error generating report:', error);
            }
        }
    };

    useEffect(() => {
        const handleCallStart = () => {
            console.log('Call has started.');
        };

        const handleCallEnd = () => {
            console.log('Call has ended.');
            setIsCalling(false);
            setCallId(null);
        };

        const handleError = () => {
            console.error('An error occurred:');
            setIsCalling(false);
        };

        vapi.on('call-start', handleCallStart);
        vapi.on('call-end', handleCallEnd);
        vapi.on('error', handleError);
        // No cleanup needed since Vapi doesn't support removing event listeners
        return () => {
            // Event listeners will be cleaned up when component unmounts
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
            {!showReport ? (
                <div className="space-y-4">
                    {!isCalling ? (
                        <>
                            <button
                                onClick={startCallHandler}
                                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
                            >
                                Start Call
                            </button>
                            {callEnded && (
                                <button
                                    onClick={generateReportHandler}
                                    className="block px-8 py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
                                >
                                    Generate Report
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={endCallHandler}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
                        >
                            End Call
                        </button>
                    )}

                    {callId && (
                        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                            <p className="text-md">
                                Current Call ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{callId}</span>
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-2xl w-full p-6 bg-gray-800 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">Interview Analysis Report</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-700 rounded">
                            <p className="font-semibold">Patience</p>
                            <p className="text-xl">{report?.patience}/10</p>
                        </div>
                        <div className="p-3 bg-gray-700 rounded">
                            <p className="font-semibold">Preparedness</p>
                            <p className="text-xl">{report?.preparedness}/10</p>
                        </div>
                        <div className="p-3 bg-gray-700 rounded">
                            <p className="font-semibold">Confidence</p>
                            <p className="text-xl">{report?.confidence}/10</p>
                        </div>
                        <div className="p-3 bg-gray-700 rounded">
                            <p className="font-semibold">Fluency</p>
                            <p className="text-xl">{report?.fluency}/10</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-700 rounded">
                            <h3 className="font-bold mb-2">Top Strengths</h3>
                            <p>{report?.top_strengths}</p>
                        </div>
                        <div className="p-4 bg-gray-700 rounded">
                            <h3 className="font-bold mb-2">Key Improvements</h3>
                            <p>{report?.key_improvements}</p>
                        </div>
                        <div className="p-4 bg-gray-700 rounded">
                            <h3 className="font-bold mb-2">Feedback</h3>
                            <p>{report?.feedback}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VapiCallPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VapiCallContent />
        </Suspense>
    );
}