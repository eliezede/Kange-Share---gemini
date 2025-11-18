import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { WaterRequest, RequestStatus, User } from '../types';
import { SpinnerIcon, CheckBadgeIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { useAuth } from '../App';
import { useToast } from '../hooks/useToast';

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusStyles: Record<RequestStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        accepted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        declined: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        chatting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

const RequestCard: React.FC<{
    request: WaterRequest;
    otherParty: User | undefined;
    perspective: 'requester' | 'host';
    onUpdateStatus: (requestId: string, status: RequestStatus) => Promise<void>;
}> = ({ request, otherParty, perspective, onUpdateStatus }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!otherParty) return null;

    const handleAction = async (e: React.MouseEvent, status: RequestStatus) => {
        e.preventDefault();
        e.stopPropagation();
        setIsProcessing(true);
        try {
            await onUpdateStatus(request.id, status);
            showToast(status === 'accepted' ? 'Request Accepted' : 'Request Declined', 'success');
        } catch {
            showToast('Action failed. Please try again.', 'error');
        }
        // No need to set isProcessing to false, parent state change will re-render
    };
    
    const handleCardClick = () => {
        navigate(`/request-detail/${request.id}`);
    };

    const date = new Date(request.pickupDate).toLocaleDateString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    });
    
    const isHost = perspective === 'host';

    return (
        <div onClick={handleCardClick} className="block p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
                <img src={otherParty.profilePicture} alt={otherParty.displayName} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <p className="font-bold text-gray-900 dark:text-gray-100">{otherParty.displayName}</p>
                                {otherParty.distributorVerificationStatus === 'approved' && <CheckBadgeIcon className="w-4 h-4 text-brand-blue flex-shrink-0" />}
                            </div>
                            {request.status !== 'chatting' && (
                               <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {date} • {request.pickupTime}
                                </p>
                            )}
                        </div>
                        <StatusBadge status={request.status} />
                    </div>
                    
                    {request.status !== 'chatting' && (
                        <p className="text-md font-semibold text-gray-700 dark:text-gray-300">
                            {request.liters}L • pH {request.phLevel.toFixed(1)}
                        </p>
                    )}

                    {isHost && request.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={(e) => handleAction(e, 'declined')}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70 transition"
                            >
                                <XCircleIcon className="w-5 h-5" />
                                Decline
                            </button>
                            <button
                                onClick={(e) => handleAction(e, 'accepted')}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70 transition"
                            >
                                {isProcessing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
                                Accept
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function RequestsPage() {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState<'my_requests' | 'host_dashboard'>('my_requests');
    const [myRequests, setMyRequests] = useState<WaterRequest[]>([]);
    const [hostRequests, setHostRequests] = useState<WaterRequest[]>([]);
    const [users, setUsers] = useState<Record<string, User>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [myReqs, hostReqs] = await Promise.all([
                    api.getRequestsByUserId(userData.id),
                    api.getRequestsByHostId(userData.id),
                ]);
                
                const sortedMyReqs = myReqs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                const sortedHostReqs = hostReqs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setMyRequests(sortedMyReqs);
                setHostRequests(sortedHostReqs);

                const allRequests = [...myReqs, ...hostReqs];
                const userIds = [...new Set(allRequests.flatMap(r => [r.hostId, r.requesterId]))];
                
                if (userIds.length > 0) {
                    const userDocs = await Promise.all(userIds.map(id => api.getUserById(id)));
                    const usersMap = userDocs.filter(Boolean).reduce((acc, user) => {
                        acc[user!.id] = user!;
                        return acc;
                    }, {} as Record<string, User>);
                    setUsers(usersMap);
                }
            } catch (error) {
                console.error("Failed to fetch requests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userData]);

    const handleUpdateStatus = async (requestId: string, newStatus: RequestStatus) => {
        const update = (reqs: WaterRequest[]) => reqs.map(r => r.id === requestId ? { ...r, status: newStatus } : r);
        setMyRequests(update);
        setHostRequests(update);
        await api.updateRequestStatus(requestId, newStatus);
    };

    const TabButton: React.FC<{ tabId: 'my_requests' | 'host_dashboard', label: string, count: number }> = ({ tabId, label, count }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className="relative flex-1 py-4 font-semibold text-center transition-colors focus:outline-none"
        >
            <span className={`${activeTab === tabId ? 'text-brand-blue' : 'text-gray-500 dark:text-gray-400'}`}>
                {label} <span className="text-sm bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">{count}</span>
            </span>
            {activeTab === tabId && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full motion-safe:transition-all"></span>
            )}
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
        return requests.map(req => {
             const otherPartyId = perspective === 'requester' ? req.hostId : req.requesterId;
             return <RequestCard 
                key={req.id} 
                request={req} 
                perspective={perspective} 
                otherParty={users[otherPartyId]}
                onUpdateStatus={handleUpdateStatus}
            />
        });
    };

    return (
        <div className="flex flex-col">
            <div className="sticky top-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex-shrink-0">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-center dark:text-gray-100">Water Requests</h1>
                </header>
                {userData?.isHost && (
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <TabButton tabId="my_requests" label="My Requests" count={myRequests.length} />
                        <TabButton tabId="host_dashboard" label="Host Dashboard" count={hostRequests.length} />
                    </div>
                )}
            </div>

            <div>
                {activeTab === 'my_requests' && renderContent(myRequests, 'requester', "You haven't made any requests yet.")}
                {activeTab === 'host_dashboard' && renderContent(hostRequests, 'host', "You haven't received any requests yet.")}
            </div>
        </div>
    );
}