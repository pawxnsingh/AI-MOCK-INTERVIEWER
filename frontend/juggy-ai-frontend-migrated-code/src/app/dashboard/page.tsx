"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { CongratulationsModal } from "@/components/CongratulationsModal";
import axios from "axios";

export default function DashboardRoute() {
    const [user, setUser] = useState<any>(null);
    const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    useEffect(() => {
        if (typeof window !== 'undefined') {
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
                router.replace("/");
            }
        }
    }, [router]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
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
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                    if (userData.createdAt && userData.lastLoginAt) {
                        const createdAt = new Date(userData.createdAt);
                        const lastLoginAt = new Date(userData.lastLoginAt);
                        const timeDifference = Math.abs(lastLoginAt.getTime() - createdAt.getTime());
                        const oneMinuteInMs = 60 * 1000;
                        if (timeDifference <= oneMinuteInMs) {
                            setShowCongratulationsModal(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Error refreshing user:', error);
            }
            }
            if (token) {
                refreshUser();
            }
        }
    }, [])

    const handleStartMockInterview = () => {
        router.push("/interview-call");
    };

    if (!user) return null;

    return (
        <>
            {showCongratulationsModal && (  
                <CongratulationsModal
                    isOpen={showCongratulationsModal}
                    onClose={() => setShowCongratulationsModal(false)}
                    onStartMockInterview={handleStartMockInterview}
                />
            )}
            <Dashboard />
        </>
    );
}