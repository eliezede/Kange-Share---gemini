
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { WaterRequest, RequestStatus, User } from '../types';
import { 
    CheckBadgeIcon, 
    CheckCircleIcon, 
    CalendarDaysIcon, 
    ClockIcon, 
    MapPinIcon, 
    DropletIcon, 
    ChatBubbleOvalLeftEllipsisIcon,
    SearchIcon,
    AdjustmentsHorizontalIcon,
    ChevronRightIcon,
    UserIcon
} from '../components/Icons';
import { useAuth } from '../App';
import { useToast } from '../hooks/useToast';
import { RequestCardSkeleton } from '../components/Skeleton';
import { SpinnerIcon } from '../components/Icons';

// --- Helper Components ---

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusStyles: Record<RequestStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
        declined: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
        chatting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    };
    
    const label = status === 'chatting' ? 'In Discussion' : status;

    return (
        <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border ${statusStyles[status]}`}>
            {label}
        </span>
    );
};

const RichRequestCard: React.FC<{
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
            showToast(`Request marked as ${status}`, 'success');
        } catch {
            showToast('Action failed. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleCardClick = () => {
        navigate(`/request-detail/${request.id}`);
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/host/${otherParty.id}`);
    };

    const handleMessageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/chat/${request.id}`);
    };

    const dateObj = new Date(request.pickupDate);
    const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    const isHost = perspective === 'host';
    const isActive = ['pending', 'accepted'].includes(request.status);

    return (
        <div 
            onClick={handleCardClick} 
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
        >
            {/* Header: Avatar & Identity */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div onClick={handleProfileClick} className="relative cursor-pointer hover:opacity-80 transition-opacity">
                        <img src={otherParty.profilePicture} alt={otherParty.displayName} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                        {otherParty.distributorVerificationStatus === 'approved' && (
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
                                <CheckBadgeIcon className="w-3.5 h-3.5 text-brand-blue" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight flex items-center gap-1">
                            {otherParty.displayName}
                            <ChevronRightIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isHost ? 'You are hosting' : 'You requested'}
                        </p>
                    </div>
                </div>
                <StatusBadge status={request.status} />
            </div>

            {/* Body: Details Grid */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-4 grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{dateStr}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{request.pickupTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <DropletIcon className="w-4 h-4 text-brand-blue" />
                    <span className="font-medium">{request.liters}L • pH {request.phLevel.toFixed(1)}</span>
                </div>
                {otherParty.address?.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[100px]">{otherParty.address.city}</span>
                    </div>
                )}
            </div>

            {/* Footer: Actions */}
            <div className="flex items-center gap-2">
                {/* Primary Actions */}
                {isHost && isActive ? (
                    <>
                        <button 
                            onClick={(e) => handleAction(e, 'completed')}
                            disabled={isProcessing}
                            className="flex-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900/60 text-green-700 dark:text-green-300 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                            {isProcessing ? <SpinnerIcon className="w-3 h-3 animate-spin"/> : <CheckCircleIcon className="w-4 h-4"/>}
                            Complete
                        </button>
                        {request.status === 'pending' && (
                             <button 
                                onClick={(e) => handleAction(e, 'declined')}
                                disabled={isProcessing}
                                className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-colors"
                            >
                                Decline
                            </button>
                        )}
                    </>
                ) : (
                    <button 
                        onClick={handleMessageClick}
                        className="flex-1 bg-brand-light dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-brand-blue dark:text-blue-300 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                        <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
                        Message
                    </button>
                )}

                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors">
                    Details
                </button>
            </div>
        </div>
    );
};

// --- Filter Bar Component ---

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    statusFilter: RequestStatus | 'all';
    setStatusFilter: (s: RequestStatus | 'all') => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (o: 'asc' | 'desc') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, sortOrder, setSortOrder }) => {
    const statuses: (RequestStatus | 'all')[] = ['all', 'pending', 'accepted', 'completed', 'cancelled'];

    return (
        <div className="pb-2">
            <div className="px-4 py-2">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Filter by name or city..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none dark:text-white"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar pb-2">
                <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                    {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 flex-shrink-0"></div>
                {statuses.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                            statusFilter === status 
                            ? 'bg-brand-blue text-white border-brand-blue shadow-sm' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-blue'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Section Component ---

const RequestSection: React.FC<{ title: string; requests: WaterRequest[]; emptyMessage: string; children: React.ReactNode }> = ({ title, requests, emptyMessage, children }) => {
    if (requests.length === 0) return null;
    return (
        <div className="mb-6 animate-fade-in-up">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-4">{title}</h2>
            <div className="space-y-3 px-4">
                {children}
            </div>
        </div>
    );
};


// --- Main Page ---

export default function RequestsPage() {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState<'my_requests' | 'host_dashboard'>('my_requests');
    
    const [rawRequests, setRawRequests] = useState<WaterRequest[]>([]);
    const [users, setUsers] = useState<Record<string, User>>({});
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (!userData) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch based on tab
                const reqs = activeTab === 'my_requests' 
                    ? await api.getRequestsByUserId(userData.id)
                    : await api.getRequestsByHostId(userData.id);
                
                setRawRequests(reqs);

                // Fetch user details for cards
                const userIds = [...new Set(reqs.flatMap(r => [r.hostId, r.requesterId]))];
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
    }, [userData, activeTab]);

    const handleUpdateStatus = async (requestId: string, newStatus: RequestStatus) => {
        setRawRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
        await api.updateRequestStatus(requestId, newStatus);
    };

    // Process Data: Filter -> Sort -> Group
    const processedGroups = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        let filtered = rawRequests.filter(req => {
            // Status Filter
            if (statusFilter !== 'all' && req.status !== statusFilter) return false;
            
            // Search Filter
            if (searchQuery) {
                const otherId = activeTab === 'my_requests' ? req.hostId : req.requesterId;
                const otherUser = users[otherId];
                if (!otherUser) return false;
                const query = searchQuery.toLowerCase();
                return otherUser.displayName.toLowerCase().includes(query) || 
                       otherUser.address.city.toLowerCase().includes(query);
            }
            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            const dateA = new Date(`${a.pickupDate}T${a.pickupTime}`).getTime();
            const dateB = new Date(`${b.pickupDate}T${b.pickupTime}`).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Grouping
        const groups = {
            today: [] as WaterRequest[],
            upcoming: [] as WaterRequest[],
            past: [] as WaterRequest[]
        };

        filtered.forEach(req => {
            const isActive = ['pending', 'accepted', 'chatting'].includes(req.status);
            const isToday = req.pickupDate === todayStr;
            const isPastDate = req.pickupDate < todayStr;

            if (isActive && isToday) {
                groups.today.push(req);
            } else if (isActive && !isPastDate) {
                groups.upcoming.push(req);
            } else {
                // Past includes completed, cancelled, declined, OR active requests that missed their date
                groups.past.push(req);
            }
        });

        // Re-sort Past to always be Newest First (Desc) regardless of toggle, usually better for history
        groups.past.sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());

        return groups;
    }, [rawRequests, statusFilter, searchQuery, users, activeTab, sortOrder]);

    const TabButton: React.FC<{ tabId: 'my_requests' | 'host_dashboard', label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => { setActiveTab(tabId); setSearchQuery(''); setStatusFilter('all'); }}
            className={`flex-1 py-4 font-bold text-sm text-center transition-all relative ${activeTab === tabId ? 'text-brand-blue' : 'text-gray-500 dark:text-gray-400'}`}
        >
            {label}
            {activeTab === tabId && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-blue rounded-t-full"></span>
            )}
        </button>
    );

    const renderRequestList = () => {
        const { today, upcoming, past } = processedGroups;
        const isEmpty = today.length === 0 && upcoming.length === 0 && past.length === 0;

        if (loading) {
            return (
                <div className="pb-28 pt-4 px-4">
                    <RequestCardSkeleton />
                    <RequestCardSkeleton />
                    <RequestCardSkeleton />
                </div>
            );
        }

        if (isEmpty) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                        <DropletIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No requests found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                        {activeTab === 'my_requests' 
                            ? "You haven't made any water requests yet. Find a host on the map to get started!" 
                            : "You don't have any incoming requests matching your filters."}
                    </p>
                    {activeTab === 'my_requests' && (
                        <Link to="/map" className="px-6 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-600 transition-colors">
                            Find Water Nearby
                        </Link>
                    )}
                </div>
            );
        }

        const perspective = activeTab === 'my_requests' ? 'requester' : 'host';

        return (
            <div className="pb-28 pt-4">
                <RequestSection title="Today's Activity" requests={today} emptyMessage="">
                    {today.map(req => (
                        <RichRequestCard 
                            key={req.id} 
                            request={req} 
                            perspective={perspective}
                            otherParty={users[perspective === 'requester' ? req.hostId : req.requesterId]}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                </RequestSection>

                <RequestSection title="Upcoming" requests={upcoming} emptyMessage="">
                    {upcoming.map(req => (
                        <RichRequestCard 
                            key={req.id} 
                            request={req} 
                            perspective={perspective}
                            otherParty={users[perspective === 'requester' ? req.hostId : req.requesterId]}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                </RequestSection>

                <RequestSection title="Past & Completed" requests={past} emptyMessage="">
                    {past.map(req => (
                        <RichRequestCard 
                            key={req.id} 
                            request={req} 
                            perspective={perspective}
                            otherParty={users[perspective === 'requester' ? req.hostId : req.requesterId]}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))}
                </RequestSection>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Consolidated Header (Sticky) */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 px-4">
                    <TabButton tabId="my_requests" label="My Requests" />
                    {userData?.isHost && (
                        <TabButton tabId="host_dashboard" label="Host Dashboard" />
                    )}
                </div>
                {/* Filter Bar */}
                <FilterBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                />
            </div>

            {/* Content */}
            <div className="flex-1">
                {renderRequestList()}
            </div>
        </div>
    );
}
