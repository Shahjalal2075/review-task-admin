import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Gift, Save, X, Ticket } from 'lucide-react';

const PromoCode = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form States
    const [showModal, setShowModal] = useState(false);
    const [code, setCode] = useState("");
    const [amount, setAmount] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const API_URL = 'https://review-task-server.vercel.app/promo-code';

    // Helper: Show Message
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    // 1. Fetch Promo Codes
    const fetchPromoCodes = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (Array.isArray(data)) {
                setPromoCodes(data);
            }
        } catch (error) {
            console.error("Error fetching promos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    // 2. Add Promo Code
    const handleAddPromo = async () => {
        if (!code || !amount) {
            showMessage("error", "Please fill all fields");
            return;
        }

        setActionLoading(true);
        const payload = { code: code.toUpperCase(), amount: parseFloat(amount) };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showMessage("success", "Promo Code Added!");
                setShowModal(false);
                setCode("");
                setAmount("");
                fetchPromoCodes(); // Refresh list
            } else {
                showMessage("error", "Failed to add promo code");
            }
        } catch (error) {
            showMessage("error", "Network error");
        } finally {
            setActionLoading(false);
        }
    };

    // 3. Delete Promo Code
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this promo code?")) return;

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setPromoCodes(promoCodes.filter(promo => promo._id !== id));
                // Optionally show a toast/message here
            } else {
                alert("Failed to delete");
            }
        } catch (error) {
            alert("Network error");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className=" ">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Ticket className="text-purple-600" />
                            Promo Codes
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage discount and bonus codes</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="mt-4 sm:mt-0 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md active:scale-95"
                    >
                        <Plus size={20} />
                        Add Promo Code
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="animate-spin text-purple-600 w-8 h-8" />
                        </div>
                    ) : promoCodes.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <Gift className="mx-auto w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg">No promo codes found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <th className="p-4 font-semibold w-16 text-center">#</th>
                                        <th className="p-4 font-semibold">Code</th>
                                        <th className="p-4 font-semibold">Amount</th>
                                        <th className="p-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {promoCodes.map((promo, index) => (
                                        <tr key={promo._id || index} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="p-4 text-center text-gray-500">{index + 1}</td>
                                            <td className="p-4">
                                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md font-mono font-bold tracking-wide">
                                                    {promo.code}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-gray-700">৳{promo.amount}</td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(promo._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
                                    <Gift size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">New Promo Code</h2>
                            </div>
                            
                            {/* Message Alert */}
                            {message.text && (
                                <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Promo Code</label>
                                    <input 
                                        type="text" 
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. SUMMER50"
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono uppercase tracking-wider"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Reward Amount</label>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="e.g. 50"
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                <button 
                                    onClick={handleAddPromo}
                                    disabled={actionLoading}
                                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95 flex justify-center items-center gap-2 mt-4"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : "Create Code"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PromoCode;