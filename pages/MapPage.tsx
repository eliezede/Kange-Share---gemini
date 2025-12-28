
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { 
    StarIcon, SearchIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon, 
    ProfilePicture, MapPinIcon, MapIcon, ListBulletIcon,
    PresentationChartBarIcon, ClipboardDocumentListIcon, ClockIcon,
    UserIcon, DropletIcon, BuildingStorefrontIcon, SparklesIcon, HeartIcon
} from '../components/Icons';
import { User, WaterRequest } from '../types';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { useDebounce } from '../hooks/useDebounce';
import { HostCardSkeleton, Skeleton } from '../components/Skeleton';

declare const L: any;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

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
    favoritesOnly: boolean;
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
                    {/* Favorites Only */}
                    <div className="flex items-center justify-between">
                         <label className="text-sm font-bold text-red-500 dark:text-red-400 flex items-center gap-2">
                             <HeartIcon className="w-5 h-5 fill-red-500" solid />
                             Saved Places Only
                         </label>
                         <button 
                            onClick={() => setLocalFilters(prev => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localFilters.favoritesOnly ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                         >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localFilters.favoritesOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                         </button>
                     </div>

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
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 pb-8 sm:pb-4">
                    <button 
                        onClick={() => {
                            onApply({ phLevels: [], minRating: 0, openToday: false, businessOnly: false, favoritesOnly: false });
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
  const { t } = useLanguage();
  const [hosts, setHosts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [todaysSchedule, setTodaysSchedule] = useState<WaterRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'map'>('dashboard');
  const [filters, setFilters] = useState<FilterState>({ phLevels: [], minRating: 0, openToday: false, businessOnly: false, favoritesOnly: false });
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
              console.log("GPS error:", err);
          });
      }

      const loadData = async () => {
          try {
              const hostsData = await api.getHosts();
              const hostsWithCoords = hostsData.map(h => ({
                  ...h, 
                  address: { ...h.address, coordinates: h.address.coordinates || getMockCoordinates(h.id) }
              }));
              setHosts(hostsWithCoords);

              if (userData) {
                  const [myReqs, hostReqs] = await Promise.all([
                      api.getRequestsByUserId(userData.id),
                      api.getRequestsByHostId(userData.id)
                  ]);
                  const today = new Date().toISOString().split('T')[0];
                  const allActive = [...myReqs, ...hostReqs].filter(r => r.status === 'accepted' && r.pickupDate === today);
                  allActive.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
                  setTodaysSchedule(allActive);
              }
          } catch (e) {
              console.error("Data load error", e);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, [userData]);

  const hostsWithDistance = useMemo(() => {
    if (!userLocation) return hosts;
    return hosts.map(host => ({
        ...host, 
        distance: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, host.address.coordinates?.lat || 0, host.address.coordinates?.lng || 0)
    }));
  }, [hosts, userLocation]);

  const filteredHosts = useMemo(() => {
    return hostsWithDistance.filter(host => {
      const matchesSearch = host.displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                            host.address.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesPh = filters.phLevels.length === 0 || filters.phLevels.some(ph => host.phLevels.includes(ph));
      const matchesRating = host.rating >= filters.minRating;
      const matchesBusiness = !filters.businessOnly || host.isBusiness;
      const matchesFavorites = !filters.favoritesOnly || userData?.favorites?.includes(host.id);
      return matchesSearch && matchesPh && matchesRating && matchesBusiness && matchesFavorites;
    });
  }, [debouncedSearchQuery, hostsWithDistance, filters, userData?.favorites]);

  useEffect(() => {
      if (searchQuery && viewMode === 'dashboard') setViewMode('list');
  }, [searchQuery]);

  useEffect(() => {
      if (viewMode === 'map' && !mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([51.505, -0.09], 13);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
          mapInstanceRef.current = map;
      }
      if (mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current.invalidateSize(), 200);
        const map = mapInstanceRef.current;
        filteredHosts.forEach(host => {
            if (host.address.coordinates && !markersRef.current[host.id]) {
                const icon = L.divIcon({ html: `<div class="text-4xl">${host.isBusiness ? '🏢' : '💧'}</div>`, className: 'bg-transparent border-none' });
                const marker = L.marker([host.address.coordinates.lat, host.address.coordinates.lng], { icon }).addTo(map);
                marker.on('click', () => navigate(`/host/${host.id}`));
                markersRef.current[host.id] = marker;
            }
        });
      }
  }, [viewMode, filteredHosts, navigate]);

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setViewMode('map');
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current) mapInstanceRef.current.flyTo([latitude, longitude], 13);
    });
  };

  const savedPlaces = useMemo(() => hostsWithDistance.filter(h => userData?.favorites?.includes(h.id)).sort((a, b) => b.rating - a.rating), [hostsWithDistance, userData?.favorites]);
  const wellnessPartners = useMemo(() => hostsWithDistance.filter(h => h.isBusiness).sort((a, b) => b.rating - a.rating), [hostsWithDistance]);
  const hostsNearYou = useMemo(() => [...hostsWithDistance].sort((a, b) => (a as any).distance - (b as any).distance).slice(0, 8), [hostsWithDistance]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-full flex flex-col relative">
        <div className={`sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4`}>
            <div className="px-4 max-w-2xl mx-auto w-full">
                 <div className="relative group">
                    <div className="relative flex items-center shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-full overflow-hidden hover:shadow-md transition-shadow">
                        <div className="pl-4 text-gray-400"><SearchIcon className="w-5 h-5" /></div>
                        <input 
                            type="text" placeholder="City or name..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3.5 px-3 bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-500 font-medium"
                        />
                         <button onClick={() => setIsFilterOpen(true)} className="pr-2 mr-2">
                            <div className={`p-2 rounded-full transition-colors ${filters.phLevels.length > 0 ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                            </div>
                        </button>
                    </div>
                 </div>
            </div>
        </div>

        {viewMode === 'dashboard' && (
            <div className="flex-1 overflow-y-auto pb-24 animate-fade-in-up">
                <div className="px-6 py-6 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        {t('hi')}, {userData?.firstName || 'there'}! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg font-medium">{t('ready_hydrate')}</p>
                    
                    <button 
                        onClick={handleNearMe}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <MapPinIcon className="w-6 h-6" />
                        {t('explore_near_me')}
                    </button>
                </div>

                {todaysSchedule.length > 0 && (
                    <CategorySection title={t('today_schedule')} icon={<ClockIcon className="w-6 h-6 text-orange-500" />}>
                        {todaysSchedule.map(req => <div key={req.id} className="snap-start"><ScheduleCard request={req} currentUserId={userData?.id || ''} /></div>)}
                    </CategorySection>
                )}

                {savedPlaces.length > 0 && (
                    <CategorySection title={t('saved_places')} icon={<HeartIcon className="w-6 h-6 text-red-500 fill-red-500" solid />}>
                         {savedPlaces.map(host => <div key={host.id} className="snap-start"><HostCard host={host} isCompact distance={(host as any).distance} onClick={() => navigate(`/host/${host.id}`)}/></div>)}
                    </CategorySection>
                )}

                {wellnessPartners.length > 0 && (
                    <CategorySection title={t('wellness_partners')} icon={<BuildingStorefrontIcon className="w-6 h-6 text-amber-500" />}>
                         {wellnessPartners.map(host => <div key={host.id} className="snap-start"><HostCard host={host} isCompact distance={(host as any).distance} onClick={() => navigate(`/host/${host.id}`)}/></div>)}
                    </CategorySection>
                )}

                <CategorySection title={t('recommended')} icon={<SparklesIcon className="w-6 h-6 text-brand-blue" />}>
                    {loading ? <HostCardSkeleton isCompact /> : hostsNearYou.map(host => <div key={host.id} className="snap-start"><HostCard host={host} isCompact distance={(host as any).distance} onClick={() => navigate(`/host/${host.id}`)}/></div>)}
                </CategorySection>
            </div>
        )}

        {viewMode !== 'dashboard' && (
            <div className="flex-1 relative h-full">
                <div className={`h-full overflow-y-auto p-4 pb-28 space-y-4 ${viewMode === 'list' ? 'block' : 'hidden'}`}>
                    {filteredHosts.map(host => <HostCard key={host.id} host={host} distance={(host as any).distance} onClick={() => navigate(`/host/${host.id}`)}/>)}
                </div>
                <div className={`absolute inset-0 z-0 ${viewMode === 'map' ? 'block' : 'hidden'}`}><div ref={mapContainerRef} className="w-full h-full" /></div>
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
                    <button 
                        onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                        className="flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black shadow-2xl transition-all uppercase tracking-widest text-xs"
                    >
                        {viewMode === 'list' ? <><MapIcon className="w-5 h-5" /> Map View</> : <><ListBulletIcon className="w-5 h-5" /> List View</>}
                    </button>
                </div>
            </div>
        )}

        <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onApply={setFilters} />
    </div>
  );
}
