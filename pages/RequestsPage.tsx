import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dataStore } from '../data';
import { WaterRequest, RequestStatus, Host, User } from '../types';

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusStyles: Record<RequestStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-gray-100 text-gray-800',
        declined: 'bg-red-100 text-red-800',
        chatting: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status === 'chatting' ? 'Chat' : status}
        </span>
    );
};

const RequestCard: React.FC<{ request: WaterRequest; perspective: 'requester' | 'host' }> = ({ request, perspective }) => {
    const otherPartyId = perspective === 'requester' ? request.hostId : request.requesterId;
    const otherParty = dataStore.findUserById(otherPartyId);

    if (!otherParty) return null; // Or some fallback UI

    const date = new Date(request.pickupDate).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    });
    
    const image = 'image' in otherParty ? otherParty.image : otherParty.profilePicture;

    return (
        <Link to={`/request-detail/${request.id}`} className="block p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <img src={image} alt={otherParty.name} className="w-14 h-14 rounded-full object-cover"/>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">
                                {perspective === 'requester' ? `Host: ${otherParty.name}` : `From: ${otherParty.name}`}
                            </p>
                            <p className="font-bold text-gray-800">{date} at {request.pickupTime}</p>
                        </div>
                        <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{request.liters}L of pH {request.phLevel.toFixed(1)}</p>
                </div>
            </div>
        </Link>
    );
};

export default function RequestsPage() {
    const [activeTab, setActiveTab] = useState<'my_requests' | 'host_dashboard'>('my_requests');

    const myRequests = useMemo(() => 
        dataStore.requests.filter(r => r.requesterId === dataStore.currentUser.id && r.status !== 'chatting'), 
    []);
    
    const hostRequests = useMemo(() =>
        dataStore.requests.filter(r => r.hostId === dataStore.currentUser.id && r.status !== 'chatting'),
    []);

    const TabButton: React.FC<{ tabId: 'my_requests' | 'host_dashboard', label: string, count: number }> = ({ tabId, label, count }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 pb-3 font-semibold text-center border-b-2 transition-colors ${
                activeTab === tabId ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
            {label} <span className="text-sm bg-gray-200 rounded-full px-2 py-0.5">{count}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h1 className="text-2xl font-bold text-center">Water Requests</h1>
            </header>
            <div className="flex border-b border-gray-200 sticky top-[73px] bg-white z-10">
                <TabButton tabId="my_requests" label="My Requests" count={myRequests.length} />
                <TabButton tabId="host_dashboard" label="Host Dashboard" count={hostRequests.length} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'my_requests' && (
                    <div>
                        {myRequests.length > 0 ? (
                            myRequests.map(req => <RequestCard key={req.id} request={req} perspective="requester" />)
                        ) : (
                            <p className="text-center p-8 text-gray-500">You haven't made any requests yet.</p>
                        )}
                    </div>
                )}
                {activeTab === 'host_dashboard' && (
                     <div>
                        {hostRequests.length > 0 ? (
                            hostRequests.map(req => <RequestCard key={req.id} request={req} perspective="host" />)
                        ) : (
                            <p className="text-center p-8 text-gray-500">You haven't received any requests yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}