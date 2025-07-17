import React, { useState } from 'react'
import { PlanSelectionModal } from './PlanSelectionModal'

interface LowCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCredits: number;
    onUpgrade: (planId: string) => void;
    paymentProcessing: boolean;
}

export const LowCreditsModal: React.FC<LowCreditsModalProps> = ({
    isOpen, onClose, currentCredits, onUpgrade, paymentProcessing
}) => {
    const [showPlanSelection, setShowPlanSelection] = useState(false);

    if (!isOpen) return null;

    const handleRechargeClick = () => {
        setShowPlanSelection(true);
    };

    const handlePlanSelection = (planId: string) => {
        setShowPlanSelection(false);
        onUpgrade(planId);
    };

    const handleClosePlanSelection = () => {
        setShowPlanSelection(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 ease-out">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Low Credits</h3>
                                <p className="text-sm text-gray-500">Action required</p>
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
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-700 font-medium">You have <span className="text-indigo-600 font-bold">{currentCredits}</span> credits remaining</p>
                                <p className="text-sm text-gray-500 mt-1">Upgrade your plan to continue your practice sessions</p>
                            </div>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            disabled={paymentProcessing}
                            onClick={handleRechargeClick}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>{paymentProcessing ? 'Processing...' : 'Recharge Now'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Selection Modal */}
            <PlanSelectionModal
                isOpen={showPlanSelection}
                onClose={handleClosePlanSelection}
                onSelectPlan={handlePlanSelection}
                paymentProcessing={paymentProcessing}
            />
        </>
    );
};
