import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dataStore, MOCK_HOSTS, MOCK_USER } from '../data';
import { WaterRequest } from '../types';

const ChatPreviewCard: React.FC<{ request: WaterRequest }> = ({ request }) => {
    const isUserHost = request.hostId === MOCK_USER.id;
    const otherPartyId = isUserHost ? request.requesterId : request.hostId;
    const otherParty = MOCK_HOSTS.find(h => h.id === otherPartyId);

    if (!otherParty) return null;

    return (
        <Link to={`/chat/${request.id}`} className="flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <img src={otherParty.image} alt={otherParty.name} className="w-14 h-14 rounded-full object-cover"/>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800">{otherParty.name}</h3>
                    <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-gray-600">
                    Regarding your request for {request.liters}L of pH {request.phLevel.toFixed(1)} water.
                </p>
            </div>
        </Link>
    );
};


export default function MessagesPage() {
    const conversations = useMemo(() => 
        dataStore.requests.filter(r => 
            (r.requesterId === MOCK_USER.id || r.hostId === MOCK_USER.id) && 
            (r.status === 'accepted' || r.status === 'completed')
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    []);

    return (
         <div className="flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h1 className="text-2xl font-bold text-center">Messages</h1>
            </header>
            <div className="flex-1 overflow-y-auto">
                {conversations.length > 0 ? (
                    conversations.map(req => <ChatPreviewCard key={req.id} request={req} />)
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <h3 className="text-lg font-semibold">No active conversations</h3>
                        <p>When a host accepts your request, your chat will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
