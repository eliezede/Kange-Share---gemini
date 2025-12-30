
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App.tsx';
import { ChevronLeftIcon, ChevronRightIcon, KeyIcon, EnvelopeIcon, MoonIcon, SunIcon, GlobeAltIcon, TrashIcon } from '../components/Icons.tsx';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="pb-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            <header className="p-4 flex items-center border-b sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate(-1)} className="p-1"><ChevronLeftIcon className="w-6 h-6" /></button>
                <h1 className="text-xl font-black flex-1 text-center uppercase tracking-widest">Settings</h1>
            </header>
            <div className="p-4 space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="font-bold dark:text-white">Dark Mode</span>
                        <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-blue' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 font-black rounded-2xl border border-red-100">Logout</button>
            </div>
        </div>
    );
}
