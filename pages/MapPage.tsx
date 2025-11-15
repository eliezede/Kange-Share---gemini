import React, { useState, useMemo, useEffect } from 'react';
// FIX: Corrected import statement for react-router-dom.
import { Link } from 'react-router-dom';
import * as api from '../api';
import { StarIcon, SearchIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon, ClipboardDocumentListIcon, ChevronRightIcon, SpinnerIcon, ProfilePicture } from '../components/Icons';
import { User } from '../types';
import { useAuth } from '../App';

const HostCard: React.FC<{ host: User }> = ({ host }) => (
  <Link to={`/host/${host.id}`} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800">
    <ProfilePicture src={host.profilePicture} alt={host.name} className="w-20 h-20 rounded-lg object-cover" />
    <div className="flex-1">
      <div className="flex items-center">
        <h3 className="font-bold text-lg dark:text-gray-100">{host.name}</h3>
        {host.isVerified && <CheckBadgeIcon className="w-5 h-5 text-brand-blue ml-2 flex-shrink-0" />}
      </div>
      <p className="text-gray-600 dark:text-gray-400">{host.address.city}</p>
      <div className="flex items-center mt-1">
        <StarIcon className="w-5 h-5 text-yellow-400" />
        <span className="ml-1 font-semibold text-gray-700 dark:text-gray-200">{host.rating.toFixed(1)}</span>
        <span className="ml-2 text-gray-500 dark:text-gray-400">({host.reviews} reviews)</span>
      </div>
    </div>
  </Link>
);

const MyRequestsCard: React.FC = () => {
    const { userData } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (userData) {
            api.getRequestsByUserId(userData.id).then(requests => {
                setPendingCount(requests.filter(r => r.status === 'pending').length);
            });
        }
    }, [userData]);

    if (!userData) return null;

    return (
        <div className="p-4">
            <Link to="/requests" className="flex items-center justify-between p-4 rounded-xl bg-brand-light dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors duration-200 border border-brand-blue/20 dark:border-brand-blue/40">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                         <ClipboardDocumentListIcon className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">My Requests</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {pendingCount > 0 
                                ? `You have ${pendingCount} pending request${pendingCount > 1 ? 's' : ''}.` 
                                : "View your request history."}
                        </p>
                    </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Link>
        </div>
    );
};


const allPhLevels = [2.5, 8.5, 9.0, 9.5, 11.5]; // Hardcoded for simplicity
const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends'];
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
        // FIX: Corrected a typo where 'd' was used instead of 'day' in the add-to-array part of the ternary.
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-gray-100">Filters</h2>
                    <button onClick={handleClear} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Clear All</button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Water pH</h3>
                    <div className="flex flex-wrap gap-2">
                        {allPhLevels.map(ph => (
                            <button key={ph} onClick={() => togglePh(ph)} className={`px-4 py-2 rounded-full font-semibold transition ${selectedPh.includes(ph) ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                {ph.toFixed(1)}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Availability</h3>
                    <div className="flex flex-wrap gap-3">
                         {AVAILABILITY_OPTIONS.map(day => (
                            <button key={day} onClick={() => toggleDay(day)} className={`flex-1 py-3 rounded-lg font-semibold transition ${selectedDays.includes(day) ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
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
  const [hosts, setHosts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ ph: number[], days: string[] }>({ ph: [], days: [] });

  useEffect(() => {
      api.getHosts().then(data => {
          setHosts(data);
          setLoading(false);
      });
  }, []);

  const isFilterActive = activeFilters.ph.length > 0 || activeFilters.days.length > 0;

  const filteredHosts = useMemo(() => {
    return hosts.filter(host => {
      const matchesSearch = host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            host.address.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPh = activeFilters.ph.length === 0 || activeFilters.ph.some(ph => host.phLevels.includes(ph));

      const hostIsWeekday = WEEKDAYS.some(day => host.availability[day]?.enabled);
      const hostIsWeekend = WEEKENDS.some(day => host.availability[day]?.enabled);
      const matchesDays = activeFilters.days.length === 0 || activeFilters.days.every(dayFilter => {
          if (dayFilter === 'Weekdays') return hostIsWeekday;
          if (dayFilter === 'Weekends') return hostIsWeekend;
          return false;
      });

      return matchesSearch && matchesPh && matchesDays;
    });
  }, [searchQuery, activeFilters, hosts]);
  
  const renderContent = () => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
            </div>
        );
    }
    
    if (filteredHosts.length > 0) {
        return filteredHosts.map(host => <HostCard key={host.id} host={host} />);
    }

    return (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-semibold dark:text-gray-300">No hosts found</h3>
            <p>Try adjusting your search or filters.</p>
        </div>
    );
  };

  return (
    <>
      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setActiveFilters}
        activeFilters={activeFilters}
      />
      <div>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-900">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by city, host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:bg-white dark:focus:bg-gray-900 outline-none transition"
            />
          </div>
          <button onClick={() => setFilterOpen(true)} className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition relative">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
              {isFilterActive && <span className="absolute top-1.5 right-1.5 block w-2 h-2 bg-brand-blue rounded-full"></span>}
          </button>
        </div>
        <div>
            <MyRequestsCard />
            <div className="px-4 pt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">NEARBY HOSTS</div>
            {renderContent()}
        </div>
      </div>
    </>
  );
}