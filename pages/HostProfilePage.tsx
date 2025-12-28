
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { StarIcon, CheckBadgeIcon, MapPinIcon, ChatBubbleOvalLeftEllipsisIcon, SpinnerIcon, ProfilePicture, UserGroupIcon, DropletIcon, SparklesIcon, BuildingStorefrontIcon } from '../components/Icons';
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-start gap-4">
            <Link to={`/host/${review.reviewerId}`}>
                <ProfilePicture src={review.reviewerImage} alt={review.reviewerName} className="w-12 h-12 rounded-full object-cover" />
            </Link>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{review.reviewerName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <RatingStars rating={review.rating} className="w-4 h-4" />
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{review.comment}</p>
            </div>
        </div>
    </div>
);

const Metric: React.FC<{ icon: React.ReactNode; value: string; label: string; linkTo?: string }> = ({ icon, value, label, linkTo }) => {
    const content = (
        <div className="text-center">
            {icon}
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">{label}</p>
        </div>
    );
    return linkTo ? <Link to={linkTo} className="p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{content}</Link> : content;
};

export default function HostProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData: currentUser, setUserData } = useAuth();
  const { showToast } = useToast();
  
  const [host, setHost] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [watersSharedCount, setWatersSharedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset scroll to top of the main container whenever the ID changes
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (!id) return;
    const fetchData = async () => {
        setLoading(true);
        try {
            const [hostData, reviewsData, hostRequestsData] = await Promise.all([
                api.getUserById(id),
                api.getReviewsForHost(id),
                api.getRequestsByHostId(id)
            ]);
            
            if (hostData) {
                setHost(hostData);
            }
            setReviews(reviewsData);
            setWatersSharedCount(hostRequestsData.filter(r => r.status === 'completed').length);
        } catch (err) {
            console.error("Failed to load host profile:", err);
            showToast("Could not load profile.", "error");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id, showToast]);
  
  const handleFollowToggle = async () => {
    if (!host || !currentUser) return;

    const previousUserData = currentUser;
    const previousHostData = host;
    const isFollowing = currentUser.following?.includes(host.id);

    const updatedFollowing = isFollowing
        ? currentUser.following.filter(uid => uid !== host.id)
        : [...(currentUser.following || []), host.id];
    setUserData({ ...currentUser, following: updatedFollowing });

    const updatedFollowers = isFollowing
        ? host.followers.filter(uid => uid !== currentUser.id)
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
    try {
        const requestId = await api.createNewChat(host.id, currentUser.id, host, currentUser);
        navigate(`/chat/${requestId}`);
    } catch(err) {
        console.error("Failed to start chat:", err);
        showToast("Could not start a conversation. Please try again.", "error");
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-full bg-white dark:bg-gray-950">
              <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
          </div>
      );
  }

  if (!host || !currentUser) {
      return <div className="p-4 text-center dark:text-gray-300">User not found.</div>;
  }
  
  const isFollowing = currentUser.following?.includes(host.id);
  const isCurrentUserProfile = currentUser.id === host.id;
  const isOfficialDistributor = host.distributorVerificationStatus === 'approved';
  const isBusiness = host.isBusiness;

  return (
    <div className={`bg-white dark:bg-gray-950 min-h-full ${isBusiness ? 'border-t-8 border-amber-500' : ''}`}>
        <div className="p-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                    <ProfilePicture src={host.profilePicture} alt={host.displayName} className={`w-32 h-32 rounded-full object-cover shadow-xl border-4 ${isBusiness ? 'border-amber-500' : 'border-white dark:border-gray-800'}`} />
                    {isBusiness && (
                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg">
                            <BuildingStorefrontIcon className="w-6 h-6" />
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{host.displayName}</h1>
                        {isBusiness ? <SparklesIcon className="w-7 h-7 text-amber-500" /> : isOfficialDistributor && <CheckBadgeIcon className="w-7 h-7 text-brand-blue" />}
                    </div>
                    
                    {isBusiness ? (
                         <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                                {host.businessCategory || 'WELLNESS PARTNER'}
                            </span>
                            {isOfficialDistributor && <span className="text-[10px] font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full uppercase">Certified</span>}
                        </div>
                    ) : isOfficialDistributor && (
                        <p className="text-sm font-semibold text-brand-blue mt-1">Official Enagic® Distributor</p>
                    )}
                    
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        <p className="text-sm font-medium">{host.address.city}, {host.address.country}</p>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="flex justify-around items-start text-center py-6 my-8 border-y border-gray-100 dark:border-gray-800">
                <Metric
                    icon={<StarIcon className="w-6 h-6 mx-auto text-yellow-400" />}
                    value={`${host.rating.toFixed(1)}`}
                    label={`Reviews (${reviews.length})`}
                />
                <Metric
                    icon={<UserGroupIcon className="w-6 h-6 mx-auto text-blue-400" />}
                    value={String(host.followers.length)}
                    label="Followers"
                    linkTo={`/profile/${host.id}/followers`}
                />
                <Metric
                    icon={<DropletIcon className="w-6 h-6 mx-auto text-cyan-400" />}
                    value={String(watersSharedCount)}
                    label="Shared"
                />
            </div>
            
            {/* Action Buttons */}
            {!isCurrentUserProfile && (
                <div className="flex gap-3">
                    <button
                        onClick={handleFollowToggle}
                        className={`flex-1 font-bold px-4 py-3.5 rounded-2xl text-sm transition-all shadow-sm ${
                        isFollowing
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                        }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button onClick={handleChat} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold px-4 py-3.5 rounded-2xl text-sm transition-all hover:bg-gray-200 shadow-sm">
                        Message
                    </button>
                    {host.isAcceptingRequests && isOfficialDistributor && (
                         <button
                            onClick={() => navigate(`/request/${id}`)}
                            className={`flex-grow-[1.5] text-white font-extrabold px-4 py-3.5 rounded-2xl text-sm transition-all shadow-lg active:scale-95 ${isBusiness ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none' : 'bg-brand-blue hover:bg-blue-600 shadow-blue-200 dark:shadow-none'}`}
                        >
                            Request Water
                        </button>
                    )}
                </div>
            )}
            
            {/* Bio */}
            <div className="my-8">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">About</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-base leading-relaxed">
                    {host.bio ? host.bio : `Sharing Kangen Water 💧\nPromoting conscious hydration and well-being ✨`}
                </p>
                
                {isBusiness && host.businessAmenities && host.businessAmenities.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {host.businessAmenities.map(amenity => (
                            <span key={amenity} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400">
                                ✓ {amenity}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>

      {/* Reviews Section */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{isBusiness ? 'Client Reviews' : 'Reviews'}</h3>
            <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-lg dark:text-gray-100">{host.rating.toFixed(1)}</span>
            </div>
         </div>
         
         <div className="space-y-4">
            {reviews.length > 0 ? reviews.map(r => <ReviewCard key={r.id} review={r} />) : <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet for this host.</p>}
         </div>
      </div>
    </div>
  );
}
