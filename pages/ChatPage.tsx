import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { ChevronLeftIcon, PaperAirplaneIcon, SpinnerIcon } from '../components/Icons';
import { Message, WaterRequest, Host, User } from '../types';

export default function ChatPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<WaterRequest | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherParty, setOtherParty] = useState<User | Host | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!requestId) return;

    const fetchData = async () => {
        setLoading(true);
        const reqData = await api.getRequestById(requestId);
        if (!reqData) {
            setLoading(false);
            return;
        }

        const [currentUserData, messagesData] = await Promise.all([
            api.getCurrentUser(),
            api.getMessages(requestId)
        ]);

        const isUserHost = reqData.hostId === currentUserData.id;
        const otherPartyId = isUserHost ? reqData.requesterId : reqData.hostId;
        const otherPartyData = await api.getUserById(otherPartyId);

        setRequest(reqData);
        setCurrentUser(currentUserData);
        setOtherParty(otherPartyData || null);
        setMessages(messagesData);
        setLoading(false);
    };

    fetchData();
  }, [requestId]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (newMessage.trim() && requestId) {
      const text = newMessage;
      setNewMessage('');

      const sentMessage = await api.sendMessage(requestId, text, 'user');
      setMessages(prev => [...prev, sentMessage]);

      // Mock host reply
      setTimeout(async () => {
        const reply = await api.sendMessage(requestId, 'Sounds good!', 'host');
        setMessages(prev => [...prev, reply]);
      }, 1500);
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
    return <div className="p-4 text-center">Chat not found.</div>;
  }
  
  const isUserHost = request.hostId === currentUser.id;
  const otherPartyName = otherParty.name;
  const otherPartyImage = 'image' in otherParty ? otherParty.image : otherParty.profilePicture;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => {
          if (request.status === 'chatting') {
            navigate(-1);
          } else {
            navigate(`/request-detail/${requestId}`);
          }
        }} className="p-1 rounded-full hover:bg-gray-100">
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
