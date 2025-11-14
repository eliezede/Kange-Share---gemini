
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_HOSTS, MOCK_MESSAGES } from '../data';
import { ChevronLeftIcon, PaperAirplaneIcon } from '../components/Icons';
import { Message } from '../types';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const host = MOCK_HOSTS.find(h => h.id === id);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
      };
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');

      // Mock host reply
      setTimeout(() => {
        const hostReply: Message = {
            id: Date.now() + 1,
            text: 'Sounds good!',
            sender: 'host',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        };
        setMessages(prev => [...prev, hostReply]);
      }, 1500);
    }
  };

  if (!host) {
    return <div className="p-4 text-center">Host not found.</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => navigate('/map')} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex items-center mx-auto">
          <img src={host.image} alt={host.name} className="w-9 h-9 rounded-full object-cover" />
          <span className="ml-3 font-bold text-lg">{host.name}</span>
        </div>
        <div className="w-6"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'host' && <img src={host.image} alt={host.name} className="w-6 h-6 rounded-full" />}
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-blue text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

       <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2">
            <button 
                onClick={() => navigate(`/rate/${id}`)}
                className="px-4 py-2.5 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition"
            >
                Complete
            </button>
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
