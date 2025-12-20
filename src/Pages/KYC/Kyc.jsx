import React, { useState, useEffect } from 'react';
import { Loader2, Eye, CheckCircle, XCircle, Clock, Search, AlertTriangle, X } from 'lucide-react';

const Kyc = () => {
    const [kycRequests, setKycRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [previewImage, setPreviewImage] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ 
        isOpen: false, 
        request: null, 
        newStatus: '', 
        type: 'confirm' // confirm or success
    });

    // 1. Fetch Data
    const fetchKycData = async () => {
        try {
            const res = await fetch('https://review-task-server.vercel.app/kyc-verify');
            const data = await res.json();

            if (Array.isArray(data)) {
                const sortedData = data.sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime));
                setKycRequests(sortedData);
                setFilteredRequests(sortedData);
            }
        } catch (error) {
            console.error("Error fetching KYC data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKycData();
    }, []);

    // 2. Filter Logic
    useEffect(() => {
        let result = kycRequests;

        if (statusFilter !== 'All') {
            result = result.filter(item => item.status === statusFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.username?.toLowerCase().includes(lowerTerm) || 
                item.email?.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredRequests(result);
    }, [statusFilter, searchTerm, kycRequests]);

    // 3. Open Confirmation Modal
    const openConfirmModal = (request, newStatus) => {
        setConfirmModal({
            isOpen: true,
            request: request,
            newStatus: newStatus,
            type: 'confirm'
        });
    };

    // 4. Handle Approve / Reject
    const handleStatusUpdate = async () => {
        const { request, newStatus } = confirmModal;
        if (!request) return;

        setActionLoading(request._id);
        // Close modal immediately to show loading state in table or keep it open with loader? 
        // Better: Close confirm modal, show loading in table
        setConfirmModal({ ...confirmModal, isOpen: false });

        try {
            const kycUpdateRes = await fetch(`https://review-task-server.vercel.app/kyc-verify/${request.username}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const isVerifiedStatus = newStatus === 'Approved' ? 'Verified' : 'Unverified';
            const userUpdateRes = await fetch(`https://review-task-server.vercel.app/user-list/kyc/${request.username}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerify: isVerifiedStatus })
            });

            if (kycUpdateRes.ok && userUpdateRes.ok) {
                const updatedList = kycRequests.map(item => 
                    item._id === request._id ? { ...item, status: newStatus } : item
                );
                setKycRequests(updatedList);
                
                // Show Success Modal
                setConfirmModal({ 
                    isOpen: true, 
                    request: null, 
                    newStatus: newStatus, 
                    type: 'success' 
                });
            } else {
                alert('Failed to update status.'); // Fallback alert for error
            }

        } catch (error) {
            console.error("Action error:", error);
            alert('Network error.');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">KYC Verification Requests</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and verify user identities</p>
                    </div>
                    
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search username/email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        statusFilter === status 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex justify-center">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">
                            No requests found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <th className="p-4 font-semibold">User Info</th>
                                        <th className="p-4 font-semibold">Details</th>
                                        <th className="p-4 font-semibold text-center">Documents</th>
                                        <th className="p-4 font-semibold text-center">Status</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredRequests.map((req) => (
                                        <tr key={req._id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{req.username}</div>
                                                <div className="text-gray-500 text-xs">{req.email}</div>
                                                <div className="text-gray-500 text-xs">{req.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-gray-700"><span className="font-semibold">Name:</span> {req.fullName}</div>
                                                <div className="text-gray-700"><span className="font-semibold">Method:</span> {req.verificationMethod}</div>
                                                <div className="text-gray-500 text-xs mt-1">Born: {req.birthDate}</div>
                                                <div className="text-gray-400 text-[10px] mt-1 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(req.submissionTime).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    {[
                                                        { src: req.frontImage, label: 'Front' }, 
                                                        { src: req.backImage, label: 'Back' }, 
                                                        { src: req.selfieImage, label: 'Selfie' }
                                                    ].map((img, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="relative group cursor-pointer"
                                                            onClick={() => setPreviewImage(img.src)}
                                                        >
                                                            <img 
                                                                src={img.src} 
                                                                alt={img.label} 
                                                                className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                                onError={(e) => e.target.src = 'https://placehold.co/50?text=Error'}
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                                <Eye className="text-white w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {req.status === 'Pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => openConfirmModal(req, 'Approved')}
                                                            disabled={actionLoading === req._id}
                                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            {actionLoading === req._id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => openConfirmModal(req, 'Rejected')}
                                                            disabled={actionLoading === req._id}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- Modals --- */}

                {/* 1. Image Preview Modal */}
                {previewImage && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl">
                            <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="w-full h-full object-contain max-h-[85vh]" 
                            />
                            <button 
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Confirmation & Success Modal */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100 animate-in zoom-in-95">
                            
                            {confirmModal.type === 'confirm' ? (
                                <>
                                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                        confirmModal.newStatus === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Are you sure?</h3>
                                    <p className="text-gray-500 mb-6 text-sm">
                                        You are about to <span className="font-bold">{confirmModal.newStatus}</span> the KYC request for <span className="font-bold">{confirmModal.request?.username}</span>.
                                    </p>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleStatusUpdate}
                                            className={`flex-1 py-2.5 text-white rounded-xl font-medium transition-colors ${
                                                confirmModal.newStatus === 'Approved' 
                                                ? 'bg-green-600 hover:bg-green-700' 
                                                : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                        >
                                            Yes, {confirmModal.newStatus}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 text-green-600">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Success!</h3>
                                    <p className="text-gray-500 mb-6 text-sm">
                                        Request has been {confirmModal.newStatus.toLowerCase()} successfully.
                                    </p>
                                    <button 
                                        onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Okay
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Kyc;