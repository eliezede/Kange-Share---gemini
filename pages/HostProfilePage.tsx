import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_HOSTS } from '../data';
import { StarIcon, ChevronLeftIcon, CheckBadgeIcon } from '../components/Icons';

export default function HostProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const host = MOCK_HOSTS.find(h => h.id === id);

  if (!host) {
    return <div className="p-4 text-center">Host not found.</div>;
  }

  return (
    <div className="pb-24">
      <div className="relative h-48">
        <img src={`https://picsum.photos/seed/${host.id}/800/400`} alt={host.name} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-white transition">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img src={host.image} alt={host.name} className="w-20 h-20 rounded-full object-cover border-4 border-white -mt-16 shadow-lg" />
          <div className="ml-4 mt-2">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{host.name}</h1>
                {host.isVerified && <CheckBadgeIcon className="w-7 h-7 text-brand-blue" />}
            </div>
            <div className="flex items-center mt-1">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="ml-1 font-semibold text-gray-700">{host.rating.toFixed(1)}</span>
              <span className="ml-2 text-gray-500">({host.reviews} reviews)</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Water Available</h2>
            <div className="flex flex-wrap gap-2">
              {host.phLevels.map(ph => (
                <span key={ph} className="bg-brand-light text-brand-blue font-semibold px-3 py-1 rounded-full text-sm">
                  pH {ph.toFixed(1)}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Pickup Availability</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
                <p><span className="font-semibold">Days:</span> {host.availability.days}</p>
                <p><span className="font-semibold">Hours:</span> {host.availability.hours}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Machine Maintenance</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
                <p><span className="font-semibold">Last Filter Change:</span> {host.maintenance.lastFilterChange}</p>
                <p><span className="font-semibold">Last E-Cleaning:</span> {host.maintenance.lastECleaning}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 max-w-4xl mx-auto">
        <Link to={`/request/${host.id}`} className="block w-full text-center bg-brand-blue text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-600 transition-colors">
          Request Water
        </Link>
      </div>
    </div>
  );
}