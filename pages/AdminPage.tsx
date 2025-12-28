
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../api';
import {
    ChevronLeftIcon,
    // Added missing ChevronRightIcon
    ChevronRightIcon,
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
    // Added missing ShieldCheckIcon
    ShieldCheckIcon,
    DocumentTextIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon as XCircleIconSolid,
    BuildingStorefrontIcon,
    SparklesIcon,
    CameraIcon,
    ArrowUpTrayIcon,
    Cog6ToothIcon
} from '../components/Icons';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../App';
import { User, WaterRequest, RequestStatus, BusinessCategory } from '../types';

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
    if (user.isBusiness) {
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 flex items-center gap-1"><SparklesIcon className="w-3 h-3" /> Partner</span>;
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

// --- Form Modal for Creating/Editing Partners ---

interface PartnerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editUser?: User | null;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({ isOpen, onClose, onSaved, editUser }) => {
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(editUser?.profilePicture || null);
    
    const [formData, setFormData] = useState({
        displayName: '',
        businessCategory: 'Organic Cafe' as BusinessCategory,
        email: '',
        phone: '',
        bio: '',
        address: { street: '', number: '', postalCode: '', city: '', country: '' },
        phLevels: [8.5, 9.0, 9.5],
    });

    useEffect(() => {
        if (editUser) {
            setFormData({
                displayName: editUser.displayName || '',
                businessCategory: editUser.businessCategory || 'Organic Cafe',
                email: editUser.email || '',
                phone: editUser.phone || '',
                bio: editUser.bio || '',
                address: {
                    street: editUser.address?.street || '',
                    number: editUser.address?.number || '',
                    postalCode: editUser.address?.postalCode || '',
                    city: editUser.address?.city || '',
                    country: editUser.address?.country || '',
                },
                phLevels: editUser.phLevels || [8.5, 9.0, 9.5],
            });
            setPhotoPreview(editUser.profilePicture || null);
        } else {
            setFormData({
                displayName: '',
                businessCategory: 'Organic Cafe',
                email: '',
                phone: '',
                bio: '',
                address: { street: '', number: '', postalCode: '', city: '', country: '' },
                phLevels: [8.5, 9.0, 9.5],
            });
            setPhotoPreview(null);
        }
    }, [editUser, isOpen]);

    const categories: BusinessCategory[] = ['Organic Cafe', 'Health Clinic', 'Fitness Center', 'Day Spa', 'Yoga Studio', 'Holistic Center', 'Other'];
    const phOptions = [2.5, 8.5, 9.0, 9.5, 11.5];

    if (!isOpen) return null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let profilePictureUrl = photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=random`;
            
            if (photoFile) {
                const targetId = editUser ? editUser.id : `business-${Date.now()}`;
                profilePictureUrl = await api.uploadProfilePicture(targetId, photoFile);
            }

            if (editUser) {
                // Update existing
                await api.updateUser(editUser.id, {
                    ...formData,
                    profilePicture: profilePictureUrl,
                    displayName: formData.displayName,
                    firstName: formData.displayName,
                });
                showToast("Wellness Partner updated!", "success");
            } else {
                // Create new
                await api.createWellnessPartner({
                    ...formData,
                    profilePicture: profilePictureUrl,
                    businessAmenities: []
                });
                showToast("Wellness Partner registered!", "success");
            }

            onSaved();
            onClose();
            setPhotoFile(null);
        } catch (error) {
            console.error(error);
            showToast("Action failed.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const togglePh = (ph: number) => {
        setFormData(prev => ({
            ...prev,
            phLevels: prev.phLevels.includes(ph) ? prev.phLevels.filter(p => p !== ph) : [...prev.phLevels, ph]
        }));
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto" onClick={onClose}>
             <div className="bg-[#1a202c] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-[#1a202c] z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BuildingStorefrontIcon className="w-7 h-7 text-amber-500" />
                        {editUser ? 'Edit Wellness Partner' : 'Register Wellness Partner'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-800 border-2 border-dashed border-gray-600 group-hover:border-amber-500 transition-colors flex items-center justify-center relative">
                                {photoPreview ? (
                                    <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <BuildingStorefrontIcon className="w-12 h-12 text-gray-600" />
                                )}
                                <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CameraIcon className="w-8 h-8 text-white mb-1" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Upload Photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-3">Establishment Image</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <h4 className="font-black text-amber-500 text-[10px] uppercase tracking-[0.3em]">Business Info</h4>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Establishment Name</label>
                                <input required value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full p-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition" placeholder="e.g. Zen Cafe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                                <select value={formData.businessCategory} onChange={e => setFormData({...formData, businessCategory: e.target.value as BusinessCategory})} className="w-full p-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition" placeholder="info@zen-hydration.com" />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h4 className="font-black text-amber-500 text-[10px] uppercase tracking-[0.3em]">Location</h4>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Street & Number</label>
                                <input required value={formData.address.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} className="w-full p-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition" placeholder="Main St, 123" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">City</label>
                                    <input required value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} className="w-full p-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition" placeholder="Austin" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Postcode / Zip</label>
                                    <input required value={formData.address.postalCode} onChange={e => setFormData({...formData, address: {...formData.address, postalCode: e.target.value}})} className="w-full p-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition" placeholder="BH1 234" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Country</label>
                                <input required value={formData.address.country} onChange={e => setFormData({...formData, address: {...formData.address, country: e.target.value}})} className="w-full p-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition" placeholder="United Kingdom" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 pt-4 border-t border-gray-700">
                        <h4 className="font-black text-amber-500 text-[10px] uppercase tracking-[0.3em]">Water & Services</h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available pH Levels</label>
                            <div className="flex flex-wrap gap-2">
                                {phOptions.map(ph => (
                                    <button type="button" key={ph} onClick={() => togglePh(ph)} className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all border ${formData.phLevels.includes(ph) ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500'}`}>
                                        pH {ph.toFixed(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bio / Description</label>
                            <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition no-scrollbar" placeholder="Establishment story..." />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-700 sticky bottom-0 bg-[#1a202c]">
                        <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-gray-400 bg-gray-800 rounded-2xl hover:bg-gray-700 transition">Cancel</button>
                        <button type="submit" disabled={isSaving} className="flex-[2] py-4 font-black text-xs uppercase tracking-[0.2em] text-white bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                            {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
                            {editUser ? 'Save Changes' : 'Register Partner'}
                        </button>
                    </div>
                </form>
             </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmText?: string; isDestructive?: boolean }> = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDestructive = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-sm m-4 p-6 text-center" onClick={e => e.stopPropagation()}>
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

// --- User Detail Modal ---

interface UserDetailModalProps {
    user: User;
    onClose: () => void;
    onUpdate: () => Promise<void>;
    onEditPartner: (user: User) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onUpdate, onEditPartner }) => {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<BusinessCategory>(user.businessCategory || 'Other');
    
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
            showToast(`Failed to ${action}.`, 'error');
        } finally {
            setIsProcessing(null);
        }
    };
    
    const handleApprove = () => handleAction('approved', () => api.approveDistributorVerification(user.id, adminUser!.id));
    const handlePartnerToggle = () => handleAction(user.isBusiness ? 'demoted from partner' : 'promoted to partner', () => api.updateUser(user.id, { isBusiness: !user.isBusiness, businessCategory: selectedCategory }));
    
    const handleReject = () => {
        if (!rejectionNote.trim()) { showToast('Reason cannot be empty.', 'error'); return; }
        handleAction('rejected', () => api.rejectDistributorVerification(user.id, adminUser!.id, rejectionNote)).then(() => setShowRejectionInput(false));
    };
    const handleRevoke = () => {
        if (!rejectionNote.trim()) { showToast('Reason cannot be empty.', 'error'); return; }
        handleAction('revoked', () => api.revokeDistributorVerification(user.id, adminUser!.id, rejectionNote)).then(() => setShowRejectionInput(false));
    };
    const handleBlockToggle = () => handleAction(user.isBlocked ? 'unblocked' : 'blocked', () => api.updateUserBlockStatus(user.id, !user.isBlocked));
    const handleDelete = () => {
        setConfirmationDetails({ title: "Delete User", message: `Are you sure you want to permanently delete ${user.displayName}?`, confirmText: 'Delete', isDestructive: true });
        setActionToConfirm(() => () => handleAction('deleted', () => api.deleteUser(user.id)).then(() => onClose()));
    };

    const categories: BusinessCategory[] = ['Organic Cafe', 'Health Clinic', 'Fitness Center', 'Day Spa', 'Yoga Studio', 'Holistic Center', 'Other'];

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-2xl m-4 text-left max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 rounded-t-3xl z-10">
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">User Intelligence</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </header>
                
                <main className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                    <div className="flex items-center gap-6">
                        <img src={user.profilePicture} alt={user.displayName} className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-gray-50 dark:border-gray-700" />
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">{user.displayName}</h3>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{user.id}</p>
                            <div className="mt-2"><UserStatusBadge user={user} /></div>
                        </div>
                        {user.isBusiness && (
                            <button 
                                onClick={() => { onClose(); onEditPartner(user); }}
                                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl hover:bg-amber-500 hover:text-white transition-all text-gray-600 dark:text-gray-300"
                            >
                                <Cog6ToothIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    
                    {/* Wellness Partner Section */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-800 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500 p-2 rounded-xl text-white">
                                <BuildingStorefrontIcon className="w-6 h-6" />
                            </div>
                            <h4 className="font-black text-amber-800 dark:text-amber-200 uppercase tracking-widest text-sm">Wellness Partner Status</h4>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-[0.2em] mb-2">Category Assignment</label>
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as BusinessCategory)}
                                    className="w-full p-3.5 text-sm bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            
                            <button 
                                onClick={handlePartnerToggle}
                                disabled={!!isProcessing}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-3 ${user.isBusiness ? 'bg-white dark:bg-gray-800 text-amber-600 border border-amber-200 dark:border-amber-700' : 'bg-amber-500 text-white'}`}
                            >
                                {isProcessing?.includes('partner') ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4" />}
                                {user.isBusiness ? 'Demote from Partner' : 'Promote to Wellness Partner'}
                            </button>
                        </div>
                    </div>

                    {/* Contact & Location Details */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <h4 className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px]">Contact Info</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                <span className="font-bold">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
                                <span className="font-bold">{user.phone || 'No phone provided'}</span>
                            </div>
                        </div>
                         <div className="space-y-5">
                            <h4 className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px]">Primary Location</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <MapPinIcon className="w-5 h-5 text-gray-400" />
                                <span className="font-bold">{user.address.city}, {user.address.country}</span>
                            </div>
                            {user.address.postalCode && (
                                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="w-5 h-5" />
                                    <span className="font-bold uppercase">{user.address.postalCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Verification & Risk */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="bg-gray-800 p-2 rounded-xl text-white">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <h4 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest text-sm">Security & Verification</h4>
                        </div>

                         <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Account Blocking</span>
                                <span className="text-sm font-medium dark:text-gray-300">{user.isBlocked ? 'This account is restricted' : 'Account is in good standing'}</span>
                            </div>
                             <button onClick={handleBlockToggle} disabled={!!isProcessing} className={`font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition shadow-sm ${user.isBlocked ? 'bg-gray-200 text-gray-800' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                {isProcessing?.includes('block') ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : (user.isBlocked ? 'Unblock Account' : 'Block Account')}
                            </button>
                         </div>

                         <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                         <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Permanent Removal</span>
                                <span className="text-sm font-medium dark:text-gray-300">Remove all data associated with user</span>
                            </div>
                            <button onClick={handleDelete} disabled={!!isProcessing} className="font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition bg-gray-800 text-white hover:bg-black">
                                {isProcessing === 'deleted' ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : 'Delete User'}
                            </button>
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

// --- Main Admin Dashboard ---

export default function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<WaterRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'verified' | 'blocked' | 'partners'>('all');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
    const [partnerToEdit, setPartnerToEdit] = useState<User | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, requestsData] = await Promise.all([api.getAllUsers(), api.getAllRequests()]);
            setUsers(usersData);
            setRequests(requestsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchData(); }, []);
    
    const metrics = useMemo(() => {
        const verifiedHosts = users.filter(u => u.distributorVerificationStatus === 'approved');
        const wellnessPartners = users.filter(u => u.isBusiness);
        return {
            totalUsers: users.length,
            totalRequests: requests.filter(r => r.status !== 'chatting').length,
            verifiedHosts: verifiedHosts.length,
            wellnessPartners: wellnessPartners.length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            pendingVerifications: users.filter(u => u.distributorVerificationStatus === 'pending').length,
        };
    }, [users, requests]);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                switch(userFilter) {
                    case 'pending': return user.distributorVerificationStatus === 'pending';
                    case 'verified': return user.distributorVerificationStatus === 'approved' && !user.isBusiness;
                    case 'partners': return user.isBusiness;
                    case 'blocked': return user.isBlocked;
                    default: return true;
                }
            })
            .filter(user => {
                const query = userSearchQuery.toLowerCase();
                return user.displayName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
            });
    }, [users, userFilter, userSearchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredUsers, currentPage, itemsPerPage]);

    const recentRequests = useMemo(() => {
        return requests
            .filter(r => r.status !== 'chatting')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }, [requests]);
    
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-6">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate('/profile')} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-black text-center dark:text-gray-100 uppercase tracking-widest flex-1">Admin HQ</h1>
                <div className="w-6"></div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" /></div>
            ) : (
                <div className="p-4 md:p-8 space-y-10">
                    <section>
                         <button 
                            onClick={() => { setPartnerToEdit(null); setIsPartnerFormOpen(true); }}
                            className="w-full flex items-center justify-center gap-4 py-5 bg-amber-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-[0.98]"
                         >
                            <SparklesIcon className="w-7 h-7" />
                            Register New Wellness Partner
                         </button>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">Core Intelligence</h2>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <MetricCard icon={<UserGroupIcon className="w-6 h-6 text-brand-blue" />} label="Total Network" value={metrics.totalUsers} />
                            <MetricCard icon={<CheckBadgeIcon className="w-6 h-6 text-brand-blue" />} label="Verified Hosts" value={metrics.verifiedHosts} />
                            <MetricCard icon={<SparklesIcon className="w-6 h-6 text-amber-500" />} label="Wellness Hubs" value={metrics.wellnessPartners} />
                            <Link to="/admin/distributor-verifications" className="block h-full">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-full relative overflow-hidden">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full z-10"><ShieldExclamationIcon className="w-6 h-6 text-orange-500" /></div>
                                    <div className="z-10">
                                        <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{metrics.pendingVerifications}</p>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pending Approvals</p>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 opacity-5"><ShieldExclamationIcon className="w-24 h-24 text-orange-500" /></div>
                                </div>
                            </Link>
                            <MetricCard icon={<ClipboardDocumentListIcon className="w-6 h-6 text-purple-500" />} label="Liters Requested" value={metrics.totalRequests} />
                            <MetricCard icon={<ClockIcon className="w-6 h-6 text-yellow-500" />} label="Active Sessions" value={metrics.pendingRequests} />
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">Registry Management</h2>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-6">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text" placeholder="Search registry..."
                                    value={userSearchQuery} onChange={(e) => { setUserSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-none outline-none dark:text-gray-100 text-sm font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-x-auto no-scrollbar">
                                {(['all', 'partners', 'pending', 'verified', 'blocked'] as const).map(f => (
                                    <button
                                        key={f} onClick={() => { setUserFilter(f); setCurrentPage(1); }}
                                        className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${userFilter === f ? 'bg-white dark:bg-gray-800 text-brand-blue shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {paginatedUsers.map(u => (
                                    <div key={u.id} onClick={() => setSelectedUser(u)} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-all">
                                        <div className="flex items-center gap-4 flex-1">
                                            <img src={u.profilePicture} alt={u.displayName} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-gray-100 leading-tight">{u.displayName}</p>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full md:w-auto self-end md:self-center">
                                             <UserStatusBadge user={u} />
                                             <ChevronRightIcon className="w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="p-6 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 border-t dark:border-gray-700/50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 disabled:opacity-30">Prev</button>
                                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 disabled:opacity-30">Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">Latest Operations</h2>
                         <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                             <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {recentRequests.length > 0 ? recentRequests.map(r => (
                                        <Link to={`/request-detail/${r.id}`} key={r.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all">
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-gray-100 text-sm">
                                                    {r.requesterName} <span className="font-medium text-gray-400 mx-1">→</span> {r.hostName}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                                            </div>
                                            <RequestStatusBadge status={r.status} />
                                        </Link>
                                )) : <p className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No recorded operations.</p>}
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
                        await fetchData();
                        const updated = await api.getUserById(selectedUser.id);
                        if (updated) setSelectedUser(updated);
                    }}
                    onEditPartner={(user) => {
                        setPartnerToEdit(user);
                        setIsPartnerFormOpen(true);
                    }}
                />
            )}

            <PartnerFormModal 
                isOpen={isPartnerFormOpen}
                onClose={() => { setIsPartnerFormOpen(false); setPartnerToEdit(null); }}
                onSaved={fetchData}
                editUser={partnerToEdit}
            />
        </div>
    );
}
