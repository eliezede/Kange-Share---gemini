

import React, { useState, useEffect } from 'react';
// FIX: Corrected import statement for react-router-dom.
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { StarIcon, ChevronLeftIcon, CheckBadgeIcon, MapPinIcon, ChatBubbleOvalLeftEllipsisIcon, SpinnerIcon, ProfilePicture, UserGroupIcon, CalendarDaysIcon, DropletIcon } from '../components/Icons';
import { Review, User } from '../types';
import { useAuth } from '../App';
import { useToast } from '../hooks/useToast';

const RatingStars: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'w-5 h-5' }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`${className} ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        ))}
    </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-start gap-4">
            <ProfilePicture src={review.reviewerImage} alt={review.reviewerName} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold dark:text-gray-100">{review.reviewerName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <RatingStars rating={review.rating} className="w-4 h-4" />
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{review.comment}</p>
            </div>
        </div>
    </div>
);


export default function HostProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData: currentUser, setUserData } = useAuth();
  const { showToast } = useToast();
  const [host, setHost] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
        setLoading(true);
        const [hostData, reviewsData] = await Promise.all([
            api.getUserById(id),
            api.getReviewsForHost(id)
        ]);
        if (hostData) {
            setHost(hostData);
        }
        setReviews(reviewsData);
        setLoading(false);
    };
    fetchData();
  }, [id]);
  
  const handleFollowToggle = async () => {
    if (!host || !currentUser) return;

    const previousUserData = currentUser;
    const previousHostData = host;
    const isFollowing = currentUser.following?.includes(host.id);

    const updatedFollowing = isFollowing
        ? currentUser.following.filter(id => id !== host.id)
        : [...(currentUser.following || []), host.id];
    setUserData({ ...currentUser, following: updatedFollowing });

    const updatedFollowers = isFollowing
        ? host.followers.filter(id => id !== currentUser.id)
        : [...(host.followers || []), currentUser.id];
    setHost({ ...host, followers: updatedFollowers });

    try {
        await api.toggleFollowHost(currentUser.id, host.id);
    } catch (error) {
        console.error("Failed to toggle follow:", error);
        setUserData(previousUserData);
        setHost(previousHostData);
        showToast("Could not update follow status. Please try again.", "error");
    }
  };

  const handleChat = async () => {
    if (!host || !currentUser) return;
    const requestId = await api.createNewChat(host.id, currentUser.id, host, currentUser);
    navigate(`/chat/${requestId}`);
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-full">
              <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
          </div>
      );
  }

  if (!host || !currentUser) {
      return <div className="p-4 text-center dark:text-gray-300">User not found.</div>;
  }
  
  const isFollowing = currentUser.following?.includes(host.id);
  const isCurrentUserProfile = currentUser.id === host.id;

  return (
    <div className="pb-24">
      <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
        <ProfilePicture src={host.profilePicture} alt={host.name} className="absolute bottom-[-48px] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-900" />
      </div>

      <div className="pt-16 px-6">
        <div className="text-center">
            <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl font-bold dark:text-gray-100">{host.name}</h1>
                {host.isVerified && <CheckBadgeIcon className="w-7 h-7 text-brand-blue" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{host.address.city}, {host.address.country}</p>
            <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-center whitespace-pre-wrap">
              {host.bio || 'No bio provided yet.'}
            </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{host.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({host.reviews} reviews)</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link to={`/profile/${host.id}/followers`} className="flex items-center gap-1">
                <UserGroupIcon className="w-5 h-5" />
                <span className="font-semibold">{host.followers.length}</span>
                <span className="text-sm text-gray-500">followers</span>
            </Link>
        </div>

        {!isCurrentUserProfile && (
            <div className="mt-6 flex gap-3">
                <button
                    onClick={handleFollowToggle}
                    className={`flex-1 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-brand-blue text-white'
                    }`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button onClick={handleChat} className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/> Message
                </button>
            </div>
        )}

        <div className="mt-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-3 dark:text-gray-100">Host Information</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-3"><DropletIcon className="w-5 h-5 text-gray-500"/> pH Levels: {host.phLevels.join(', ')}</div>
                    <div className="flex items-center gap-3"><CalendarDaysIcon className="w-5 h-5 text-gray-500"/> Last Filter Change: {host.maintenance.lastFilterChange ? new Date(host.maintenance.lastFilterChange).toLocaleDateString() : 'N/A'}</div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <h3 className="text-lg font-bold mb-3 dark:text-gray-100">Reviews ({reviews.length})</h3>
                 <div className="space-y-4">
                    {reviews.length > 0 ? reviews.slice(0, 3).map(r => <ReviewCard key={r.id} review={r} />) : <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>}
                 </div>
            </div>
        </div>
      </div>
      
       {!isCurrentUserProfile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
          <Link
            to={`/request/${id}`}
            className="w-full block text-center bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors"
          >
            Request Water
          </Link>
        </div>
      )}
    </div>
  );
}