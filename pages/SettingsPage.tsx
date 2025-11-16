import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import { ChevronLeftIcon, ChevronRightIcon, KeyIcon, EnvelopeIcon, TrashIcon, BellIcon, MoonIcon, SunIcon, DocumentTextIcon, ShieldExclamationIcon, LifebuoyIcon, XMarkIcon, SpinnerIcon } from '../components/Icons';
import { useToast } from '../hooks/useToast';


const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div>
        <h2 className="px-4 text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {children}
        </div>
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

const SettingsItem: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void; isDestructive?: boolean }> = ({ icon, title, onClick, isDestructive }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex justify-between items-center text-left p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
        isDestructive ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'
    }`}
>
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 ${isDestructive ? '' : 'text-gray-600 dark:text-gray-300'}`}>{icon}</div>
      <span className="font-medium">{title}</span>
    </div>
    {!isDestructive && <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
  </button>
);


const SettingsToggle: React.FC<{ icon: React.ReactNode; title: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ icon, title, checked, onChange }) => (
    <div className="w-full flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
             <div className="w-6 h-6 text-gray-600 dark:text-gray-300">{icon}</div>
            <span className="font-medium text-gray-800 dark:text-gray-200">{title}</span>
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
);

const DeleteAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrashIcon className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold mb-2 dark:text-white">Delete Account</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete your account? This action is permanent and cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default function SettingsPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();
    
    const [pushNotifs, setPushNotifs] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleNotImplemented = () => {
        showToast('This feature is not yet implemented.', 'info');
    };

    const handleDelete = () => {
        setDeleteModalOpen(false);
        showToast('Account deleted.', 'info');
        logout();
        navigate('/');
    };

    return (
        <div className="pb-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-bold flex-1 text-center dark:text-gray-100">Settings</h1>
                <div className="w-6 h-6"></div> {/* Spacer */}
            </header>

            <div className="p-4 md:p-6 space-y-8">
                <Section title="Account">
                    <SettingsItem icon={<EnvelopeIcon />} title="Change Email" onClick={handleNotImplemented} />
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4"></div>
                    <SettingsItem icon={<KeyIcon />} title="Change Password" onClick={handleNotImplemented} />
                     <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4"></div>
                    <SettingsItem icon={<TrashIcon />} title="Delete Account" onClick={() => setDeleteModalOpen(true)} isDestructive />
                </Section>

                <Section title="Notifications">
                    <SettingsToggle icon={<BellIcon />} title="Push Notifications" checked={pushNotifs} onChange={setPushNotifs} />
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4"></div>
                    <SettingsToggle icon={<EnvelopeIcon />} title="Email Notifications" checked={emailNotifs} onChange={setEmailNotifs} />
                </Section>
                
                <Section title="Appearance">
                    <SettingsToggle 
                        icon={theme === 'dark' ? <MoonIcon /> : <SunIcon />} 
                        title="Dark Mode" 
                        checked={theme === 'dark'} 
                        onChange={toggleTheme} 
                    />
                </Section>

                <Section title="Help & Legal">
                    <SettingsItem icon={<ShieldExclamationIcon />} title="Privacy Policy" onClick={handleNotImplemented} />
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4"></div>
                    <SettingsItem icon={<DocumentTextIcon />} title="Terms of Service" onClick={handleNotImplemented} />
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4"></div>
                    <SettingsItem icon={<LifebuoyIcon />} title="Report a Problem / Support" onClick={handleNotImplemented} />
                </Section>
            </div>
            
            <DeleteAccountModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
