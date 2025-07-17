import React, { useState } from 'react';
// import { GoogleLogin } from '@react-oauth/google';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface AuthComponentProps {
  authType: 'login' | 'signup';
  onBack: () => void;
  onAuthSuccess: (userData: any) => void;
}

export const AuthComponent: React.FC<AuthComponentProps> = ({
  authType,
  onBack,
  onAuthSuccess,
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSignup = () => {
    // Store referral code in localStorage if provided
    if (referralCode.trim()) {
      localStorage.setItem('referralCode', referralCode.trim());
      localStorage.setItem('referralCodeApplied', 'false');
    }
    window.location.href = `${API}/auth/login`;
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 fixed top-0 left-0 w-full h-full z-50 inset-0 overflow-y-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 mb-8"
            >
              ← Back
            </button>
            
            {authType === 'signup' && (
              <>
                <div className="mb-6">
                  <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    id="referralCode"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center mb-6">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Terms Of Service
                    </a>
                  </label>
                </div>
              </>
            )}

            <button
              onClick={handleSignup}
              className={`w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 ${authType === 'signup' && !acceptedTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={authType === 'signup' && !acceptedTerms}
            >
              <div className='flex gap-2'>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                {authType === 'login' ? ' Sign in with Google' : ' Sign up with Google'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 