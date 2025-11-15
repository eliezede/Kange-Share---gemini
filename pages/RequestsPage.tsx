import React, { useState, useMemo, useEffect } from 'react';
// FIX: Corrected import statement for react-router-dom.
import { Link } from 'react-router-dom';
import * as api from '../api';
import { WaterRequest, RequestStatus, User } from '../types';
import { SpinnerIcon } from '../components/Icons';
import { useAuth } from '../App';

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusStyles: Record<RequestStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        accepted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        declined: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        chatting: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status === 'chatting' ? 'Chat' : status}
        </span>
    );
};

const RequestCard: React.FC<{ request: WaterRequest; perspective: 'requester' | 'host' }> = ({ request, perspective }) => {
    
    const otherPartyName = perspective === 'requester' ? request.hostName : request.requesterName;
    const otherPartyImage = perspective === 'requester' ? request.hostImage : request.requesterImage;

    if (!otherPartyName) return null;

    const date = new Date(request.pickupDate).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    });
    
    return (
        <Link to={`/request-detail/${request.id}`} className="block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-4">
                <img src={otherPartyImage} alt={otherPartyName} className="w-14 h-14 rounded-full object-cover"/>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {perspective === 'requester' ? `Host: ${otherPartyName}` : `From: ${otherPartyName}`}
                            </p>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{date} at {request.pickupTime}</p>
                        </div>
                        <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{request.liters}L of pH {request.phLevel.toFixed(1)}</p>
                </div>
            </div>
        </Link>
    );
};

export default function RequestsPage() {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState<'my_requests' | 'host_dashboard'>('my_requests');
    const [myRequests, setMyRequests] = useState<WaterRequest[]>([]);
    const [hostRequests, setHostRequests] = useState<WaterRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) return;
        const fetchData = async () => {
            setLoading(true);
            const [myReqs, hostReqs] = await Promise.all([
                api.getRequestsByUserId(userData.id),
                api.getRequestsByHostId(userData.id),
            ]);
            setMyRequests(myReqs);
            setHostRequests(hostReqs);
            setLoading(false);
        };
        fetchData();
    }, [userData]);

    const TabButton: React.FC<{ tabId: 'my_requests' | 'host_dashboard', label: string, count: number }> = ({ tabId, label, count }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 pb-3 font-semibold text-center border-b-2 transition-colors ${
                activeTab === tabId ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
            {label} <span className="text-sm bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">{count}</span>
        </button>
    );
    
    const renderContent = (requests: WaterRequest[], perspective: 'requester' | 'host', emptyMessage: string) => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
                </div>
            );
        }
        if (requests.length === 0) {
            return <p className="text-center p-8 text-gray-500 dark:text-gray-400">{emptyMessage}</p>;
        }
        return requests.map(req => <RequestCard key={req.id} request={req} perspective={perspective} />);
    };

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h1 className="text-2xl font-bold text-center dark:text-gray-100">Water Requests</h1>
            </header>
            <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-[73px] bg-white dark:bg-gray-900 z-10">
                <TabButton tabId="my_requests" label="My Requests" count={myRequests.length} />
                <TabButton tabId="host_dashboard" label="Host Dashboard" count={hostRequests.length} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'my_requests' && renderContent(myRequests, 'requester', "You haven't made any requests yet.")}
                {activeTab === 'host_dashboard' && renderContent(hostRequests, 'host', "You haven't received any requests yet.")}
            </div>
        </div>
    );
}
