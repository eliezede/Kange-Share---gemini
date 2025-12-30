
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api.ts';
import { 
    StarIcon, SearchIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon, 
    ProfilePicture, MapPinIcon, MapIcon, ListBulletIcon,
    ClockIcon, DropletIcon, BuildingStorefrontIcon, SparklesIcon, HeartIcon
} from '../components/Icons.tsx';
import { User, WaterRequest } from '../types.ts';
import { useAuth } from '../App.tsx';
import { useDebounce } from '../hooks/useDebounce.ts';
import { HostCardSkeleton } from '../components/Skeleton.tsx';

declare const L: any;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2-lat1) * (Math.PI/180);
  const dLon = (lon2-lon1) * (Math.PI/180); 
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
}

const HostCard: React.FC<{ host: User; isCompact?: boolean; onClick?: () => void; distance?: number }> = ({ host, isCompact, onClick, distance }) => (
  <div onClick={onClick} className={`group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${isCompact ? 'w-64 flex-shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm mr-4' : 'w-full border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md'} ${host.isBusiness ? 'ring-2 ring-amber-500/20' : ''}`}>
    <div className="p-4 flex items-center gap-4">
        <div className="relative flex-shrink-0">
            <ProfilePicture src={host.profilePicture} alt={host.displayName} className={`w-16 h-16 rounded-full object-cover border-2 shadow-sm ${host.isBusiness ? 'border-amber-500' : 'border-white dark:border-gray-700'}`} />
            {host.isBusiness && <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-lg"><BuildingStorefrontIcon className="w-3 h-3" /></div>}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-lg leading-tight">{host.displayName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{host.isBusiness && host.businessCategory ? host.businessCategory : `${host.address.city}, ${host.address.country}`}</p>
            <div className="flex items-center mt-1 gap-3">
                <div className="flex items-center"><StarIcon className="w-4 h-4 text-yellow-400" /><span className="ml-1 text-sm font-bold text-gray-800 dark:text-gray-200">{host.rating.toFixed(1)}</span></div>
                {distance !== undefined && <div className="flex items-center text-gray-500 dark:text-gray-400"><MapPinIcon className="w-3 h-3 mr-0.5" /><span className="text-xs">{distance.toFixed(1)} km</span></div>}
            </div>
        </div>
    </div>
  </div>
);

const ScheduleCard: React.FC<{ request: WaterRequest; currentUserId: string }> = ({ request, currentUserId }) => {
    const isHost = request.hostId === currentUserId;
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/request-detail/${request.id}`)} className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 border-l-4 border-brand-blue rounded-r-xl rounded-l-md shadow-sm p-4 mr-4 cursor-pointer hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-brand-blue font-bold text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md"><ClockIcon className="w-4 h-4" />{request.pickupTime}</div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isHost ? 'Hosting' : 'Pickup'}</span>
            </div>
            <div className="flex items-center gap-3">
                <ProfilePicture src={isHost ? request.requesterImage : request.hostImage} alt={isHost ? request.requesterName : request.hostName} className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{isHost ? request.requesterName : request.hostName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><DropletIcon className="w-3 h-3" /> {request.liters}L • pH {request.phLevel}</p>
                </div>
            </div>
        </div>
    );
};

export default function MapPage() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [hosts, setHosts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [todaysSchedule, setTodaysSchedule] = useState<WaterRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'map'>('dashboard');
  const [filters, setFilters] = useState({ phLevels: [] as number[], businessOnly: false, favoritesOnly: false });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
      }
      const loadData = async () => {
          try {
              const hostsData = await api.getHosts();
              setHosts(hostsData);
              if (userData) {
                  const [myReqs, hostReqs] = await Promise.all([api.getRequestsByUserId(userData.id), api.getRequestsByHostId(userData.id)]);
                  const today = new Date().toISOString().split('T')[0];
                  setTodaysSchedule([...myReqs, ...hostReqs].filter(r => r.status === 'accepted' && r.pickupDate === today).sort((a, b) => a.pickupTime.localeCompare(b.pickupTime)));
              }
          } catch (e) { console.error(e); } finally { setLoading(false); }
      };
      loadData();
  }, [userData]);

  const hostsWithDistance = useMemo(() => hosts.map(h => ({ ...h, distance: userLocation && h.address.coordinates ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, h.address.coordinates.lat, h.address.coordinates.lng) : undefined })), [hosts, userLocation]);
  
  const filteredHosts = useMemo(() => hostsWithDistance.filter(h => {
      const matchesSearch = h.displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || h.address.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesPh = filters.phLevels.length === 0 || filters.phLevels.some(ph => h.phLevels.includes(ph));
      const matchesBusiness = !filters.businessOnly || h.isBusiness;
      const matchesFav = !filters.favoritesOnly || userData?.favorites?.includes(h.id);
      return matchesSearch && matchesPh && matchesBusiness && matchesFav;
  }), [debouncedSearchQuery, hostsWithDistance, filters, userData]);

  useEffect(() => {
      if (viewMode === 'map' && !mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([51.505, -0.09], 13);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
          mapInstanceRef.current = map;
      }
      if (mapInstanceRef.current && viewMode === 'map') {
        setTimeout(() => mapInstanceRef.current.invalidateSize(), 200);
        filteredHosts.forEach(h => {
            if (h.address.coordinates && !markersRef.current[h.id]) {
                const icon = L.divIcon({ html: `<div class="text-4xl">${h.isBusiness ? '🏢' : '💧'}</div>`, className: 'bg-transparent border-none' });
                markersRef.current[h.id] = L.marker([h.address.coordinates.lat, h.address.coordinates.lng], { icon }).addTo(mapInstanceRef.current).on('click', () => navigate(`/host/${h.id}`));
            }
        });
      }
  }, [viewMode, filteredHosts, navigate]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-full flex flex-col relative">
        <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4">
            <div className="px-4 max-w-2xl mx-auto w-full flex items-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <SearchIcon className="ml-4 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="City or name..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if(e.target.value && viewMode === 'dashboard') setViewMode('list'); }} className="w-full py-3.5 px-3 bg-transparent border-none outline-none text-gray-800 dark:text-white" />
            </div>
        </div>
        {viewMode === 'dashboard' ? (
            <div className="flex-1 overflow-y-auto pb-24 px-6 animate-fade-in-up">
                <h1 className="text-3xl font-bold mt-6 mb-2">Hi, {userData?.firstName || 'there'}! 👋</h1>
                <p className="text-gray-500 mb-8">Ready to hydrate your potential?</p>
                <button onClick={() => setViewMode('map')} className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3"><MapPinIcon className="w-6 h-6" />Explore Near Me</button>
                {todaysSchedule.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <h2 className="text-xl font-bold dark:text-white">Today's Schedule</h2>
                        <div className="flex overflow-x-auto no-scrollbar pb-4">
                            {todaysSchedule.map(r => <ScheduleCard key={r.id} request={r} currentUserId={userData?.id || ''} />)}
                        </div>
                    </div>
                )}
                <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-bold dark:text-white">Recommended for You</h2>
                    <div className="grid gap-4">
                        {loading ? <HostCardSkeleton /> : filteredHosts.slice(0, 5).map(h => <HostCard key={h.id} host={h} distance={h.distance} onClick={() => navigate(`/host/${h.id}`)}/>)}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 relative">
                <div className={`h-full overflow-y-auto p-4 pb-28 space-y-4 ${viewMode === 'list' ? 'block' : 'hidden'}`}>{filteredHosts.map(h => <HostCard key={h.id} host={h} distance={h.distance} onClick={() => navigate(`/host/${h.id}`)}/>)}</div>
                <div className={`absolute inset-0 z-0 ${viewMode === 'map' ? 'block' : 'hidden'}`}><div ref={mapContainerRef} className="w-full h-full" /></div>
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                    <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black shadow-2xl flex items-center gap-2">{viewMode === 'list' ? <><MapIcon className="w-5 h-5" /> Map</> : <><ListBulletIcon className="w-5 h-5" /> List</>}</button>
                    <button onClick={() => setViewMode('dashboard')} className="px-6 py-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white rounded-full font-bold shadow-xl">Back</button>
                </div>
            </div>
        )}
    </div>
  );
}
