
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
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
    DropletIcon
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
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

export default function UserDashboardPage() {
    const { userData, setUserData, logout, pendingHostRequestCount, unreadMessagesCount } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isTogglingHost, setIsTogglingHost] = useState(false);
    const [completedRequestsCount, setCompletedRequestsCount] = useState(0);

    useEffect(() => {
        if (userData?.id) {
            // Fetch fresh user data to ensure counts (followers, etc.) are up to date
            api.getUserById(userData.id).then(freshUser => {
                if (freshUser) {
                    setUserData(freshUser);
                }
            });

            api.getRequestsByHostId(userData.id).then(requests => {
                const completed = requests.filter(r => r.status === 'completed').length;
                setCompletedRequestsCount(completed);
            });
        }
    }, [userData?.id, setUserData]);

    if (!userData) return null;

    const isDistributor = userData.distributorVerificationStatus === 'approved';
    const isPending = userData.distributorVerificationStatus === 'pending';
    const isRejected = userData.distributorVerificationStatus === 'rejected';
    const isRevoked = userData.distributorVerificationStatus === 'revoked';

    const handleHostToggle = async (newValue: boolean) => {
        if (!userData) return;
        setIsTogglingHost(true);
        try {
            await api.updateUser(userData.id, { isAcceptingRequests: newValue });
            setUserData({ ...userData, isAcceptingRequests: newValue });
            showToast(newValue ? 'You are now visible to travelers.' : 'You are hidden from search.', 'success');
        } catch (error) {
            showToast('Failed to update status.', 'error');
        } finally {
            setIsTogglingHost(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
             {/* Header */}
             <div className="bg-white dark:bg-gray-800 pb-6 pt-4 px-6 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex flex-col items-center text-center">
                    <ProfilePicture src={userData.profilePicture} alt={userData.displayName} className="w-24 h-24 rounded-full object-cover shadow-lg mb-4" />
                    <div className="flex items-center gap-2 justify-center mb-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.displayName}</h1>
                        {isDistributor && <CheckBadgeIcon className="w-6 h-6 text-brand-blue" />}
                    </div>
                    {isDistributor ? (
                        <span className="text-sm font-semibold text-brand-blue bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-4">
                            Official Enagic® Distributor
                        </span>
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Wellness Enthusiast
                        </span>
                    )}
                    
                    <div className="flex items-center gap-8 w-full justify-center max-w-xs mx-auto">
                        <Link to={`/profile/${userData.id}/followers`} className="flex-1 text-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <p className="font-bold text-xl dark:text-white">{userData.followers.length}</p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Followers</p>
                        </Link>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <Link to={`/profile/${userData.id}/following`} className="flex-1 text-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <p className="font-bold text-xl dark:text-white">{userData.following.length}</p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Following</p>
                        </Link>
                    </div>
                </div>
             </div>

             <div className="p-4 md:p-6 space-y-4 -mt-2">
                {/* Profile Card */}
                <DashboardCard>
                    <ActionButton 
                        icon={<UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                        label="View Public Profile"
                        subLabel="See how others view your profile"
                        onClick={() => navigate(`/host/${userData.id}`)}
                    />
                     <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1 mx-3"></div>
                    <ActionButton 
                        icon={<DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                        label="Edit Profile"
                        subLabel="Update bio, photo, and address"
                        onClick={() => navigate('/profile/edit')}
                    />
                    
                    <div className="flex justify-center gap-4 mt-4 pt-2">
                         {userData.instagram && <a href={userData.instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:opacity-80"><InstagramIcon className="w-5 h-5" /></a>}
                         {userData.facebook && <a href={userData.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:opacity-80"><FacebookIcon className="w-5 h-5" /></a>}
                         {userData.linkedin && <a href={userData.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:opacity-80"><LinkedInIcon className="w-5 h-5" /></a>}
                         {userData.website && <a href={userData.website} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-gray-300 hover:opacity-80"><GlobeAltIcon className="w-5 h-5" /></a>}
                    </div>
                </DashboardCard>

                {/* Distributor Status */}
                <DashboardCard title="Distributor Status">
                    {isDistributor ? (
                        <div className="space-y-4">
                             <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                        <CheckBadgeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-800 dark:text-green-200 text-sm">Verified Distributor</p>
                                        <p className="text-xs text-green-600 dark:text-green-300">ID: {userData.distributorId}</p>
                                    </div>
                                </div>
                             </div>
                             <div className="text-center">
                                <button onClick={() => navigate('/profile/edit')} className="text-sm text-brand-blue font-semibold hover:underline">
                                    Manage Documents
                                </button>
                             </div>
                        </div>
                    ) : isPending ? (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30 text-center">
                            <SpinnerIcon className="w-6 h-6 text-yellow-500 animate-spin mx-auto mb-2" />
                            <p className="font-bold text-yellow-800 dark:text-yellow-200">Verification in Progress</p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">We are reviewing your documents.</p>
                        </div>
                    ) : isRejected || isRevoked ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <p className="font-bold text-red-800 dark:text-red-200">Verification {isRevoked ? 'Revoked' : 'Rejected'}</p>
                            {userData.distributorRejectionReason && (
                                <p className="text-xs text-red-600 dark:text-red-300 mt-1 mb-3 bg-white dark:bg-gray-800 p-2 rounded border border-red-100 dark:border-red-800">
                                    "{userData.distributorRejectionReason}"
                                </p>
                            )}
                             <button 
                                onClick={() => navigate('/profile/edit')}
                                className="w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-sm"
                            >
                                Update & Resubmit
                            </button>
                        </div>
                    ) : (
                         <div className="text-center space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Become a host by verifying your Enagic® Distributor status.
                            </p>
                            <button 
                                onClick={() => navigate('/profile/edit')}
                                className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 transition shadow-md shadow-blue-200 dark:shadow-none"
                            >
                                Become a Verified Distributor
                            </button>
                         </div>
                    )}
                </DashboardCard>

                {/* Hosting Card */}
                <DashboardCard title="Hosting">
                    {isDistributor ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${userData.isAcceptingRequests ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                        <PresentationChartBarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">Accept Requests</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{userData.isAcceptingRequests ? 'Visible on map' : 'Hidden from map'}</p>
                                    </div>
                                </div>
                                {isTogglingHost ? <SpinnerIcon className="w-5 h-5 animate-spin text-brand-blue" /> : 
                                    <Toggle checked={userData.isAcceptingRequests} onChange={handleHostToggle} />
                                }
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1 mx-3"></div>
                             <ActionButton 
                                icon={<ClipboardDocumentListIcon className="w-5 h-5 text-brand-blue" />}
                                label="Host Dashboard"
                                subLabel="Manage incoming water requests"
                                onClick={() => navigate('/requests')}
                            />
                            <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1 mx-3"></div>
                             <ActionButton 
                                icon={<DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                                label="Availability Settings"
                                subLabel="Set hours and water types"
                                onClick={() => navigate('/profile/edit')}
                            />
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-center">
                            <ShieldCheckIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Only verified distributors can enable hosting.</p>
                        </div>
                    )}
                </DashboardCard>

                {/* Activity Card */}
                <DashboardCard title="Activity">
                     <div className="grid grid-cols-3 gap-3">
                        <Link to="/requests" className="bg-brand-light dark:bg-blue-900/20 p-3 rounded-xl text-center hover:opacity-80 transition flex flex-col items-center justify-center">
                            <p className="text-xl font-bold text-brand-blue">{pendingHostRequestCount}</p>
                            <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mt-1">Pending</p>
                        </Link>
                         <Link to="/requests" className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center hover:opacity-80 transition flex flex-col items-center justify-center">
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">{completedRequestsCount}</p>
                            <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mt-1">Completed</p>
                        </Link>
                         <Link to="/messages" className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-center hover:opacity-80 transition flex flex-col items-center justify-center">
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{unreadMessagesCount}</p>
                            <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mt-1">Messages</p>
                        </Link>
                     </div>
                </DashboardCard>

                {/* Settings Card */}
                <DashboardCard title="Settings">
                     <div className="flex items-center justify-between p-2 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                {theme === 'dark' ? <MoonIcon className="w-5 h-5 text-purple-400" /> : <SunIcon className="w-5 h-5 text-orange-400" />}
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">Dark Mode</span>
                        </div>
                        <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
                     </div>
                     
                     <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1 mx-3"></div>
                     <ActionButton 
                        icon={<BellIcon className="w-5 h-5" />}
                        label="Notifications"
                        onClick={() => navigate('/settings')}
                     />
                     
                     <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1 mx-3"></div>
                     <ActionButton 
                        icon={<TrashIcon className="w-5 h-5" />}
                        label="Delete Account"
                        onClick={() => navigate('/settings')}
                        colorClass="text-red-600 dark:text-red-400"
                     />

                     <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1 mx-3"></div>
                     <ActionButton 
                        icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />}
                        label="Logout"
                        onClick={handleLogout}
                        colorClass="text-red-600 dark:text-red-400"
                     />
                </DashboardCard>
             </div>
        </div>
    );
}
