import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
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

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function OnboardingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithEmail } = useAuth();
    
    const { userId, email, password } = location.state || {};
    const [user, setUser] = useState<Partial<User> | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showHostSettings, setShowHostSettings] = useState(false);

    const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        if (userId) {
            api.getUserById(userId).then(userData => {
                if (userData) {
                    setUser(userData);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [userId]);

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
    
    const handleAvailabilityChange = (day: string, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
        setUser(prev => {
            if (!prev) return null;
    
            const currentAvailability = prev.availability || {};
            const dayAvailability = currentAvailability[day] || { enabled: false, startTime: '09:00', endTime: '17:00' };
    
            return {
                ...prev,
                availability: {
                    ...currentAvailability,
                    [day]: {
                        ...dayAvailability,
                        [field]: value,
                    },
                },
            };
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !user) return;

        setIsSaving(true);
        try {
            await api.updateUser(userId, {
                ...user,
                isHost: showHostSettings
            });
            
            // Log the user in after they complete onboarding
            if (email && password) {
                await loginWithEmail(email, password);
            }
            // On successful login, the AuthProvider's onAuthStateChanged will trigger a redirect.
        } catch (error) {
            console.error("Onboarding failed:", error);
            alert("There was an error saving your profile. Please try again.");
            setIsSaving(false); // Reset saving state on error
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" /></div>;
    }
    
    if (!userId) {
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
                        <InputField label="Full Name" id="name" name="name" value={user.name || ''} onChange={handleInputChange} required />
                        <InputField label="Phone" id="phone" name="phone" type="tel" value={user.phone || ''} onChange={handleInputChange} required />
                    </FormSection>
                    
                    <FormSection title="Your Location">
                         <InputField label="City" id="address.city" name="address.city" value={user.address?.city || ''} onChange={handleInputChange} required />
                         <InputField label="Country" id="address.country" name="address.country" value={user.address?.country || ''} onChange={handleInputChange} required />
                         <p className="text-xs text-gray-500 dark:text-gray-400 !mt-2">Your city and country are public. Full address can be added later in your profile settings.</p>
                    </FormSection>

                    {showHostSettings ? (
                        <FormSection title="Host Settings">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pickup Availability</label>
                                <div className="space-y-3">
                                    {DAYS_OF_WEEK.map(day => (
                                    <div key={day} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{day}</span>
                                        <Toggle 
                                            checked={user.availability?.[day]?.enabled || false}
                                            onChange={(checked) => handleAvailabilityChange(day, 'enabled', checked)}
                                        />
                                        </div>
                                        {user.availability?.[day]?.enabled && (
                                        <div className="grid grid-cols-2 gap-3 pl-4">
                                            <input type="time" defaultValue="09:00" onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm"/>
                                            <input type="time" defaultValue="17:00" onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm"/>
                                        </div>
                                        )}
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </FormSection>
                    ) : (
                        <div className="text-center">
                            <button type="button" onClick={() => setShowHostSettings(true)} className="font-semibold text-brand-blue hover:underline">
                                Want to share water? Add host settings.
                            </button>
                        </div>
                    )}

                    <div className="pt-4">
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
