import React, { useState, useEffect } from 'react';
// FIX: Corrected import statement for react-router-dom.
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { StarIcon, ChevronLeftIcon, CheckBadgeIcon, MapPinIcon, ChatBubbleOvalLeftEllipsisIcon, SpinnerIcon, ProfilePicture } from '../components/Icons';
import { Review, User } from '../types';
import { useAuth } from '../App';

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

    // Save previous state for potential rollback on API failure
    const previousUserData = currentUser;
    const previousHostData = host;

    const isFollowing = currentUser.following?.includes(host.id);

    // Optimistically update the UI
    setUserData(prev => {
        if (!prev) return null;
        const following = prev.following || [];
        return {
            ...prev,
            following: isFollowing
                ? following.filter(id => id !== host.id)
                : [...following, host.id],
        };
    });
    
    setHost(prev => {
        if (!prev) return null;
        const sanitizedHost = {
            ...prev,
            followers: prev.followers || [],
            following: prev.following || [],
            phLevels: prev.phLevels || [],
        };
        return {
            ...sanitizedHost,
            followers: isFollowing
                ? sanitizedHost.followers.filter(id => id !== currentUser.id)
                : [...sanitizedHost.followers, currentUser.id],
        };
    });
    
    try {
        // Persist the change via API call
        await api.toggleFollowHost(currentUser.id, host.id);
        
        // Re-fetch from the source of truth to ensure UI is perfectly consistent.
        const [updatedHost, updatedUser] = await Promise.all([
            api.getUserById(host.id),
            api.getUserById(currentUser.id)
        ]);
        if (updatedHost) setHost(updatedHost);
        if (updatedUser) setUserData(updatedUser);
    } catch (error) {
        console.error("Failed to toggle follow:", error);
        alert("An error occurred. Could not update follow status.");
        // Rollback UI changes on failure
        setUserData(previousUserData);
        setHost(previousHostData);
    }
  };
  
  const handleSendMessage = async () => {
    if (!host || !currentUser) return;

    // A more robust chat existence check would be a direct query. This is simplified.
    // For now, we'll just create a new chat request.
    const newChatId = await api.createNewChat(host.id, currentUser.id, host, currentUser);
    navigate(`/chat/${newChatId}`);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
        </div>
    );
  }

  if (!host) {
    return <div className="p-4 text-center dark:text-gray-300">Host not found.</div>;
  }
  
  if (!currentUser) {
    return <div className="p-4 text-center dark:text-gray-300">Could not load user data.</div>;
  }

  const isFollowing = currentUser.following?.includes(host.id);
  
  // FIX: Refactored to iterate over keys for better type safety with TypeScript,
  // resolving issues where `details` was inferred as `unknown`.
  const availableDays = Object.keys(host.availability)
    .filter((day) => host.availability[day].enabled)
    .map((day) => ({ day, ...host.availability[day] }));
    
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  }

  return (
    <div className="pb-24">
      <div className="relative h-48">
        <img src={`https://picsum.photos/seed/${host.id}/800/400`} alt={host.name} className="w-full h-full object-cover dark:opacity-80" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-start mb-4">
          <ProfilePicture src={host.profilePicture} alt={host.name} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-900 -mt-16 shadow-lg" />
          <div className="ml-4 mt-1 flex-1">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold dark:text-white">{host.name}</h1>
                {host.isVerified && <CheckBadgeIcon className="w-7 h-7 text-brand-blue" />}
            </div>
             <div className="flex items-center mt-1 text-sm gap-4">
                <Link to={`/profile/${host.id}/followers`} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{host.followers.length}</span> Followers
                </Link>
                <Link to={`/profile/${host.id}/following`} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{host.following.length}</span> Following
                </Link>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
            <button 
                onClick={handleFollowToggle}
                className={`flex-1 font-bold py-2 px-4 rounded-xl transition-colors ${isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : 'bg-brand-blue text-white hover:bg-blue-600'}`}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button 
                onClick={handleSendMessage}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-transparent text-brand-blue font-bold py-2 px-4 rounded-xl hover:bg-brand-light dark:hover:bg-brand-blue/10 transition-colors border-2 border-brand-blue"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                <span>Message</span>
            </button>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold dark:text-gray-100">About</h2>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>{host.address.city}</span>
                </div>
            </div>
            <div className="flex items-center mt-2">
              <RatingStars rating={Math.round(host.rating)} />
              <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">{host.rating.toFixed(1)}</span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">({host.reviews} reviews)</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">Water Available</h2>
            <div className="flex flex-wrap gap-2">
              {host.phLevels.map(ph => (
                <span key={ph} className="bg-brand-light text-brand-blue dark:bg-blue-900/50 dark:text-blue-300 font-semibold px-3 py-1 rounded-full text-sm">
                  pH {ph.toFixed(1)}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">Pickup Availability</h2>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-2">
              {availableDays.length > 0 ? (
                availableDays.map(({ day, startTime, endTime }) => (
                  <div key={day} className="flex justify-between dark:text-gray-300">
                    <span className="font-semibold dark:text-gray-200">{day}</span>
                    <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                  </div>
                ))
              ) : (
                <p className="dark:text-gray-400">No availability set.</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">Machine Maintenance</h2>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-1 text-gray-800 dark:text-gray-300">
                <p><span className="font-semibold dark:text-gray-200">Last Filter Change:</span> {host.maintenance.lastFilterChange ? new Date(host.maintenance.lastFilterChange).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-semibold dark:text-gray-200">Last E-Cleaning:</span> {host.maintenance.lastECleaning ? new Date(host.maintenance.lastECleaning).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">Reviews ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map(review => <ReviewCard key={review.id} review={review} />)
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 max-w-4xl mx-auto flex items-center gap-3">
        <Link to={`/request/${host.id}`} className="w-full text-center bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors">
          Request Water
        </Link>
      </div>
    </div>
  );
}
