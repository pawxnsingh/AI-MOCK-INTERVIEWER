"use client"
import React, { useEffect, useState } from 'react'
import KpiCard from './InterviewReport/KpiCard';
import DetailList from './InterviewReport/DetailList';
import FeedbackAccordion, { FeedbackItem } from './InterviewReport/FeedbackAccordion';
import ScoreBadge from './InterviewReport/ScoreBadge';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Download icon component
const Download = ({ size = 24 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export type DetailItem = {
    title: string;
    description: string;
};

export type feedbackSubData = {
    summary: string
    what_went_well: string[]
    areas_to_improve: string[]
    how_to_improve: string[]
    pro_tip: string
}

export type FeedbackData = {
    confidence: feedbackSubData
    fluency: feedbackSubData
    patiency: feedbackSubData
    preparedness: feedbackSubData
}

export type LastInterviewValues = {
    patience: number;
    preparedness: number;
    confidence: number;
    fluency: number;
};

export type InterviewReportData = {
    overall_score: number;
    patience: number;
    preparedness: number;
    confidence: number;
    fluency: number;
    top_strengths: DetailItem[];
    key_improvements: DetailItem[];
    feedback: FeedbackData;
    last_interview_values: LastInterviewValues;
};


export default function InterviewReport() {
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const [report, setReport] = useState<InterviewReportData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReport = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('sessionId');
            if (sessionId) {
                try {
                    setLoading(true);
                    setError(null);
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API}/api/platform/session/analyse/${sessionId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to generate report');
                    }

                    const reportData = await response.json();

                    if (!reportData) {
                        throw new Error('No report data received');
                    }

                    setReport(reportData);
                } catch (error) {
                    console.error('Error generating report:', error);
                    setError(error instanceof Error ? error.message : 'An error occurred while fetching the report');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('No session ID provided');
                setLoading(false);
            }
        }
        fetchReport();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading interview report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-600 text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Report Available</h2>
                    <p className="text-gray-600">No interview report data found for this session.</p>
                </div>
            </div>
        );
    }

    // Move all data processing after the loading check
    const kpiData = [
        {
            key: 'confidence',
            label: 'Confidence',
            value: report.confidence || 0,
            previousValue: report.last_interview_values?.confidence || 0
        },
        {
            key: 'fluency',
            label: 'Fluency',
            value: report.fluency || 0,
            previousValue: report.last_interview_values?.fluency || 0
        },
        {
            key: 'patience',
            label: 'Patience',
            value: report.patience || 0,
            previousValue: report.last_interview_values?.patience || 0
        },
        {
            key: 'preparedness',
            label: 'Preparedness',
            value: report.preparedness || 0,
            previousValue: report.last_interview_values?.preparedness || 0
        }
    ];

    // Convert feedback report to the format expected by FeedbackAccordion
    const feedbackItems = [
        // Confidence feedback
        {
            title: "Confidence",
            description: report.feedback?.confidence?.summary || "No summary available",
            subItems: [
                {
                    title: "What Went Well",
                    description: report.feedback?.confidence?.what_went_well?.join("\n\n") || "No data available"
                },
                {
                    title: "Areas to Improve",
                    description: report.feedback?.confidence?.areas_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "How to Improve",
                    description: report.feedback?.confidence?.how_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "Pro Tip",
                    description: report.feedback?.confidence?.pro_tip || "No pro tip available"
                }
            ]
        },
        // Fluency feedback
        {
            title: "Fluency",
            description: report.feedback?.fluency?.summary || "No summary available",
            subItems: [
                {
                    title: "What Went Well",
                    description: report.feedback?.fluency?.what_went_well?.join("\n\n") || "No data available"
                },
                {
                    title: "Areas to Improve",
                    description: report.feedback?.fluency?.areas_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "How to Improve",
                    description: report.feedback?.fluency?.how_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "Pro Tip",
                    description: report.feedback?.fluency?.pro_tip || "No pro tip available"
                }
            ]
        },
        // Patience feedback
        {
            title: "Patience",
            description: report.feedback?.patiency?.summary || "No summary available",
            subItems: [
                {
                    title: "What Went Well",
                    description: report.feedback?.patiency?.what_went_well?.join("\n\n") || "No data available"
                },
                {
                    title: "Areas to Improve",
                    description: report.feedback?.patiency?.areas_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "How to Improve",
                    description: report.feedback?.patiency?.how_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "Pro Tip",
                    description: report.feedback?.patiency?.pro_tip || "No pro tip available"
                }
            ]
        },
        // Preparedness feedback
        {
            title: "Preparedness",
            description: report.feedback?.preparedness?.summary || "No summary available",
            subItems: [
                {
                    title: "What Went Well",
                    description: report.feedback?.preparedness?.what_went_well?.join("\n\n") || "No data available"
                },
                {
                    title: "Areas to Improve",
                    description: report.feedback?.preparedness?.areas_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "How to Improve",
                    description: report.feedback?.preparedness?.how_to_improve?.join("\n\n") || "No data available"
                },
                {
                    title: "Pro Tip",
                    description: report.feedback?.preparedness?.pro_tip || "No pro tip available"
                }
            ]
        }
    ].filter(item =>
        item.description !== "No summary available" &&
        item.subItems.some(subItem =>
            subItem.description !== "No data available" &&
            subItem.description !== "No pro tip available"
        )
    );

    // Convert scores to numeric format for ScoreBadge
    const scores = {
        confidence: report.confidence || 0,
        fluency: report.fluency || 0,
        patience: report.patience || 0,
        preparedness: report.preparedness || 0
    };

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Interview Analysis Report
                        </h1>
                        <p className="text-xl text-gray-600">
                            Comprehensive performance evaluation and improvement insights
                        </p>
                    </div>
                    <div className="flex gap-3 ml-6">
                        <button className="flex items-center gap-2 px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download size={18} />
                            <span className="hidden sm:inline">Export PDF</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {kpiData.map((kpi, index) => (
                        <KpiCard
                            key={kpi.key}
                            label={kpi.label}
                            value={kpi.value}
                            previousValue={kpi.previousValue}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <DetailList
                        title="Key Strengths"
                        items={report.top_strengths || []}
                        type="strengths"
                    />
                    <DetailList
                        title="Areas for Improvement"
                        items={report.key_improvements || []}
                        type="improvements"
                    />
                </div>

                <div className='mb-12'>
                    <FeedbackAccordion feedback={feedbackItems} />
                </div>

                <div className='mb-12'>
                    <ScoreBadge scores={scores} overallScore={report.overall_score} />
                </div>

                <div className="text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready for Your Next Challenge?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Continue improving your interview skills with personalized practice sessions tailored to your areas of improvement.
                        </p>
                        <button
                            onClick={() => router.push('/interview-call')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                            Book Another Practice Interview
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
