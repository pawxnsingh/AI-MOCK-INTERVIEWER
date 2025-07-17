import React, { useState, useEffect } from 'react'
import axios from 'axios';

interface PaymentSuccessProps {
    user: any;
    onComplete: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ user, onComplete }) => {
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(true);
    const [message, setMessage] = useState('');
    const [creditsAdded, setCreditsAdded] = useState(0);
    const [showRecoveryButton, setShowRecoveryButton] = useState(false);

    const token = localStorage.getItem('token') || '';

    const tryRecoveryManually = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API}/api/payments/recover-payment`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess(true);
                setCreditsAdded(response.data.credits_added);
                setMessage(response.data.message);
                setShowRecoveryButton(false);

                // Update user data and refresh
                setTimeout(async () => {
                    try {
                        const userResponse = await axios.get(`${API}/api/user/profile`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (userResponse.data && userResponse.data.user) {
                            localStorage.setItem('user', JSON.stringify(userResponse.data.user));
                            window.location.reload();
                        }
                    } catch (error) {
                        console.error('Error refreshing user data:', error);
                    }
                }, 2000);
            } else {
                setMessage(`Recovery failed: ${response.data.message}. Please contact support.`);
                setShowRecoveryButton(false);
            }
        } catch (error) {
            console.error('Manual recovery failed:', error);
            setMessage('Manual recovery failed. Please contact support with your payment details.');
            setShowRecoveryButton(false);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     const confirmPayment = async () => {
    //         try {
    //             // Check if credits were just added manually
    //             const lastCreditAction = localStorage.getItem('lastCreditAction');
    //             if (lastCreditAction) {
    //                 const creditData = JSON.parse(lastCreditAction);
    //                 if (creditData.timestamp && (Date.now() - creditData.timestamp) < 60000) { // Within last minute
    //                     setSuccess(true);
    //                     setCreditsAdded(creditData.credits || 60);
    //                     setMessage('Payment recovered! Credits have been added to your account.');
    //                     localStorage.removeItem('lastCreditAction');
    //                     setLoading(false);

    //                     setTimeout(() => {
    //                         window.location.reload();
    //                     }, 3000);
    //                     return;
    //                 }
    //             }

    //             // Get session_id from URL parameters - try multiple possible parameter names
    //             const urlParams = new URLSearchParams(window.location.search);
    //             const sessionId = urlParams.get('session_id') || urlParams.get('sessionId') || urlParams.get('checkout_session_id');

    //             console.log('Current URL:', window.location.href);
    //             console.log('URL Parameters:', Object.fromEntries(urlParams));
    //             console.log('Session ID found:', sessionId);

    //             if (!sessionId) {
    //                 // Show all URL parameters for debugging
    //                 const allParams = Object.fromEntries(urlParams);
    //                 console.error('No session ID found. All URL parameters:', allParams);
    //                 setMessage(`No payment session found. URL parameters: ${JSON.stringify(allParams)}`);

    //                 // Try to recover payment automatically
    //                 try {
    //                     console.log('Attempting automatic payment recovery...');
    //                     const recoveryResponse = await axios.post(`${API}/api/payments/recover-payment`, {}, {
    //                         headers: { Authorization: `Bearer ${token}` }
    //                     });

    //                     if (recoveryResponse.data.success) {
    //                         setSuccess(true);
    //                         setCreditsAdded(recoveryResponse.data.credits_added);
    //                         setMessage(recoveryResponse.data.message);

    //                         // Update user data and trigger refresh
    //                         setTimeout(async () => {
    //                             try {
    //                                 const userResponse = await axios.get(`${API}/api/user/profile`, {
    //                                     headers: { Authorization: `Bearer ${token}` }
    //                                 });

    //                                 if (userResponse.data) {
    //                                     localStorage.setItem('user', JSON.stringify(userResponse.data));
    //                                     window.location.reload();
    //                                 }
    //                             } catch (error) {
    //                                 console.error('Error refreshing user data:', error);
    //                             }
    //                         }, 2000);
    //                         return;
    //                     } else {
    //                         setMessage(`Payment recovery failed: ${recoveryResponse.data.message}`);
    //                     }
    //                 } catch (recoveryError) {
    //                     console.error('Automatic payment recovery failed:', recoveryError);
    //                     // Check if it was a successful manual addition
    //                     if (recoveryError instanceof Error && recoveryError.message.includes('success')) {
    //                         setSuccess(true);
    //                         const axiosError = recoveryError as { response?: { data: { credits_added: number; message: string } } };
    //                         if (axiosError.response?.data) {
    //                             setCreditsAdded(axiosError.response.data.credits_added);
    //                             setMessage(axiosError.response.data.message);
    //                         }
    //                         setShowRecoveryButton(false);

    //                         setTimeout(async () => {
    //                             try {
    //                                 const userResponse = await axios.get(`${API}/api/user/profile`, {
    //                                     headers: { Authorization: `Bearer ${token}` }
    //                                 });

    //                                 if (userResponse.data) {
    //                                     localStorage.setItem('user', JSON.stringify(userResponse.data));
    //                                     window.location.reload();
    //                                 }
    //                             } catch (error) {
    //                                 console.error('Error refreshing user data:', error);
    //                             }
    //                         }, 2000);
    //                         return;
    //                     }

    //                     setMessage('No payment session found. If you were charged, use the recovery button below.');
    //                     setShowRecoveryButton(true);
    //                 }

    //                 setLoading(false);
    //                 return;
    //             }

    //             console.log('Attempting to confirm payment with session ID:', sessionId);

    //             const response = await axios.post(`${API}/api/payments/confirm-checkout`, {
    //                 session_id: sessionId
    //             }, {
    //                 headers: { Authorization: `Bearer ${token}` }
    //             });

    //             console.log('Payment confirmation response:', response.data);

    //             if (response.data.success) {
    //                 setSuccess(true);
    //                 setCreditsAdded(response.data.credits_added);
    //                 setMessage(response.data.message);

    //                 // Update user data and trigger a refresh
    //                 setTimeout(async () => {
    //                     try {
    //                         const userResponse = await axios.get(`${API}/api/user/profile`, {
    //                             headers: { Authorization: `Bearer ${token}` }
    //                         });

    //                         if (userResponse.data) {
    //                             localStorage.setItem('user', JSON.stringify(userResponse.data));
    //                             // Trigger a page reload to ensure all components get updated user data
    //                             window.location.reload();
    //                         }
    //                     } catch (error) {
    //                         console.error('Error refreshing user data:', error);
    //                     }
    //                 }, 2000);
    //             } else {
    //                 setMessage('Payment confirmation failed');
    //             }
    //         } catch (error) {
    //             console.error('Payment confirmation error:', error);
    //             setMessage('Failed to confirm payment. Please contact support.');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     confirmPayment();
    // }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Confirming your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                {success ? (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <div className="bg-green-50 rounded-lg p-4 mb-6">
                            <p className="text-green-800 font-semibold">+{creditsAdded == 0 ? '' : creditsAdded} Credits Added</p>
                            <p className="text-green-700 text-sm">Ready for more interview practice!</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                    </>
                )}

                <div className="space-y-3">
                    {!success && showRecoveryButton && (
                        <button
                            onClick={tryRecoveryManually}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Recovering Payment...' : 'Try Payment Recovery'}
                        </button>
                    )}

                    <div className="space-y-3">
                        {!success && showRecoveryButton && (
                            <button
                                onClick={tryRecoveryManually}
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Recovering Payment...' : 'Try Payment Recovery'}
                            </button>
                        )}

                        <button
                            onClick={onComplete}
                            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PaymentCancelledProps {
    onBack: () => void;
}

export const PaymentCancelled: React.FC<PaymentCancelledProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
                <p className="text-gray-600 mb-6">Your payment was cancelled. No charges were made.</p>

                <button
                    onClick={onBack}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

