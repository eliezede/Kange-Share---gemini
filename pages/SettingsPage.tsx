
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    KeyIcon, 
    EnvelopeIcon, 
    TrashIcon, 
    BellIcon, 
    MoonIcon, 
    SunIcon, 
    DocumentTextIcon, 
    ShieldExclamationIcon, 
    LifebuoyIcon, 
    GlobeAltIcon,
    CheckCircleIcon
} from '../components/Icons';
import { useToast } from '../hooks/useToast';


const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div>
        <h2 className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">{title}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
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

const SettingsItem: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void; isDestructive?: boolean; badge?: string }> = ({ icon, title, onClick, isDestructive, badge }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex justify-between items-center text-left p-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
        isDestructive ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'
    }`}
>
    <div className="flex items-center gap-4">
      <div className={`w-5 h-5 ${isDestructive ? '' : 'text-gray-500 dark:text-gray-400'}`}>{icon}</div>
      <span className="font-bold text-sm tracking-tight">{title}</span>
    </div>
    <div className="flex items-center gap-2">
        {badge && <span className="text-[10px] font-black bg-brand-light dark:bg-blue-900/30 text-brand-blue px-2 py-0.5 rounded-full uppercase tracking-widest">{badge}</span>}
        {!isDestructive && <ChevronRightIcon className="w-5 h-5 text-gray-300" />}
    </div>
  </button>
);

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const langs: { id: Language, name: string, flag: string }[] = [
        { id: 'en', name: 'English', flag: '🇺🇸' },
        { id: 'pt', name: 'Português', flag: '🇧🇷' }
    ];

    return (
        <div className="p-2 bg-gray-50 dark:bg-gray-900/50 m-4 rounded-2xl flex gap-1">
            {langs.map(l => (
                <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                        language === l.id 
                        ? 'bg-white dark:bg-gray-800 shadow-md text-brand-blue scale-100' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 scale-95'
                    }`}
                >
                    <span className="text-base">{l.flag}</span>
                    {l.name}
                </button>
            ))}
        </div>
    );
};

export default function SettingsPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const { showToast } = useToast();
    
    const [pushNotifs, setPushNotifs] = useState(true);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    return (
        <div className="pb-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-black flex-1 text-center dark:text-gray-100 uppercase tracking-widest">{t('settings')}</h1>
                <div className="w-6 h-6"></div>
            </header>

            <div className="p-4 md:p-6 space-y-8 animate-fade-in-up">
                
                <Section title={t('language')}>
                    <LanguageSelector />
                </Section>

                <Section title="Account">
                    <SettingsItem icon={<EnvelopeIcon />} title="Change Email" onClick={() => {}} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                    <SettingsItem icon={<KeyIcon />} title="Change Password" onClick={() => {}} />
                </Section>

                <Section title="Appearance">
                    <div className="w-full flex justify-between items-center p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-5 h-5 text-gray-500 dark:text-gray-400">
                                {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{t('dark_mode')}</span>
                        </div>
                        <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
                    </div>
                </Section>

                <Section title="Help & Legal">
                    <SettingsItem icon={<ShieldExclamationIcon />} title="Privacy Policy" onClick={() => {}} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                    <SettingsItem icon={<DocumentTextIcon />} title="Terms of Service" onClick={() => {}} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                    <SettingsItem icon={<LifebuoyIcon />} title="Support" onClick={() => {}} />
                </Section>
                
                <div className="px-4 pt-4">
                    <button 
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 font-black uppercase tracking-widest text-xs rounded-2xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
