import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dataStore } from '../data';
import { User, Host } from '../types';
import { ChevronLeftIcon } from '../components/Icons';

// FIX: Define props interface for UserCard for better type safety and clarity.
interface UserCardProps {
    user: User | Host;
    currentUser: User;
    onFollowToggle: (userId: string) => void;
}

// FIX: Explicitly type UserCard as a React.FC to resolve the issue with the 'key' prop.
const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onFollowToggle }) => {
    const isFollowing = currentUser.following.includes(user.id);

    const handleFollowClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if clicking the button
        onFollowToggle(user.id);
    };

    const userImage = 'image' in user ? user.image : user.profilePicture;
    const userCity = 'city' in user ? user.city : user.address.city;
    // Don't show follow button for the current user themselves
    const isCurrentUserProfile = user.id === currentUser.id;

    return (
        <Link to={`/host/${user.id}`} className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50">
            <img src={userImage} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 ml-4">
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-500">{userCity}</p>
            </div>
            {!isCurrentUserProfile && (
                <button
                    onClick={handleFollowClick}
                    className={`px-4 py-1.5 rounded-full font-semibold text-sm transition ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-brand-blue text-white'}`}
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
    const [_, setForceUpdate] = useState(0); 
    
    const currentUser = dataStore.currentUser;
    const profileUser = dataStore.findUserById(userId);

    const title = followType === 'followers' ? 'Followers' : 'Following';
    const userIds = profileUser && followType ? profileUser[followType] : [];
    const userList = userIds.map(id => dataStore.findUserById(id)).filter(Boolean) as (User | Host)[];
    
    const handleFollowToggle = (targetUserId: string) => {
        const isCurrentlyFollowing = currentUser.following.includes(targetUserId);
        const targetUser = dataStore.findUserById(targetUserId);
        if (!targetUser) return;

        if (isCurrentlyFollowing) {
            currentUser.following = currentUser.following.filter(id => id !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUser.id);
        }
        setForceUpdate(v => v + 1);
    };


    if (!profileUser) {
        return <div className="p-4 text-center">User not found.</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 flex items-center border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold">{title}</h1>
                    <p className="text-sm text-gray-500">{profileUser.name}</p>
                </div>
                <div className="w-6 h-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto">
                {userList.length > 0 ? (
                    userList.map(user => (
                        <UserCard key={user.id} user={user} currentUser={currentUser} onFollowToggle={handleFollowToggle} />
                    ))
                ) : (
                    <p className="text-center p-8 text-gray-500">No users to display.</p>
                )}
            </div>
        </div>
    );
}
