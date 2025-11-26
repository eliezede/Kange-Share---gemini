
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../api';
import { WaterRequest, RequestStatus, User } from '../types';
import { ChevronLeftIcon, DropletIcon, CalendarDaysIcon, ClockIcon, ChatBubbleOvalLeftEllipsisIcon, SpinnerIcon, CheckBadgeIcon, QrCodeIcon, StarIcon, ChevronRightIcon } from '../components/Icons';
import { useAuth } from '../App';
import { QRCodeDisplayModal, QRScannerModal } from '../components/QRModals';
import { useToast } from '../hooks/useToast';

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusInfo: Record<RequestStatus, { className: string; text: string }> = {
        pending: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', text: 'Pending Host Approval' },
        accepted: { className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', text: 'Accepted - Ready for Pickup' },
        completed: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', text: 'Completed' },
        cancelled: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', text: 'Cancelled' },
        declined: { className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', text: 'Declined by Host' },
        chatting: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', text: 'Conversation in progress' },
    };
    const { className, text } = statusInfo[status];
    return (
        <div className={`p-4 rounded-lg text-center font-semibold ${className}`}>
            {text}
        </div>
    );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
        <div className="w-5 h-5 text-gray-500 dark:text-gray-400">{icon}</div>
        <div className="flex-1">
            <p className="text-sm">{label}</p>
            <p className="font-semibold dark:text-gray-200">{value}</p>
        </div>
    </div>
);

export default function RequestDetailPage() {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { userData: currentUser } = useAuth();
    const { showToast } = useToast();
    
    const [request, setRequest] = useState<WaterRequest | null>(null);
    const [host, setHost] = useState<User | null>(null);
    const [requester, setRequester] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // QR Modal States
    const [showQRDisplay, setShowQRDisplay] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);

    useEffect(() => {
        if (!requestId) return;
        const fetchData = async () => {
            setLoading(true);
            const reqData = await api.getRequestById(requestId);
            if (!reqData) {
                setLoading(false);
                return;
            }
            const [hostData, requesterData] = await Promise.all([
                api.getUserById(reqData.hostId),
                api.getUserById(reqData.requesterId)
            ]);
            setRequest(reqData);
            setHost(hostData);
            setRequester(requesterData);
            setLoading(false);
        };
        fetchData();
    }, [requestId]);

    const updateRequestStatus = async (newStatus: RequestStatus) => {
        if (!requestId) return;
        await api.updateRequestStatus(requestId, newStatus);
        if(request) {
            setRequest({ ...request, status: newStatus });
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        try {
            // Try parsing JSON first
            let scannedRequestId = decodedText;
            try {
                const payload = JSON.parse(decodedText);
                if (payload.requestId) scannedRequestId = payload.requestId;
            } catch (e) {
                // Not JSON, treat as raw string
            }

            if (scannedRequestId === requestId && currentUser) {
                await api.verifyPickupScan(requestId, currentUser.id);
                showToast("Pickup verified successfully!", "success");
                
                // Update local state
                if(request) setRequest({ ...request, status: 'completed' });
                
                // Close the scanner modal
                setShowQRScanner(false);
                
                // NOTE: Removed automatic navigation to rate page because it's the HOST scanning.
                // The host should not rate themselves.
            } else {
                showToast("Invalid QR Code for this request.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Verification failed.", "error");
        }
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
            </div>
        );
    }
    
    if (!request || !currentUser || !host || !requester) {
        return <div className="p-4 text-center dark:text-gray-300">Request not found.</div>;
    }

    const isUserTheHost = request.hostId === currentUser.id;
    
    const formattedDate = new Date(request.pickupDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
    
    const canCancel = request.status === 'pending' || request.status === 'accepted';

    const otherParty = isUserTheHost ? requester : host;


    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate('/requests')} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-xl font-bold mx-auto dark:text-gray-100">Request Details</h1>
                <div className="w-6"></div>
            </header>
            
            <div className="p-4 md:p-6 space-y-6 pb-32">
                <StatusBadge status={request.status} />

                {/* QR Actions */}
                {request.status === 'accepted' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <QrCodeIcon className="w-6 h-6 text-brand-blue" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Pickup Verification</h3>
                        
                        {isUserTheHost ? (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Scan the requester's QR code to verify the pickup and complete the order.</p>
                                <button onClick={() => setShowQRScanner(true)} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors">
                                    Scan Pickup Code
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Show this code to the host when you pick up your water.</p>
                                <button onClick={() => setShowQRDisplay(true)} className="w-full bg-white dark:bg-gray-700 text-brand-blue dark:text-white border border-brand-blue dark:border-gray-600 font-bold py-3 px-4 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors">
                                    Show Pickup Code
                                </button>
                            </>
                        )}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <h2 className="text-lg font-bold dark:text-gray-100">Pickup Details</h2>
                     {request.status !== 'chatting' ? (
                        <>
                            <DetailItem 
                                icon={<DropletIcon />}
                                label="Water Request"
                                value={`${request.liters}L of pH ${request.phLevel.toFixed(1)}`}
                            />
                            <DetailItem 
                                icon={<CalendarDaysIcon />}
                                label="Date"
                                value={formattedDate}
                            />
                            <DetailItem 
                                icon={<ClockIcon />}
                                label="Time"
                                value={request.pickupTime}
                            />
                        </>
                     ) : (
                        <p className="text-gray-500 dark:text-gray-400">This is a pre-request conversation. No pickup details yet.</p>
                     )}
                </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4 dark:text-gray-100">
                        {isUserTheHost ? "Requester Info" : "Host Info"}
                    </h2>
                    <div 
                        onClick={() => navigate(`/host/${otherParty.id}`)}
                        className="flex items-center gap-4 cursor-pointer group p-3 -m-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <img 
                            src={otherParty.profilePicture} 
                            alt={otherParty.displayName} 
                            className="w-16 h-16 rounded-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-xl dark:text-gray-100 group-hover:text-brand-blue transition-colors">{otherParty.displayName}</p>
                                {!isUserTheHost && host.distributorVerificationStatus === 'approved' && <CheckBadgeIcon className="w-5 h-5 text-brand-blue" />}
                            </div>
                            {!isUserTheHost && host.distributorVerificationStatus === 'approved' && (
                                <p className="text-xs font-semibold text-brand-blue">Official Enagic® Distributor</p>
                            )}
                             <p className="text-gray-600 dark:text-gray-400">{isUserTheHost ? 'Requester' : 'Host'}</p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-brand-blue transition-colors" />
                    </div>
                    {request.status === 'accepted' && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                             <h3 className="font-semibold mb-2 dark:text-gray-200">Pickup Address</h3>
                             <p className="text-gray-700 dark:text-gray-300">{host.address.street}, {host.address.number}</p>
                             <p className="text-gray-700 dark:text-gray-300">{host.address.city}, {host.address.postalCode}</p>
                        </div>
                    )}
                 </div>
                 
                 {request.notes && (
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                         <h2 className="text-lg font-bold mb-2 dark:text-gray-100">Notes from Requester</h2>
                         <p className="text-gray-700 dark:text-gray-300 italic">"{request.notes}"</p>
                     </div>
                 )}

            </div>
            
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 max-w-4xl mx-auto space-y-2">
                 {/* Chat Button - Visible during active stages */}
                 {(request.status === 'accepted' || request.status === 'chatting' || request.status === 'pending') && (
                    <Link to={`/chat/${request.id}`} className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors text-center">
                       <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/>
                       <span>Chat with {otherParty.displayName.split(' ')[0]}</span>
                    </Link>
                 )}

                 {/* Host Actions: Accept/Decline */}
                 {isUserTheHost && request.status === 'pending' && (
                    <div className="flex gap-3">
                        <button onClick={() => updateRequestStatus('declined')} className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors">Decline</button>
                        <button onClick={() => updateRequestStatus('accepted')} className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors">Accept</button>
                    </div>
                 )}

                 {/* Requester Actions: Cancel */}
                 {!isUserTheHost && canCancel && (
                    <button onClick={() => updateRequestStatus('cancelled')} className="w-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Cancel Request
                    </button>
                 )}

                 {/* Requester Actions: Rate (Only when completed) */}
                 {!isUserTheHost && request.status === 'completed' && (
                    <Link to={`/rate/${request.id}`} className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 font-bold py-3 px-4 rounded-xl hover:bg-yellow-500 transition-colors shadow-md">
                        <StarIcon className="w-5 h-5" />
                        Rate Experience
                    </Link>
                 )}
            </div>
            
            <QRCodeDisplayModal 
                isOpen={showQRDisplay}
                onClose={() => setShowQRDisplay(false)}
                requestId={request.id}
                hostName={host.displayName}
            />

            <QRScannerModal 
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScanSuccess={handleScanSuccess}
            />
        </div>
    )
}
