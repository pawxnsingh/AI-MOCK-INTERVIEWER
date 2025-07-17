import React from 'react'

interface AdminDashboardProps {
    user: any;
    onShowAuth: (type: string) => void;
    onNavigate: (view: string) => void;
    currentView?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onShowAuth, onNavigate, currentView }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage users and system settings</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Admin Features</h2>
                    <p className="text-gray-600">Admin functionality coming soon...</p>
                </div>
            </div>
        </div>
    );
};

