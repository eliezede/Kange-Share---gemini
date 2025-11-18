import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../api';
import { User } from '../types';
import { ChevronLeftIcon, SpinnerIcon } from '../components/Icons';
import { useAuth } from '../App';

interface UserCardProps {
    user: User;
    currentUser: User;
    onFollowToggle: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onFollowToggle }) => {
    const isFollowing = currentUser.following.includes(user.id);

    const handleFollowClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onFollowToggle(user.id);
    };

    const isCurrentUserProfile = user.id === currentUser.id;

    return (
        <Link to={`/host/${user.id}`} className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
            <img src={user.profilePicture} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 ml-4">
                <p className="font-bold dark:text-gray-100">{user.displayName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.address.city}</p>
            </div>
            {!isCurrentUserProfile && (
                <button
                    onClick={handleFollowClick}
                    className={`px-4 py-1.5 rounded-full font-semibold text-sm transition w-24 ${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-brand-blue text-white'}`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </Link>
    );
};


export default function FollowListPage() {
    const { userId, followType } = useParams<{ userId: string, followType: 'followers' | 'following' }>();
    const navigate = useNavigate();
    const { userData: currentUser, setUserData } = useAuth();
    
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!userId || !followType) return;
        setLoading(true);

        const pUser = await api.getUserById(userId);

        if (pUser) {
            const userIdsToFetch = pUser[followType] || [];
            const users = await Promise.all(userIdsToFetch.map(id => api.getUserById(id)));
            setUserList(users.filter(Boolean) as User[]);
        }
        
        setProfileUser(pUser || null);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [userId, followType]);
    
    const handleFollowToggle = async (targetUserId: string) => {
        if (!currentUser) return;
        await api.toggleFollowHost(currentUser.id, targetUserId);
        
        // Refetch current user's data to update their following list in context
        const updatedCurrentUser = await api.getUserById(currentUser.id);
        if (updatedCurrentUser) setUserData(updatedCurrentUser);

        // Refetch the entire list to show changes
        fetchData();
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
            </div>
        );
    }
    
    if (!profileUser || !currentUser) {
        return <div className="p-4 text-center dark:text-gray-300">User not found.</div>;
    }

    const title = followType === 'followers' ? 'Followers' : 'Following';

    return (
        <div className="flex flex-col">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex-shrink-0">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold dark:text-gray-100">{title}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profileUser.displayName}</p>
                </div>
                <div className="w-6 h-6"></div>
            </header>

            <div>
                {userList.length > 0 ? (
                    userList.map(user => (
                        <UserCard key={user.id} user={user} currentUser={currentUser} onFollowToggle={handleFollowToggle} />
                    ))
                ) : (
                    <p className="text-center p-8 text-gray-500 dark:text-gray-400">No users to display.</p>
                )}
            </div>
        </div>
    );
}