import React from 'react';

interface PlanSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlan: (planId: string) => void;
    paymentProcessing: boolean;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
    isOpen, onClose, onSelectPlan, paymentProcessing
}) => {
    if (!isOpen) return null;

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

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full transform transition-all duration-200 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Choose Your Plan</h3>
                            <p className="text-sm text-gray-500">Select the plan that works best for you</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid md:grid-cols-2 text-black gap-8 max-w-4xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative ${
                                    plan.popular 
                                        ? 'bg-indigo-600 text-white rounded-xl p-8 shadow-lg' 
                                        : 'bg-white rounded-xl p-8 shadow-lg'
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
                                    disabled={paymentProcessing}
                                    onClick={() => onSelectPlan(plan.id)}
                                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                                        plan.popular
                                            ? 'bg-white text-indigo-600 hover:bg-gray-100 shadow-md hover:shadow-lg'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {paymentProcessing ? 'Processing...' : `Buy Now - ${plan.price}`}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <p className="text-sm text-gray-600 text-center">
                        All plans include secure payment processing and instant credit delivery
                    </p>
                </div>
            </div>
        </div>
    );
}; 