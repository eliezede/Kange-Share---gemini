import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapIcon, ClipboardDocumentListIcon, UserIcon, ChatBubbleOvalLeftEllipsisIcon } from './Icons';
import { useAuth } from '../App';

const navItems = [
  { path: '/map', label: 'Home', icon: MapIcon },
  { path: '/requests', label: 'Requests', icon: ClipboardDocumentListIcon },
  { path: '/messages', label: 'Messages', icon: ChatBubbleOvalLeftEllipsisIcon },
  { path: '/profile', label: 'You', icon: UserIcon },
];

export default function BottomNav() {
  const { pendingHostRequestCount, unreadMessagesCount } = useAuth();
  const activeLinkClass = 'text-brand-blue';
  const inactiveLinkClass = 'text-gray-500 dark:text-gray-400 hover:text-brand-blue';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around h-16">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full text-xs font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <div className="relative">
              <Icon className="w-6 h-6 mb-0.5" />
              {path === '/requests' && pendingHostRequestCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">{pendingHostRequestCount}</span>
              )}
              {path === '/messages' && unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">{unreadMessagesCount}</span>
              )}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
