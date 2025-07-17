'use client'
import InterviewReport from '@/components/InterviewReport'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function page() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
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
    }, [router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <InterviewReport />
        </div>
    )
}
