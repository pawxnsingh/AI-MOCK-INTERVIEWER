"use client"
import { EnterpriseInterviewForm } from '@/components/EnterpriseInterviewForm'
import { VoiceConversation } from '@/components/VoiceConversation';
import React, { useEffect, useState } from 'react'

export default function CandidateInterviewPage() {
    const [conversationData, setConversationData] = useState<any>(null);
    const [currentView, setCurrentView] = useState<'landing' | 'voice-conversation' | 'thank-you'>('landing');
    const [user, setUser] = useState<any>(null);

    const handleStartInterview = (sessionId: string, type: string, additionalData: any) => {
        setConversationData({ sessionId, type, additionalData });
        setCurrentView('voice-conversation');
    };

    const handleCallEnd = () => {
        setCurrentView('thank-you');
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
                setUser(JSON.parse(user));
            }
        }
    }, []);

    const renderThankYouScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-6 py-12 text-center">
                <div className="bg-white rounded-2xl shadow-2xl p-12">
                    {/* Success Icon */}
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Thank You Message */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Thank You!
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Thank you for completing your interview. A detailed report will be generated and sent to your recruiter.
                    </p>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => window.close()}
                            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Close Window
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {currentView === 'thank-you' ? (
                renderThankYouScreen()
            ) : (currentView === 'voice-conversation' && conversationData) ? (
                <VoiceConversation
                    user={user}
                    onBack={() => setCurrentView('landing')}
                    sessionId={conversationData.sessionId}
                    additionalData={conversationData.additionalData}
                    onUserUpdate={(updatedUser) => {
                        setUser(updatedUser);
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                        }
                    }}
                    onCallEnd={handleCallEnd}
                />
            ) : (
                <EnterpriseInterviewForm onStartInterview={handleStartInterview} />
            )}
        </div>
    )
} 