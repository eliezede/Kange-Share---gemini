

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_HOSTS, dataStore } from '../data';
import { StarIcon } from '../components/Icons';

export default function RateHostPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const request = dataStore.requests.find(r => r.id === requestId);
  const host = MOCK_HOSTS.find(h => h.id === request?.hostId);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    // Submit rating logic
    alert('Thank you for your feedback!');
    navigate('/requests');
  };

  if (!host) {
    return <div className="p-4 text-center">Host not found for this request.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <img src={host.image} alt={host.name} className="w-24 h-24 rounded-full object-cover shadow-lg mb-4"/>
      <h1 className="text-2xl font-bold">Rate your experience with</h1>
      <p className="text-2xl text-gray-800 mb-6">{host.name}</p>
      
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`w-10 h-10 cursor-pointer transition-colors ${
              (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      <textarea 
        placeholder="Add a comment (optional)"
        rows={4}
        className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition mb-6"
      />

      <div className="w-full max-w-md">
        <button 
          onClick={handleSubmit} 
          disabled={rating === 0}
          className="w-full bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300"
        >
          Submit Rating
        </button>
        <button onClick={() => navigate('/requests')} className="mt-2 text-gray-500 hover:text-gray-700">
          Skip
        </button>
      </div>
    </div>
  );
}
