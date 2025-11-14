import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { StarIcon, ChevronLeftIcon, CheckBadgeIcon, MapPinIcon, ChatBubbleOvalLeftEllipsisIcon, SpinnerIcon } from '../components/Icons';
import { Review, Host, User } from '../types';

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
            <img src={review.reviewerImage} alt={review.reviewerName} className="w-12 h-12 rounded-full object-cover" />
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
  const [host, setHost] = useState<Host | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
        setLoading(true);
        const [hostData, userData] = await Promise.all([
            api.getHostById(id),
            api.getCurrentUser()
        ]);
        if (hostData) {
            setHost(hostData);
        }
        setCurrentUser(userData);
        setLoading(false);
    };
    fetchData();
  }, [id]);
  
  const handleFollowToggle = async () => {
    if (!host || !currentUser) return;
    await api.toggleFollowHost(host.id);
    // Re-fetch both to get updated follower/following counts
    const [updatedHost, updatedUser] = await Promise.all([
        api.getHostById(host.id),
        api.getCurrentUser()
    ]);
    if (updatedHost) setHost(updatedHost);
    setCurrentUser(updatedUser);
  };
  
  const handleSendMessage = async () => {
    if (!host || !currentUser) return;

    // This logic is simplified; in a real app, you'd have a more robust way to find existing chats
    const allRequests = await api.getAllRequests();
    const existingRequest = allRequests.find(r => 
        r.hostId === host.id && r.requesterId === currentUser.id
    );

    if (existingRequest) {
        navigate(`/chat/${existingRequest.id}`);
        return;
    }

    const newChatRequest = await api.createNewChat(host.id, currentUser.id);
    navigate(`/chat/${newChatRequest.id}`);
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
    // This should ideally not happen if the user is authenticated
    return <div className="p-4 text-center dark:text-gray-300">Could not load user data.</div>;
  }

  const isFollowing = currentUser.following.includes(host.id);
  
  const availableDays = Object.entries(host.availability)
    .filter(([, details]) => details.enabled)
    .map(([day, details]) => ({ day, ...details }));
    
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
          <img src={host.image} alt={host.name} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-900 -mt-16 shadow-lg" />
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
                <p><span className="font-semibold dark:text-gray-200">Last Filter Change:</span> {new Date(host.maintenance.lastFilterChange).toLocaleDateString()}</p>
                <p><span className="font-semibold dark:text-gray-200">Last E-Cleaning:</span> {new Date(host.maintenance.lastECleaning).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-100">Reviews ({host.fullReviews.length})</h2>
            <div className="space-y-4">
              {host.fullReviews.length > 0 ? (
                host.fullReviews.map(review => <ReviewCard key={review.id} review={review} />)
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