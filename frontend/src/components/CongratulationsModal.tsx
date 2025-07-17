import React, { useEffect, useState } from 'react';

interface CongratulationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartMockInterview: () => void;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
    isOpen,
    onClose,
    onStartMockInterview,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsAnimating(true);
            // Reset animation after it completes
            const timer = setTimeout(() => setIsAnimating(false), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white shadow-2xl rounded-xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'
                } animate-slideUp`}>
                <div className="text-center">
                    {/* Animated celebration icon */}
                    <div className={`w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 ${isAnimating ? 'animate-bounce' : ''
                        }`}>
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    {/* Confetti effect */}
                    {isAnimating && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti`}
                                    style={{
                                        left: `${20 + i * 15}%`,
                                        top: '10%',
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: '1s'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fadeInUp">
                        Congratulations!
                    </h2>

                    <p className="text-gray-600 mb-6 text-lg leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        You have received <span className="font-bold text-green-600">20 free credits</span>.
                        Have fun practicing your mock interview!
                    </p>

                    <div className="flex flex-col gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <button
                            onClick={onStartMockInterview}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Start Mock Interview
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white text-gray-600 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes confetti {
          0% { 
            transform: translateY(-100px) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(100vh) rotate(360deg); 
            opacity: 0; 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-confetti {
          animation: confetti 1s linear forwards;
        }
      `}</style>
        </div>
    );
}; 