import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { WaterRequest, User, Host } from '../types';
import { SpinnerIcon } from '../components/Icons';

const ChatPreviewCard: React.FC<{ request: WaterRequest, allUsers: (User | Host)[] }> = ({ request, allUsers }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        api.getCurrentUser().then(setCurrentUser);
    }, []);

    if (!currentUser) return null;

    const isUserHost = request.hostId === currentUser.id;
    const otherPartyId = isUserHost ? request.requesterId : request.hostId;
    const otherParty = allUsers.find(u => u.id === otherPartyId);

    if (!otherParty) return null;

    const image = 'image' in otherParty ? otherParty.image : otherParty.profilePicture;

    return (
        <Link to={`/chat/${request.id}`} className="flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <img src={image} alt={otherParty.name} className="w-14 h-14 rounded-full object-cover"/>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800">{otherParty.name}</h3>
                    <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-gray-600 truncate">
                    {request.status === 'chatting'
                        ? "Message thread"
                        : `Regarding your request for ${request.liters}L of pH ${request.phLevel.toFixed(1)} water.`
                    }
                </p>
            </div>
        </Link>
    );
};


export default function MessagesPage() {
    const [conversations, setConversations] = useState<WaterRequest[]>([]);
    const [allUsers, setAllUsers] = useState<(User | Host)[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const currentUser = await api.getCurrentUser();
            const [convos, hosts] = await Promise.all([
                api.getConversationsByUserId(currentUser.id),
                api.getHosts()
            ]);
            setConversations(convos);
            setAllUsers([currentUser, ...hosts]);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
         <div className="flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h1 className="text-2xl font-bold text-center">Messages</h1>
            </header>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
                    </div>
                ) : conversations.length > 0 ? (
                    conversations.map(req => <ChatPreviewCard key={req.id} request={req} allUsers={allUsers} />)
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
