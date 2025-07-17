"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface EnterpriseInterviewFormProps {
    onStartInterview: (sessionId: string, type: string, additionalData: any) => void;
}

export const EnterpriseInterviewForm: React.FC<EnterpriseInterviewFormProps> = ({
    onStartInterview,
}) => {
    const [jobId, setJobId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!jobId.trim()) {
            toast.error('Please enter a valid Job ID');
            return;
        }

        setLoading(true);

        try {
            // Use job ID directly as session ID
            const sessionId = jobId.trim();
            const additionalData = {
                jobId: sessionId,
                interviewType: 'enterprise'
            };

            // Directly start interview without API call
            onStartInterview(sessionId, 'enterprise_interview', additionalData);
        } catch (error: any) {
            console.error('Failed to start interview:', error);
            setLoading(false);
            toast.error('Failed to start interview. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Interview</h2>
                    <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
                        You've been invited to complete an AI-powered interview. Please enter your Job ID to begin.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-lg font-semibold text-gray-900 mb-4 text-center">
                                Enter Your Job ID
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={jobId}
                                    onChange={(e) => setJobId(e.target.value)}
                                    placeholder="Paste your unique interview code here ✨"
                                    className="w-full px-6 py-4 border-2 border-gray-200 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-lg text-center font-medium"
                                    required
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-500 text-center">
                                This ID was provided by your recruiter or hiring manager
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !jobId.trim()}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                    Starting Your Interview...
                                </div>
                            ) : (
                                'Start Interview'
                            )}
                        </button>
                    </form>

                    {/* Interview Info */}
                    <div className="mt-10 pt-8 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">15-30 Minutes</h4>
                                <p className="text-sm text-gray-600">Interview Duration</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">Real-time Feedback</h4>
                                <p className="text-sm text-gray-600">Instant Scoring</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">Detailed Report</h4>
                                <p className="text-sm text-gray-600">Performance Analysis</p>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                        <div className="text-center">
                            <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                If you're having trouble accessing your interview, please contact your recruiter or hiring manager.
                            </p>
                            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                                <span>• Make sure you have a stable internet connection</span>
                                <span>• Use a modern browser (Chrome, Firefox, Safari)</span>
                                <span>• Allow microphone access when prompted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 