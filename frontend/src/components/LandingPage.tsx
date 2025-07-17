import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface LandingPageProps {
  onShowAuth: (type: string) => void;
  user: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onShowAuth,
  user,
}) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const handleGetStarted = () => {
    if (user) {
      router.push('/interview-call');
    } else {
      onShowAuth('signup');
    }
  };

  const steps = [
    { icon: "🎯", title: "Choose Role", description: "Select your target PM role or paste a job description" },
    { icon: "🎤", title: "Practice", description: "Conduct realistic mock interviews with AI" },
    { icon: "📊", title: "Get Feedback", description: "Receive detailed analytics and insights" },
    { icon: "🚀", title: "Improve", description: "Track progress and refine your skills" }
  ];

  const faqs = [
    {
      question: "How accurate is the AI interviewer?",
      answer: "Our AI is trained on thousands of real PM interviews and continuously updated with the latest industry standards. It provides realistic scenarios and feedback comparable to human interviewers."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We use enterprise-grade encryption and never share your interview data with third parties. Your privacy is our top priority."
    },
    {
      question: "What types of PM interviews do you cover?",
      answer: "We cover all major Product Management interview types, including AI Product Management, behavioral, product sense, technical PM, case studies, and system design interviews."
    }

  ];

  const companies = [
    { name: "Google", logo: "/google-logo.svg" },
    { name: "Amazon", logo: "/amazon-logo.svg" },
    { name: "Meta", logo: "/meta-logo.svg" },
    { name: "Microsoft", logo: "/microsoft-logo.svg" },
    { name: "Apple", logo: "/apple-logo.svg" },
    { name: "Netflix", logo: "/netflix-logo.svg" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-4">
                🚀 Trusted by Product Managers worldwide
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-br from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Master PM Interviews
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                With AI Mock Interviewer
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Practice product management interviews with our advanced AI interviewer.
              Get real-time feedback, improve your responses, and land your dream Product or AI Product Manager role.
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => router.push('/interview-call')}
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Mock Interview
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                  You have <span className="font-semibold text-indigo-600">{user.credits} credits</span> remaining
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onShowAuth('signup')}
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* What Is Juggy AI Section */}
      <section className="py-10 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-8">
              {/* <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <span className="text-4xl">🤖</span>
              </div> */}
              <h2 className="text-5xl pb-2 font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                What is Juggy AI?
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Coach</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your dedicated PM interview coach, available 24/7 to help you practice and improve your skills.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI technology provides realistic interview scenarios and real-time feedback.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Results-Driven</h3>
                <p className="text-gray-600 leading-relaxed">
                  Personalized coaching and analytics to help you excel in product management interviews.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
              <p className="text-xl text-white/90 leading-relaxed">
                "Cracked Google PM with Juggy AI in 30 days. The AI interviewer was incredibly realistic and the feedback helped me identify exactly what I needed to improve."
              </p>
              <p className="text-white/80 mt-4 font-medium">— Sarah Chen, Senior Product Manager at Google</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Juggy AI Section */}
      <section className="py-10 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Juggy AI?</h2>
            <p className="text-xl text-gray-600">The most realistic interview practice experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Interviewer 24/7</h3>
              <p className="text-gray-600">Practice anytime, anywhere with our always-available AI interviewer that never gets tired.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Scoring</h3>
              <p className="text-gray-600">Get instant feedback on confidence, fluency, and communication style with actionable insights.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Improvement</h3>
              <p className="text-gray-600">Monitor your progress over time with detailed analytics and performance trends.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">PM-Focused</h3>
              <p className="text-gray-600">Specialized in behavioral and product thinking questions that PM interviews actually ask.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Try It Now</h2>
            <p className="text-xl text-gray-600">Experience the power of AI-driven interview practice</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">🎤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Sample Interview</h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Experience our AI interviewer with a free 5-minute sample interview — no signup or credit card required. Get a 20-minute mock interview for free.
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Free Interview
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by PMs at</h2>
            <p className="text-xl text-gray-600">PMs at Google, Amazon, and 1,000+ more companies</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {companies.map((company, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md mb-3 hover:shadow-lg transition-shadow">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get interview-ready in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 ${activeStep === index
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    onClick={() => setActiveStep(index)}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0">
                    <div className={`h-full transition-all duration-500 ${activeStep > index ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
                      }`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
              <p className="text-gray-600 mb-6">Join thousands of PMs who have improved their interview skills with Juggy AI</p>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Free Interview
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Pay only for what you use. No subscriptions.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white text-black rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold mb-4">Starter</h3>
              <div className="text-4xl font-bold text-indigo-600 mb-6">$10</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  60 credits (60 minutes)
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Full analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All interview types
                </li>
              </ul>
              <button 
                onClick={() => user ? router.push('/add-credits') : onShowAuth('signup')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Choose Starter
              </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 shadow-lg relative transform hover:-translate-y-2 transition-all duration-300">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 rounded-bl-lg rounded-tr-xl text-sm font-semibold">
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-6">$45</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  300 credits (300 minutes)
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  60 credits (60 minutes)
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Full analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All interview types
                </li>
              </ul>
              <button 
                onClick={() => user ? router.push('/add-credits') : onShowAuth('signup')}
                className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Choose Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Juggy AI vs Alternatives?</h2>
            <p className="text-xl text-gray-600">See how we compare to traditional coaching and free prep</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Juggy AI</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Traditional Coaching</th>
                </tr>
              </thead>
              <tbody className='text-black'>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-left font-medium">Cost per hour</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">$10</td>
                  <td className="py-4 px-6 text-center text-gray-600">$200+</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-left font-medium">Availability</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">24/7</td>
                  <td className="py-4 px-6 text-center text-gray-600">Limited hours</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-left font-medium">Real-time feedback</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-red-500">✗</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-left font-medium">Progress tracking</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-gray-600">Limited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-left font-medium">Personalized questions</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-red-500">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about Juggy AI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors rounded-xl"
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${activeFAQ === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-10 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to ace your PM interview?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of PMs who have improved their interview skills with Juggy AI
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 px-10 py-5 rounded-xl text-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}; 