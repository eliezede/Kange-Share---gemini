import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import * as api from '../api';
import { User } from '../types';
import { useAuth } from '../App';
import { SpinnerIcon } from '../components/Icons';

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 dark:border-gray-700">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
    />
  </div>
);

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
                return {
                    ...prev,
                    [section]: {
                        ...(prev[section as keyof User] as object || {}),
                        [key]: value
                    }
                };
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
            
            // Update the global state, which will trigger navigation via AppRoutes
            setUserData(prev => ({ ...prev, ...updates } as User));

        } catch (error) {
            console.error("Onboarding failed:", error);
            alert("There was an error saving your profile. Please try again.");
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" /></div>;
    }
    
    if (!userData) {
        // This is a safeguard; AppRoutes should prevent this page from being rendered without a user.
        return <Navigate to="/signup" replace />;
    }

    if (!user) {
        return <div className="text-center p-4">Could not load user data. Please try again.</div>;
    }
    
    return (
        <div className="pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <h1 className="text-xl font-bold flex-1 text-center dark:text-gray-100">Setup Your Profile</h1>
                <div className="w-16"></div>
            </header>
            
            <div className="p-4 md:p-6 space-y-6">
                 <p className="text-center text-gray-600 dark:text-gray-400">Welcome! Let's get your account ready.</p>
                <form id="onboarding-form" onSubmit={handleSave} className="space-y-6">
                    <FormSection title="Personal Info">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="First Name" id="firstName" name="firstName" value={user.firstName || ''} onChange={handleInputChange} required />
                            <InputField label="Last Name" id="lastName" name="lastName" value={user.lastName || ''} onChange={handleInputChange} required />
                        </div>
                        <InputField label="Phone" id="phone" name="phone" type="tel" value={user.phone || ''} onChange={handleInputChange} required />
                    </FormSection>
                    
                    <FormSection title="Your Location">
                         <InputField label="City" id="address.city" name="address.city" value={user.address?.city || ''} onChange={handleInputChange} required />
                         <InputField label="Country" id="address.country" name="address.country" value={user.address?.country || ''} onChange={handleInputChange} required />
                         <p className="text-xs text-gray-500 dark:text-gray-400 !mt-2">Your city and country are public. Full address can be added later in your profile settings.</p>
                    </FormSection>

                    <div className="pt-4">
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-4 text-sm">
                            Want to share water? You can set up your host profile and get verified after completing this initial setup.
                        </p>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex justify-center items-center"
                        >
                             {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : 'Complete Profile & Enter App'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}