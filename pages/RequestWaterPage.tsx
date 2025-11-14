
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_HOSTS } from '../data';
import { ChevronLeftIcon } from '../components/Icons';

const LITER_OPTIONS = [1, 2, 5, 10];
const TIME_SLOTS = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

export default function RequestWaterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const host = MOCK_HOSTS.find(h => h.id === id);
  const [liters, setLiters] = useState(5);
  const [time, setTime] = useState(TIME_SLOTS[0]);

  const handleConfirm = () => {
    // Here you would typically send the request to a server
    navigate(`/chat/${id}`);
  };
  
  if (!host) {
    return <div className="p-4 text-center">Host not found.</div>;
  }

  return (
    <div className="pb-24">
        <header className="p-4 flex items-center border-b border-gray-200">
            <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-xl font-bold mx-auto">Request from {host.name}</h1>
        </header>

        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-3">How many liters?</h2>
                <div className="grid grid-cols-4 gap-3">
                    {LITER_OPTIONS.map(l => (
                        <button 
                            key={l}
                            onClick={() => setLiters(l)}
                            className={`py-3 rounded-lg font-semibold transition ${liters === l ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {l}L
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3">Choose pickup time</h2>
                <div className="grid grid-cols-2 gap-3">
                     {TIME_SLOTS.map(t => (
                        <button 
                            key={t}
                            onClick={() => setTime(t)}
                            className={`py-3 rounded-lg font-semibold transition ${time === t ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                 <h2 className="text-lg font-semibold mb-3">Notes (optional)</h2>
                 <textarea 
                    placeholder="e.g., I'll bring my own containers." 
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                 />
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 max-w-4xl mx-auto">
            <button onClick={handleConfirm} className="w-full bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors">
            Confirm Request
            </button>
        </div>
    </div>
  );
}
