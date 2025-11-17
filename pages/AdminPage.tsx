

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
    ShieldExclamationIcon,
    DocumentTextIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon as XCircleIconSolid
} from '../components/Icons';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../App';

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

const RequestStatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
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

const UserStatusBadge: React.FC<{ user: User }> = ({ user }) => {
    if (user.isBlocked) {
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">Blocked</span>;
    }
    switch (user.distributorVerificationStatus) {
        case 'pending':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</span>;
        case 'approved':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Verified</span>;
        case 'rejected':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Rejected</span>;
        case 'revoked':
             return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">Revoked</span>;
        default:
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">User</span>;
    }
};

const ConfirmationModal: React.FC<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmText?: string; isDestructive?: boolean }> = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDestructive = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-2 dark:text-white">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                    <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 font-semibold rounded-lg text-white transition ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-blue hover:bg-blue-600'}`}>{confirmText}</button>
                </div>
            </div>
        </div>
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
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
    const [confirmationDetails, setConfirmationDetails] = useState({ title: '', message: '', confirmText: 'Confirm', isDestructive: false });
    const { userData: adminUser } = useAuth();
    const { showToast } = useToast();

    const handleAction = async (action: string, apiCall: () => Promise<void>) => {
        setIsProcessing(action);
        try {
            await apiCall();
            await onUpdate();
            showToast(`User ${action} successfully!`, 'success');
        } catch (error) {
            console.error(`Failed to ${action} user:`, error);
            showToast(`Failed to ${action}. Please try again.`, 'error');
        } finally {
            setIsProcessing(null);
        }
    };
    
    const handleApprove = () => handleAction('approved', () => api.approveDistributorVerification(user.id, adminUser!.id));
    const handleReject = () => {
        if (!rejectionNote.trim()) { showToast('Rejection reason cannot be empty.', 'error'); return; }
        handleAction('rejected', () => api.rejectDistributorVerification(user.id, adminUser!.id, rejectionNote)).then(() => setShowRejectionInput(false));
    };
    const handleRevoke = () => {
        if (!rejectionNote.trim()) { showToast('Revocation reason cannot be empty.', 'error'); return; }
        handleAction('revoked', () => api.revokeDistributorVerification(user.id, adminUser!.id, rejectionNote)).then(() => setShowRejectionInput(false));
    };
    const handleBlockToggle = () => handleAction(user.isBlocked ? 'unblocked' : 'blocked', () => api.updateUserBlockStatus(user.id, !user.isBlocked));
    const handleDelete = () => {
        setConfirmationDetails({ title: "Delete User", message: `Are you sure you want to permanently delete ${user.displayName}? This action cannot be undone.`, confirmText: 'Delete', isDestructive: true });
        setActionToConfirm(() => () => handleAction('deleted', () => api.deleteUser(user.id)));
    };

    return (
        <>
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
                        <img src={user.profilePicture} alt={user.displayName} className="w-20 h-20 rounded-full object-cover" />
                        <div>
                            <h3 className="text-2xl font-bold dark:text-gray-100">{user.displayName}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{user.id}</p>
                            <div className="mt-1"><UserStatusBadge user={user} /></div>
                        </div>
                    </div>
                    
                    {/* Verification Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold dark:text-gray-200">Verification Management</h4>
                         <DetailItem icon={<UserCircleIcon />} label="Distributor ID" value={user.distributorId || 'Not provided'} />
                         <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Proof Documents:</p>
                            {user.distributorProofDocuments.length > 0 ? (
                                <div className="space-y-1 pl-8">
                                    {user.distributorProofDocuments.map(doc => (
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" key={doc.id} className="flex items-center gap-2 text-brand-blue hover:underline text-sm">
                                            <DocumentTextIcon className="w-4 h-4" /> {doc.fileName}
                                        </a>
                                    ))}
                                </div>
                            ) : <p className="text-sm pl-8 text-gray-500">No documents uploaded.</p>}
                        </div>
                         
                        {(showRejectionInput) && (
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Rejection/Revocation</label>
                                <textarea value={rejectionNote} onChange={e => setRejectionNote(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none transition" rows={2}/>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                            {user.distributorVerificationStatus === 'pending' && (
                                <>
                                    <button onClick={handleApprove} disabled={!!isProcessing} className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70 transition">
                                        {isProcessing === 'approved' ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <CheckCircleIcon className="w-5 h-5"/>} Approve
                                    </button>
                                    <button onClick={() => setShowRejectionInput(current => !current)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70 transition">
                                        <XCircleIconSolid className="w-5 h-5"/> Reject
                                    </button>
                                     {showRejectionInput && <button onClick={handleReject} disabled={!rejectionNote.trim() || !!isProcessing} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition">Confirm Rejection</button>}
                                </>
                            )}
                             {user.distributorVerificationStatus === 'approved' && (
                                <>
                                <button onClick={() => setShowRejectionInput(current => !current)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/70 transition">
                                    <XCircleIconSolid className="w-5 h-5"/> Revoke
                                </button>
                                {showRejectionInput && <button onClick={handleRevoke} disabled={!rejectionNote.trim() || !!isProcessing} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-orange-600 text-white hover:bg-orange-700 transition">Confirm Revocation</button>}
                                </>
                            )}
                        </div>
                    </div>
                    
                     {/* Account Status Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                         <h4 className="font-semibold dark:text-gray-200">Account Status</h4>
                         <div className="flex justify-between items-center">
                            <span>Blocked</span>
                             <button onClick={handleBlockToggle} disabled={!!isProcessing} className={`font-semibold px-3 py-1 text-sm rounded-md transition ${user.isBlocked ? 'bg-gray-200 text-gray-800' : 'bg-red-600 text-white'}`}>
                                {isProcessing === 'blocked' || isProcessing === 'unblocked' ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : (user.isBlocked ? 'Unblock' : 'Block')}
                            </button>
                         </div>
                         <div className="flex justify-between items-center">
                            <span>Delete User</span>
                            <button onClick={handleDelete} disabled={!!isProcessing} className="font-semibold px-3 py-1 text-sm rounded-md transition bg-red-600 text-white">
                                {isProcessing === 'deleted' ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : 'Delete'}
                            </button>
                         </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold dark:text-gray-200 border-b dark:border-gray-700 pb-2">Contact</h4>
                            <DetailItem icon={<EnvelopeIcon />} label="Email" value={user.email} />
                            <DetailItem icon={<DevicePhoneMobileIcon />} label="Phone" value={user.phone || 'N/A'} />
                        </div>
                         <div className="space-y-4">
                            <h4 className="font-semibold dark:text-gray-200 border-b dark:border-gray-700 pb-2">Address</h4>
                            <DetailItem icon={<MapPinIcon />} label="Location" value={`${user.address.city}, ${user.address.country}`} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
        <ConfirmationModal 
            isOpen={!!actionToConfirm}
            onCancel={() => setActionToConfirm(null)}
            onConfirm={() => { if(actionToConfirm) actionToConfirm(); setActionToConfirm(null); }}
            {...confirmationDetails}
        />
        </>
    );
};


// --- Main Admin Page Component ---
export default function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<WaterRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'verified' | 'blocked'>('all');
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
    
    const metrics = useMemo(() => {
        const verifiedHosts = users.filter(u => u.distributorVerificationStatus === 'approved');
        return {
            totalUsers: users.length,
            totalRequests: requests.filter(r => r.status !== 'chatting').length,
            verifiedHosts: verifiedHosts.length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            pendingVerifications: users.filter(u => u.distributorVerificationStatus === 'pending').length,
        };
    }, [users, requests]);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                switch(userFilter) {
                    case 'pending': return user.distributorVerificationStatus === 'pending';
                    case 'verified': return user.distributorVerificationStatus === 'approved';
                    case 'blocked': return user.isBlocked;
                    case 'all':
                    default:
                        return true;
                }
            })
            .filter(user => {
                const query = userSearchQuery.toLowerCase();
                return user.displayName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
            });
    }, [users, userFilter, userSearchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

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
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <MetricCard icon={<UserGroupIcon className="w-6 h-6 text-brand-blue" />} label="Total Users" value={users.length} />
                            <MetricCard icon={<ClipboardDocumentListIcon className="w-6 h-6 text-brand-blue" />} label="Total Requests" value={metrics.totalRequests} />
                            <MetricCard icon={<CheckBadgeIcon className="w-6 h-6 text-green-500" />} label="Verified Hosts" value={metrics.verifiedHosts} />
                            <MetricCard icon={<ClockIcon className="w-6 h-6 text-yellow-500" />} label="Pending Requests" value={metrics.pendingRequests} />
                            <Link to="/admin/distributor-verifications" className="block col-span-2 lg:col-span-1">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-full">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                                        <ShieldExclamationIcon className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{metrics.pendingVerifications}</p>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Verifications</p>
                                    </div>
                                </div>
                            </Link>
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
                                {(['all', 'pending', 'verified', 'blocked'] as const).map(filter => (
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
                                            <img src={user.profilePicture} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{user.displayName}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full md:w-auto self-end md:self-center">
                                            <div className="flex flex-col items-start md:items-end gap-1 flex-1">
                                                <UserStatusBadge user={user} />
                                                {user.isAdmin && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Admin</span>
                                                )}
                                            </div>
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
                                            <RequestStatusBadge status={req.status} />
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