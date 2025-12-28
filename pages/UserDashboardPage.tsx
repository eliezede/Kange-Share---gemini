
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';
import { 
    UserCircleIcon, 
    CheckBadgeIcon, 
    ChevronRightIcon, 
    ClipboardDocumentListIcon, 
    PresentationChartBarIcon,
    ArrowLeftOnRectangleIcon,
    SunIcon,
    MoonIcon,
    DocumentTextIcon,
    SpinnerIcon,
    ProfilePicture,
    ShieldCheckIcon,
    InstagramIcon,
    FacebookIcon,
    LinkedInIcon,
    GlobeAltIcon,
    BellIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    Cog6ToothIcon
} from '../components/Icons';
import { useToast } from '../hooks/useToast';

const DashboardCard: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
        {title && <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>}
        {children}
    </div>
);

const ActionButton: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    subLabel?: string;
    onClick: () => void; 
    colorClass?: string 
}> = ({ icon, label, subLabel, onClick, colorClass = "text-gray-700 dark:text-gray-200" }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors ${colorClass}`}>
                {icon}
            </div>
            <div className="text-left">
                <p className={`font-semibold text-sm ${colorClass}`}>{label}</p>
                {subLabel && <p className="text-xs text-gray-500 dark:text-gray-400">{subLabel}</p>}
            </div>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
    </button>
);

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

export default function UserDashboardPage() {
    const { userData, setUserData, logout, pendingHostRequestCount, unreadMessagesCount } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isTogglingHost, setIsTogglingHost] = useState(false);
    const [completedRequestsCount, setCompletedRequestsCount] = useState(0);
    const [dashboardUser, setDashboardUser] = useState(userData);

    useEffect(() => {
        if (userData?.id) {
            api.getUserById(userData.id).then(freshUser => {
                if (freshUser) {
                    setDashboardUser(freshUser);
                    setUserData(freshUser);
                }
            });
            api.getRequestsByHostId(userData.id).then(requests => {
                setCompletedRequestsCount(requests.filter(r => r.status === 'completed').length);
            });
        }
    }, [userData?.id, setUserData]);

    const userToRender = dashboardUser || userData;
    if (!userToRender) return null;

    const handleHostToggle = async (newValue: boolean) => {
        if (!userToRender) return;
        setIsTogglingHost(true);
        try {
            await api.updateUser(userToRender.id, { isAcceptingRequests: newValue });
            const updatedUser = { ...userToRender, isAcceptingRequests: newValue };
            setDashboardUser(updatedUser);
            setUserData(updatedUser);
            showToast(newValue ? 'Visível para viajantes.' : 'Oculto das buscas.', 'success');
        } catch (error) {
            showToast('Erro ao atualizar status.', 'error');
        } finally {
            setIsTogglingHost(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
             <div className="bg-white dark:bg-gray-800 pb-6 pt-4 px-6 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 dark:border-gray-700/50 text-center">
                <ProfilePicture src={userToRender.profilePicture} alt={userToRender.displayName} className="w-24 h-24 rounded-full object-cover shadow-lg mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{userToRender.displayName}</h1>
                <div className="flex items-center gap-4 w-full justify-center max-w-sm mx-auto">
                    <Link to={`/profile/${userToRender.id}/followers`} className="flex-1">
                        <p className="font-bold text-xl dark:text-white">{userToRender.followers.length}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('followers')}</p>
                    </Link>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                    <Link to={`/profile/${userToRender.id}/following`} className="flex-1">
                        <p className="font-bold text-xl dark:text-white">{userToRender.following.length}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('following')}</p>
                    </Link>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                     <button onClick={() => navigate('/map')} className="flex-1">
                        <p className="font-bold text-xl dark:text-white text-red-500">{userToRender.favorites?.length || 0}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('saved')}</p>
                    </button>
                </div>
             </div>

             <div className="p-4 md:p-6 space-y-4">
                <DashboardCard>
                    <ActionButton icon={<UserCircleIcon className="w-5 h-5" />} label={t('view_profile')} onClick={() => navigate(`/host/${userToRender.id}`)} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <ActionButton icon={<DocumentTextIcon className="w-5 h-5" />} label={t('edit_profile')} onClick={() => navigate('/profile/edit')} />
                </DashboardCard>

                <DashboardCard title={t('settings')}>
                    <ActionButton icon={<Cog6ToothIcon className="w-5 h-5" />} label={t('settings')} subLabel={language === 'pt' ? 'Português' : 'English'} onClick={() => navigate('/settings')} />
                     <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                     <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">{theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}</div>
                            <span className="font-semibold text-sm">{t('dark_mode')}</span>
                        </div>
                        <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
                     </div>
                </DashboardCard>
             </div>
        </div>
    );
}
