import React, { useState } from 'react';
import { useAuth } from '../App';
import { GoogleIcon, EnvelopeIcon, XMarkIcon } from '../components/Icons';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    login('user@gmail.com');
    onClose();
  };
  
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { // Basic validation
      login(email);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">Share the water. Share the wellness.</p>
        
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <GoogleIcon className="w-6 h-6" />
            <span>Continue with Google</span>
          </button>
          
          <div className="flex items-center">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                <input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                />
            </div>
            <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-brand-blue text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors"
            >
                <EnvelopeIcon className="w-5 h-5" />
                <span>Continue with Email</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
