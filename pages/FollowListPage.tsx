import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../api';
import { User, Host } from '../types';
import { ChevronLeftIcon, SpinnerIcon } from '../components/Icons';

interface UserCardProps {
    user: User | Host;
    currentUser: User;
    onFollowToggle: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onFollowToggle }) => {
    const isFollowing = currentUser.following.includes(user.id);

    const handleFollowClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onFollowToggle(user.id);
    };

    const userImage = 'image' in user ? user.image : user.profilePicture;
    const userCity = 'city' in user ? user.city : user.address.city;
    const isCurrentUserProfile = user.id === currentUser.id;

    return (
        <Link to={`/host/${user.id}`} className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
            <img src={userImage} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 ml-4">
                <p className="font-bold dark:text-gray-100">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userCity}</p>
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
    
    const [profileUser, setProfileUser] = useState<User | Host | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userList, setUserList] = useState<(User | Host)[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!userId || !followType) return;
        setLoading(true);

        const [pUser, cUser] = await Promise.all([
            api.getUserById(userId),
            api.getCurrentUser()
        ]);

        if (pUser) {
            const userIds = pUser[followType] || [];
            const users = await Promise.all(userIds.map(id => api.getUserById(id)));
            setUserList(users.filter(Boolean) as (User | Host)[]);
        }
        
        setProfileUser(pUser || null);
        setCurrentUser(cUser);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [userId, followType]);
    
    const handleFollowToggle = async (targetUserId: string) => {
        await api.toggleFollowHost(targetUserId);
        // Refetch all data to ensure consistency
        fetchData();
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
            </div>
        );
    }
    
    if (!profileUser || !currentUser) {
        return <div className="p-4 text-center dark:text-gray-300">User not found.</div>;
    }

    const title = followType === 'followers' ? 'Followers' : 'Following';

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold dark:text-gray-100">{title}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profileUser.name}</p>
                </div>
                <div className="w-6 h-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto">
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