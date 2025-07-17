'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <button
                        onClick={() => {
                            if (window.history.length > 1) {
                                router.back();
                            } else {
                                window.close();
                            }
                        }}
                        className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center mx-auto transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-br from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Terms Of Service
                        </span>
                    </h1>
                    <div className="text-gray-600 text-lg">Last updated: July 2, 2025</div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">1</span>
                            </span>
                            Acceptance of Terms
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">2</span>
                            </span>
                            Use License
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">
                            Permission is granted to temporarily download one copy of the materials (information or software) on this website for personal,
                            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="space-y-3 ml-4">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Modify or copy the materials</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Use the materials for any commercial purpose or for any public display</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Attempt to reverse engineer any software contained on the website</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Remove any copyright or other proprietary notations from the materials</span>
                            </li>
                        </ul>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">3</span>
                            </span>
                            Disclaimer
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim
                            and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a
                            particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">4</span>
                            </span>
                            Limitations
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
                            or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or an authorized
                            representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">5</span>
                            </span>
                            Platform Services and AI Interviews
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg mb-4">
                            Our platform provides AI-powered interview services. By using our service, you acknowledge and agree that:
                        </p>
                        <ul className="space-y-3 ml-4 mb-4">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Interviews will be conducted by artificial intelligence systems</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">All interview sessions, including audio recordings and transcripts, will be recorded and stored</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Interview data may be used to provide feedback, analysis, and improve our AI systems</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">You consent to the recording and processing of your interview sessions</span>
                            </li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            By participating in our AI interviews, you grant us permission to record, store, and analyze your interview sessions for the purposes of providing our services and improving our platform.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">6</span>
                            </span>
                            Privacy Policy
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">7</span>
                            </span>
                            User Account
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg mb-4">
                            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible
                            for safeguarding the password and for all activities that occur under your account.
                        </p>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">8</span>
                            </span>
                            Service Availability
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to
                            you or to any third party for any modification, suspension, or discontinuance of the service.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">9</span>
                            </span>
                            Governing Law
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive
                            jurisdiction of the courts in that location.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">10</span>
                            </span>
                            Changes to Terms
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            We reserve the right, at our sole discretion, to modify or replace these terms at any time. If a revision is material, we will try to
                            provide at least 30 days notice prior to any new terms taking effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">11</span>
                            </span>
                            Contact Information
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            If you have any questions about these terms of service, please contact us at{' '}
                            <a href="mailto:support@juggy.ai" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">
                                support@juggy.ai
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
} 