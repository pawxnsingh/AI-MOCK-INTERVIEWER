'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfileResponse {
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (token) {
        const referralCode = localStorage.getItem('referralCode');
        const referralCodeApplied = localStorage.getItem('referralCodeApplied');
        
        // Step 1: Link referral code if present and not already applied
        if (referralCode && referralCodeApplied === 'false') {
          fetch(`${API}/api/user/referral/link`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ referralCode }),
          })
            .then(async (res) => {
              if (res.ok) {
                // Mark referral code as applied
                localStorage.setItem('referralCodeApplied', 'true');
                console.log('Referral code applied successfully');
              } else {
                console.error('Failed to apply referral code');
              }
            })
            .catch((err) => {
              console.error('Error applying referral code:', err);
            })
            .finally(() => {
              // Step 2: Fetch user profile after referral code handling
              fetchUserProfile(token);
            });
        } else {
          // Step 2: Fetch user profile directly if no referral code
          fetchUserProfile(token);
        }
      }
    }
  }, []);

  const fetchUserProfile = (token: string) => {
    fetch(`${API}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch user profile');
        return res.json();
      })
      .then((data: UserProfileResponse) => {
        // Set the user details and the userid (which will be the token)
        localStorage.setItem('user', JSON.stringify(data.user)); 
        localStorage.setItem('token', data.userId);
        
        // Clean up referral code from localStorage after successful profile fetch
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referralCodeApplied');
      })
      .catch((err) => {
        console.error('Error fetching user profile:', err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
        <p className="text-gray-700 mb-4">You have been authenticated.</p>
        <button
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}