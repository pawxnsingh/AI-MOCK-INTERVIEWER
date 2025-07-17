import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Conversation } from './Dashboard';

interface ConversationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversation: Conversation;
}

interface ExchangePiece {
    candidate?: string;
    interviewer?: string;
}

interface SessionExchange {
    exchangePiece: ExchangePiece;
    createdAt: string;
}

interface CandidateContext {
    currentRole: string;
    currentCompany: string;
    totalProductManagementExperience: string;
    totalWorkExperience: string;
    targetRole: string;
    targetCompany: string;
    jobDescription: string;
    jobDescriptionLink: string;
}

interface SessionContext {
    candidates_other_contexts: CandidateContext;
    assessment_area: string;
}

interface Question {
    question: string;
    reference: string;
    goal: string;
}

interface SessionMainQuestions {
    questions: Question[];
}

interface SessionData {
    sessionId: string;
    sessionExchanges: SessionExchange[];
}

// Report interface
interface Report {
    patience: string;
    preparedness: string;
    confidence: string;
    fluency: string;
    top_strengths: string;
    key_improvements: string;
    feedback: string;
}

// Merged interface combining SessionData and Conversation
interface MergedSessionData extends Omit<SessionData, 'createdAt'> {
    // Conversation properties
    id: string;
    status: string;
    duration_minutes: number;
    credits_used: number;
    created_at: string;
    type?: string;
    sessionContext: SessionContext;
    sessionMainQuestions: SessionMainQuestions;
    // SessionData properties (excluding createdAt to avoid conflict)
    sessionId: string;
    sessionExchanges: SessionExchange[];
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export const ConversationDetailsModal: React.FC<ConversationDetailsModalProps> = ({
    isOpen,
    onClose,
    conversation,
}) => {
    const [sessionData, setSessionData] = useState<MergedSessionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [report, setReport] = useState<Report | null>(null);

    useEffect(() => {
        if (isOpen && conversation) {
            fetchSessionDetails();
        }
    }, [isOpen, conversation]);

    const fetchSessionDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(`${API}/api/platform/session/get/exchanges/${conversation.id}`, { headers });

            // Merge the conversation data with the session data
            const mergedData: MergedSessionData = {
                ...response.data,
                // Conversation properties
                id: conversation.id,
                status: conversation.status,
                duration_minutes: conversation.duration_minutes,
                credits_used: conversation.credits_used,
                created_at: conversation.created_at,
                type: conversation.type,
                sessionContext: conversation.sessionContext,
                sessionMainQuestions: conversation.sessionMainQuestions,
                // SessionData properties
                sessionId: response.data.sessionId,
                sessionExchanges: response.data.sessionExchanges
            };

            setSessionData(mergedData);
        } catch (err: any) {
            console.error('Error fetching session details:', err);
            setError(err.response?.data?.message || 'Failed to load conversation details');
        } finally {
            setLoading(false);
        }
    };

    const generateReportHandler = async () => {
        if (conversation.id) {
            setIsGeneratingReport(true);
            try {
                window.location.href = `/interview-report?sessionId=${conversation.id}`;
                setIsGeneratingReport(false);
            } catch (error) {
                console.error('Error generating report:', error);
                setIsGeneratingReport(false);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CREATED':
                return 'bg-blue-100 text-blue-800';
            case 'ACTIVE':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Conversation Details</h3>
                            <p className="text-sm text-gray-500">Session ID: {conversation.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {sessionData && !showReport && (
                            <button
                                onClick={generateReportHandler}
                                disabled={isGeneratingReport}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingReport ? 'Generating Report...' : 'View Report'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="ml-3 text-gray-600">Loading conversation details...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="text-red-500 text-lg mb-2">⚠️</div>
                            <p className="text-gray-600">{error}</p>
                            <button
                                onClick={fetchSessionDetails}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : showReport && report ? (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Interview Analysis Report</h3>
                                <p className="text-gray-600">Your performance evaluation</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <p className="font-semibold text-indigo-800 mb-1">Patience</p>
                                    <p className="text-2xl font-bold text-indigo-600">{parseInt(report?.patience) || 0}/10</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <p className="font-semibold text-indigo-800 mb-1">Preparedness</p>
                                    <p className="text-2xl font-bold text-indigo-600">{parseInt(report?.preparedness) || 0}/10</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <p className="font-semibold text-indigo-800 mb-1">Confidence</p>
                                    <p className="text-2xl font-bold text-indigo-600">{parseInt(report?.confidence) || 0}/10</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <p className="font-semibold text-indigo-800 mb-1">Fluency</p>
                                    <p className="text-2xl font-bold text-indigo-600">{parseInt(report?.fluency) || 0}/10</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-2">Top Strengths</h3>
                                    <div className="text-gray-700 space-y-3">
                                        {report?.top_strengths?.split(/\n\n+/).map((paragraph: string, index: number) => (
                                            <p key={index} className="leading-relaxed">
                                                {paragraph.trim()}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-2">Key Improvements</h3>
                                    <div className="text-gray-700 space-y-3">
                                        {report?.key_improvements?.split(/\n\n+/).map((paragraph: string, index: number) => (
                                            <p key={index} className="leading-relaxed">
                                                {paragraph.trim()}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-2">Feedback</h3>
                                    <div className="text-gray-700 space-y-3">
                                        {report?.feedback?.split(/\n\n+/).map((paragraph: string, index: number) => (
                                            <p key={index} className="leading-relaxed">
                                                {paragraph.trim()}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : sessionData ? (
                        <div className="space-y-6">
                            {/* Session Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Session Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="text-gray-600">Session ID:</span>
                                        <span className="ml-2 font-medium">{sessionData.sessionId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sessionData.status)}`}>
                                            {sessionData.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Created:</span>
                                        <span className="ml-2 font-medium">{formatDate(sessionData.created_at)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Credits Used:</span>
                                        <span className="ml-2 font-medium">{sessionData.credits_used || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Exchanges:</span>
                                        <span className="ml-2 font-medium">{sessionData.sessionExchanges?.length || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Assessment Area:</span>
                                        <span className="ml-2 font-medium">{sessionData.sessionContext?.assessment_area || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Candidate Context */}
                            {sessionData.sessionContext?.candidates_other_contexts && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Candidate Context</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="text-gray-600">Current Role:</span>
                                            <span className="ml-2 font-medium">{sessionData.sessionContext.candidates_other_contexts.currentRole || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Current Company:</span>
                                            <span className="ml-2 font-medium">{sessionData.sessionContext.candidates_other_contexts.currentCompany || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Target Role:</span>
                                            <span className="ml-2 font-medium">{sessionData.sessionContext.candidates_other_contexts.targetRole || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Target Company:</span>
                                            <span className="ml-2 font-medium">{sessionData.sessionContext.candidates_other_contexts.targetCompany || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Product Management Experience:</span>
                                            <span className="ml-2 font-medium">{sessionData.sessionContext.candidates_other_contexts.totalProductManagementExperience || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Total Work Experience:</span>
                                            <span className="ml-2 font-medium">{sessionData.sessionContext.candidates_other_contexts.totalWorkExperience || 'N/A'}</span>
                                        </div>
                                    </div>
                                    {(sessionData.sessionContext.candidates_other_contexts.jobDescription || sessionData.sessionContext.candidates_other_contexts.jobDescriptionLink) && (
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            {sessionData.sessionContext.candidates_other_contexts.jobDescription && (
                                                <div className="mb-2">
                                                    <span className="text-gray-600 text-sm">Job Description:</span>
                                                    <p className="text-gray-700 text-sm mt-1">{sessionData.sessionContext.candidates_other_contexts.jobDescription}</p>
                                                </div>
                                            )}
                                            {sessionData.sessionContext.candidates_other_contexts.jobDescriptionLink && (
                                                <div>
                                                    <span className="text-gray-600 text-sm">Job Description Link:</span>
                                                    <a
                                                        href={sessionData.sessionContext.candidates_other_contexts.jobDescriptionLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
                                                    >
                                                        View Job Description
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Interview Questions */}
                            {sessionData.sessionMainQuestions?.questions && sessionData.sessionMainQuestions.questions.length > 0 && (
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Interview Questions</h4>
                                    <div className="space-y-4">
                                        {sessionData.sessionMainQuestions.questions.map((question, index) => (
                                            <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                                                <div className="flex items-start space-x-2 mb-2">
                                                    <span className="text-green-600 font-medium text-sm">{index + 1}.</span>
                                                    <p className="text-gray-700 text-sm font-medium">{question.question}</p>
                                                </div>
                                                <div className="ml-6 space-y-1">
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">Goal:</span> {question.goal}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">Reference:</span> {question.reference}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Conversation Exchanges */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Conversation Flow</h4>
                                {sessionData.sessionExchanges && sessionData.sessionExchanges.length > 0 ? (
                                    <div className="space-y-4">
                                        {sessionData.sessionExchanges.map((exchange, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm text-gray-500">Exchange #{index + 1}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(exchange.createdAt)}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {exchange.exchangePiece.candidate && (
                                                        <div className="bg-green-50 rounded-lg p-3">
                                                            <div className="flex items-center mb-2">
                                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                                                                    <span className="text-white text-xs font-bold">U</span>
                                                                </div>
                                                                <span className="font-medium text-green-800">Candidate</span>
                                                            </div>
                                                            <p className="text-green-900 text-sm">{exchange.exchangePiece.candidate}</p>
                                                        </div>
                                                    )}

                                                    {exchange.exchangePiece.interviewer && (
                                                        <div className="bg-blue-50 rounded-lg p-3">
                                                            <div className="flex items-center mb-2">
                                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                                                                    <span className="text-white text-xs font-bold">A</span>
                                                                </div>
                                                                <span className="font-medium text-blue-800">Interviewer</span>
                                                            </div>
                                                            <p className="text-blue-900 text-sm">{exchange.exchangePiece.interviewer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-4xl mb-2">💬</div>
                                        <p>No conversation exchanges found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-gray-100">
                    {showReport && (
                        <button
                            onClick={() => setShowReport(false)}
                            className="mr-3 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Back to Details
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}; 