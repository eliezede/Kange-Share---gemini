import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../App';
import { GoogleIcon, EnvelopeIcon, SpinnerIcon, ChevronLeftIcon } from '../components/Icons';

export default function SignUpPage() {
    const navigate = useNavigate();
    const { openLoginModal, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        setError('');
        try {
            const userCredential = await loginWithGoogle();
            const { user } = userCredential;
            
            // Check if user document already exists
            const existingUser = await api.getUserById(user.uid);
            if (!existingUser) {
                await api.createInitialUser(user.uid, user.email || '', user.displayName || 'Google User', user.photoURL || '');
            }
            // AuthProvider will handle navigation
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const userCredential = await api.signUpWithEmail(email, password);
            const user = userCredential.user;
            await api.createInitialUser(user.uid, email, 'New User', '');
            navigate('/onboarding', { state: { userId: user.uid } });
        } catch (err: any) {
             setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
             <div className="absolute top-4 left-4">
                <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-semibold">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Create an Account</h1>
                    <p className="text-gray-500 dark:text-gray-400">Join our community of wellness.</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-4">
                    <button
                        onClick={handleGoogleSignUp}
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

                    <form onSubmit={handleEmailSignUp} className="space-y-4 text-left">
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
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="confirm-password">Confirm Password</label>
                            <input 
                                id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••" required
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-brand-blue text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                        >
                            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <EnvelopeIcon className="w-5 h-5" />}
                            <span>Continue with Email</span>
                        </button>
                    </form>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center">
                    Already have an account?{' '}
                    <button onClick={() => {
                        navigate('/');
                        setTimeout(openLoginModal, 100);
                    }} className="font-semibold text-brand-blue hover:underline">
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
}