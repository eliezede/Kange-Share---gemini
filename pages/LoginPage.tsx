
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App.tsx';
import { GoogleIcon, EnvelopeIcon, XMarkIcon, SpinnerIcon } from '../components/Icons.tsx';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (loginFn: () => Promise<any>) => {
    setError('');
    setIsLoading(true);
    try {
      await loginFn();
      // The AuthProvider will handle closing the modal on success
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      handleLogin(() => loginWithEmail(email, password));
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
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm m-4 p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
        </button>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome Back</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Share the water. Share the wellness.</p>
        
        <div className="space-y-4">
          <button
            onClick={() => handleLogin(loginWithGoogle)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <GoogleIcon className="w-6 h-6" />
            <span>Continue with Google</span>
          </button>
          
          <div className="flex items-center">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="px-3 text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">Email</label>
                <input 
                    id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">Password</label>
                <input 
                    id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                />
            </div>
             {error && <p className="text-sm text-red-500">{error}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-brand-blue text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
                {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <EnvelopeIcon className="w-5 h-5" />}
                <span>Continue with Email</span>
            </button>
          </form>
        </div>
         <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" onClick={onClose} className="font-semibold text-brand-blue hover:underline">
                Sign Up
            </Link>
        </p>
      </div>
    </div>
  );
}
