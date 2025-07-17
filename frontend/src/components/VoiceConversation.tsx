'use client'
import React, { useEffect, useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LowCreditsModal } from './LowCreditsModal';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';
const vapiKey = process.env.NEXT_PUBLIC_VAPI_KEY || '';
// const vapi = new Vapi(vapiKey);

interface VoiceConversationProps {
  user: any;
  onBack: () => void;
  onUserUpdate: (user: any) => void;
  additionalData?: any;
  sessionId: string;
  onCallEnd?: () => void;
}

interface SessionStatus {
  sessionStatus: string;
  sessionUsedCredits: number;
  sessionStartTime: string;
  userCredits: number;
}

interface TranscriptEntry {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  transcriptType?: 'partial' | 'final';
}

interface VapiMessage {
  type: 'status-update' | 'speech-update' | 'transcript' | 'conversation-update';
  status?: string;
  role?: 'user' | 'assistant';
  transcriptType?: 'partial' | 'final';
  transcript?: string;
  conversation?: any[];
  messages?: any[];
  messagesOpenAIFormatted?: any[];
  turn?: number;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPartial?: boolean;
}

export const VoiceConversation: React.FC<VoiceConversationProps> = ({
  user, onBack, sessionId, additionalData, onCallEnd }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showLowCreditsModal, setShowLowCreditsModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callId, setCallId] = useState<any>();
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [callEnded, setCallEnded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [currentUserCredits, setCurrentUserCredits] = useState(user.credits);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const hasDismissedLowCreditsWarningRef = useRef(false);
  const [token, setToken] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const callEndedTranscriptRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [vapiMessages, setVapiMessages] = useState<VapiMessage[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [currentPartialMessage, setCurrentPartialMessage] = useState<string>('');
  const [currentPartialMessageRole, setCurrentPartialMessageRole] = useState<'user' | 'assistant' | null>(null);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);

  // Auto-scroll to bottom of transcript container
  useEffect(() => {
    const scrollToBottom = (container: HTMLDivElement | null) => {
      if (container) {
        // Small delay to ensure DOM has updated
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    };

    // Scroll live transcript container
    scrollToBottom(transcriptContainerRef.current);

    // Scroll call ended transcript container if call has ended
    if (callEnded) {
      scrollToBottom(callEndedTranscriptRef.current);
    }
  }, [transcripts, conversationMessages, currentPartialMessage, callEnded]);

  // Function to poll session status
  const pollSessionStatus = async () => {
    if (!sessionId || !isCallActive) return;

    try {
      const response = await fetch(`${API}/api/platform/session/status/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const statusData: SessionStatus = await response.json();
        console.log('Session status response:', statusData);
        setSessionStatus(statusData);
        setCurrentUserCredits(statusData.userCredits);

        // Check if session is terminated due to insufficient credits
        if (statusData.sessionStatus === 'TERMINATED') {
          console.log('Session terminated due to insufficient credits');
          setShowLowCreditsModal(true);
          endCallHandler();
        }
        // Show low credits warning but don't end call immediately
        else if (statusData.userCredits <= 2 && !hasDismissedLowCreditsWarningRef.current) {
          console.log('Low credits warning - credits:', statusData.userCredits);
          setShowLowCreditsModal(true);
        }
        // Reset the dismissed state when credits go above 2, so warning can show again if credits drop
        else if (statusData.userCredits > 2) {
          hasDismissedLowCreditsWarningRef.current = false;
        }
        // Reset the dismissed state when credits reach -3
        else if (statusData.userCredits <= -3) {
          toast.error('You have no credits left. Ending call.');
          endCallHandler();
        }
      } else {
        console.error('Session status response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error polling session status:', error);
    }
  };

  // Start polling when call becomes active
  useEffect(() => {
    if (isCallActive && sessionId) {
      // Poll after a 5-second delay to avoid race conditions
      const initialPollTimeout = setTimeout(() => {
        pollSessionStatus();
      }, 5000);

      // Then poll every 30 seconds
      statusPollingRef.current = setInterval(pollSessionStatus, 10000);

      return () => {
        clearTimeout(initialPollTimeout);
        if (statusPollingRef.current) {
          clearInterval(statusPollingRef.current);
          statusPollingRef.current = null;
        }
      };
    }

    return () => {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }
    };
  }, [isCallActive, sessionId]);

  const handleCloseLowCreditsModal = () => {
    setShowLowCreditsModal(false);
    hasDismissedLowCreditsWarningRef.current = true;

    if (currentUserCredits <= -3) {
      toast.error('You have no credits left. Ending call.');
      endCallHandler();
    }
  };

  useEffect(() => {
    if (currentUserCredits <= -3 && isCallActive) {
      toast.error('Call ended due to insufficient credits.');
      endCallHandler();
    }
  }, [currentUserCredits, isCallActive]);

  // Initialize token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token') || '';
      setToken(storedToken);
    }
  }, []);

  const handleUpgrade = async (planId: string) => {
    try {
      setPaymentProcessing(true);
      const response = await axios.post(`${API}/api/payments/create-checkout-session`, {
        plan_id: planId,
        success_url: `${window.location.origin}?session_id=${sessionId}&payment=success`,
        cancel_url: `${window.location.origin}?payment=cancelled`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.checkout_url) {
        window.open(response.data.checkout_url, '_blank');
      } else {
        toast.error('Failed to create checkout session. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setShowLowCreditsModal(false);
      setPaymentProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeVapi = async () => {
    if (!vapiKey) {
      throw new Error('VAPI public key is not defined');
    }

    const vapi = new Vapi(vapiKey);
    vapiRef.current = vapi;

    vapi.on('transcript', (data) => {
      setTranscripts(data.text);
    });

    vapi.on('message', (data: VapiMessage) => {
      console.log('VAPI message received:', data);
      setVapiMessages(prev => [...prev, data]);

      switch (data.type) {
        case 'status-update':
          console.log('Status update:', data.status);
          break;

        case 'speech-update':
          if (data.role === 'assistant') {
            setIsAssistantSpeaking(data.status === 'started');
            console.log('Assistant speech:', data.status);
          }
          break;

        case 'transcript':
          if (data.transcript && data.role) {
            const newTranscript: TranscriptEntry = {
              id: `transcript-${Date.now()}-${Math.random()}`,
              text: data.transcript,
              role: data.role,
              timestamp: new Date(),
              transcriptType: data.transcriptType
            };

            if (data.transcriptType === 'partial') {
              setCurrentPartialMessage(data.transcript);
              setCurrentPartialMessageRole(data.role);
            } else if (data.transcriptType === 'final') {
              setCurrentPartialMessage('');
              setCurrentPartialMessageRole(null);
              setTranscripts(prev => [...prev, newTranscript]);

              // Also add to conversation messages
              const newConversationMessage: ConversationMessage = {
                id: `conv-${Date.now()}-${Math.random()}`,
                role: data.role,
                content: data.transcript,
                timestamp: new Date(),
                isPartial: false
              };
              setConversationMessages(prev => [...prev, newConversationMessage]);
            }
          }
          break;

        case 'conversation-update':
          if (data.messages) {
            console.log('Conversation update with messages:', data.messages);
            // Process conversation messages if needed
          }
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    });

    return vapi;
  };


  const startCallHandler = async () => {
    try {
      console.log('Starting call with sessionId:', sessionId);
      setIsConnecting(true);
      setIsCalling(true);
      setCallDuration(0);
      setTranscripts([]); // Clear previous transcripts
      setVapiMessages([]); // Clear previous VAPI messages
      setConversationMessages([]); // Clear previous conversation messages
      setCurrentPartialMessage(''); // Clear partial message
      setCurrentPartialMessageRole(null); // Clear partial message role
      setIsAssistantSpeaking(false); // Reset assistant speaking state

      try {
        const vapi = await initializeVapi();
        const result: any = await vapi.start(vapiAssistantId);
        console.log('Vapi call started with result:', result);

        // If we have a sessionId, make the API call
        if (result?.id && sessionId) {
          setIsCallActive(true);
          setIsConnecting(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          setElapsedTime(0); // Reset the timer

          // Start new interval
          timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
          }, 1000);
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }

          fetch(`${API}/api/platform/session/link`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              callId: result?.id,
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
              toast.error('Failed to start call. Please try again.');
              endCallHandler();
            });
        }
      } catch (vapiError: any) {
        console.error('VAPI error:', vapiError);

        // Check if it's a wallet balance error
        if (vapiError?.message && vapiError.message.includes('Wallet Balance')) {
          toast.error(vapiError.message);
        } else if (vapiError?.error && vapiError.error === 'Bad Request' && vapiError.message) {
          toast.error(vapiError.message);
        } else if (vapiError?.message) {
          toast.error(vapiError.message);
        } else {
          toast.error('Failed to start call. Please try again.');
        }

        setIsCalling(false);
        setIsConnecting(false);
        return;
      }

    } catch (error: any) {
      console.error('Error starting call:', error);

      // Also check for wallet balance error in the outer catch
      if (error?.message && error.message.includes('Wallet Balance')) {
        toast.error(error.message);
      } else if (error?.error && error.error === 'Bad Request' && error.message) {
        toast.error(error.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to start call. Please try again.');
      }

      setIsCalling(false);
      setIsConnecting(false);
    }
  };

  const endCallHandler = async () => {
    setIsEnding(true);
    vapiRef.current?.stop();
    setCallEnded(true);
    setIsCallActive(false);

    // Stop polling
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }

    // Only make the API call if we have a sessionId
    if (sessionId) {
      try {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setCallDuration(elapsedTime);
        timerRef.current = null;
        setElapsedTime(0);
        const response = await fetch(`${API}/api/platform/session/end/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

    // Call the onCallEnd callback if provided
    if (onCallEnd) {
      onCallEnd();
    }
  };

  const generateReportHandler = async () => {
    if (sessionId) {
      setIsGeneratingReport(true);
      try {
        window.location.href = `/interview-report?sessionId=${sessionId}`;
        setIsGeneratingReport(false);
      } catch (error) {
        console.error('Error generating report:', error);
        setIsGeneratingReport(false);
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
      setIsEnding(false);
      setCallId(null);
      setCallEnded(true);
      setIsCallActive(false);
      
      // Call the onCallEnd callback if provided
      if (onCallEnd) {
        onCallEnd();
      }
    };

    const handleError = (error: any) => {
      console.error('Vapi error occurred:', error);

      // Handle specific error types
      if (error?.type === 'ejected' && error?.msg === 'Meeting has ended') {
        toast.error("The meeting has ended.");
      } else {
        toast.error('An error occurred during the call. Please try again.');
      }

      // Reset all states
      setIsCalling(false);
      setIsEnding(false);
      setCallId(null);
      setCallEnded(true);
      setIsCallActive(false);
      setIsConnecting(false);

      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop polling
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }

      // Call the onCallEnd callback if provided
      if (onCallEnd) {
        onCallEnd();
      }
    };

    const handleTranscript = (transcript: any) => {
      console.log('Transcript received:', transcript);

      // Handle different transcript formats from Vapi
      if (transcript && transcript.text) {
        const newTranscript: TranscriptEntry = {
          id: transcript.id || `transcript-${Date.now()}-${Math.random()}`,
          text: transcript.text,
          role: transcript.role || (transcript.speaker === 'user' ? 'user' : 'assistant'),
          timestamp: new Date(transcript.timestamp || Date.now()),
          transcriptType: transcript.transcriptType
        };

        setTranscripts((prevTranscripts) => [...prevTranscripts, newTranscript]);
      }
    };

    vapiRef.current?.on('call-start', handleCallStart);
    vapiRef.current?.on('call-end', handleCallEnd);
    vapiRef.current?.on('error', handleError);
    vapiRef.current?.on('transcript', handleTranscript);

    // Cleanup function - note that event listeners will be cleaned up when component unmounts
    return () => {
      // Vapi doesn't have an off method, so we'll just override with no-op handlers
      vapiRef.current?.on('call-start', () => { });
      vapiRef.current?.on('call-end', () => { });
      vapiRef.current?.on('error', () => { });
      vapiRef.current?.on('transcript', () => { });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-4 text-gray-600 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            Voice Interview
          </h2>
        </div>


        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-indigo-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">
                  Mock Interview
                </h3>
                <p className="text-indigo-100">
                  {isCallActive ? <span>Duration: {formatTime(elapsedTime)}</span> :
                    callEnded ?
                      <span>Call Ended in {formatTime(callDuration)}</span> :
                      <span>Ready to start</span>}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-indigo-500 px-3 py-1 rounded-full text-sm">
                  <span className="font-semibold">{currentUserCredits}</span> credits remaining
                </div>
                {callEnded ? (
                  <button
                    disabled
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                  >
                    Call Ended
                  </button>
                ) : !isCalling ? (
                  <button
                    onClick={startCallHandler}
                    disabled={isConnecting}
                    className={`px-4 py-2 rounded-lg transition-colors ${isConnecting
                      ? 'bg-yellow-500 text-white cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                  >
                    {isConnecting ? 'Connecting...' : 'Start Call'}
                  </button>
                ) : (
                  <button
                    onClick={endCallHandler}
                    disabled={isEnding}
                    className={`px-4 py-2 rounded-lg transition-colors ${isEnding
                      ? 'bg-orange-500 text-white cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                  >
                    {isEnding ? 'Ending Call...' : 'End Call'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {
              isCallActive ?
                <div className="text-center py-12">
                  <div className="max-w-4xl mx-auto">
                    {/* Call status */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-green-600 mb-2">Call Active</h3>
                      <p className="text-gray-600 mb-4">Your interview is in progress</p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live</span>
                      </div>
                    </div>

                    {/* Call duration display */}
                    {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Call Duration</p>
                        <p className="text-3xl font-bold text-gray-900">{formatTime(elapsedTime)}</p>
                      </div>
                    </div> */}

                    {/* Live Transcript */}
                    <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-lg">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                          Live Transcript
                          {isAssistantSpeaking && (
                            <span className="ml-3 text-sm text-blue-600 flex items-center bg-blue-100 px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                              Assistant speaking...
                            </span>
                          )}
                        </h4>
                      </div>
                      <div
                        ref={transcriptContainerRef}
                        className="h-80 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white"
                      >
                        {conversationMessages.length === 0 && !currentPartialMessage ? (
                          <div className="text-center text-gray-500 py-12">
                            <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium">Waiting for conversation to begin...</p>
                            <p className="text-sm text-gray-400 mt-1">The interview will start shortly</p>
                          </div>
                        ) : (
                          <>
                            {/* Display conversation messages */}
                            {conversationMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-md lg:max-w-lg px-6 py-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                                    : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 border border-gray-200'
                                  }`}>
                                  <div className="text-sm leading-relaxed">
                                    {message.content}
                                  </div>
                                  <div className={`text-xs mt-3 flex items-center justify-between ${message.role === 'user'
                                      ? 'text-indigo-100'
                                      : 'text-gray-500'
                                    }`}>
                                    <span className="font-medium">
                                      {message.role === 'user' ? 'You' : 'Interviewer'}
                                    </span>
                                    <span>{message.timestamp.toLocaleTimeString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Display current partial message */}
                            {currentPartialMessage && currentPartialMessageRole && (
                              <div className={`flex ${currentPartialMessageRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg transform transition-all duration-200 border-2 border-dashed ${currentPartialMessageRole === 'user'
                                    ? 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-900 border-indigo-300'
                                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 border-blue-300'
                                  }`}>
                                  <div className="text-sm italic leading-relaxed">
                                    {currentPartialMessage}
                                    <span className={`animate-pulse ${currentPartialMessageRole === 'user' ? 'text-indigo-500' : 'text-blue-500'}`}>...</span>
                                  </div>
                                  <div className={`text-xs mt-3 flex items-center justify-between ${currentPartialMessageRole === 'user' ? 'text-indigo-600' : 'text-blue-600'
                                    }`}>
                                    <span className="font-medium">
                                      {currentPartialMessageRole === 'user' ? 'You' : 'Interviewer'}
                                    </span>
                                    <span>{new Date().toLocaleTimeString()}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Real-time credit status */}
                    {sessionStatus && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-blue-800 mb-2">Credit Status:</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>• Used: {sessionStatus.sessionUsedCredits} credits</p>
                          <p>• Remaining: {sessionStatus.userCredits} credits</p>
                          <p>• Session Status: {sessionStatus.sessionStatus}</p>
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Interview Tips:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Speak clearly and at a normal pace</li>
                        <li>• Take your time to think before answering</li>
                        <li>• Be honest and authentic in your responses</li>
                        <li>• Ask for clarification if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
                :
                <div className="text-center py-12">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Analysis Report</h3>
                    <p className="text-gray-600 mb-6">
                      {callEnded
                        ? (additionalData?.interviewType === 'enterprise' 
                            ? "Your detailed interview report has been automatically sent to your recruiter. Thank you for completing the interview!"
                            : "You can now generate your report by clicking the 'Generate Report' button above.")
                        : (additionalData?.interviewType === 'enterprise'
                            ? "After completing the interview, your detailed report will be automatically sent to your recruiter."
                            : "After completing the interview, you can generate your report by clicking the 'Generate Report' button.")
                      }
                    </p>

                    {callEnded && !showReport && additionalData?.interviewType !== 'enterprise' && (
                      <button
                        onClick={generateReportHandler}
                        className="block mx-auto mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
                      >
                        {isGeneratingReport ? 'Generating Report...' : 'Generate Report'}
                      </button>
                    )}

                    {/* Show transcript if call ended and we have transcripts */}
                    {callEnded && conversationMessages.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg my-6 shadow-lg">
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                          <h4 className="font-semibold text-gray-900">Conversation Transcript</h4>
                          <p className="text-sm text-gray-600">Review your interview conversation</p>
                        </div>
                        <div
                          ref={callEndedTranscriptRef}
                          className="h-96 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white"
                        >
                          {conversationMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-md lg:max-w-lg px-6 py-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 ${message.role === 'user'
                                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                                  : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 border border-gray-200'
                                }`}>
                                <div className="text-sm leading-relaxed">
                                  {message.content}
                                </div>
                                <div className={`text-xs mt-3 flex items-center justify-between ${message.role === 'user'
                                    ? 'text-indigo-100'
                                    : 'text-gray-500'
                                  }`}>
                                  <span className="font-medium">
                                    {message.role === 'user' ? 'You' : 'Interviewer'}
                                  </span>
                                  <span>{message.timestamp.toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            }
          </div>
        </div>

        {showLowCreditsModal && (
          <LowCreditsModal
            isOpen={showLowCreditsModal}
            onClose={handleCloseLowCreditsModal}
            currentCredits={currentUserCredits}
            onUpgrade={handleUpgrade}
            paymentProcessing={paymentProcessing}
          />
        )}
      </div>
    </div>
  );
};