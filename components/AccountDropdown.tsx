import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import { 
    UserCircleIcon, 
    ClipboardDocumentListIcon, 
    Cog6ToothIcon, 
    SunIcon, 
    MoonIcon, 
    ArrowLeftOnRectangleIcon, 
    PresentationChartBarIcon, 
    ShieldCheckIcon 
} from './Icons';
import { useClickOutside } from '../hooks/useClickOutside';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  toggleRef: React.RefObject<HTMLButtonElement>;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ isOpen, onClose, toggleRef }) => {
  const { userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, toggleRef, onClose, isOpen);

  if (!isOpen || !userData) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/');
  };
  
  const handleItemClick = (action: () => void) => {
    onClose();
    action();
  };

  const menuItems = [
    { label: 'View Profile', icon: <UserCircleIcon className="w-5 h-5" />, action: () => navigate(`/host/${userData.id}`) },
    { label: 'Edit Profile', icon: <UserCircleIcon className="w-5 h-5" />, action: () => navigate('/profile') },
    { label: 'Settings', icon: <Cog6ToothIcon className="w-5 h-5" />, action: () => navigate('/settings') },
    { label: 'My Requests', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, action: () => navigate('/requests') },
  ];

  if (userData.isHost) {
    menuItems.push({ label: 'Host Dashboard', icon: <PresentationChartBarIcon className="w-5 h-5" />, action: () => navigate('/requests') });
  } else if (userData.distributorVerificationStatus === 'approved') {
     // Approved but maybe they turned off hosting
    menuItems.push({ label: 'Host Settings', icon: <PresentationChartBarIcon className="w-5 h-5" />, action: () => navigate('/profile') });
  } else {
    menuItems.push({ label: 'Become a Host', icon: <PresentationChartBarIcon className="w-5 h-5" />, action: () => navigate('/profile') });
  }


  if (userData.isAdmin) {
    menuItems.push({ label: 'Admin Dashboard', icon: <ShieldCheckIcon className="w-5 h-5" />, action: () => navigate('/admin') });
  }

  return (
    <div ref={dropdownRef} className="absolute top-14 right-4 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up" style={{ animationDuration: '0.2s'}}>
      <div className="p-2">
        {menuItems.map(item => (
          <button key={item.label} onClick={() => handleItemClick(item.action)} className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
        <button onClick={toggleTheme} className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            <span className="font-medium text-sm">Dark Mode</span>
          </div>
          <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AccountDropdown;