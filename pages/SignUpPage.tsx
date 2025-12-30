
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api.ts';
import { useAuth } from '../App.tsx';
import { GoogleIcon, EnvelopeIcon, SpinnerIcon, ChevronLeftIcon } from '../components/Icons.tsx';

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
            const existingUser = await api.getUserById(user.uid);
            if (!existingUser) {
                const nameParts = (user.displayName || 'Google User').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                await api.createInitialUser(user.uid, user.email || '', firstName, lastName, user.displayName || 'Google User', user.photoURL || '');
            }
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
            await api.createInitialUser(user.uid, email, '', '', 'New User', '');
        } catch (err: any) {
             setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
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
                    <button onClick={handleGoogleSignUp} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <GoogleIcon className="w-6 h-6" />
                        <span>Continue with Google</span>
                    </button>
                    <div className="flex items-center"><hr className="flex-grow border-t border-gray-300"/><span className="px-3 text-gray-500 text-sm">OR</span><hr className="flex-grow border-t border-gray-300"/></div>
                    <form onSubmit={handleEmailSignUp} className="space-y-4 text-left">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg outline-none transition"/>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg outline-none transition"/>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg outline-none transition"/>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 transition disabled:bg-blue-300">
                            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin mx-auto"/> : 'Continue with Email'}
                        </button>
                    </form>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center">Already have an account? <button onClick={openLoginModal} className="font-semibold text-brand-blue hover:underline">Log In</button></p>
            </div>
        </div>
    );
}
