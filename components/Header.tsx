import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { DropletIcon, BellIcon } from './Icons';
import { ProfilePicture } from './Icons';
import NotificationsPanel from './NotificationsPanel';
import AccountDropdown from './AccountDropdown';

export default function Header() {
    const { userData, notifications, unreadCount } = useAuth();
    const navigate = useNavigate();
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isAccountDropdownOpen, setAccountDropdownOpen] = useState(false);

    const notificationsToggleRef = useRef<HTMLButtonElement>(null);
    const accountToggleRef = useRef<HTMLButtonElement>(null);

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Link to="/map" className="flex items-center gap-2">
                <DropletIcon className="w-7 h-7 text-brand-blue" />
                <span className="text-xl font-bold text-gray-800 dark:text-white">Kangen Share</span>
            </Link>
            {userData && (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button 
                            ref={notificationsToggleRef}
                            onClick={() => setNotificationsOpen(o => !o)} 
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle notifications"
                        >
                            <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900/80"></span>
                            )}
                        </button>
                        <NotificationsPanel 
                            isOpen={isNotificationsOpen} 
                            onClose={() => setNotificationsOpen(false)}
                            notifications={notifications}
                            toggleRef={notificationsToggleRef}
                        />
                    </div>
                    <div className="relative">
                        <button 
                            ref={accountToggleRef}
                            onClick={() => setAccountDropdownOpen(o => !o)} 
                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-brand-blue dark:hover:border-brand-blue transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                            aria-label="Toggle user menu"
                        >
                            <ProfilePicture src={userData.profilePicture} alt={userData.displayName} className="w-full h-full object-cover" />
                        </button>
                         <AccountDropdown 
                            isOpen={isAccountDropdownOpen}
                            onClose={() => setAccountDropdownOpen(false)}
                            toggleRef={accountToggleRef}
                         />
                    </div>
                </div>
            )}
        </header>
    );
}