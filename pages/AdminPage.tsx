
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../api';
import { User, WaterRequest, RequestStatus } from '../types';
import {
    ChevronLeftIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CheckBadgeIcon,
    ClockIcon,
    SpinnerIcon,
    SearchIcon,
    XMarkIcon,
    UserCircleIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    MapPinIcon,
    ShieldCheckIcon,
} from '../components/Icons';
import { useToast } from '../hooks/useToast';

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-brand-light dark:bg-blue-900/50 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);

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


// --- User Detail Modal Component ---
const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
        <div className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5">{icon}</div>
        <div className="flex-1">
            <p className="text-sm">{label}</p>
            <p className="font-semibold dark:text-gray-200 break-words">{value}</p>
        </div>
    </div>
);

interface UserDetailModalProps {
    user: User;
    onClose: () => void;
    onUpdate: () => Promise<void>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onUpdate }) => {
    const [editedUser, setEditedUser] = useState<User>(JSON.parse(JSON.stringify(user)));
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const isDirty = useMemo(() => JSON.stringify(editedUser) !== JSON.stringify(user), [editedUser, user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateUser(editedUser.id, editedUser);
            await onUpdate();
            showToast('User updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update user:", error);
            showToast("Failed to save changes. Please try again.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 text-left max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
                    <h2 className="text-xl font-bold dark:text-gray-100">User Details</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </header>
                
                <main className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <img src={user.profilePicture} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                        <div>
                            <h3 className="text-2xl font-bold dark:text-gray-100">{user.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{user.id}</p>
                        </div>
                    </div>
                    
                    {/* Permissions */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold dark:text-gray-200">Permissions</h4>
                        <div className="flex justify-between items-center"><span>Is Host?</span><Toggle checked={editedUser.isHost} onChange={c => setEditedUser(u => ({...u, isHost: c}))} /></div>
                        <div className="flex justify-between items-center"><span>Is Verified Host?</span><Toggle checked={editedUser.isVerified} onChange={c => setEditedUser(u => ({...u, isVerified: c}))} /></div>
                        <div className="flex justify-between items-center"><span>Is Admin?</span><Toggle checked={editedUser.isAdmin ?? false} onChange={c => setEditedUser(u => ({...u, isAdmin: c}))} /></div>
                    </div>

                    {/* Contact & Address */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold dark:text-gray-200 border-b dark:border-gray-700 pb-2">Contact</h4>
                            <DetailItem icon={<EnvelopeIcon />} label="Email" value={user.email} />
                            <DetailItem icon={<DevicePhoneMobileIcon />} label="Phone" value={user.phone || 'N/A'} />
                        </div>
                         <div className="space-y-4">
                            <h4 className="font-semibold dark:text-gray-200 border-b dark:border-gray-700 pb-2">Address</h4>
                            <DetailItem icon={<MapPinIcon />} label="Location" value={`${user.address.city}, ${user.address.country}`} />
                            <DetailItem icon={<MapPinIcon />} label="Full Address" value={`${user.address.street} ${user.address.number}, ${user.address.postalCode}`} />
                        </div>
                    </div>
                    
                    {/* Host Details */}
                    {user.isHost && (
                        <div className="space-y-4">
                            <h4 className="font-semibold dark:text-gray-200 border-b dark:border-gray-700 pb-2">Host Details</h4>
                            <p><span className="font-medium">Rating:</span> {user.rating.toFixed(1)} ({user.reviews} reviews)</p>
                            <p><span className="font-medium">pH Levels:</span> {user.phLevels.join(', ')}</p>
                            <p><span className="font-medium">Last Filter Change:</span> {user.maintenance.lastFilterChange || 'N/A'}</p>
                            <p><span className="font-medium">Last E-Cleaning:</span> {user.maintenance.lastECleaning || 'N/A'}</p>
                            <h5 className="font-medium mt-2">Availability:</h5>
                            <ul className="text-sm space-y-1 pl-2">
                                {/* FIX: Explicitly cast schedule to its correct type to resolve inference issue with Object.entries. */}
                                {Object.entries(user.availability).map(([day, schedule]) => {
                                    const typedSchedule = schedule as { enabled: boolean; startTime: string; endTime: string; };
                                    return typedSchedule.enabled && (
                                        <li key={day}><span className="font-semibold w-24 inline-block">{day}:</span> {typedSchedule.startTime} - {typedSchedule.endTime}</li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={!isDirty || isSaving}
                        className="px-4 py-2 font-semibold rounded-lg bg-brand-blue text-white hover:bg-blue-600 transition disabled:bg-blue-300 dark:disabled:bg-gray-500"
                    >
                        {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                    </button>
                </footer>
            </div>
        </div>
    );
};


// --- Main Admin Page Component ---
export default function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<WaterRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [userFilter, setUserFilter] = useState<'all' | 'hosts' | 'non-hosts'>('all');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);


    const fetchData = async () => {
        setLoading(true);
        const [usersData, requestsData] = await Promise.all([
            api.getAllUsers(),
            api.getAllRequests()
        ]);
        setUsers(usersData);
        setRequests(requestsData);
        setLoading(false);
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const hosts = useMemo(() => users.filter(u => u.isHost), [users]);

    const metrics = useMemo(() => {
        return {
            totalHosts: hosts.length,
            totalRequests: requests.filter(r => r.status !== 'chatting').length,
            verifiedHosts: hosts.filter(h => h.isVerified).length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
        };
    }, [hosts, requests]);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                if (userFilter === 'hosts') return user.isHost;
                if (userFilter === 'non-hosts') return !user.isHost;
                return true; // 'all'
            })
            .filter(user => {
                const query = userSearchQuery.toLowerCase();
                return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
            });
    }, [users, userFilter, userSearchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const handleVerifyToggle = async (host: User) => {
        setUpdatingUserId(host.id);
        await api.toggleHostVerification(host.id, host.isVerified);
        const updatedUsers = await api.getAllUsers();
        setUsers(updatedUsers);
        setUpdatingUserId(null);
    };

    const recentRequests = useMemo(() => {
        return requests
            .filter(r => r.status !== 'chatting')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }, [requests]);
    
    const renderLoading = () => (
        <div className="flex justify-center items-center h-64">
            <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-6">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate('/profile')} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-bold flex-1 text-center dark:text-gray-100">Admin Dashboard</h1>
                <div className="w-6"></div>
            </header>

            {loading ? renderLoading() : (
                <div className="p-4 md:p-6 space-y-6">
                    {/* Key Metrics */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Key Metrics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard icon={<UserGroupIcon className="w-6 h-6 text-brand-blue" />} label="Total Users" value={users.length} />
                            <MetricCard icon={<ClipboardDocumentListIcon className="w-6 h-6 text-brand-blue" />} label="Total Requests" value={metrics.totalRequests} />
                            <MetricCard icon={<CheckBadgeIcon className="w-6 h-6 text-green-500" />} label="Verified Hosts" value={metrics.verifiedHosts} />
                            <MetricCard icon={<ClockIcon className="w-6 h-6 text-yellow-500" />} label="Pending Requests" value={metrics.pendingRequests} />
                        </div>
                    </section>
                    
                    {/* Users Management */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Users Management</h2>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text" placeholder="Search by name or email..."
                                    value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue outline-none transition"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                {(['all', 'hosts', 'non-hosts'] as const).map(filter => (
                                    <button
                                        key={filter} onClick={() => setUserFilter(filter)}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors flex-1 md:flex-none ${userFilter === filter ? 'bg-white dark:bg-gray-800 text-brand-blue shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {paginatedUsers.map(user => (
                                    <div key={user.id} onClick={() => setSelectedUser(user)} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3 flex-1">
                                            <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.address.city}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full md:w-auto self-end md:self-center">
                                            <div className="flex flex-col items-start md:items-end gap-1 flex-1">
                                                {user.isHost ? (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Host</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">User</span>
                                                )}
                                                {user.isVerified && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Verified</span>
                                                )}
                                                {user.isAdmin && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Admin</span>
                                                )}
                                            </div>
                                            {user.isHost && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVerifyToggle(user); }}
                                                    disabled={updatingUserId === user.id}
                                                    className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors w-20 text-center ${user.isVerified ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70'}`}
                                                >
                                                    {updatingUserId === user.id ? <SpinnerIcon className="w-4 h-4 mx-auto animate-spin" /> : (user.isVerified ? 'Revoke' : 'Verify')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span>Rows per page:</span>
                                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-1">
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md font-semibold text-sm bg-gray-200 dark:bg-gray-700 enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-600 disabled:opacity-50">Prev</button>
                                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md font-semibold text-sm bg-gray-200 dark:bg-gray-700 enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-600 disabled:opacity-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* Recent Activity */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Water Requests</h2>
                         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                             <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentRequests.length > 0 ? recentRequests.map(req => (
                                        <Link to={`/request-detail/${req.id}`} key={req.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                    {req.requesterName} <span className="font-normal text-gray-500 dark:text-gray-400">to</span> {req.hostName}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(req.createdAt).toLocaleString()}</p>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </Link>
                                )) : <p className="p-4 text-gray-500 dark:text-gray-400 text-sm">No recent requests.</p>}
                            </div>
                        </div>
                    </section>
                </div>
            )}
            
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={async () => {
                        setSelectedUser(null);
                        await fetchData();
                    }}
                />
            )}
        </div>
    );
}
