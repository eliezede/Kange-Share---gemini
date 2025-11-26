
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { User, WaterRequest, Review } from '../types';
import { useAuth } from '../App';
import { StarIcon, SpinnerIcon, ChevronLeftIcon } from '../components/Icons';
import { useToast } from '../hooks/useToast';

export default function RateHostPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { userData: currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [request, setRequest] = useState<WaterRequest | null>(null);
  const [host, setHost] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    const fetchData = async () => {
        setLoading(true);
        const reqData = await api.getRequestById(requestId);
        if (reqData) {
            setRequest(reqData);
            const hostData = await api.getUserById(reqData.hostId);
            setHost(hostData);
        }
        setLoading(false);
    };
    fetchData();
  }, [requestId]);

  const handleSubmit = async () => {
    if (!host || !currentUser) return;
    setIsSubmitting(true);
    
    const newReview: Omit<Review, 'id'> = {
        rating,
        comment,
        reviewerId: currentUser.id,
        reviewerName: currentUser.displayName,
        reviewerImage: currentUser.profilePicture,
        date: new Date().toISOString(),
    };

    try {
        await api.addReview(host.id, newReview);
        showToast('Thank you for your feedback!', 'success');
        navigate('/requests');
    } catch (error) {
        console.error("Failed to submit review:", error);
        showToast('Failed to submit review. Please try again.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" /></div>;
  }

  if (!host) {
    return <div className="p-4 text-center">Host not found for this request.</div>;
  }

  // Prevent self-rating logic
  if (currentUser && host.id === currentUser.id) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-900">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-sm w-full">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Self-Rating Not Allowed</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">You cannot write a review for yourself. Reviews are only for requesters.</p>
                  <button 
                    onClick={() => navigate('/requests')}
                    className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                      <ChevronLeftIcon className="w-5 h-5" />
                      Back to Requests
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50 dark:bg-gray-900">
      <img src={host.profilePicture} alt={host.displayName} className="w-24 h-24 rounded-full object-cover shadow-lg mb-4 border-4 border-white dark:border-gray-800"/>
      <h1 className="text-2xl font-bold dark:text-gray-100">Rate your experience with</h1>
      <p className="text-2xl text-gray-800 dark:text-gray-200 mb-6">{host.displayName}</p>
      
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`w-10 h-10 cursor-pointer transition-colors ${
              (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>

      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (optional)"
        rows={4}
        className="w-full max-w-md p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition mb-6"
      />

      <div className="w-full max-w-md space-y-3">
        <button 
          onClick={handleSubmit} 
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 flex justify-center items-center"
        >
          {isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : 'Submit Rating'}
        </button>
        <button onClick={() => navigate('/requests')} className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          Skip
        </button>
      </div>
    </div>
  );
}
