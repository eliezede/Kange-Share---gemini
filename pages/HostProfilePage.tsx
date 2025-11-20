
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { StarIcon, CheckBadgeIcon, MapPinIcon, ChatBubbleOvalLeftEllipsisIcon, SpinnerIcon, ProfilePicture, UserGroupIcon, DropletIcon } from '../components/Icons';
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-start gap-4">
            <ProfilePicture src={review.reviewerImage} alt={review.reviewerName} className="w-12 h-12 rounded-full object-cover" />
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
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
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

  return (
    <div className="bg-white dark:bg-gray-950 min-h-full">
        <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center gap-5">
                <ProfilePicture src={host.profilePicture} alt={host.displayName} className="w-24 h-24 rounded-full object-cover" />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{host.displayName}</h1>
                        {isOfficialDistributor && <CheckBadgeIcon className="w-6 h-6 text-brand-blue" />}
                    </div>
                    {isOfficialDistributor && (
                        <p className="text-sm font-semibold text-brand-blue">Official Enagic® Distributor</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        <p className="text-sm">{host.address.city}, {host.address.country}</p>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="flex justify-around items-start text-center py-4 my-6 border-y-2 border-gray-100 dark:border-gray-800">
                <Metric
                    icon={<StarIcon className="w-6 h-6 mx-auto text-yellow-400" />}
                    value={`${host.rating.toFixed(1)} (${reviews.length})`}
                    label="Reviews"
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
                    label="Waters Shared"
                />
            </div>
            
            {/* Action Buttons */}
            {!isCurrentUserProfile && (
                <div className="flex gap-3">
                    <button
                        onClick={handleFollowToggle}
                        className={`flex-1 font-semibold px-4 py-3 rounded-xl text-sm transition-colors ${
                        isFollowing
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button onClick={handleChat} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-4 py-3 rounded-xl text-sm transition-colors">
                        Message
                    </button>
                    {host.isAcceptingRequests && isOfficialDistributor && (
                         <button
                            onClick={() => navigate(`/request/${id}`)}
                            className="flex-grow-[1.5] bg-brand-blue text-white font-bold px-4 py-3 rounded-xl text-sm transition-colors"
                        >
                            Request Water
                        </button>
                    )}
                </div>
            )}
            
            {/* Bio */}
            <div className="my-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {host.bio ? host.bio : `Sharing Kangen Water 💧\nPromoting conscious hydration and well-being ✨`}
                </p>
            </div>
        </div>

      {/* Reviews Section */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800">
         <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Reviews ({reviews.length})</h3>
         <div className="space-y-4">
            {reviews.length > 0 ? reviews.slice(0, 3).map(r => <ReviewCard key={r.id} review={r} />) : <p className="text-gray-500 dark:text-gray-400">No reviews yet for this host.</p>}
            {reviews.length > 3 && (
                <button className="w-full text-center py-3 mt-2 text-brand-blue font-semibold bg-gray-100 dark:bg-gray-800 rounded-lg">
                    Show all {reviews.length} reviews
                </button>
            )}
         </div>
      </div>
    </div>
  );
}
