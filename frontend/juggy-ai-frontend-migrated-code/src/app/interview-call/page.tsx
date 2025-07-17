"use client"
import { MockInterviewForm } from '@/components/MockInterviewForm'
import { VoiceConversation } from '@/components/VoiceConversation';
import React, { useEffect, useState } from 'react'

export default function page() {
    const [conversationData, setConversationData] = useState<any>(null);
    const [currentView, setCurrentView] = useState<'dashboard' | 'mock-interview-form' | 'voice-conversation'>('dashboard');
    const [user, setUser] = useState<any>(null);
    const handleStartInterview = (sessionId: string, type: string, additionalData: any) => {
        setConversationData({ sessionId, type, additionalData });
        setCurrentView('voice-conversation');
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
                setUser(JSON.parse(user));
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {(currentView === 'voice-conversation' && conversationData) ?
                <VoiceConversation
                    user={user}
                    onBack={() => setCurrentView('dashboard')}
                    sessionId={conversationData.sessionId}
                    onUserUpdate={(updatedUser) => {
                        setUser(updatedUser);
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                        }
                    }}
                />
                :
                <MockInterviewForm onStartInterview={handleStartInterview} />
            }
        </div>
    )
}
