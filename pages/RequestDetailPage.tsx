import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dataStore, MOCK_USER, MOCK_HOSTS } from '../data';
import { WaterRequest, Host, RequestStatus } from '../types';
import { ChevronLeftIcon, DropletIcon, CalendarDaysIcon, ClockIcon, ChatBubbleOvalLeftEllipsisIcon } from '../components/Icons';

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusInfo: Record<RequestStatus, { className: string; text: string }> = {
        pending: { className: 'bg-yellow-100 text-yellow-800', text: 'Pending Host Approval' },
        accepted: { className: 'bg-green-100 text-green-800', text: 'Accepted - Ready for Pickup' },
        completed: { className: 'bg-blue-100 text-blue-800', text: 'Completed' },
        cancelled: { className: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
        declined: { className: 'bg-red-100 text-red-800', text: 'Declined by Host' },
    };
    const { className, text } = statusInfo[status];
    return (
        <div className={`p-4 rounded-lg text-center font-semibold ${className}`}>
            {text}
        </div>
    );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 text-gray-700">
        <div className="w-5 h-5 text-gray-500">{icon}</div>
        <div className="flex-1">
            <p className="text-sm">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);

export default function RequestDetailPage() {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    
    // Use a state variable to re-render when data changes
    const [request, setRequest] = useState<WaterRequest | undefined>(
        dataStore.requests.find(r => r.id === requestId)
    );

    if (!request) {
        return <div className="p-4 text-center">Request not found.</div>;
    }
    
    const isUserTheHost = request.hostId === MOCK_USER.id;
    const host = MOCK_HOSTS.find(h => h.id === request.hostId);
    
    // For simplicity, find requester in MOCK_HOSTS too, assuming any user can be a host.
    // In a real app, you'd have a separate users collection.
    const requester = MOCK_HOSTS.find(h => h.id === request.requesterId) || MOCK_USER;

    if (!host || !requester) {
        return <div className="p-4 text-center">User data not found.</div>;
    }
    
    const updateRequestStatus = (newStatus: RequestStatus) => {
        const requestIndex = dataStore.requests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
            dataStore.requests[requestIndex].status = newStatus;
            setRequest({ ...dataStore.requests[requestIndex] }); // Trigger re-render
        }
    };
    
    const formattedDate = new Date(request.pickupDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
    
    const canCancel = request.status === 'pending' || request.status === 'accepted';

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            <header className="p-4 flex items-center border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate('/requests')} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <h1 className="text-xl font-bold mx-auto">Request Details</h1>
                <div className="w-6"></div>
            </header>
            
            <div className="p-4 md:p-6 space-y-6">
                <StatusBadge status={request.status} />

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-bold">Pickup Details</h2>
                     <DetailItem 
                        icon={<DropletIcon />}
                        label="Water Request"
                        value={`${request.liters}L of pH ${request.phLevel.toFixed(1)}`}
                     />
                     <DetailItem 
                        icon={<CalendarDaysIcon />}
                        label="Date"
                        value={formattedDate}
                     />
                      <DetailItem 
                        icon={<ClockIcon />}
                        label="Time"
                        value={request.pickupTime}
                     />
                </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4">
                        {isUserTheHost ? "Requester Info" : "Host Info"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <img 
                            src={isUserTheHost ? (requester as Host).image : host.image} 
                            alt={isUserTheHost ? (requester as Host).name : host.name} 
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                             <p className="font-bold text-xl">{isUserTheHost ? (requester as Host).name : host.name}</p>
                             <p className="text-gray-600">{isUserTheHost ? 'Requester' : 'Host'}</p>
                        </div>
                    </div>
                    {request.status === 'accepted' && (
                        <div className="mt-4 pt-4 border-t">
                             <h3 className="font-semibold mb-2">Pickup Address</h3>
                             <p className="text-gray-700">{host.address.street}, {host.address.number}</p>
                             <p className="text-gray-700">{host.address.city}, {host.address.postalCode}</p>
                        </div>
                    )}
                 </div>
                 
                 {request.notes && (
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h2 className="text-lg font-bold mb-2">Notes from Requester</h2>
                         <p className="text-gray-700 italic">"{request.notes}"</p>
                     </div>
                 )}

            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 max-w-4xl mx-auto space-y-2">
                 {request.status === 'accepted' && (
                    <Link to={`/chat/${request.id}`} className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors text-center">
                       <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/>
                       <span>Chat with {isUserTheHost ? (requester as Host).name.split(' ')[0] : host.name.split(' ')[0]}</span>
                    </Link>
                 )}
                 {isUserTheHost && request.status === 'pending' && (
                    <div className="flex gap-3">
                        <button onClick={() => updateRequestStatus('declined')} className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors">Decline</button>
                        <button onClick={() => updateRequestStatus('accepted')} className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors">Accept</button>
                    </div>
                 )}
                 {!isUserTheHost && canCancel && (
                    <button onClick={() => updateRequestStatus('cancelled')} className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors">
                        Cancel Request
                    </button>
                 )}
            </div>
        </div>
    )
}
