
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import * as api from '../api.ts';
import { User } from '../types.ts';
import { useAuth } from '../App.tsx';
import { SpinnerIcon } from '../components/Icons.tsx';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { userData, setUserData } = useAuth();
    const [user, setUser] = useState<Partial<User> | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userData) {
            setUser(userData);
            setLoading(false);
        }
    }, [userData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prev => {
            if (!prev) return null;
            if (name.includes('.')) {
                const [section, key] = name.split('.');
                return { ...prev, [section]: { ...(prev[section as keyof User] as object || {}), [key]: value } };
            }
            return { ...prev, [name]: value };
        });
    };
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userData) return;
        setIsSaving(true);
        try {
            const updates: Partial<User> = {
                ...user,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                onboardingCompleted: true,
                onboardingStep: 'completed'
            };
            await api.updateUser(userData.id, updates);
            setUserData(prev => ({ ...prev, ...updates } as User));
        } catch (error) {
            console.error(error);
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" /></div>;
    if (!userData) return <Navigate to="/signup" replace />;

    return (
        <div className="pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10"><h1 className="text-xl font-bold text-center">Setup Your Profile</h1></header>
            <div className="p-6 max-w-lg mx-auto space-y-6">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 space-y-4">
                        <input name="firstName" value={user?.firstName || ''} onChange={handleInputChange} placeholder="First Name" required className="w-full p-3 border dark:bg-gray-700 rounded-lg outline-none"/>
                        <input name="lastName" value={user?.lastName || ''} onChange={handleInputChange} placeholder="Last Name" required className="w-full p-3 border dark:bg-gray-700 rounded-lg outline-none"/>
                        <input name="phone" value={user?.phone || ''} onChange={handleInputChange} placeholder="Phone Number" required className="w-full p-3 border dark:bg-gray-700 rounded-lg outline-none"/>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 space-y-4">
                         <input name="address.city" value={user?.address?.city || ''} onChange={handleInputChange} placeholder="City" required className="w-full p-3 border dark:bg-gray-700 rounded-lg outline-none"/>
                         <input name="address.country" value={user?.address?.country || ''} onChange={handleInputChange} placeholder="Country" required className="w-full p-3 border dark:bg-gray-700 rounded-lg outline-none"/>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full py-4 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 transition disabled:bg-blue-300">
                        {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin mx-auto"/> : 'Complete & Enter App'}
                    </button>
                </form>
            </div>
        </div>
    );
}
