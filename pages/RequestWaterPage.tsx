import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { ChevronLeftIcon, SpinnerIcon } from '../components/Icons';
import { Host } from '../types';

const LITER_OPTIONS = [1, 2, 5, 10];

const generateTimeSlots = (start: string, end: string, intervalMinutes: number): string[] => {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);

    while (currentTime < endTime) {
        slots.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(' ', ''));
        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }
    return slots;
};


export default function RequestWaterPage() {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedPh, setSelectedPh] = useState<number | null>(null);
  const [liters, setLiters] = useState(5);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hostId) {
      api.getHostById(hostId).then(hostData => {
        if (hostData) {
          setHost(hostData);
          setSelectedPh(hostData.phLevels[0] || null);
        }
        setLoading(false);
      });
    }
  }, [hostId]);

  const availableTimeSlots = useMemo(() => {
    if (!host || !selectedDate) return [];
    const dayOfWeek = new Date(selectedDate).toLocaleString('en-US', { weekday: 'long' });
    const availability = host.availability[dayOfWeek];
    if (availability && availability.enabled) {
      return generateTimeSlots(availability.startTime, availability.endTime, 30);
    }
    return [];
  }, [host, selectedDate]);
  
  const handleConfirm = async () => {
    if (!hostId || !selectedPh || !selectedTime) {
      alert('Please fill out all fields.');
      return;
    }
    
    setIsSubmitting(true);
    const currentUser = await api.getCurrentUser();

    await api.createRequest({
        requesterId: currentUser.id,
        hostId: hostId,
        status: 'pending',
        phLevel: selectedPh,
        liters,
        pickupDate: selectedDate,
        pickupTime: selectedTime,
        notes,
    });
    
    setIsSubmitting(false);
    alert('Request sent!');
    navigate('/requests');
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

  return (
    <div className="pb-24">
        <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
            <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            </button>
            <h1 className="text-xl font-bold mx-auto dark:text-gray-100">Request from {host.name}</h1>
            <div className="w-6"></div>
        </header>

        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">Choose pH Level</h2>
                <div className="flex flex-wrap gap-3">
                    {host.phLevels.map(ph => (
                        <button 
                            key={ph}
                            onClick={() => setSelectedPh(ph)}
                            className={`px-4 py-2 rounded-full font-semibold transition ${selectedPh === ph ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            pH {ph.toFixed(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">How many liters?</h2>
                <div className="grid grid-cols-4 gap-3">
                    {LITER_OPTIONS.map(l => (
                        <button 
                            key={l}
                            onClick={() => setLiters(l)}
                            className={`py-3 rounded-lg font-semibold transition ${liters === l ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            {l}L
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">Choose pickup date</h2>
                <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    onChange={e => {
                        setSelectedDate(e.target.value)
                        setSelectedTime(null);
                    }}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                />
            </div>
            
            {availableTimeSlots.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">Choose pickup time</h2>
                    <div className="grid grid-cols-3 gap-3">
                         {availableTimeSlots.map(t => (
                            <button 
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`py-3 rounded-lg font-semibold transition text-sm ${selectedTime === t ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}
             {selectedDate && availableTimeSlots.length === 0 && (
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">The host is not available on this day. Please select another date.</p>
                </div>
             )}


            <div>
                 <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">Notes (optional)</h2>
                 <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g., I'll bring my own containers." 
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                 />
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <button 
                onClick={handleConfirm} 
                disabled={!selectedPh || !selectedTime || isSubmitting}
                className="w-full bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 flex justify-center items-center"
            >
                {isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : 'Confirm Request'}
            </button>
        </div>
    </div>
  );
}