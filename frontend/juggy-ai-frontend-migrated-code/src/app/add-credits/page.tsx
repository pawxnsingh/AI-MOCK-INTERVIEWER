"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

export default function AddCreditsPage() {
    const [user, setUser] = useState<any>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const router = useRouter();

    const API = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");
        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
                router.replace("/");
            }
        } else {
            router.replace("/");
        }
    }, [router]);

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: '$10',
            credits: 60,
            features: [
                '60 credits (60 minutes)',
                'Full analytics',
                'All interview types'
            ],
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '$45',
            credits: 300,
            features: [
                '300 credits (300 minutes)',
                'Advanced analytics',
                'Priority support',
                '25% bonus credits'
            ],
            popular: true
        }
    ];

    const handleSelectPlan = async (planId: string) => {
        const token = localStorage.getItem("token");
        try {
            setPaymentProcessing(true);
            setSelectedPlan(planId);
            const response = await axios.post(`${API}/api/payments/create-checkout-session`, {
                plan_id: planId,
                success_url: `${window.location.origin}?payment=success`,
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
            setPaymentProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add Credits</h1>
                            <p className="text-lg text-gray-600 mt-2">Choose the plan that works best for you</p>
                        </div>
                    </div>

                    {/* Current Credits Display */}
                    <div className="inline-flex items-center bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs text-white font-bold">C</span>
                        </div>
                        <span className="font-semibold text-indigo-700 text-lg">{user.credits}</span>
                        <span className="text-indigo-600 ml-2">credits remaining</span>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative ${plan.popular
                                ? 'bg-indigo-600 text-white rounded-xl p-8 shadow-lg'
                                : 'bg-white text-black rounded-xl p-8 shadow-lg'
                                } transition-all duration-200 hover:shadow-xl border border-indigo-100`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 rounded-bl-lg rounded-tr-xl text-sm font-semibold">
                                    BEST VALUE
                                </div>
                            )}

                            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                            <div className={`text-4xl font-bold mb-6 ${plan.popular ? '' : 'text-indigo-600'}`}>
                                {plan.price}
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <svg className={`w-5 h-5 mr-3 ${plan.popular ? 'text-green-400' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={paymentProcessing && selectedPlan === plan.id}
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${plan.popular
                                    ? 'bg-white text-indigo-600 hover:bg-gray-100 shadow-md hover:shadow-lg'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                            >
                                {paymentProcessing && selectedPlan === plan.id ? (
                                    <>
                                        <span>Processing...</span>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </>
                                ) : (
                                    `Buy Now - ${plan.price}`
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="text-center mt-12">
                    <p className="text-sm text-gray-600">
                        All plans include secure payment processing and instant credit delivery
                    </p>
                </div>
            </div>
        </div>
    );
} 