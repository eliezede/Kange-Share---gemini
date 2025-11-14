import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataStore } from '../data';
import { ChevronLeftIcon, PaperAirplaneIcon } from '../components/Icons';
import { Message, WaterRequest, Host, User } from '../types';

export default function ChatPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<WaterRequest | undefined>(
    dataStore.requests.find(r => r.id === requestId)
  );

  const isUserHost = request?.hostId === dataStore.currentUser.id;
  const otherPartyId = isUserHost ? request?.requesterId : request?.hostId;
  const otherParty = dataStore.findUserById(otherPartyId || '');

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (requestId) {
        setMessages(dataStore.conversations[requestId] || []);
    }
  }, [requestId]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (newMessage.trim() && requestId) {
      const userMessage: Message = {
        id: Date.now(),
        text: newMessage,
        sender: 'user', // Simplified for now
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
      };
      
      const currentMessages = dataStore.conversations[requestId] || [];
      dataStore.conversations[requestId] = [...currentMessages, userMessage];
      setMessages([...dataStore.conversations[requestId]]);

      setNewMessage('');

      // Mock host reply
      setTimeout(() => {
        const hostReply: Message = {
            id: Date.now() + 1,
            text: 'Sounds good!',
            sender: 'host',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        };
        const currentMessagesWithUser = dataStore.conversations[requestId] || [];
        dataStore.conversations[requestId] = [...currentMessagesWithUser, hostReply];
        setMessages([...dataStore.conversations[requestId]]);
      }, 1500);
    }
  };

  const handleComplete = () => {
    const requestIndex = dataStore.requests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
        dataStore.requests[requestIndex].status = 'completed';
        navigate(`/rate/${requestId}`);
    }
  };

  if (!request || !otherParty) {
    return <div className="p-4 text-center">Chat not found.</div>;
  }
  
  const otherPartyName = otherParty.name;
  const otherPartyImage = 'image' in otherParty ? otherParty.image : otherParty.profilePicture;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => navigate(request?.status === 'chatting' ? -1 : `/request-detail/${requestId}`)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex items-center mx-auto">
          <img src={otherPartyImage} alt={otherPartyName} className="w-9 h-9 rounded-full object-cover" />
          <span className="ml-3 font-bold text-lg">{otherPartyName}</span>
        </div>
        <div className="w-6"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'host' && <img src={otherPartyImage} alt={otherPartyName} className="w-6 h-6 rounded-full" />}
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-blue text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

       <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2">
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
                className="flex-1 px-4 py-2.5 bg-gray-100 border-transparent rounded-full focus:ring-2 focus:ring-brand-blue outline-none"
            />
            <button onClick={handleSend} className="p-3 bg-brand-blue text-white rounded-full hover:bg-blue-600 transition disabled:bg-gray-300" disabled={!newMessage.trim()}>
                <PaperAirplaneIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
  );
}