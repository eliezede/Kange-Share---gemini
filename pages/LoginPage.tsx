import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { GoogleIcon } from '../components/Icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    // In a real app, this would trigger the Google OAuth flow.
    // For this mock, we'll just log in the user.
    login('user@gmail.com');
    navigate('/map');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Kangen Share</h1>
        <p className="text-gray-500 mb-8">Share the water. Share the wellness.</p>
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <GoogleIcon className="w-6 h-6" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
