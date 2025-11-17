import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { ChevronLeftIcon, PaperAirplaneIcon, SpinnerIcon } from '../components/Icons';
import { Message, WaterRequest, User } from '../types';
import { useAuth } from '../App';

export default function ChatPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { userData: currentUser } = useAuth();
  
  const [request, setRequest] = useState<WaterRequest | null>(null);
  const [otherParty, setOtherParty] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!requestId || !currentUser) return;

    let unsubscribe: () => void;

    const fetchData = async () => {
        setLoading(true);
        const reqData = await api.getRequestById(requestId);
        if (!reqData) {
            setLoading(false);
            return;
        }

        const isUserHost = reqData.hostId === currentUser.id;
        const otherPartyId = isUserHost ? reqData.requesterId : reqData.hostId;
        const otherPartyData = await api.getUserById(otherPartyId);

        setRequest(reqData);
        setOtherParty(otherPartyData || null);
        
        unsubscribe = api.getMessagesStream(requestId, (newMessages) => {
            setMessages(newMessages);
        });
        
        setLoading(false);
    };

    fetchData();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [requestId, currentUser]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (newMessage.trim() && requestId && currentUser) {
      const text = newMessage;
      setNewMessage('');
      await api.sendMessage(requestId, text, currentUser.id);
    }
  };

  const handleComplete = async () => {
    if (!requestId) return;
    await api.updateRequestStatus(requestId, 'completed');
    navigate(`/rate/${requestId}`);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
        </div>
    );
  }

  if (!request || !otherParty || !currentUser) {
    return <div className="p-4 text-center dark:text-gray-300">Chat not found.</div>;
  }
  
  const isUserHost = request.hostId === currentUser.id;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => {
          if (request.status === 'chatting') {
            navigate(-1);
          } else {
            navigate(`/request-detail/${requestId}`);
          }
        }} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
        <div className="flex items-center mx-auto">
          <img src={otherParty.profilePicture} alt={otherParty.displayName} className="w-9 h-9 rounded-full object-cover" />
          <span className="ml-3 font-bold text-lg dark:text-gray-100">{otherParty.displayName}</span>
        </div>
        <div className="w-6"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            {msg.sender !== currentUser.id && <img src={otherParty.profilePicture} alt={otherParty.displayName} className="w-6 h-6 rounded-full" />}
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === currentUser.id ? 'bg-brand-blue text-white rounded-br-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

       <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center gap-2">
            {!isUserHost && request.status === 'accepted' && (
                <button 
                    onClick={handleComplete}
                    className="px-4 py-2.5 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition"
                >
                    Complete Pickup
                </button>
            )}
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 border-transparent rounded-full focus:ring-2 focus:ring-brand-blue outline-none"
            />
            <button onClick={handleSend} className="p-3 bg-brand-blue text-white rounded-full hover:bg-blue-600 transition disabled:bg-gray-300 dark:disabled:bg-gray-600" disabled={!newMessage.trim()}>
                <PaperAirplaneIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
  );
}