
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App.tsx';
import * as api from '../api.ts';
import { 
    UserCircleIcon, 
    ChevronRightIcon, 
    SunIcon,
    MoonIcon,
    DocumentTextIcon,
    ProfilePicture,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon
} from '../components/Icons.tsx';

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; subLabel?: string; onClick: () => void; colorClass?: string }> = ({ icon, label, subLabel, onClick, colorClass = "text-gray-700 dark:text-gray-200" }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors ${colorClass}`}>{icon}</div>
            <div className="text-left"><p className={`font-semibold text-sm ${colorClass}`}>{label}</p>{subLabel && <p className="text-xs text-gray-500 dark:text-gray-400">{subLabel}</p>}</div>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
    </button>
);

export default function UserDashboardPage() {
    const { userData, setUserData, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (userData?.id) {
            api.getUserById(userData.id).then(res => { if (res) setUserData(res); });
        }
    }, [userData?.id]);

    if (!userData) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
             <div className="bg-white dark:bg-gray-800 pb-6 pt-4 px-6 rounded-b-[2.5rem] shadow-sm border-b dark:border-gray-700/50 text-center">
                <ProfilePicture src={userData.profilePicture} alt={userData.displayName} className="w-24 h-24 rounded-full object-cover shadow-lg mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{userData.displayName}</h1>
                <div className="flex items-center gap-4 w-full justify-center max-w-sm mx-auto">
                    <Link to={`/profile/${userData.id}/followers`} className="flex-1 text-center"><p className="font-bold text-xl dark:text-white">{userData.followers.length}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Followers</p></Link>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                    <Link to={`/profile/${userData.id}/following`} className="flex-1 text-center"><p className="font-bold text-xl dark:text-white">{userData.following.length}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Following</p></Link>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                     <button onClick={() => navigate('/map')} className="flex-1 text-center"><p className="font-bold text-xl dark:text-white text-red-500">{userData.favorites?.length || 0}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saved</p></button>
                </div>
             </div>

             <div className="p-4 md:p-6 space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border dark:border-gray-700">
                    <ActionButton icon={<UserCircleIcon className="w-5 h-5" />} label="View Profile" onClick={() => navigate(`/host/${userData.id}`)} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <ActionButton icon={<DocumentTextIcon className="w-5 h-5" />} label="Edit Profile" onClick={() => navigate('/profile/edit')} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border dark:border-gray-700">
                    <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Settings</h3>
                    <ActionButton icon={<Cog6ToothIcon className="w-5 h-5" />} label="Settings" onClick={() => navigate('/settings')} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3"><div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">{theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}</div><span className="font-semibold text-sm dark:text-white">Dark Mode</span></div>
                        <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-blue' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <ActionButton icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />} label="Logout" onClick={logout} colorClass="text-red-500" />
                </div>
             </div>
        </div>
    );
}
