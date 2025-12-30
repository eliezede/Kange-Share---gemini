
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api.ts';
import { WaterRequest, User } from '../types.ts';
import { SpinnerIcon } from '../components/Icons.tsx';
import { useAuth } from '../App.tsx';

const ChatPreviewCard: React.FC<{ request: WaterRequest }> = ({ request }) => {
    const { userData: currentUser } = useAuth();
    if (!currentUser) return null;

    const isUserHost = request.hostId === currentUser.id;
    const otherPartyName = isUserHost ? request.requesterName : request.hostName;
    const otherPartyImage = isUserHost ? request.requesterImage : request.hostImage;

    return (
        <Link to={`/chat/${request.id}`} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <img src={otherPartyImage} alt={otherPartyName} className="w-14 h-14 rounded-full object-cover"/>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{otherPartyName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
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
    const { userData } = useAuth();
    const [conversations, setConversations] = useState<WaterRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) return;
        const fetchData = async () => {
            setLoading(true);
            const convos = await api.getConversationsByUserId(userData.id);
            setConversations(convos);
            setLoading(false);
        };
        fetchData();
    }, [userData]);

    return (
         <div className="flex flex-col">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex-shrink-0">
                <h1 className="text-2xl font-bold text-center dark:text-gray-100">Messages</h1>
            </header>
            <div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
                    </div>
                ) : conversations.length > 0 ? (
                    conversations.map(req => <ChatPreviewCard key={req.id} request={req} />)
                ) : (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        <h3 className="text-lg font-semibold dark:text-gray-200">No active conversations</h3>
                        <p>When a host accepts your request, your chat will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
