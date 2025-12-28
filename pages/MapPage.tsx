
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { 
    StarIcon, SearchIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon, 
    ProfilePicture, MapPinIcon, MapIcon, ListBulletIcon,
    PresentationChartBarIcon, ClipboardDocumentListIcon, ClockIcon,
    UserIcon, DropletIcon, BuildingStorefrontIcon, SparklesIcon
} from '../components/Icons';
import { User, WaterRequest } from '../types';
import { useAuth } from '../App';
import { useDebounce } from '../hooks/useDebounce';
import { HostCardSkeleton, Skeleton } from '../components/Skeleton';

// --- Leaflet Types Shim ---
declare const L: any;

// Haversine formula for distance calculation (in km)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

// Mock function to generate coordinates based on string hash if they don't exist (fallback)
const getMockCoordinates = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const lat = 51.505 + (Math.sin(hash) * 0.1);
    const lng = -0.09 + (Math.cos(hash) * 0.1);
    return { lat, lng };
};

const HostCard: React.FC<{ host: User; isCompact?: boolean; onClick?: () => void; distance?: number }> = ({ host, isCompact, onClick, distance }) => (
  <div 
    onClick={onClick}
    className={`
        group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer
        ${isCompact ? 'w-64 flex-shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm mr-4' : 'w-full border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md'}
        ${host.isBusiness ? 'ring-2 ring-amber-500/20' : ''}
    `}
  >
    <div className="p-4 flex items-center gap-4">
        <div className="relative flex-shrink-0">
            <ProfilePicture src={host.profilePicture} alt={host.displayName} className={`w-16 h-16 rounded-full object-cover border-2 shadow-sm ${host.isBusiness ? 'border-amber-500' : 'border-white dark:border-gray-700'}`} />
            {host.isBusiness && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-lg">
                    <BuildingStorefrontIcon className="w-3 h-3" />
                </div>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-lg leading-tight">{host.displayName}</h3>
                {host.isBusiness ? <SparklesIcon className="w-5 h-5 text-amber-500 flex-shrink-0" /> : host.distributorVerificationStatus === 'approved' && <CheckBadgeIcon className="w-5 h-5 text-brand-blue flex-shrink-0" />}
            </div>
            {host.isBusiness && host.businessCategory ? (
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-0.5">{host.businessCategory}</p>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{host.address.city}, {host.address.country}</p>
            )}
            <div className="flex items-center mt-1 gap-3">
                <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1 text-sm font-bold text-gray-800 dark:text-gray-200">{host.rating.toFixed(1)}</span>
                </div>
                {distance !== undefined && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="w-3 h-3 mr-0.5" />
                        <span className="text-xs">{distance.toFixed(1)} km</span>
                    </div>
                )}
            </div>
        </div>
    </div>
    {!isCompact && (
        <div className="px-4 pb-4">
             <Link to={`/host/${host.id}`} className={`block w-full text-center py-2.5 font-bold rounded-xl transition-colors ${host.isBusiness ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white' : 'bg-gray-50 dark:bg-gray-700 text-brand-blue dark:text-white hover:bg-brand-blue hover:text-white'}`}>
                View Profile
             </Link>
        </div>
    )}
  </div>
);

const ScheduleCard: React.FC<{ request: WaterRequest; currentUserId: string }> = ({ request, currentUserId }) => {
    const isHost = request.hostId === currentUserId;
    const otherName = isHost ? request.requesterName : request.hostName;
    const otherImage = isHost ? request.requesterImage : request.hostImage;
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/request-detail/${request.id}`)}
            className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 border-l-4 border-brand-blue rounded-r-xl rounded-l-md shadow-sm p-4 mr-4 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-brand-blue font-bold text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                    <ClockIcon className="w-4 h-4" />
                    {request.pickupTime}
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isHost ? 'Hosting' : 'Pickup'}
                </span>
            </div>
            
            <div className="flex items-center gap-3">
                <ProfilePicture src={otherImage} alt={otherName} className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{otherName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <DropletIcon className="w-3 h-3" /> {request.liters}L • pH {request.phLevel}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface FilterState {
    phLevels: number[];
    minRating: number;
    openToday: boolean;
    businessOnly: boolean;
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
             <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm m-0 sm:m-4 flex flex-col max-h-[90vh] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">Filters</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Close</button>
                </div>
                
                <div className="p-6 space-y-8 overflow-y-auto">
                    {/* Wellness Centers Only */}
                    <div className="flex items-center justify-between">
                         <label className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                             <BuildingStorefrontIcon className="w-5 h-5" />
                             Businesses Only
                         </label>
                         <button 
                            onClick={() => setLocalFilters(prev => ({ ...prev, businessOnly: !prev.businessOnly }))}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localFilters.businessOnly ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                         >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localFilters.businessOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                         </button>
                     </div>

                    {/* pH Levels */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Water Types (pH)</label>
                        <div className="flex flex-wrap gap-2">
                            {PH_OPTIONS.map(ph => (
                                <button
                                    key={ph}
                                    onClick={() => togglePh(ph)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                                        localFilters.phLevels.includes(ph)
                                        ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                                    }`}
                                >
                                    pH {ph.toFixed(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Min Rating */}
                    <div>
                         <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Minimum Rating</label>
                         <div className="flex items-center gap-2">
                            {[0, 3, 4, 4.5].map(rating => (
                                 <button
                                    key={rating}
                                    onClick={() => setLocalFilters(prev => ({ ...prev, minRating: rating }))}
                                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all flex justify-center items-center gap-1 ${
                                        localFilters.minRating === rating
                                        ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                                    }`}
                                >
                                    {rating === 0 ? 'Any' : <>{rating}+ <StarIcon className="w-3 h-3" /></>}
                                </button>
                            ))}
                         </div>
                    </div>

                    {/* Open Today */}
                     <div className="flex items-center justify-between">
                         <label className="text-sm font-bold text-gray-900 dark:text-gray-100">Available Today</label>
                         <button 
                            onClick={() => setLocalFilters(prev => ({ ...prev, openToday: !prev.openToday }))}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localFilters.openToday ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'}`}
                         >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localFilters.openToday ? 'translate-x-6' : 'translate-x-1'}`} />
                         </button>
                     </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 pb-8 sm:pb-4">
                    <button 
                        onClick={() => {
                            onApply({ phLevels: [], minRating: 0, openToday: false, businessOnly: false });
                            onClose();
                        }}
                        className="flex-1 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleApply}
                        className="flex-1 py-3 rounded-xl font-semibold bg-brand-blue text-white hover:bg-blue-600 transition shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        Show Results
                    </button>
                </div>
             </div>
        </div>
    );
};

const CategorySection: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-4">
            {icon}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="overflow-x-auto pb-4 px-4 flex gap-4 no-scrollbar snap-x snap-mandatory">
            {children}
        </div>
    </section>
);

export default function MapPage() {
  const navigate = useNavigate();
  const { userData, pendingHostRequestCount } = useAuth();
  const [hosts, setHosts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [todaysSchedule, setTodaysSchedule] = useState<WaterRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'map'>('dashboard');
  const [filters, setFilters] = useState<FilterState>({ phLevels: [], minRating: 0, openToday: false, businessOnly: false });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
              setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
              });
          }, (err) => {
              console.log("GPS permission denied or error:", err);
          });
      }

      const loadData = async () => {
          try {
              const hostsData = await api.getHosts();
              const hostsWithCoords = hostsData.map(h => {
                  if (!h.address.coordinates) {
                      return { ...h, address: { ...h.address, coordinates: getMockCoordinates(h.id) } };
                  }
                  return h;
              });
              setHosts(hostsWithCoords);

              if (userData) {
                  const [myReqs, hostReqs] = await Promise.all([
                      api.getRequestsByUserId(userData.id),
                      api.getRequestsByHostId(userData.id)
                  ]);
                  
                  const today = new Date().toISOString().split('T')[0];
                  const allActive = [...myReqs, ...hostReqs].filter(r => 
                      r.status === 'accepted' && r.pickupDate === today
                  );
                  
                  allActive.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
                  setTodaysSchedule(allActive);
              }
          } catch (e) {
              console.error("Error loading map data", e);
          } finally {
              setLoading(false);
          }
      };
      
      loadData();
  }, [userData]);

  const hostsWithDistance = useMemo(() => {
    if (!userLocation) return hosts;
    return hosts.map(host => {
        const dist = getDistanceFromLatLonInKm(
            userLocation.lat,
            userLocation.lng,
            host.address.coordinates?.lat || 0,
            host.address.coordinates?.lng || 0
        );
        return { ...host, distance: dist };
    });
  }, [hosts, userLocation]);

  const filteredHosts = useMemo(() => {
    return hostsWithDistance.filter(host => {
      const matchesSearch = host.displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                            host.address.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesPh = filters.phLevels.length === 0 || filters.phLevels.some(ph => host.phLevels.includes(ph));
      const matchesRating = host.rating >= filters.minRating;
      const matchesBusiness = !filters.businessOnly || host.isBusiness;

      let matchesAvailability = true;
      if (filters.openToday) {
          const today = new Date().toLocaleString('en-US', { weekday: 'long' });
          const schedule = host.availability[today];
          matchesAvailability = schedule && schedule.enabled;
      }

      return matchesSearch && matchesPh && matchesRating && matchesAvailability && matchesBusiness;
    });
  }, [debouncedSearchQuery, hostsWithDistance, filters]);

  useEffect(() => {
      if (searchQuery && viewMode === 'dashboard') {
          setViewMode('list');
      }
  }, [searchQuery]);

  useEffect(() => {
      if (viewMode === 'map' && !mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([51.505, -0.09], 13);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
          L.control.zoom({ position: 'topright' }).addTo(map);
          mapInstanceRef.current = map;
      }
      
      if (mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current.invalidateSize(), 200);

        const map = mapInstanceRef.current;
        const currentMarkers = markersRef.current;
        const existingIds = new Set(Object.keys(currentMarkers));
        const newIds = new Set(filteredHosts.map(h => h.id));

        existingIds.forEach(id => {
            if (!newIds.has(id)) {
                currentMarkers[id].remove();
                delete currentMarkers[id];
            }
        });

        const customIcon = (isBusiness: boolean) => L.divIcon({
            className: 'bg-transparent border-none',
            html: `<div style="font-size: 40px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: translateY(-5px); cursor: pointer;">${isBusiness ? '🏢' : '💧'}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20], 
            popupAnchor: [0, -20]
        });

        const bounds = L.latLngBounds([]);
        let hasBounds = false;

        filteredHosts.forEach(host => {
            if (host.address.coordinates) {
                hasBounds = true;
                bounds.extend([host.address.coordinates.lat, host.address.coordinates.lng]);

                if (!currentMarkers[host.id]) {
                    const marker = L.marker([host.address.coordinates.lat, host.address.coordinates.lng], { icon: customIcon(!!host.isBusiness) }).addTo(map);
                    
                    const popupContent = document.createElement('div');
                    popupContent.className = "min-w-[240px] -m-[18px] rounded-3xl overflow-hidden shadow-2xl font-sans"; 
                    
                    const imgSrc = host.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(host.displayName)}&background=random`;
                    const isVerified = host.distributorVerificationStatus === 'approved';
                    const distanceStr = (host as any).distance ? `${(host as any).distance.toFixed(1)} km` : '';

                    const verifiedIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-brand-blue"><path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 0 1-1.307 3.498 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" /></svg>`;
                    const goldIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-amber-500"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z" clip-rule="evenodd" /></svg>`;
                    const arrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>`;

                    popupContent.innerHTML = `
                        <div class="group bg-white dark:bg-gray-800 text-left cursor-pointer rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 ${host.isBusiness ? 'border-b-8 border-amber-500' : ''}">
                            <div class="p-5 flex items-start gap-4 relative">
                                <div class="relative flex-shrink-0">
                                    <img src="${imgSrc}" class="w-14 h-14 rounded-full object-cover border-2 shadow-md ${host.isBusiness ? 'border-amber-500' : 'border-gray-50 dark:border-gray-700'}" alt="${host.displayName}" />
                                    ${host.isBusiness ? `<div class="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-2.5 h-2.5"><path d="M1 8.25V14.5A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5V8.25m-18 0V7.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 19 7.5v.75m-18 0h18M5 12v1.5m10-1.5v1.5m-7.5-1.5v1.5m5-1.5v1.5" /></svg></div>` : (isVerified ? `<div class="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">${verifiedIcon}</div>` : '')}
                                </div>
                                <div class="flex-1 min-w-0 pt-0.5">
                                    <h3 class="font-bold text-gray-900 dark:text-white text-lg truncate leading-snug">${host.displayName}</h3>
                                    ${host.isBusiness ? `<p class="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">${host.businessCategory || 'WELLNESS PARTNER'}</p>` : `<p class="text-xs text-gray-500 dark:text-gray-400 truncate">${host.address.city}, ${host.address.country}</p>`}
                                    <div class="flex items-center gap-2 mt-2">
                                        <div class="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-yellow-400"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z" clip-rule="evenodd" /></svg>
                                            <span class="text-xs font-bold text-yellow-700 dark:text-yellow-400">${host.rating.toFixed(1)}</span>
                                        </div>
                                        ${distanceStr ? `<span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">${distanceStr} away</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-900/50 px-5 py-3.5 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors duration-200">
                                <span class="text-xs font-extrabold ${host.isBusiness ? 'text-amber-600' : 'text-brand-blue'} tracking-widest uppercase">View Profile</span>
                                <span class="${host.isBusiness ? 'text-amber-600' : 'text-brand-blue'} transform group-hover:translate-x-1 transition-transform duration-200">${arrowIcon}</span>
                            </div>
                        </div>
                    `;
                    
                    popupContent.addEventListener('click', (e) => {
                        e.stopPropagation();
                        navigate(`/host/${host.id}`);
                    });

                    marker.bindPopup(popupContent, {
                        closeButton: false, 
                        minWidth: 260,
                        offset: [0, -10]
                    });
                    
                    markersRef.current[host.id] = marker;
                }
            }
        });

        if (hasBounds && !selectedHostId) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
        
        if (userLocation) {
            if (userMarkerRef.current) userMarkerRef.current.remove();
            const userIcon = L.divIcon({
                className: 'user-location-icon',
                html: `<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.2);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        }
      }

  }, [viewMode, filteredHosts, userLocation]); 

  const handleNearMe = () => {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }
    setViewMode('map');
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current) {
             mapInstanceRef.current.flyTo([latitude, longitude], 13);
        }
    }, () => alert("Location access denied"));
  };

  const hostsNearYou = useMemo(() => {
      const list = [...hostsWithDistance];
      if (userLocation) {
          list.sort((a, b) => (a as any).distance - (b as any).distance);
      } else {
          list.sort((a, b) => b.rating - a.rating);
      }
      return list.slice(0, 8);
  }, [hostsWithDistance, userLocation]);

  const wellnessPartners = useMemo(() => {
    return hostsWithDistance.filter(h => h.isBusiness).sort((a, b) => b.rating - a.rating);
  }, [hostsWithDistance]);

  const activeFilterCount = filters.phLevels.length + (filters.minRating > 0 ? 1 : 0) + (filters.openToday ? 1 : 0) + (filters.businessOnly ? 1 : 0);
  const isDistributor = userData?.distributorVerificationStatus === 'approved';

  return (
    <div className="bg-white dark:bg-gray-900 min-h-full flex flex-col relative">
        
        {/* Sticky Header with Search */}
        <div className={`sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transition-all duration-300 ${viewMode === 'dashboard' ? 'py-4 border-b-0' : 'py-3 border-b border-gray-200 dark:border-gray-800'}`}>
            <div className="px-4 max-w-2xl mx-auto w-full">
                 <div className="relative group">
                    <div className={`absolute inset-0 bg-brand-blue/5 rounded-full transition-transform group-hover:scale-105 duration-300 ${viewMode === 'dashboard' ? 'opacity-100' : 'opacity-0'}`}></div>
                    <div className="relative flex items-center shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-full overflow-hidden hover:shadow-md transition-shadow">
                        <div className="pl-4 text-gray-400">
                            <SearchIcon className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={viewMode === 'dashboard' ? "City or establishment name..." : "Search..."}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if(e.target.value.length > 0 && viewMode === 'dashboard') setViewMode('list');
                            }}
                            onFocus={() => {
                                if (viewMode === 'dashboard' && searchQuery.length > 0) setViewMode('list');
                            }}
                            className="w-full py-3.5 px-3 bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-500 font-medium"
                        />
                         <button 
                            onClick={() => setIsFilterOpen(true)}
                            className="pr-2 mr-2"
                        >
                            <div className={`p-2 rounded-full transition-colors ${activeFilterCount > 0 ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                            </div>
                        </button>
                    </div>
                 </div>
            </div>
            
            {viewMode !== 'dashboard' && (
                 <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
                    <button onClick={() => setViewMode('dashboard')} className="whitespace-nowrap px-4 py-1.5 text-xs font-extrabold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full tracking-widest uppercase">
                        &larr; Back
                    </button>
                    {filters.businessOnly && (
                        <div className="whitespace-nowrap px-4 py-1.5 text-xs font-extrabold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1 uppercase tracking-widest">
                            <BuildingStorefrontIcon className="w-3.5 h-3.5" /> Partners
                        </div>
                    )}
                    {activeFilterCount > 0 && (
                        <button onClick={() => setFilters({ phLevels: [], minRating: 0, openToday: false, businessOnly: false })} className="whitespace-nowrap px-4 py-1.5 text-xs font-extrabold bg-red-50 text-red-600 rounded-full uppercase tracking-widest">
                            Reset
                        </button>
                    )}
                    <div className="px-2 text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center">
                        {loading ? 'Loading...' : `${filteredHosts.length} spots`}
                    </div>
                 </div>
            )}
        </div>

        {/* --- DASHBOARD MODE --- */}
        {viewMode === 'dashboard' && (
            <div className="flex-1 overflow-y-auto pb-24 animate-fade-in-up">
                <div className="px-6 py-6 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        Hi, {userData?.firstName || 'there'}! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg font-medium">Ready to hydrate your potential?</p>
                    
                    <button 
                        onClick={handleNearMe}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <MapPinIcon className="w-6 h-6" />
                        Explore Near Me
                    </button>
                </div>

                {todaysSchedule.length > 0 && (
                    <CategorySection 
                        title="Today's Schedule"
                        icon={<ClockIcon className="w-6 h-6 text-orange-500" />}
                    >
                        {todaysSchedule.map(req => (
                            <div key={req.id} className="snap-start">
                                <ScheduleCard request={req} currentUserId={userData?.id || ''} />
                            </div>
                        ))}
                    </CategorySection>
                )}

                {/* Wellness Partners Horizontal Showcase */}
                {wellnessPartners.length > 0 && (
                    <CategorySection 
                        title="Certified Wellness Partners" 
                        icon={<BuildingStorefrontIcon className="w-6 h-6 text-amber-500" />}
                    >
                         {wellnessPartners.map(host => (
                            <div key={host.id} className="snap-start">
                                <HostCard 
                                    host={host} 
                                    isCompact 
                                    distance={(host as any).distance} 
                                    onClick={() => navigate(`/host/${host.id}`)}
                                />
                            </div>
                        ))}
                    </CategorySection>
                )}

                <div className="px-6 mb-8">
                    {isDistributor ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/profile/edit" className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                                <PresentationChartBarIcon className="w-8 h-8 text-brand-blue mb-2" />
                                <p className="font-extrabold text-gray-900 dark:text-gray-100 leading-tight">Availability</p>
                            </Link>
                            <Link to="/requests" className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-3xl border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition relative">
                                <ClipboardDocumentListIcon className="w-8 h-8 text-purple-600 mb-2" />
                                <p className="font-extrabold text-gray-900 dark:text-gray-100 leading-tight">Requests</p>
                                {pendingHostRequestCount > 0 && (
                                    <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {pendingHostRequestCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    ) : (
                        <Link to="/become-distributor" className="block bg-gradient-to-br from-brand-blue to-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 pointer-events-none transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-xl mb-1">Join the Network</h3>
                                    <p className="text-blue-100 text-sm font-medium">Verify your machine to host others.</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <CheckBadgeIcon className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                <CategorySection 
                    title="Recommended for You" 
                    icon={<SparklesIcon className="w-6 h-6 text-brand-blue" />}
                >
                    {loading ? (
                        <>
                            <div className="snap-start"><HostCardSkeleton isCompact /></div>
                            <div className="snap-start"><HostCardSkeleton isCompact /></div>
                            <div className="snap-start"><HostCardSkeleton isCompact /></div>
                        </>
                    ) : (
                        hostsNearYou.map(host => (
                            <div key={host.id} className="snap-start">
                                <HostCard 
                                    host={host} 
                                    isCompact 
                                    distance={(host as any).distance} 
                                    onClick={() => navigate(`/host/${host.id}`)}
                                />
                            </div>
                        ))
                    )}
                </CategorySection>
            </div>
        )}

        {/* --- RESULTS MODE (LIST & MAP) --- */}
        {viewMode !== 'dashboard' && (
            <div className="flex-1 relative h-full">
                <div className={`h-full overflow-y-auto p-4 pb-28 space-y-4 ${viewMode === 'list' ? 'block' : 'hidden'}`}>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {[...Array(6)].map((_, i) => <HostCardSkeleton key={i} />)}
                        </div>
                    ) : filteredHosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredHosts.map(host => (
                                <HostCard 
                                    key={host.id} 
                                    host={host} 
                                    distance={(host as any).distance} 
                                    onClick={() => navigate(`/host/${host.id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <SearchIcon className="w-8 h-8" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-bold">No results found</p>
                            <button onClick={() => setFilters({ phLevels: [], minRating: 0, openToday: false, businessOnly: false })} className="mt-4 text-brand-blue font-extrabold uppercase tracking-widest text-xs border-b-2 border-brand-blue">Clear all filters</button>
                        </div>
                    )}
                </div>

                <div className={`absolute inset-0 z-0 ${viewMode === 'map' ? 'block' : 'hidden'}`}>
                    <div ref={mapContainerRef} className="w-full h-full" />
                </div>

                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
                    <button 
                        onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                        className="flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black shadow-2xl transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                        {viewMode === 'list' ? (
                            <>
                                <MapIcon className="w-5 h-5" />
                                Map View
                            </>
                        ) : (
                            <>
                                <ListBulletIcon className="w-5 h-5" />
                                List View
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        <FilterModal 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onApply={setFilters}
        />
    </div>
  );
}
