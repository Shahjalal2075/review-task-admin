import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Users, Save, X, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const DepositAgent = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState(null);
    
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        method: "Bkash" // Default
    });

    const API_URL = 'https://server.amazonkindlerating.com/deposit-agent';

    // Helper: Show Message
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    // 1. Fetch Agents
    const fetchAgents = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (Array.isArray(data)) {
                setAgents(data);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    // 2. Add Agent Handler
    const handleAddAgent = async () => {
        if (!formData.name || !formData.number) {
            showMessage("error", "Please fill all fields");
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showMessage("success", "Agent added successfully!");
                setShowAddModal(false);
                setFormData({ name: "", number: "", method: "Bkash" });
                fetchAgents(); // Refresh list
            } else {
                showMessage("error", "Failed to add agent");
            }
        } catch (error) {
            console.error("Add error:", error);
            showMessage("error", "Network error");
        } finally {
            setActionLoading(false);
        }
    };

    // 3. Delete Agent Logic
    const confirmDelete = (id) => {
        setAgentToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!agentToDelete) return;
        
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/${agentToDelete}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setAgents(agents.filter(agent => agent._id !== agentToDelete));
                showMessage("success", "Agent deleted successfully");
                setShowDeleteModal(false);
            } else {
                showMessage("error", "Failed to delete");
            }
        } catch (error) {
            showMessage("error", "Network error");
        } finally {
            setActionLoading(false);
            setAgentToDelete(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
            
            {/* Global Message Toast */}
            {message.text && (
                <div className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 ${
                    message.type === 'error' 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-green-50 border-green-200 text-green-600'
                }`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className=" ">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Deposit Agents</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage agent numbers for deposit</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md active:scale-95"
                    >
                        <Plus size={20} />
                        Add Agent
                    </button>
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <Users className="mx-auto w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg">No agents found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <th className="p-4 font-semibold">Agent Name</th>
                                        <th className="p-4 font-semibold">Number</th>
                                        <th className="p-4 font-semibold">Method</th>
                                        <th className="p-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {agents.map((agent, index) => (
                                        <tr key={agent._id || index} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 font-medium text-gray-800">{agent.name}</td>
                                            <td className="p-4 font-mono text-gray-600">{agent.number}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    agent.method === 'Bkash' ? 'bg-pink-100 text-pink-600' :
                                                    agent.method === 'Nagad' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-purple-100 text-purple-600'
                                                }`}>
                                                    {agent.method}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => confirmDelete(agent._id)}
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

                {/* Add Agent Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Agent</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. Agent - 01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={formData.number}
                                        onChange={(e) => setFormData({...formData, number: e.target.value})}
                                        placeholder="01XXXXXXXXX"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                    <select 
                                        value={formData.method}
                                        onChange={(e) => setFormData({...formData, method: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="Bkash">Bkash</option>
                                        <option value="Nagad">Nagad</option>
                                        <option value="Rocket">Rocket</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6 pt-2">
                                    <button 
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleAddAgent}
                                        disabled={actionLoading}
                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex justify-center items-center gap-2 disabled:opacity-70 transition-colors"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Agent</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 relative">
                            
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle className="text-red-600" size={32} />
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Agent?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Are you sure you want to delete this agent? This action cannot be undone.
                            </p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Yes, Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DepositAgent;