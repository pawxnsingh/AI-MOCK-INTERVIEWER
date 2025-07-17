import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface ReferralCodeProps {
    user: any;
}

interface ReferralData {
    code: string;
    totalReferrals: number;
    totalEarnings: number;
    referrals: Array<{
        id: string;
        email: string;
        createdAt: string;
        status: string;
    }>;
}
const dummyReferralData: ReferralData = {
    code: 'FRIEND2024',
    totalReferrals: 5,
    totalEarnings: 150,
    referrals: [
        {
            id: '1',
            email: 'john.doe@example.com',
            createdAt: '2024-01-15T10:30:00Z',
            status: 'active'
        },
        {
            id: '2',
            email: 'sarah.smith@example.com',
            createdAt: '2024-01-20T14:45:00Z',
            status: 'active'
        },
        {
            id: '3',
            email: 'mike.johnson@example.com',
            createdAt: '2024-01-25T09:15:00Z',
            status: 'pending'
        },
        {
            id: '4',
            email: 'emma.wilson@example.com',
            createdAt: '2024-02-01T16:20:00Z',
            status: 'active'
        },
        {
            id: '5',
            email: 'alex.brown@example.com',
            createdAt: '2024-02-05T11:30:00Z',
            status: 'active'
        }
    ]
};


export const ReferralCode: React.FC<ReferralCodeProps> = ({ user }) => {
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [referralCode, setReferralCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API}/api/user/referral/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setReferralData(response.data);
            setReferralCode(response.data.code || '');
        } catch (error) {
            console.error('Error fetching referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            const referralMessage = `Hi There, Practice for PM interviews with AI mock interviewer from Juggy. Use my referral code ${text} while signing up and get 20 minutes of free conversation - https://test.juggy.ai/`;
            await navigator.clipboard.writeText(referralMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading referral data...</span>
            </div>
        );
    }

    // Handle case when no referral data is available


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Referral Program</h3>
            </div>

            <div className="space-y-6">
                {/* Referral Code Display */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h4>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-white rounded-lg p-4 border border-gray-300">
                            <code className="text-xl font-mono text-indigo-600">{referralCode || 'No code available'}</code>
                        </div>
                        <button
                            onClick={() => copyToClipboard(referralCode)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                        Share this code with friends and earn rewards when they sign up!
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Referrals</p>
                                <p className="text-2xl font-bold text-gray-900">{referralData?.totalReferrals || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Earnings</p>
                                <p className="text-2xl font-bold text-gray-900">{referralData?.totalEarnings || 0} credits</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referrals List */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Referrals</h4>
                    {referralData?.referrals && referralData?.referrals.length > 0 ? (
                        <div className="space-y-3">
                            {referralData?.referrals.map((referral) => (
                                <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-full ${referral.status === 'active'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {referral.status === 'active' ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{referral.email}</p>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(referral.createdAt)} • {referral.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">👥</div>
                            <p>No referrals yet. Share your code to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 