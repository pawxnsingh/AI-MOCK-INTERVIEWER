'use client'

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { AuthComponent } from "./AuthComponent";


export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<string>('');
  const [authType, setAuthType] = useState('signup');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const API = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      // Only redirect to home if not on protected routes that don't require immediate auth
      if (pathname === '/dashboard' || pathname === '/add-credits' || pathname === '/interview-call') {
        router.replace("/");
      }
    }
    // Remove the automatic redirect to home - let individual pages handle their own auth requirements
  }, [router, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem("token");
    const refreshUser = async () => {
      try {
        const response = await axios.get(`${API}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data && response.data.user) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
    if (token) {
      refreshUser();
    }
  }, [isClient])

  // Update currentView based on pathname
  useEffect(() => {
    const getCurrentView = (path: string) => {
      if (path === '/') return 'home';
      if (path === '/dashboard') return 'dashboard';
      if (path === '/interview-call') return 'interview';
      if (path === '/add-credits') return 'add-credits';
      if (path === '/about') return 'about';
      if (path === '/terms') return 'terms';
      if (path === '/privacy') return 'privacy';
      if (path === '/interview-report') return 'interview-report';
      return '';
    };

    setCurrentView(getCurrentView(pathname));
  }, [pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleShowAuth = (type: string) => {
    if (type === "logout") {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/");
      setIsMobileMenuOpen(false);
    } else {
      setAuthType(type);
      setCurrentView('auth');
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setCurrentView('landing');
  };

  const handleBack = () => {
    setCurrentView('landing');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  if (currentView === 'auth') {
    return (
      <AuthComponent
        authType={authType as 'login' | 'signup'}
        onBack={handleBack}
        onAuthSuccess={handleAuthSuccess}
      />
    )
  }

  // Don't render user-dependent content until client-side hydration is complete
  if (!isClient) {
    return (
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <button
                onClick={() => router.push('/')}
                className="ml-3 cursor-pointer text-xl sm:text-2xl font-bold text-gray-900 hover:text-indigo-600"
              >
                Juggy AI
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {/* Loading state - will be replaced after hydration */}
            </div>
            <div className="md:hidden">
              <button
                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <button
                onClick={() => router.push('/')}
                className={`ml-3 cursor-pointer text-xl sm:text-2xl font-bold text-gray-900 hover:text-indigo-600 ${currentView === 'home' ? 'text-indigo-600' : ''}`}
              >
                Juggy AI
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* User-specific Navigation */}
              {user && (
                <>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className={`text-gray-600 cursor-pointer hover:text-gray-800 ${currentView === 'dashboard' ? 'font-semibold text-gray-800' : ''}`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/interview-call')}
                    className={`text-gray-600 cursor-pointer hover:text-gray-800 ${currentView === 'interview' ? 'font-semibold text-gray-800' : ''}`}
                  >
                    New Interview
                  </button>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-indigo-50 px-3 py-2 rounded-lg">
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs text-white font-bold">C</span>
                      </div>
                      <span className="font-semibold text-indigo-700">{user.credits}</span>
                      <span className="text-sm text-indigo-600 ml-1">credits</span>
                    </div>

                    <button
                      onClick={() => router.push('/add-credits')}
                      className={`bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-1 ${currentView === 'add-credits' ? 'bg-indigo-700' : ''}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Credits</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                    <button
                      onClick={() => handleShowAuth('logout')}
                      className="text-sm text-gray-500 cursor-pointer hover:text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleShowAuth('login')}
                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleShowAuth('signup')}
                    className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile menu panel */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-4">

                {user ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Welcome, {user.name}</p>
                      <div className="flex items-center bg-indigo-50 px-3 py-2 rounded-lg">
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs text-white font-bold">C</span>
                        </div>
                        <span className="font-semibold text-indigo-700">{user.credits}</span>
                        <span className="text-sm text-indigo-600 ml-1">credits</span>
                      </div>
                    </div>

                    {/* User-specific Navigation Links */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleNavigation('/dashboard')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard'
                            ? 'bg-indigo-100 text-indigo-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => handleNavigation('/interview-call')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'interview'
                            ? 'bg-indigo-100 text-indigo-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        New Interview
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleNavigation('/add-credits')}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${currentView === 'add-credits'
                            ? 'bg-indigo-700 text-white'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Credits</span>
                      </button>
                      <button
                        onClick={() => handleShowAuth('logout')}
                        className="w-full px-4 py-3 text-sm text-gray-600 hover:text-gray-800 text-center"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <button
                        onClick={() => handleShowAuth('login')}
                        className="w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg text-left transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleShowAuth('signup')}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 