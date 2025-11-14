import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { EnvelopeIcon, ChevronRightIcon } from '../components/Icons';

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { userId } = location.state || {};

    if (!userId) {
        // If there's no userId, user shouldn't be here. Redirect to signup.
        return <Navigate to="/signup" replace />;
    }

    const handleContinue = () => {
        navigate('/onboarding', { state: { userId } });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-light dark:bg-blue-900/50 text-brand-blue mx-auto mb-6">
                    <EnvelopeIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">Verify Your Email</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We've sent a verification link to your email address. Please check your inbox to continue.
                </p>
                <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors"
                >
                    <span>Continue to Profile Setup</span>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    (In this demo, you can continue without checking your email.)
                </p>
            </div>
        </div>
    );
}