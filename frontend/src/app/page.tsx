'use client'
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { LandingPage } from '@/components/LandingPage';
import { AuthComponent } from '@/components/AuthComponent';
import { AdminDashboard } from '@/components/AdminDashboard';
import { MockInterviewForm } from '@/components/MockInterviewForm';
import { VoiceConversation } from '@/components/VoiceConversation';
import { PaymentSuccess } from '@/components/Payments';
import { PaymentCancelled } from '@/components/Payments';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [conversationData, setConversationData] = useState<any>(null);
  const [authType, setAuthType] = useState('signup');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${API}/api/user/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.data && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
    if (token) {
      refreshUser();
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for payment status in URL
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');
      // Handle Stripe success redirect
      if (paymentStatus === 'success') {
        setCurrentView('payment-success');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (paymentStatus === 'cancelled') {
        setCurrentView('payment-cancelled');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    }
  }, []);


  const handleShowAuth = (type: React.SetStateAction<string>) => {
    if (type === 'logout') {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('welcomeModalShown');
      }
      setCurrentView('landing');
    } else {
      setAuthType(type);
      setCurrentView('auth');
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setCurrentView('landing');
  };

  const handleNavigate = (view: string) => {
    if (view === 'home') {
      router.push('/');
    }
    else if (view === 'dashboard') {
      router.push('/dashboard');
    } else if (view === 'interview') {
      router.push('/interview-call');
    } else if (view === 'add-credits') {
      router.push('/add-credits');
    } else if (view === 'admin' && user?.role === 'admin') {
      setCurrentView('admin');
    }
  };

  const handleStartInterview = (sessionId: string, type: string, additionalData: any) => {
    setConversationData({ sessionId, type, additionalData });
    setCurrentView('voice-conversation');
  };

  const handleBack = () => {
    setCurrentView('landing');
  };


  return (
    // <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> TESTING WITHOUT THIS GOOGLE AUTH PROVIDER DEPENDENCY AT ALL 
    <div className="text-center">


      {currentView === 'landing' && (
        <LandingPage
          onShowAuth={handleShowAuth}
          user={user}
        />
      )}

      {currentView === 'auth' && (
        <AuthComponent
          authType={authType as 'login' | 'signup'}
          onBack={handleBack}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {currentView === 'admin' && user?.role === 'admin' && (
        <AdminDashboard
          user={user}
          onShowAuth={handleShowAuth}
          onNavigate={handleNavigate}
          currentView={currentView}
        />
      )}

      {currentView === 'voice-conversation' && conversationData && (
        <div className="min-h-screen bg-gray-50">
          <VoiceConversation
            user={user}
            onBack={handleBack}
            sessionId={conversationData.sessionId}
            onUserUpdate={(updatedUser) => {
              setUser(updatedUser);
              if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            }}
          />
        </div>
      )}

      {currentView === 'mock-interview-form' && (
        <div className="min-h-screen bg-gray-50">
          <MockInterviewForm onStartInterview={handleStartInterview} />
        </div>
      )}

      {currentView === 'payment-success' && (
        <PaymentSuccess
          user={user}
          onComplete={() => {
            // Refresh user data and go to dashboard
            const refreshUser = async () => {
              try {
                const response = await axios.get(`${API}/api/user/profile`, {
                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                if (response.data && response.data.user) {
                  setUser(response.data.user);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                  }
                }
              } catch (error) {
                console.error('Error refreshing user:', error);
              }
              router.push('/dashboard');
            };
            refreshUser();
          }}
        />
      )}

      {currentView === 'payment-cancelled' && (
        <PaymentCancelled
          onBack={() => router.push('/dashboard')}
        />
      )}
    </div>
    // </GoogleOAuthProvider>
  );
}

export default App;