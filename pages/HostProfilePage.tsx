
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { 
    StarIcon, 
    CheckBadgeIcon, 
    MapPinIcon, 
    ChatBubbleOvalLeftEllipsisIcon, 
    SpinnerIcon, 
    ProfilePicture, 
    UserGroupIcon, 
    DropletIcon, 
    SparklesIcon, 
    BuildingStorefrontIcon, 
    ChevronRightIcon, 
    XMarkIcon,
    GlobeAltIcon,
    DevicePhoneMobileIcon,
    InstagramIcon,
    FacebookIcon,
    LinkedInIcon,
    HeartIcon
} from '../components/Icons';
import { Review, User } from '../types';
import { useAuth } from '../App';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI } from "@google/genai";

const RatingStars: React.FC<{ rating: number; className?: string; onClick?: (rating: number) => void; hoverRating?: number; onHover?: (rating: number) => void }> = ({ rating, className = 'w-5 h-5', onClick, hoverRating = 0, onHover }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            const isActive = (hoverRating || rating) >= starValue;
            return (
                <StarIcon 
                    key={i} 
                    onClick={() => onClick?.(starValue)}
                    onMouseEnter={() => onHover?.(starValue)}
                    onMouseLeave={() => onHover?.(0)}
                    className={`${className} ${isActive ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'} ${onClick ? 'cursor-pointer' : ''}`} 
                />
            );
        })}
    </div>
);

const ReviewFormModal: React.FC<{ isOpen: boolean; onClose: () => void; hostName: string; onSubmit: (rating: number, comment: string) => Promise<void> }> = ({ isOpen, onClose, hostName, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        setIsSubmitting(true);
        await onSubmit(rating, comment);
        setIsSubmitting(false);
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{t('write_review')}<br/><span className="text-brand-blue">for {hostName}</span></h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Overall Rating</p>
                        <RatingStars 
                            rating={rating} 
                            hoverRating={hoverRating} 
                            className="w-10 h-10" 
                            onClick={setRating} 
                            onHover={setHoverRating} 
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Your Experience</label>
                        <textarea 
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 min-h-[120px] focus:ring-2 focus:ring-brand-blue outline-none transition"
                            placeholder="Share some details about your visit..."
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={rating === 0 || isSubmitting}
                        className="w-full py-4 bg-brand-blue text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ReviewCard: React.FC<{ review: Review; isBusiness?: boolean }> = ({ review, isBusiness }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${isBusiness ? 'border-amber-100 dark:border-amber-900/30' : ''}`}>
        <div className="flex items-start gap-4">
            <Link to={`/host/${review.reviewerId}`} className="flex-shrink-0">
                <ProfilePicture src={review.reviewerImage} alt={review.reviewerName} className="w-12 h-12 rounded-full object-cover shadow-sm" />
            </Link>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{review.reviewerName}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <RatingStars rating={review.rating} className="w-3.5 h-3.5" />
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">"{review.comment}"</p>
            </div>
        </div>
    </div>
);

const Metric: React.FC<{ icon: React.ReactNode; value: string; label: string; linkTo?: string }> = ({ icon, value, label, linkTo }) => {
    const content = (
        <div className="text-center group">
            <div className="transition-transform group-hover:scale-110 duration-200">{icon}</div>
            <p className="text-lg font-black text-gray-900 dark:text-white mt-1.5">{value}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black">{label}</p>
        </div>
    );
    return linkTo ? <Link to={linkTo} className="p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">{content}</Link> : content;
};

export default function HostProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData: currentUser, setUserData } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  
  const [host, setHost] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [watersSharedCount, setWatersSharedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  // Translation states
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
        const [hostData, reviewsData, hostRequestsData] = await Promise.all([
            api.getUserById(id),
            api.getReviewsForHost(id),
            api.getRequestsByHostId(id)
        ]);
        
        if (hostData) setHost(hostData);
        setReviews(reviewsData);
        setWatersSharedCount(hostRequestsData.filter(r => r.status === 'completed').length);
    } catch (err) {
        console.error("Failed to load host profile:", err);
        showToast("Could not load profile.", "error");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    fetchData();
    // Reset translation when changing profile
    setTranslatedBio(null);
  }, [id, showToast]);
  
  const handleTranslateBio = async () => {
      if (!host?.bio || isTranslating) return;
      if (translatedBio) {
          setTranslatedBio(null); // Toggle back to original
          return;
      }

      setIsTranslating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const targetLang = language === 'pt' ? 'Portuguese' : 'English';
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Translate the following Kangen Share host bio to ${targetLang}. Keep it natural, friendly, and preserve all emojis: ${host.bio}`,
          });
          setTranslatedBio(response.text || null);
      } catch (err) {
          console.error("Gemini translation failed:", err);
          showToast("Translation failed. Try again later.", "error");
      } finally {
          setIsTranslating(false);
      }
  };

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
        showToast("Could not update follow status.", "error");
    }
  };

  const handleFavoriteToggle = async () => {
      if (!host || !currentUser || isFavoriting) return;
      setIsFavoriting(true);
      
      const isFavorited = currentUser.favorites?.includes(host.id);
      const updatedFavorites = isFavorited 
        ? currentUser.favorites.filter(id => id !== host.id)
        : [...(currentUser.favorites || []), host.id];
      
      const previousUserData = currentUser;
      setUserData({ ...currentUser, favorites: updatedFavorites });

      try {
          await api.toggleFavoriteHost(currentUser.id, host.id);
          showToast(isFavorited ? "Removed from saved places." : "Saved to your places!", "success");
      } catch (error) {
          setUserData(previousUserData);
          showToast("Failed to update saved places.", "error");
      } finally {
          setIsFavoriting(false);
      }
  };

  const handleChat = async () => {
    if (!host || !currentUser) return;
    try {
        const requestId = await api.createNewChat(host.id, currentUser.id, host, currentUser);
        navigate(`/chat/${requestId}`);
    } catch(err) {
        console.error("Failed to start chat:", err);
        showToast("Could not start a conversation.", "error");
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
      if (!host || !currentUser) return;
      try {
          const newReview: Omit<Review, 'id'> = {
              rating,
              comment,
              reviewerId: currentUser.id,
              reviewerName: currentUser.displayName,
              reviewerImage: currentUser.profilePicture,
              date: new Date().toISOString(),
          };
          await api.addReview(host.id, newReview);
          showToast("Feedback posted! Thank you.", "success");
          fetchData(); 
      } catch (error) {
          showToast("Failed to post review.", "error");
      }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-full bg-white dark:bg-gray-950">
              <SpinnerIcon className="w-12 h-12 text-brand-blue animate-spin" />
          </div>
      );
  }

  if (!host || !currentUser) {
      return <div className="p-8 text-center dark:text-gray-300 font-bold">Profile not found.</div>;
  }
  
  const isFollowing = currentUser.following?.includes(host.id);
  const isFavorited = currentUser.favorites?.includes(host.id);
  const isCurrentUserProfile = currentUser.id === host.id;
  const isOfficialDistributor = host.distributorVerificationStatus === 'approved';
  const isBusiness = host.isBusiness;

  const fullAddress = `${host.address.street} ${host.address.number}, ${host.address.city}, ${host.address.country}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

  return (
    <div className={`bg-white dark:bg-gray-950 min-h-full ${isBusiness ? 'border-t-[12px] border-amber-500' : ''}`}>
        <div className="p-6 md:p-10">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative">
                
                {/* Favorite Toggle */}
                {!isCurrentUserProfile && (
                    <button 
                        onClick={handleFavoriteToggle}
                        disabled={isFavoriting}
                        className="absolute top-0 right-0 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all z-10"
                    >
                        <HeartIcon className={`w-6 h-6 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} solid={isFavorited} />
                    </button>
                )}

                <div className="relative">
                    <div className={`rounded-full p-1 shadow-2xl ${isBusiness ? 'bg-amber-500' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <ProfilePicture src={host.profilePicture} alt={host.displayName} className={`w-36 h-36 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-inner`} />
                    </div>
                    {isBusiness && (
                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-3 rounded-2xl shadow-xl transform rotate-12">
                            <BuildingStorefrontIcon className="w-6 h-6" />
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-none">{host.displayName}</h1>
                        {isBusiness ? <SparklesIcon className="w-8 h-8 text-amber-500" /> : isOfficialDistributor && <CheckBadgeIcon className="w-8 h-8 text-brand-blue" />}
                    </div>
                    
                    {isBusiness ? (
                         <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 dark:bg-amber-900/30 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-amber-200 dark:border-amber-800">
                                {host.businessCategory || 'WELLNESS PARTNER'}
                            </span>
                            {isOfficialDistributor && <span className="text-[10px] font-black text-brand-blue bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-900/50 shadow-sm">Certified</span>}
                        </div>
                    ) : isOfficialDistributor && (
                        <p className="text-sm font-extrabold text-brand-blue mt-2 tracking-wide uppercase">{t('verified_host')}</p>
                    )}
                    
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="w-5 h-5" />
                        <p className="text-sm font-bold uppercase tracking-widest">{host.address.city}, {host.address.country}</p>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 py-8 my-8 border-y border-gray-100 dark:border-gray-800">
                <Metric
                    icon={<StarIcon className="w-6 h-6 mx-auto text-yellow-400" />}
                    value={`${host.rating.toFixed(1)}`}
                    label={`Reviews (${reviews.length})`}
                />
                <Metric
                    icon={<UserGroupIcon className="w-6 h-6 mx-auto text-blue-400" />}
                    value={String(host.followers.length)}
                    label={t('followers')}
                    linkTo={`/profile/${host.id}/followers`}
                />
                <Metric
                    icon={<DropletIcon className="w-6 h-6 mx-auto text-cyan-400" />}
                    value={String(watersSharedCount)}
                    label="Hydrated"
                />
            </div>
            
            {/* CTA Container */}
            {!isCurrentUserProfile && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-1 gap-2">
                        <button
                            onClick={handleFollowToggle}
                            className={`flex-1 font-black px-6 py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-sm ${
                            isFollowing
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button onClick={handleChat} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black px-6 py-4 rounded-2xl text-xs uppercase tracking-widest transition-all hover:bg-gray-200">
                            Chat
                        </button>
                    </div>
                    {isBusiness ? (
                        <a 
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-[1.5] text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none flex items-center justify-center gap-2"
                        >
                            <MapPinIcon className="w-5 h-5" />
                            {t('get_directions')}
                        </a>
                    ) : (
                        host.isAcceptingRequests && isOfficialDistributor && (
                            <button
                                onClick={() => navigate(`/request/${id}`)}
                                className="flex-[1.5] text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 bg-brand-blue hover:bg-blue-600 shadow-blue-200 dark:shadow-none"
                            >
                                {t('request_water')}
                            </button>
                        )
                    )}
                </div>
            )}
            
            {/* Bio Section */}
            <div className="my-10 space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">{t('the_story')}</h3>
                        {host.bio && (
                            <button 
                                onClick={handleTranslateBio}
                                disabled={isTranslating}
                                className="text-[10px] font-black text-brand-blue uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                            >
                                {isTranslating ? (
                                    <>
                                        <SpinnerIcon className="w-3 h-3 animate-spin" />
                                        {t('translating')}
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-3 h-3" />
                                        {translatedBio ? t('original_story') : t('translate_story')}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="relative group">
                         <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-lg leading-relaxed font-medium transition-all ${isTranslating ? 'blur-sm opacity-50' : 'blur-0 opacity-100'}`}>
                            {translatedBio || (host.bio ? host.bio : isBusiness 
                                ? `Welcome to our ${host.businessCategory || 'Wellness Space'}. We are proud to serve Kangen Water to our valued guests.` 
                                : `Welcome to our space. We share Kangen Water to promote conscious hydration. ✨`)}
                        </p>
                    </div>
                </div>
                
                {isBusiness && host.businessAmenities && host.businessAmenities.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">{t('amenities')}</h3>
                        <div className="flex flex-wrap gap-3">
                            {host.businessAmenities.map(amenity => (
                                <span key={amenity} className="px-5 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-xs font-black text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 shadow-sm">
                                    ✓ {amenity}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

      <div className={`p-6 md:p-10 border-t border-gray-100 dark:border-gray-800 ${isBusiness ? 'bg-amber-50/20 dark:bg-amber-900/5' : 'bg-gray-50/30 dark:bg-gray-900/10'}`}>
         <div className="flex justify-between items-end mb-8">
            <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{isBusiness ? t('guest_feedback') : 'Host Reviews'}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Based on {reviews.length} experiences</p>
            </div>
            
            <div className="flex items-center gap-3">
                {!isCurrentUserProfile && (
                    <button 
                        onClick={() => setShowReviewModal(true)}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-sm ${isBusiness ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-brand-blue text-white hover:bg-blue-600'}`}
                    >
                        {t('write_review')}
                    </button>
                )}
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.length > 0 ? reviews.map(r => <ReviewCard key={r.id} review={r} isBusiness={isBusiness} />) : (
                <div className="col-span-full py-16 text-center bg-white dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">No reviews yet.</p>
                </div>
            )}
         </div>
      </div>

      <ReviewFormModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        hostName={host.displayName}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
