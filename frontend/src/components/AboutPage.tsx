"use client"
import React, { useState, useEffect } from 'react';

export const AboutPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [teamMemberHover, setTeamMemberHover] = useState<number | null>(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const tabs = [
        { id: 0, title: "Our Story", icon: "📖" },
        { id: 1, title: "Mission", icon: "🎯" },
        { id: 2, title: "Values", icon: "💎" },
        { id: 3, title: "Team", icon: "👥" }
    ];

    const tabContent = [
        {
            title: "Our Story",
            content: `Juggy AI was born from a simple observation: traditional interview preparation was broken. 
      PMs were spending thousands on coaching, but still struggling with real interviews. We saw an opportunity 
      to democratize access to high-quality interview practice through AI technology.`,
            details: [
                "Founded in 2024 by a team of ex-Google, Meta, and Amazon PMs",
                "Built on 10,000+ real PM interview questions and responses",
                "Used by 1,000+ PMs worldwide with 95% satisfaction rate",
                "Continuously updated with the latest industry trends and questions"
            ]
        },
        {
            title: "Our Mission",
            content: `We're on a mission to democratize access to world-class PM interview preparation. 
      We believe that every aspiring Product Manager deserves the opportunity to practice with the same 
      quality of feedback that top-tier candidates receive.`,
            details: [
                "Make PM interview prep accessible to everyone",
                "Provide realistic, AI-powered interview practice",
                "Help PMs build confidence and improve their skills",
                "Bridge the gap between traditional prep and real interviews"
            ]
        },
        {
            title: "Our Values",
            content: `Our values guide everything we do, from product development to customer support. 
      We believe in transparency, continuous improvement, and putting our users first.`,
            details: [
                "Transparency in pricing and product capabilities",
                "Continuous improvement based on user feedback",
                "User privacy and data security as top priorities",
                "Accessibility and inclusivity in everything we build"
            ]
        },
        {
            title: "Our Team",
            content: `We're a small but mighty team of PMs, engineers, and designers who are passionate 
      about helping others succeed in their PM journey.`,
            details: []
        }
    ];

    const teamMembers = [
        {
            name: "Sarah Chen",
            role: "CEO & Co-founder",
            bio: "Former Senior PM at Google, led teams of 50+ engineers. Passionate about democratizing access to PM education.",
            avatar: "👩‍💼",
            experience: "8+ years PM experience",
            companies: ["Google", "Meta", "Startup"]
        },
        {
            name: "Alex Rodriguez",
            role: "CTO & Co-founder",
            bio: "Ex-Google engineer turned PM. Built and scaled multiple products used by millions of users.",
            avatar: "👨‍💻",
            experience: "10+ years tech experience",
            companies: ["Google", "Amazon", "Microsoft"]
        },
        {
            name: "Priya Patel",
            role: "Head of Product",
            bio: "Former PM at Netflix and Spotify. Expert in user research and product strategy.",
            avatar: "👩‍🎨",
            experience: "6+ years PM experience",
            companies: ["Netflix", "Spotify", "Uber"]
        },
        {
            name: "Marcus Johnson",
            role: "Head of AI",
            bio: "PhD in Machine Learning, former research scientist at OpenAI. Leads our AI development.",
            avatar: "🤖",
            experience: "7+ years AI experience",
            companies: ["OpenAI", "DeepMind", "Stanford"]
        }
    ];

    const stats = [
        { number: "1,000+", label: "PMs Helped", icon: "👥" },
        { number: "95%", label: "Satisfaction Rate", icon: "⭐" },
        { number: "10,000+", label: "Interviews Conducted", icon: "🎤" },
        { number: "24/7", label: "Availability", icon: "⏰" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <div className="mb-8">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-4">
                                About Juggy AI
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            <span className="bg-gradient-to-br from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                                Building the Future of
                            </span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                PM Interview Prep
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                            We're on a mission to democratize access to world-class Product Manager interview preparation
                            through innovative AI technology and real-world expertise.
                        </p>
                    </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={`text-center transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">{stat.icon}</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Tabs Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Get to Know Us</h2>
                        <p className="text-xl text-gray-600">Learn about our journey, mission, and the team behind Juggy AI</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.title}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                                    {activeTab === 0 && "Our Story"}
                                    {activeTab === 1 && "Our Mission"}
                                    {activeTab === 2 && "Our Values"}
                                    {activeTab === 3 && "Our Team"}
                                </h3>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    {activeTab === 0 && "Juggy AI was born from a simple observation: traditional interview preparation was broken. PMs were spending thousands on coaching, but still struggling with real interviews. We saw an opportunity to democratize access to high-quality interview practice through AI technology."}
                                    {activeTab === 1 && "We're on a mission to democratize access to world-class PM interview preparation. We believe that every aspiring Product Manager deserves the opportunity to practice with the same quality of feedback that top-tier candidates receive."}
                                    {activeTab === 2 && "Our values guide everything we do, from product development to customer support. We believe in transparency, continuous improvement, and putting our users first."}
                                    {activeTab === 3 && "We're a small but mighty team of PMs, engineers, and designers who are passionate about helping others succeed in their PM journey."}
                                </p>
                            </div>

                            <div className="relative">
                                {activeTab === 3 ? (
                                    // Team Members Grid
                                    <div className="grid grid-cols-2 gap-4">
                                        {teamMembers.map((member, index) => (
                                            <div
                                                key={index}
                                                className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 cursor-pointer ${teamMemberHover === index ? 'shadow-lg scale-105' : 'shadow-md'
                                                    }`}
                                                onMouseEnter={() => setTeamMemberHover(index)}
                                                onMouseLeave={() => setTeamMemberHover(null)}
                                            >
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-md">
                                                    {member.avatar}
                                                </div>
                                                <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
                                                <p className="text-sm text-indigo-600 mb-2">{member.role}</p>
                                                <p className="text-xs text-gray-600">{member.experience}</p>
                                                {teamMemberHover === index && (
                                                    <div className="absolute inset-0 bg-white rounded-xl p-4 shadow-xl z-10">
                                                        <div className="text-center">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                                                                {member.avatar}
                                                            </div>
                                                            <h4 className="font-semibold text-gray-900 mb-2">{member.name}</h4>
                                                            <p className="text-sm text-indigo-600 mb-3">{member.role}</p>
                                                            <p className="text-sm text-gray-600 mb-3">{member.bio}</p>
                                                            <div className="flex flex-wrap gap-1 justify-center">
                                                                {member.companies.map((company, idx) => (
                                                                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                                                        {company}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Other tab content visual
                                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <span className="text-4xl">{tabs[activeTab].icon}</span>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {tabs[activeTab].title}
                                            </h3>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
                        <p className="text-xl text-gray-600">From idea to helping thousands of PMs</p>
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>

                        {/* Timeline items */}
                        <div className="space-y-12">
                            {[
                                {
                                    year: "2024 Q1",
                                    title: "The Beginning",
                                    description: "Founded by ex-Google and Meta PMs who saw the need for better interview prep",
                                    icon: "🚀"
                                },
                                {
                                    year: "2024 Q2",
                                    title: "First Prototype",
                                    description: "Built and tested our first AI interviewer with 100 beta users",
                                    icon: "🔬"
                                },
                                {
                                    year: "2024 Q3",
                                    title: "Public Launch",
                                    description: "Launched Juggy AI to the public, helping our first 500 PMs",
                                    icon: "🎉"
                                },
                                {
                                    year: "2024 Q4",
                                    title: "Growth & Scale",
                                    description: "Reached 1,000+ users and expanded our question database to 10,000+ questions",
                                    icon: "📈"
                                },
                                {
                                    year: "2025 Q1",
                                    title: "Future Vision",
                                    description: "Expanding to new interview types and launching advanced analytics features",
                                    icon: "🔮"
                                }
                            ].map((item, index) => (
                                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                    {/* Timeline dot */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                        {item.icon}
                                    </div>

                                    {/* Content */}
                                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                                        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            <div className="text-sm font-semibold text-indigo-600 mb-2">{item.year}</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What Drives Us</h2>
                        <p className="text-xl text-gray-600">Our core values that guide everything we do</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: "🎯",
                                title: "Excellence",
                                description: "We strive for excellence in everything we do, from our AI technology to customer support."
                            },
                            {
                                icon: "🤝",
                                title: "Empathy",
                                description: "We understand the PM interview journey because we've been there ourselves."
                            },
                            {
                                icon: "🔬",
                                title: "Innovation",
                                description: "We continuously innovate to provide the best possible interview preparation experience."
                            },
                            {
                                icon: "🌍",
                                title: "Accessibility",
                                description: "We believe everyone deserves access to world-class PM interview preparation."
                            }
                        ].map((value, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl">{value.icon}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Join Our Mission</h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        Help us democratize access to world-class PM interview preparation
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Start Your Journey
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}; 