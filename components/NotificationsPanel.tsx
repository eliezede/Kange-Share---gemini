import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import * as api from '../api';
import { Notification, NotificationType } from '../types';
import { UserGroupIcon, ClipboardDocumentListIcon, ChatBubbleOvalLeftEllipsisIcon, StarIcon, BellIcon, ProfilePicture, CheckCircleIcon, XCircleIcon } from './Icons';
import { useClickOutside } from '../hooks/useClickOutside';

const TimeAgo: React.FC<{ dateString: string }> = ({ dateString }) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return <>{Math.floor(interval)}y</>;
    interval = seconds / 2592000;
    if (interval > 1) return <>{Math.floor(interval)}mo</>;
    interval = seconds / 86400;
    if (interval > 1) return <>{Math.floor(interval)}d</>;
    interval = seconds / 3600;
    if (interval > 1) return <>{Math.floor(interval)}h</>;
    interval = seconds / 60;
    if (interval > 1) return <>{Math.floor(interval)}m</>;
    return <>{Math.floor(seconds)}s</>;
};

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const iconMap: Record<NotificationType, React.ReactNode> = {
        new_request: <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-500" />,
        request_accepted: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        request_declined: <XCircleIcon className="w-6 h-6 text-red-500" />,
        request_cancelled: <XCircleIcon className="w-6 h-6 text-gray-500" />,
        new_message: <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-brand-blue" />,
        new_follower: <UserGroupIcon className="w-6 h-6 text-pink-500" />,
        review_left: <StarIcon className="w-6 h-6 text-yellow-400" />,
    };
    return <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">{iconMap[type]}</div>;
};

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    toggleRef: React.RefObject<HTMLButtonElement>;
}

export default function NotificationsPanel({ isOpen, onClose, notifications, toggleRef }: NotificationsPanelProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);

    useClickOutside(panelRef, toggleRef, onClose, isOpen);

    const handleNotificationClick = async (notification: Notification) => {
        if (!user) return;

        if (!notification.read) {
            await api.markNotificationAsRead(user.uid, notification.id);
        }

        switch (notification.type) {
            case 'new_request':
            case 'request_accepted':
            case 'request_declined':
            case 'request_cancelled':
                navigate(`/request-detail/${notification.relatedId}`);
                break;
            case 'new_message':
                navigate(`/chat/${notification.relatedId}`);
                break;
            case 'new_follower':
            case 'review_left':
                navigate(`/host/${notification.relatedId}`);
                break;
            default:
                break;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef} 
            className="absolute top-16 right-4 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[70vh] z-40"
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Notifications</h3>
            </div>
            {notifications.length > 0 ? (
                <div className="overflow-y-auto">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!n.read ? 'bg-brand-light dark:bg-blue-900/30' : ''}`}
                        >
                            <NotificationIcon type={n.type} />
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <TimeAgo dateString={n.createdAt} /> ago
                                </p>
                            </div>
                            {!n.read && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full mt-1.5 flex-shrink-0"></div>}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <BellIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <h4 className="font-semibold dark:text-gray-300">No notifications yet</h4>
                    <p className="text-sm">We'll let you know when something happens.</p>
                </div>
            )}
        </div>
    );
}
