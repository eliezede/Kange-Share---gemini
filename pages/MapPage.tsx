
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { StarIcon, SearchIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon, ChevronRightIcon, SpinnerIcon, ProfilePicture, MapPinIcon, ClipboardDocumentListIcon, XMarkIcon } from '../components/Icons';
import { User } from '../types';
import { useAuth } from '../App';

// --- Leaflet Types Shim ---
declare const L: any;

// Mock function to generate coordinates based on string hash if they don't exist
const getMockCoordinates = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const lat = 51.505 + (Math.sin(hash) * 0.1);
    const lng = -0.09 + (Math.cos(hash) * 0.1);
    return { lat, lng };
};

const HostCard: React.FC<{ host: User; isCompact?: boolean; isSelected?: boolean; onClick?: () => void }> = ({ host, isCompact, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`
        relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer border
        ${isCompact ? 'w-72 flex-shrink-0 mr-4 shadow-lg' : 'w-full mb-4 hover:shadow-md'}
        ${isSelected ? 'border-brand-blue ring-2 ring-brand-blue ring-opacity-50' : 'border-gray-100 dark:border-gray-700'}
    `}
  >
    <div className="p-4 flex items-start gap-3">
        <ProfilePicture src={host.profilePicture} alt={host.displayName} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700" />
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate pr-2">{host.displayName}</h3>
                {host.distributorVerificationStatus === 'approved' && <CheckBadgeIcon className="w-4 h-4 text-brand-blue flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{host.address.city}, {host.address.country}</p>
            <div className="flex items-center mt-1.5">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span className="ml-1 text-sm font-bold text-gray-800 dark:text-gray-200">{host.rating.toFixed(1)}</span>
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({host.reviews})</span>
            </div>
        </div>
    </div>
    <div className="px-4 pb-3 pt-0">
         <Link to={`/host/${host.id}`} className="block w-full text-center py-2 bg-gray-50 dark:bg-gray-700 hover:bg-brand-light dark:hover:bg-gray-600 text-brand-blue dark:text-brand-light text-sm font-bold rounded-lg transition-colors">
            View Profile
         </Link>
    </div>
  </div>
);

interface FilterState {
    phLevels: number[];
    minRating: number;
    openToday: boolean;
}

const FilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (newFilters: FilterState) => void;
}> = ({ isOpen, onClose, filters, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const PH_OPTIONS = [8.5, 9.0, 9.5, 11.5, 2.5];

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, isOpen]);

    if (!isOpen) return null;

    const togglePh = (ph: number) => {
        setLocalFilters(prev => {
            const levels = prev.phLevels.includes(ph) 
                ? prev.phLevels.filter(p => p !== ph)
                : [...prev.phLevels, ph];
            return { ...prev, phLevels: levels };
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm m-4 flex flex-col max-h-[80vh] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">Filters</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* pH Levels */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Water Types (pH)</label>
                        <div className="flex flex-wrap gap-2">
                            {PH_OPTIONS.map(ph => (
                                <button
                                    key={ph}
                                    onClick={() => togglePh(ph)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                                        localFilters.phLevels.includes(ph)
                                        ? 'bg-brand-blue text-white border-brand-blue'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    pH {ph.toFixed(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Min Rating */}
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Rating</label>
                         <div className="flex items-center gap-2">
                            {[0, 3, 4, 4.5].map(rating => (
                                 <button
                                    key={rating}
                                    onClick={() => setLocalFilters(prev => ({ ...prev, minRating: rating }))}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors flex items-center gap-1 ${
                                        localFilters.minRating === rating
                                        ? 'bg-brand-blue text-white border-brand-blue'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {rating === 0 ? 'Any' : <>{rating}+ <StarIcon className="w-3 h-3" /></>}
                                </button>
                            ))}
                         </div>
                    </div>

                    {/* Open Today */}
                     <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Today</label>
                         <button 
                            onClick={() => setLocalFilters(prev => ({ ...prev, openToday: !prev.openToday }))}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localFilters.openToday ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'}`}
                         >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localFilters.openToday ? 'translate-x-6' : 'translate-x-1'}`} />
                         </button>
                     </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button 
                        onClick={() => {
                            onApply({ phLevels: [], minRating: 0, openToday: false });
                            onClose();
                        }}
                        className="flex-1 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleApply}
                        className="flex-1 py-3 rounded-xl font-semibold bg-brand-blue text-white hover:bg-blue-600 transition"
                    >
                        Apply Filters
                    </button>
                </div>
             </div>
        </div>
    );
};

export default function MapPage() {
  const [hosts, setHosts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
      phLevels: [],
      minRating: 0,
      openToday: false,
  });
  
  const { userData, pendingHostRequestCount } = useAuth();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
      api.getHosts().then(data => {
          const hostsWithCoords = data.map(h => {
              if (!h.address.coordinates) {
                  return { ...h, address: { ...h.address, coordinates: getMockCoordinates(h.id) } };
              }
              return h;
          });
          setHosts(hostsWithCoords);
          setLoading(false);
      });
  }, []);

  const filteredHosts = useMemo(() => {
    return hosts.filter(host => {
      const matchesSearch = host.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            host.address.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPh = filters.phLevels.length === 0 || filters.phLevels.some(ph => host.phLevels.includes(ph));
      
      const matchesRating = host.rating >= filters.minRating;

      let matchesAvailability = true;
      if (filters.openToday) {
          const today = new Date().toLocaleString('en-US', { weekday: 'long' });
          const schedule = host.availability[today];
          matchesAvailability = schedule && schedule.enabled;
      }

      return matchesSearch && matchesPh && matchesRating && matchesAvailability;
    });
  }, [searchQuery, hosts, filters]);

  useEffect(() => {
    if (loading) return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
    }).addTo(map);
    
    L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;
    
    setTimeout(() => { map.invalidateSize(); }, 100);

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [loading]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #2C8CF4; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    const selectedIcon = L.divIcon({
        className: 'custom-div-icon-selected',
        html: `<div style="background-color: #2C8CF4; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4); transform: scale(1.1);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const bounds = L.latLngBounds([]);

    filteredHosts.forEach(host => {
        if (host.address.coordinates) {
            const { lat, lng } = host.address.coordinates;
            const isSelected = host.id === selectedHostId;
            
            const marker = L.marker([lat, lng], { 
                icon: isSelected ? selectedIcon : customIcon 
            }).addTo(map);

            marker.on('click', () => {
                setSelectedHostId(host.id);
            });
            
            markersRef.current[host.id] = marker;
            bounds.extend([lat, lng]);
        }
    });
    
    if (filteredHosts.length > 0 && !selectedHostId) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [filteredHosts, selectedHostId]);

  useEffect(() => {
      if (selectedHostId && mapInstanceRef.current) {
          const host = hosts.find(h => h.id === selectedHostId);
          if (host && host.address.coordinates) {
              mapInstanceRef.current.flyTo([host.address.coordinates.lat, host.address.coordinates.lng], 15, {
                  animate: true,
                  duration: 1
              });
          }
      }
  }, [selectedHostId, hosts]);


  const handleNearMe = () => {
      if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
      }
      navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          if (mapInstanceRef.current) {
              const map = mapInstanceRef.current;
              if (userMarkerRef.current) userMarkerRef.current.remove();
              const userIcon = L.divIcon({
                  className: 'user-location-icon',
                  html: `<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.2);"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
              });
              userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
              map.flyTo([latitude, longitude], 14);
          }
      }, (error) => {
          if (error.code === error.PERMISSION_DENIED) {
              alert("Location permission denied. Please enable it in your browser settings.");
          } else {
              alert("Could not get your location.");
          }
      });
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-full">
              <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
          </div>
      );
  }
  
  const hasActiveFilters = Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : !!v));

  return (
    <div className="relative h-full w-full flex flex-col md:flex-row overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR LIST --- */}
      <div className="hidden md:flex flex-col w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-10 shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-brand-blue dark:text-white transition-all"
                    />
                </div>
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className={`p-3 rounded-xl border transition-colors ${
                        hasActiveFilters
                        ? 'bg-brand-light border-brand-blue text-brand-blue'
                        : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </button>
            </div>
            
            {userData?.isHost && pendingHostRequestCount > 0 && (
                <Link to="/requests" className="flex items-center justify-between p-3 bg-brand-light dark:bg-blue-900/20 rounded-lg border border-brand-blue/20">
                     <div className="flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-brand-blue"/>
                        <span className="text-sm font-bold text-brand-blue">{pendingHostRequestCount} Request(s)</span>
                     </div>
                     <ChevronRightIcon className="w-4 h-4 text-brand-blue" />
                </Link>
            )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">
                {filteredHosts.length} Hosts Found
            </h3>
            {filteredHosts.map(host => (
                <HostCard 
                    key={host.id} 
                    host={host} 
                    isSelected={selectedHostId === host.id}
                    onClick={() => setSelectedHostId(host.id)}
                />
            ))}
        </div>
      </div>

      {/* --- MAP CONTAINER --- */}
      <div className="flex-1 relative h-full bg-gray-100 dark:bg-gray-800">
         <div ref={mapContainerRef} className="w-full h-full z-0" id="map"></div>
         
         {/* Mobile Search Bar Overlay */}
         <div className="md:hidden absolute top-4 left-4 right-4 z-20 flex gap-2 pointer-events-auto">
             <div className="relative flex-1 shadow-lg rounded-full">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full outline-none focus:ring-2 focus:ring-brand-blue dark:text-white shadow-sm"
                />
             </div>
             <button 
                onClick={() => setIsFilterOpen(true)}
                className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors ${
                    hasActiveFilters
                    ? 'bg-brand-blue text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                }`}
            >
                <AdjustmentsHorizontalIcon className="w-6 h-6" />
            </button>
        </div>

         {/* Floating Buttons on Map */}
         <div className="absolute bottom-56 left-4 md:top-4 md:left-4 z-[1] flex flex-col gap-2">
             <button 
                onClick={handleNearMe}
                className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-transform active:scale-95"
                title="Near Me"
             >
                 <MapPinIcon className="w-6 h-6 text-brand-blue" />
             </button>
         </div>
      </div>

      {/* --- MOBILE BOTTOM CAROUSEL --- */}
      <div className="md:hidden absolute bottom-20 left-0 right-0 z-[2] flex flex-col justify-end pointer-events-none h-[40vh]">
           {/* Horizontal Scrollable List */}
           <div className="w-full overflow-x-auto flex gap-4 px-4 pb-4 pt-2 pointer-events-auto no-scrollbar snap-x snap-mandatory">
                {filteredHosts.map(host => (
                    <div key={host.id} className="snap-center">
                         <HostCard 
                            host={host} 
                            isCompact 
                            isSelected={selectedHostId === host.id}
                            onClick={() => setSelectedHostId(host.id)}
                        />
                    </div>
                ))}
           </div>
      </div>
      
      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  );
}
