
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_HOSTS, MOCK_USER, dataStore } from '../data';
import { ChevronLeftIcon } from '../components/Icons';
import { WaterRequest } from '../types';

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
  const host = MOCK_HOSTS.find(h => h.id === hostId);

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedPh, setSelectedPh] = useState<number | null>(host?.phLevels[0] || null);
  const [liters, setLiters] = useState(5);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const availableTimeSlots = useMemo(() => {
    if (!host || !selectedDate) return [];
    const dayOfWeek = new Date(selectedDate).toLocaleString('en-US', { weekday: 'long' });
    const availability = host.availability[dayOfWeek];
    if (availability && availability.enabled) {
      return generateTimeSlots(availability.startTime, availability.endTime, 30);
    }
    return [];
  }, [host, selectedDate]);
  
  const handleConfirm = () => {
    if (!hostId || !selectedPh || !selectedTime) {
      alert('Please fill out all fields.');
      return;
    }
    
    const newRequest: WaterRequest = {
        id: `req_${Date.now()}`,
        requesterId: MOCK_USER.id,
        hostId: hostId,
        status: 'pending',
        phLevel: selectedPh,
        liters,
        pickupDate: selectedDate,
        pickupTime: selectedTime,
        notes,
        createdAt: new Date().toISOString(),
    };
    
    dataStore.requests.unshift(newRequest);
    alert('Request sent!');
    navigate('/requests');
  };
  
  if (!host) {
    return <div className="p-4 text-center">Host not found.</div>;
  }

  return (
    <div className="pb-24">
        <header className="p-4 flex items-center border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
            <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-xl font-bold mx-auto">Request from {host.name}</h1>
            <div className="w-6"></div>
        </header>

        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-3">Choose pH Level</h2>
                <div className="flex flex-wrap gap-3">
                    {host.phLevels.map(ph => (
                        <button 
                            key={ph}
                            onClick={() => setSelectedPh(ph)}
                            className={`px-4 py-2 rounded-full font-semibold transition ${selectedPh === ph ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            pH {ph.toFixed(1)}
                        </button>
                    ))}
                </div>
            </div>

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
                <h2 className="text-lg font-semibold mb-3">Choose pickup date</h2>
                <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    onChange={e => {
                        setSelectedDate(e.target.value)
                        setSelectedTime(null);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                />
            </div>
            
            {availableTimeSlots.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3">Choose pickup time</h2>
                    <div className="grid grid-cols-3 gap-3">
                         {availableTimeSlots.map(t => (
                            <button 
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`py-3 rounded-lg font-semibold transition text-sm ${selectedTime === t ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}
             {selectedDate && availableTimeSlots.length === 0 && (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">The host is not available on this day. Please select another date.</p>
                </div>
             )}


            <div>
                 <h2 className="text-lg font-semibold mb-3">Notes (optional)</h2>
                 <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g., I'll bring my own containers." 
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                 />
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 max-w-4xl mx-auto">
            <button 
                onClick={handleConfirm} 
                disabled={!selectedPh || !selectedTime}
                className="w-full bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
                Confirm Request
            </button>
        </div>
    </div>
  );
}
