
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataStore } from '../data';
import { StarIcon, SearchIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon, ClipboardDocumentListIcon, ChevronRightIcon } from '../components/Icons';
import { Host } from '../types';

const HostCard: React.FC<{ host: Host }> = ({ host }) => (
  <Link to={`/host/${host.id}`} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100">
    <img src={host.image} alt={host.name} className="w-20 h-20 rounded-lg object-cover" />
    <div className="flex-1">
      <div className="flex items-center">
        <h3 className="font-bold text-lg">{host.name}</h3>
        {host.isVerified && <CheckBadgeIcon className="w-5 h-5 text-brand-blue ml-2 flex-shrink-0" />}
      </div>
      <p className="text-gray-600">{host.city}</p>
      <div className="flex items-center mt-1">
        <StarIcon className="w-5 h-5 text-yellow-400" />
        <span className="ml-1 font-semibold text-gray-700">{host.rating.toFixed(1)}</span>
        <span className="ml-2 text-gray-500">({host.reviews} reviews)</span>
      </div>
    </div>
  </Link>
);

const MyRequestsCard: React.FC = () => {
    const pendingRequestsCount = useMemo(() => 
        dataStore.requests.filter(r => r.requesterId === dataStore.currentUser.id && r.status === 'pending').length
    , []);

    return (
        <div className="p-4">
            <Link to="/requests" className="flex items-center justify-between p-4 rounded-xl bg-brand-light hover:bg-blue-100 transition-colors duration-200 border border-brand-blue/20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-full">
                         <ClipboardDocumentListIcon className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">My Requests</h4>
                        <p className="text-sm text-gray-600">
                            {pendingRequestsCount > 0 
                                ? `You have ${pendingRequestsCount} pending request${pendingRequestsCount > 1 ? 's' : ''}.` 
                                : "View your request history."}
                        </p>
                    </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </Link>
        </div>
    );
};


const allPhLevels = Array.from(new Set(dataStore.hosts.flatMap(h => h.phLevels))).sort((a,b) => a - b);
const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends'];
// FIX: Define weekday/weekend constants for availability filtering.
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKENDS = ['Saturday', 'Sunday'];

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: { ph: number[]; days: string[] }) => void;
    activeFilters: { ph: number[]; days: string[] };
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, activeFilters }) => {
    const [selectedPh, setSelectedPh] = useState<number[]>(activeFilters.ph);
    const [selectedDays, setSelectedDays] = useState<string[]>(activeFilters.days);
    
    useEffect(() => {
        setSelectedPh(activeFilters.ph);
        setSelectedDays(activeFilters.days);
    }, [isOpen, activeFilters]);

    if (!isOpen) return null;

    const togglePh = (ph: number) => {
        setSelectedPh(prev => prev.includes(ph) ? prev.filter(p => p !== ph) : [...prev, ph]);
    }

    const toggleDay = (day: string) => {
        setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    }
    
    const handleApply = () => {
        onApply({ ph: selectedPh, days: selectedDays });
        onClose();
    }
    
    const handleClear = () => {
        setSelectedPh([]);
        setSelectedDays([]);
        onApply({ ph: [], days: [] });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Filters</h2>
                    <button onClick={handleClear} className="text-sm font-semibold text-gray-600 hover:text-black">Clear All</button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3">Water pH</h3>
                    <div className="flex flex-wrap gap-2">
                        {allPhLevels.map(ph => (
                            <button key={ph} onClick={() => togglePh(ph)} className={`px-4 py-2 rounded-full font-semibold transition ${selectedPh.includes(ph) ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                {ph.toFixed(1)}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-3">Availability</h3>
                    <div className="flex flex-wrap gap-3">
                         {AVAILABILITY_OPTIONS.map(day => (
                            <button key={day} onClick={() => toggleDay(day)} className={`flex-1 py-3 rounded-lg font-semibold transition ${selectedDays.includes(day) ? 'bg-brand-blue text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleApply} className="w-full bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors">
                    Apply Filters
                </button>
            </div>
        </div>
    );
};


export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ ph: number[], days: string[] }>({ ph: [], days: [] });

  const isFilterActive = activeFilters.ph.length > 0 || activeFilters.days.length > 0;

  const filteredHosts = useMemo(() => {
    return dataStore.hosts.filter(host => {
      // Search filter
      const matchesSearch = host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            host.city.toLowerCase().includes(searchQuery.toLowerCase());

      // pH filter
      const matchesPh = activeFilters.ph.length === 0 || activeFilters.ph.some(ph => host.phLevels.includes(ph));

      // Availability filter
      // FIX: Correctly check host availability for weekdays and weekends based on the `availability` object structure.
      const hostIsWeekday = WEEKDAYS.some(day => host.availability[day]?.enabled);
      const hostIsWeekend = WEEKENDS.some(day => host.availability[day]?.enabled);
      const matchesDays = activeFilters.days.length === 0 || activeFilters.days.every(dayFilter => {
          if (dayFilter === 'Weekdays') return hostIsWeekday;
          if (dayFilter === 'Weekends') return hostIsWeekend;
          return false;
      });

      return matchesSearch && matchesPh && matchesDays;
    });
  }, [searchQuery, activeFilters]);

  return (
    <>
      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setActiveFilters}
        activeFilters={activeFilters}
      />
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 sticky top-0 bg-white z-10">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by city, host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full bg-gray-100 focus:ring-2 focus:ring-brand-blue focus:bg-white outline-none transition"
            />
          </div>
          <button onClick={() => setFilterOpen(true)} className="p-2.5 border border-gray-300 rounded-full hover:bg-gray-100 transition relative">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-700"/>
              {isFilterActive && <span className="absolute top-1.5 right-1.5 block w-2 h-2 bg-brand-blue rounded-full"></span>}
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
            <MyRequestsCard />
            <div className="px-4 pt-2 text-sm font-semibold text-gray-500">NEARBY HOSTS</div>
            {filteredHosts.length > 0 ? (
              filteredHosts.map(host => <HostCard key={host.id} host={host} />)
            ) : (
              <div className="text-center p-8 text-gray-500">
                  <h3 className="text-lg font-semibold">No hosts found</h3>
                  <p>Try adjusting your search or filters.</p>
              </div>
            )}
        </div>
      </div>
    </>
  );
}