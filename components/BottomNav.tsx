import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapIcon, ClipboardDocumentListIcon, UserIcon, ChatBubbleOvalLeftEllipsisIcon } from './Icons';

const navItems = [
  { path: '/map', label: 'Home', icon: MapIcon },
  { path: '/requests', label: 'Requests', icon: ClipboardDocumentListIcon },
  { path: '/messages', label: 'Messages', icon: ChatBubbleOvalLeftEllipsisIcon },
  { path: '/profile', label: 'You', icon: UserIcon },
];

export default function BottomNav() {
  const activeLinkClass = 'text-brand-blue';
  const inactiveLinkClass = 'text-gray-500 hover:text-brand-blue';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-t border-gray-200 z-40">
      <div className="flex justify-around h-16">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full text-xs font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <Icon className="w-6 h-6 mb-0.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}