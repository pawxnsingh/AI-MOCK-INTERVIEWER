import React, { useEffect, useState } from 'react';
import { ConversationDetailsModal } from './ConversationDetailsModal';
import { ReferralCode } from './ReferralCode';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  reference: string;
  goal: string;
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
  assessment_area: string;
  candidates_other_contexts: CandidateContext;
}

interface SessionMainQuestions {
  questions: Question[];
}

export interface Conversation {
  id: string;
  status: string;
  duration_minutes: number;
  credits_used: number;
  created_at: string;
  type?: string;
  sessionContext: SessionContext;
  sessionMainQuestions: SessionMainQuestions;
  sessionSummary: any;
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL || '';
// const oldAPI = 'https://quirky-maxwell.emergent.host';

export const Dashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<{
    totalConversations: number,
    totalMinutes: number,
    averageScore?: number
  }>({
    totalConversations: 0,
    totalMinutes: 0,
    averageScore: 0
  });
  const [transactions, setTransactions] = useState<{
    createdAt: string,
    status: string,
    amount: number,
    currency: string
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Transaction pagination state
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [transactionsPerPage] = useState(5);

  // Conversation details modal state
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        setUser(JSON.parse(user));
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Fetch conversations for specific page
  const fetchConversations = async (page: number) => {
    try {
      setConversationsLoading(true);
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const conversationsRes = await axios.get(`${API}/api/platform/session/get/${page}`, { headers });

        let totalSessionUsedCredits: number = 0;
        const mappedConversations = conversationsRes.data.interview_sessions.map((session: any) => {
          const mappedConversation = {
            id: session.sessionId,
            status: session.sessionStatus,
            duration_minutes: session.sessionCredits || 0,
            credits_used: session.sessionCredits || 0,
            created_at: session.createdAt,
            sessionContext: session.sessionContext,
            sessionMainQuestions: session.sessionMainQuestions,
            sessionSummary: session.sessionSummary,
          };

          totalSessionUsedCredits += parseInt(session?.sessionCredits || '0');
          return mappedConversation;
        });
        setConversations(mappedConversations);
        setTotalPages(parseInt(conversationsRes.data.totalPages || '1'));

        // Update stats with total sessions available
        const totalSessionsAvailable = parseInt(conversationsRes.data.totalPages || '0') * 5; // because 5 per page
        setStats(prevStats => ({
          ...prevStats,
          totalConversations: totalSessionsAvailable,
          totalMinutes: totalSessionUsedCredits,
        }));
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch initial conversations (page 1)
        const conversationsRes = await axios.get(`${API}/api/platform/session/get/1`, { headers });
        const transactionsRes = await axios.get(`${API}/api/payments/get/transactions`, { headers });

        let totalSessionUsedCredits: number = 0;
        const mappedConversations = conversationsRes.data.interview_sessions.map((session: any) => {
          const mappedConversation = {
            id: session.sessionId,
            status: session.sessionStatus,
            duration_minutes: session.sessionCredits || 0,
            credits_used: session.sessionCredits || 0,
            created_at: session.createdAt,
            sessionContext: session.sessionContext,
            sessionMainQuestions: session.sessionMainQuestions,
            sessionSummary: session.sessionSummary,
          };

          totalSessionUsedCredits += parseInt(session?.sessionCredits || '0');
          return mappedConversation;
        });

        const totalSessionsAvailable = parseInt(conversationsRes.data.totalPages || '0') * 5; // because 5 per page

        const structuredStats = {
          totalConversations: totalSessionsAvailable,
          totalMinutes: totalSessionUsedCredits,
          averageScore: 0
        };

        setConversations(mappedConversations);
        setStats(structuredStats);
        setTransactions(transactionsRes.data.transactions);
        setTotalPages(parseInt(conversationsRes.data.totalPages || '1'));

        // const [transactionsRes] = await Promise.all([
        //   // axios.get(`${API}/api/platform/session/get/1`, { headers }),
        //   // axios.get(`${oldAPI}/api/dashboard/stats`, { headers }),
        //   axios.get(`${oldAPI}/api/credits/transactions`, { headers })
        // ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchConversations(newPage);
    }
  };

  // Handle transaction page change
  const handleTransactionPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(transactions.length / transactionsPerPage)) {
      setCurrentTransactionPage(newPage);
    }
  };

  // Get current transactions for pagination
  const getCurrentTransactions = () => {
    const startIndex = (currentTransactionPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return transactions.slice(startIndex, endIndex);
  };

  // Get total transaction pages
  const getTotalTransactionPages = () => {
    return Math.ceil(transactions.length / transactionsPerPage);
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewConversationDetails = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationModal(true);
  };

  const handleCloseConversationModal = () => {
    setShowConversationModal(false);
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your progress and practice sessions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalConversations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Practice Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats?.totalMinutes || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats?.averageScore || 0)}`}>
                  {stats?.averageScore || 0}/10
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-sm text-white font-bold">C</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Credits Remaining</p>
                <p className="text-2xl font-bold text-indigo-600">{user.credits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'conversations', name: 'Practice Sessions', icon: '🎯' },
                { id: 'credits', name: 'Credits History', icon: '💳' },
                { id: 'referrals', name: 'Referrals', icon: '🎁' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 cursor-pointer border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push('/interview-call')}
                      className="p-6 border-2 cursor-pointer border-dashed border-indigo-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🎤</div>
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">Start New Interview</h4>
                        <p className="text-gray-600">Practice with AI-powered mock interviews</p>
                      </div>
                    </button>

                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl mb-2">📈</div>
                        <h4 className="text-lg font-semibold text-gray-900">Your Progress</h4>
                        <p className="text-gray-600">
                          {stats?.totalConversations > 0
                            ? `${stats?.totalConversations} sessions completed with ${stats?.averageScore}/10 average score`
                            : 'Start your first practice session to see progress'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Sessions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Practice Sessions</h3>
                  {conversations.length > 0 ? (
                    <div className="space-y-3">
                      {conversations.slice(0, 3).map((conversation) => (
                        <div key={conversation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {conversation.type === 'mock_interview' ? 'Mock Interview' : 'Practice Session'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(conversation.created_at)} • {conversation.duration_minutes}m
                              {/* {conversation.analysis && (
                                <span className={`ml-2 ${getScoreColor(conversation.analysis.overall_score)}`}>
                                  Score: {conversation.analysis.overall_score}/10
                                </span>
                              )} */}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewConversationDetails(conversation)}
                            className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🎯</div>
                      <p>No practice sessions yet. Start your first interview!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'conversations' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">All Practice Sessions</h3>
                  <button
                    onClick={() => router.push('/interview-call')}
                    className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    New Session
                  </button>
                </div>

                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Loading conversations...</span>
                  </div>
                ) : conversations.length > 0 ? (
                  <div>
                    <div className="space-y-4 mb-6">
                      {conversations.map((conversation) => (
                        <div key={conversation.id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex md:flex-row flex-col gap-4 items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {conversation.type === 'mock_interview' ? 'Mock Interview' : 'Practice Session'}
                                </h4>
                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${conversation.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : conversation.status === 'CREATED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {conversation.status}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <p>📅 {formatDate(conversation.created_at)}</p>
                                <p>⏱️ Duration: {conversation.duration_minutes} minutes</p>
                                <p>💰 Credits used: {conversation.credits_used}</p>
                                {/* {conversation.analysis && (
                                  <div className="flex items-center space-x-4 mt-2">
                                    <span className={`font-medium ${getScoreColor(conversation.analysis.overall_score)}`}>
                                      Overall: {conversation.analysis.overall_score}/10
                                    </span>
                                    <span className="text-gray-500">
                                      Confidence: {conversation.analysis.confidence_score}/10
                                    </span>
                                    <span className="text-gray-500">
                                      Fluency: {conversation.analysis.fluency_score}/10
                                    </span>
                                  </div>
                                )} */}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewConversationDetails(conversation)}
                                className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-xs md:text-sm"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex md:flex-row flex-col gap-4 items-center justify-between border-t border-gray-200 pt-6">
                        <div className="flex items-center text-sm text-gray-700">
                          <span>
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>

                        <div className="flex items-center gap-[1px] md:space-x-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                              }`}
                          >
                            Previous
                          </button>

                          {/* Page Numbers */}
                          <div className="flex flex-wrap items-center gap-[1px] md:space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === pageNum
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                              }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎯</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No practice sessions yet</h4>
                    <p className="text-gray-600 mb-4">Start your first mock interview to see your progress</p>
                    <button
                      onClick={() => router.push('/interview-call')}
                      className="bg-indigo-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start First Interview
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'credits' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Credits History</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Balance</p>
                      <p className="text-2xl font-bold text-indigo-600">{user.credits} credits</p>
                    </div>
                    <button
                      onClick={() => router.push('/add-credits')}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Credits</span>
                    </button>
                  </div>
                </div>

                {transactions.length > 0 ? (
                  <div>
                    <div className="space-y-3 mb-6">
                      {getCurrentTransactions().map((transaction, index) => (
                        <div key={index} className="flex md:flex-row flex-col gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${transaction.status === "COMPLETED"
                              ? 'bg-green-100 text-green-600'
                              : transaction.status === "PENDING"
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                              {transaction.status === "COMPLETED" ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : transaction.status === "PENDING" ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{transaction.status.toLowerCase()}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(transaction.createdAt)} • {transaction.currency.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className={`text-sm md:text-lg font-semibold ${transaction.status === "PENDING"
                            ? 'text-orange-600'
                            : (transaction.amount > 0 ? 'text-green-600' : 'text-red-600')
                            }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} {transaction.currency.toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Transaction Pagination Controls */}
                    {getTotalTransactionPages() > 1 && (
                      <div className="flex md:flex-row flex-col gap-4 items-center justify-between border-t border-gray-200 pt-6">
                        <div className="flex items-center text-sm text-gray-700">
                          <span>
                            Showing {((currentTransactionPage - 1) * transactionsPerPage) + 1} to {Math.min(currentTransactionPage * transactionsPerPage, transactions.length)} of {transactions.length} transactions
                          </span>
                        </div>

                        <div className="flex items-center gap-[1px] md:space-x-2">
                          <button
                            onClick={() => handleTransactionPageChange(currentTransactionPage - 1)}
                            disabled={currentTransactionPage === 1}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${currentTransactionPage === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                              }`}
                          >
                            Previous
                          </button>

                          {/* Page Numbers */}
                          <div className="flex flex-wrap items-center gap-[1px] md:space-x-1">
                            {Array.from({ length: Math.min(5, getTotalTransactionPages()) }, (_, i) => {
                              let pageNum;
                              if (getTotalTransactionPages() <= 5) {
                                pageNum = i + 1;
                              } else if (currentTransactionPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentTransactionPage >= getTotalTransactionPages() - 2) {
                                pageNum = getTotalTransactionPages() - 4 + i;
                              } else {
                                pageNum = currentTransactionPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handleTransactionPageChange(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-md ${currentTransactionPage === pageNum
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => handleTransactionPageChange(currentTransactionPage + 1)}
                            disabled={currentTransactionPage === getTotalTransactionPages()}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${currentTransactionPage === getTotalTransactionPages()
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                              }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💳</div>
                    <p>No credit transactions yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'referrals' && (
              <ReferralCode user={user} />
            )}
          </div>
        </div>
      </div>

      {/* Conversation Details Modal */}
      {showConversationModal && selectedConversation && (
        <ConversationDetailsModal
          isOpen={showConversationModal}
          onClose={handleCloseConversationModal}
          conversation={selectedConversation}
        />
      )}
    </div>
  );
};
