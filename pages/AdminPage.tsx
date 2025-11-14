import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../api';
import { Host, WaterRequest, RequestStatus } from '../types';
import {
    ChevronLeftIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CheckBadgeIcon,
    ClockIcon,
    SpinnerIcon,
} from '../components/Icons';

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-brand-light rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const statusStyles: Record<RequestStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-gray-100 text-gray-800',
        declined: 'bg-red-100 text-red-800',
        chatting: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status === 'chatting' ? 'Chat' : status}
        </span>
    );
};

export default function AdminPage() {
    const navigate = useNavigate();
    const [hosts, setHosts] = useState<Host[]>([]);
    const [requests, setRequests] = useState<WaterRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifyingHostId, setVerifyingHostId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [hostsData, requestsData] = await Promise.all([
                api.getHosts(),
                api.getAllRequests()
            ]);
            setHosts(hostsData);
            setRequests(requestsData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const metrics = useMemo(() => {
        return {
            totalHosts: hosts.length,
            totalRequests: requests.filter(r => r.status !== 'chatting').length,
            verifiedHosts: hosts.filter(h => h.isVerified).length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
        };
    }, [hosts, requests]);
    
    const handleVerifyToggle = async (hostId: string) => {
        setVerifyingHostId(hostId);
        await api.toggleHostVerification(hostId);
        const updatedHosts = await api.getHosts();
        setHosts(updatedHosts);
        setVerifyingHostId(null);
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
        <div className="bg-gray-50 min-h-screen pb-6">
            <header className="p-4 flex items-center border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <button onClick={() => navigate('/profile')} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <h1 className="text-xl font-bold flex-1 text-center">Admin Dashboard</h1>
                <div className="w-6"></div>
            </header>

            {loading ? renderLoading() : (
                <div className="p-4 md:p-6 space-y-6">
                    {/* Key Metrics */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Key Metrics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard icon={<UserGroupIcon className="w-6 h-6 text-brand-blue" />} label="Total Hosts" value={metrics.totalHosts} />
                            <MetricCard icon={<ClipboardDocumentListIcon className="w-6 h-6 text-brand-blue" />} label="Total Requests" value={metrics.totalRequests} />
                            <MetricCard icon={<CheckBadgeIcon className="w-6 h-6 text-green-500" />} label="Verified Hosts" value={metrics.verifiedHosts} />
                            <MetricCard icon={<ClockIcon className="w-6 h-6 text-yellow-500" />} label="Pending Requests" value={metrics.pendingRequests} />
                        </div>
                    </section>
                    
                    {/* Manage Users & Hosts */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Manage Users & Hosts</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {hosts.map(host => (
                                    <div key={host.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={host.image} alt={host.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-gray-800">{host.name}</p>
                                                <p className="text-sm text-gray-500">{host.city}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {host.isVerified ? (
                                                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                                                    <CheckBadgeIcon className="w-5 h-5" /> Verified
                                                </span>
                                            ) : (
                                                <span className="text-sm font-semibold text-gray-500">Not Verified</span>
                                            )}
                                            <button 
                                                onClick={() => handleVerifyToggle(host.id)}
                                                disabled={verifyingHostId === host.id}
                                                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors w-20 text-center ${host.isVerified ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                            >
                                                {verifyingHostId === host.id ? <SpinnerIcon className="w-4 h-4 mx-auto animate-spin" /> : (host.isVerified ? 'Revoke' : 'Verify')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Water Requests</h2>
                         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="divide-y divide-gray-100">
                                {recentRequests.length > 0 ? recentRequests.map(req => {
                                    const requester = hosts.find(h => h.id === req.requesterId) || (req.requesterId === 'user_alex_123' && { name: 'Alex Johnson' });
                                    const host = hosts.find(h => h.id === req.hostId) || (req.hostId === 'user_alex_123' && { name: 'Alex Johnson' });
                                    if (!requester || !host) return null;
                                    return (
                                        <Link to={`/request-detail/${req.id}`} key={req.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {requester.name} <span className="font-normal text-gray-500">to</span> {host.name}
                                                </p>
                                                <p className="text-sm text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </Link>
                                    );
                                }) : <p className="p-4 text-gray-500 text-sm">No recent requests.</p>}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
