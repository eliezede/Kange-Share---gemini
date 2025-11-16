import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { User } from '../types';
import { useToast } from '../hooks/useToast';
import { ChevronLeftIcon, SpinnerIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';

// Sub-component for each user card
const VerificationCard: React.FC<{
    user: User;
    onApprove: (userId: string) => void;
    onReject: (userId: string, note: string) => void;
}> = ({ user, onApprove, onReject }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = async () => {
        setIsProcessing(true);
        await onApprove(user.id);
        // The parent component will handle removing this card from the list
    };
    
    const handleRejectConfirm = async () => {
        if (!rejectionNote.trim()) {
            alert('Rejection note cannot be empty.');
            return;
        }
        setIsProcessing(true);
        await onReject(user.id, rejectionNote);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                    Pending
                </span>
            </div>
            
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Uploaded Documents</h4>
                        {user.hostVerificationDocuments.length > 0 ? (
                            <ul className="space-y-2">
                                {user.hostVerificationDocuments.map(doc => (
                                    <li key={doc.id}>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-blue hover:underline">
                                            <DocumentTextIcon className="w-5 h-5" />
                                            <span>{doc.fileName}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No documents uploaded.</p>
                        )}
                    </div>

                    {isRejecting ? (
                        <div className="space-y-2">
                            <textarea
                                value={rejectionNote}
                                onChange={(e) => setRejectionNote(e.target.value)}
                                placeholder="Reason for rejection..."
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none transition"
                                rows={3}
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsRejecting(false)} className="px-3 py-1.5 rounded-md font-semibold text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                                    Cancel
                                </button>
                                <button onClick={handleRejectConfirm} disabled={isProcessing} className="px-3 py-1.5 rounded-md font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:bg-red-400 flex items-center gap-1">
                                    {isProcessing && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3 justify-end pt-2">
                             <button onClick={() => setIsRejecting(true)} disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 rounded-lg font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70 transition flex items-center justify-center gap-2">
                                <XCircleIcon className="w-5 h-5" /> Reject
                            </button>
                            <button onClick={handleApprove} disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 rounded-lg font-semibold text-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70 transition flex items-center justify-center gap-2">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <><CheckCircleIcon className="w-5 h-5" /> Approve</>}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// Main page component
export default function AdminHostVerificationsPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const users = await api.getPendingVerificationUsers();
            setPendingUsers(users);
        } catch (error) {
            console.error("Failed to fetch pending users:", error);
            showToast("Could not load users. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        try {
            await api.approveHostVerification(userId);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            showToast("User approved as a host.", "success");
        } catch (error) {
            console.error("Failed to approve user:", error);
            showToast("Approval failed. Please try again.", "error");
        }
    };

    const handleReject = async (userId: string, note: string) => {
        try {
            await api.rejectHostVerification(userId, note);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            showToast("User verification rejected.", "success");
        } catch (error) {
            console.error("Failed to reject user:", error);
            showToast("Rejection failed. Please try again.", "error");
        }
    };
    
    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-6">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate('/admin')} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-bold flex-1 text-center dark:text-gray-100">Host Verifications</h1>
                <div className="w-6 h-6"></div> {/* Spacer */}
            </header>
            
            <main className="p-4 md:p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
                    </div>
                ) : pendingUsers.length > 0 ? (
                    <div className="space-y-4">
                        {pendingUsers.map(user => (
                            <VerificationCard 
                                key={user.id} 
                                user={user} 
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">All caught up!</h2>
                        <p className="text-gray-500 dark:text-gray-400">There are no pending host verifications.</p>
                    </div>
                )}
            </main>
        </div>
    );
}