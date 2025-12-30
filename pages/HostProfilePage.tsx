
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api.ts';
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
    InstagramIcon,
    FacebookIcon,
    LinkedInIcon,
    HeartIcon
} from '../components/Icons.tsx';
import { Review, User } from '../types.ts';
import { useAuth } from '../App.tsx';
import { useToast } from '../hooks/useToast.tsx';
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
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Write a Review<br/><span className="text-brand-blue">for {hostName}</span></h3>
                    <button onClick={onClose} className="p-2"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <RatingStars rating={rating} hoverRating={hoverRating} className="w-10 h-10 mx-auto" onClick={setRating} onHover={setHoverRating} />
                    <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl dark:text-white min-h-[120px]" placeholder="Share your experience..." />
                    <button type="submit" disabled={rating === 0 || isSubmitting} className="w-full py-4 bg-brand-blue text-white font-black rounded-2xl disabled:opacity-50">{isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin mx-auto"/> : 'Submit'}</button>
                </form>
            </div>
        </div>
    );
};

const ReviewCard: React.FC<{ review: Review; isBusiness?: boolean }> = ({ review, isBusiness }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all ${isBusiness ? 'border-amber-100' : ''}`}>
        <div className="flex items-start gap-4">
            <Link to={`/host/${review.reviewerId}`}><ProfilePicture src={review.reviewerImage} alt={review.reviewerName} className="w-12 h-12 rounded-full object-cover shadow-sm" /></Link>
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

export default function HostProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData: currentUser, setUserData } = useAuth();
  const { showToast } = useToast();
  
  const [host, setHost] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [watersSharedCount, setWatersSharedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [hostData, reviewsData, hostRequestsData] = await Promise.all([
                api.getUserById(id),
                api.getReviewsForHost(id),
                api.getRequestsByHostId(id)
            ]);
            if (hostData) setHost(hostData);
            setReviews(reviewsData);
            setWatersSharedCount(hostRequestsData.filter(r => r.status === 'completed').length);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleTranslateBio = async () => {
    if (!host?.bio || isTranslating) return;
    if (translatedBio) { setTranslatedBio(null); return; }
    setIsTranslating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate the following bio to English: ${host.bio}`,
        });
        setTranslatedBio(response.text || null);
    } catch (err) { showToast("Translation failed.", "error"); } finally { setIsTranslating(false); }
  };

  const handleFollowToggle = async () => {
    if (!host || !currentUser) return;
    try {
        await api.toggleFollowHost(currentUser.id, host.id);
        const updated = await api.getUserById(host.id);
        if (updated) setHost(updated);
        const currentUpdated = await api.getUserById(currentUser.id);
        if (currentUpdated) setUserData(currentUpdated);
    } catch (error) { showToast("Could not update follow status.", "error"); }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><SpinnerIcon className="w-12 h-12 text-brand-blue animate-spin" /></div>;
  if (!host || !currentUser) return <div className="p-8 text-center dark:text-gray-300 font-bold">Profile not found.</div>;

  return (
    <div className={`bg-white dark:bg-gray-950 min-h-full ${host.isBusiness ? 'border-t-[12px] border-amber-500' : ''}`}>
        <div className="p-6 md:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className={`rounded-full p-1 ${host.isBusiness ? 'bg-amber-500' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <ProfilePicture src={host.profilePicture} alt={host.displayName} className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-none">{host.displayName}</h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 text-gray-500">
                        <MapPinIcon className="w-5 h-5" />
                        <p className="text-sm font-bold uppercase tracking-widest">{host.address.city}, {host.address.country}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-8 border-y dark:border-gray-800 my-8">
                <div className="text-center"><p className="text-lg font-black dark:text-white">{host.rating.toFixed(1)}</p><p className="text-[10px] text-gray-400 uppercase font-black">Reviews</p></div>
                <div className="text-center"><p className="text-lg font-black dark:text-white">{host.followers.length}</p><p className="text-[10px] text-gray-400 uppercase font-black">Followers</p></div>
                <div className="text-center"><p className="text-lg font-black dark:text-white">{watersSharedCount}</p><p className="text-[10px] text-gray-400 uppercase font-black">Shared</p></div>
            </div>
            {currentUser.id !== host.id && (
                <div className="flex gap-4">
                    <button onClick={handleFollowToggle} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black uppercase text-xs tracking-widest">{currentUser.following.includes(host.id) ? 'Following' : 'Follow'}</button>
                    <button onClick={() => navigate(`/request/${host.id}`)} className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Request Water</button>
                </div>
            )}
            <div className="my-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">The Story</h3>
                    <button onClick={handleTranslateBio} className="text-[10px] font-black text-brand-blue uppercase tracking-widest flex items-center gap-1.5">{isTranslating ? 'Translating...' : translatedBio ? 'See original' : 'Translate story'}</button>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{translatedBio || host.bio || "Welcome to our space. ✨"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t dark:border-gray-800">
                {reviews.map(r => <ReviewCard key={r.id} review={r} isBusiness={host.isBusiness} />)}
            </div>
        </div>
    </div>
  );
}
