"use client"
import React from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
                            Privacy Policy
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
                            Introduction
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. By accessing or using our services, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">2</span>
                            </span>
                            Information We Collect
                        </h2>
                        <ul className="space-y-3 ml-4">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Personal Information: Name, email address, and other identifiers you provide when creating an account.</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Interview Data: Audio recordings, transcripts, and feedback from AI interview sessions.</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Usage Data: Information about how you use our platform, including log data, device information, and cookies.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">3</span>
                            </span>
                            How We Use Your Information
                        </h2>
                        <ul className="space-y-3 ml-4">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">To provide and maintain our services, including AI interview sessions and feedback.</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">To improve our platform and develop new features.</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">To communicate with you, including sending updates and responding to inquiries.</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">To comply with legal obligations and protect our rights.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">4</span>
                            </span>
                            How We Share Your Information
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            We do not sell or rent your personal information. We may share your information with:
                        </p>
                        <ul className="space-y-3 ml-4">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Service providers who assist in operating our platform and providing our services.</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Legal authorities if required by law or to protect our rights.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">5</span>
                            </span>
                            Data Security
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">6</span>
                            </span>
                            Your Rights and Choices
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            You may access, update, or delete your personal information by contacting us. You may also opt out of certain communications at any time.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">7</span>
                            </span>
                            Children's Privacy
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us to have it removed.
                        </p>
                    </section>

                    <section className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">8</span>
                            </span>
                            Changes to This Policy
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with a new effective date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-semibold text-sm">9</span>
                            </span>
                            Contact Us
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            If you have any questions about this Privacy Policy, please contact us at{' '}
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