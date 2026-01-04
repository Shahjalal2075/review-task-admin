import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, User, Shield, ShieldAlert, Loader2, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

const AdminList = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search Filters State
    const [filters, setFilters] = useState({
        username: '',
        email: '',
        role: ''
    });
    // Applied Filters
    const [appliedFilters, setAppliedFilters] = useState({
        username: '',
        email: '',
        role: ''
    });

    const [showModal, setShowModal] = useState(false);

    // Error Modal State
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Delete Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    // Initial Form State (No default role)
    const initialFormState = {
        username: '',
        email: '',
        password: '',
        role: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const API_URL = 'https://server.amazonkindlerating.com/admin-list';

    // 1. Data Fetching
    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            const filteredData = data.filter(admin => admin.role !== 'superAdmin');
            setAdmins(filteredData);
        } catch (err) {
            console.error("Failed to fetch admins:", err);
            triggerErrorModal("Data load korte somossha hoyeche.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Helper to trigger error modal
    const triggerErrorModal = (msg) => {
        setErrorMessage(msg);
        setShowErrorModal(true);
    };

    // 2. Handle Search & Filtering
    const handleSearchClick = () => {
        setAppliedFilters(filters);
    };

    const handleResetClick = () => {
        const resetState = { username: '', email: '', role: '' };
        setFilters(resetState);
        setAppliedFilters(resetState);
    };

    const filteredAdmins = admins.filter(admin => {
        const matchName = !appliedFilters.username || admin.username.toLowerCase().includes(appliedFilters.username.toLowerCase());
        const matchEmail = !appliedFilters.email || admin.email.toLowerCase().includes(appliedFilters.email.toLowerCase());
        const matchRole = !appliedFilters.role || admin.role === appliedFilters.role;

        return matchName && matchEmail && matchRole;
    });

    // 3. Handle Add Admin
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.role) {
            triggerErrorModal('Doya kore ekta Role (Admin ba Moderator) select korun.');
            return;
        }

        setSubmitting(true);

        // Check duplicate email
        const emailExists = admins.some(admin => admin.email.toLowerCase() === formData.email.toLowerCase());

        if (emailExists) {
            triggerErrorModal('Ei email diye already ekjon admin/moderator register kora ache.');
            setSubmitting(false);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchAdmins();
                setShowModal(false);
                setFormData(initialFormState);
            } else {
                triggerErrorModal('Admin add korte somossha hoyeche. Abar chesta korun.');
            }
        } catch (err) {
            triggerErrorModal('Network error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    // 4. Handle Delete Request
    const confirmDeleteRequest = (id) => {
        setAdminToDelete(id);
        setShowDeleteModal(true);
    };

    // Execute Delete
    const executeDelete = async () => {
        if (!adminToDelete) return;

        try {
            const response = await fetch(`${API_URL}/${adminToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAdmins(prev => prev.filter(admin => admin._id !== adminToDelete));
                setShowDeleteModal(false);
                setAdminToDelete(null);
            } else {
                setShowDeleteModal(false);
                triggerErrorModal('Delete korte somossha hoyeche.');
            }
        } catch (err) {
            console.error("Delete error:", err);
            setShowDeleteModal(false);
            triggerErrorModal('Delete request fail hoyeche.');
        }
    };

    const getRoleBadge = (role) => {
        if (role === 'Admin') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    Admin
                </span>
            );
        } else if (role === 'Mod') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Modarator
                </span>
            );
        }
        return <span className="text-gray-500">{role}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
            <div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin List</h1>
                    <p className="text-gray-500 text-sm">Manage your team members and their permissions.</p>
                </div>

                {/* Filter & Actions */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col gap-4 items-center">
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={filters.username}
                                        onChange={handleFilterChange}
                                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Type username..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="email"
                                        value={filters.email}
                                        onChange={handleFilterChange}
                                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Type email..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Role</label>
                                <select
                                    name="role"
                                    value={filters.role}
                                    onChange={handleFilterChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Mod">Moderator</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                            <button onClick={handleSearchClick} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm">
                                <Search className="h-4 w-4" /> Search
                            </button>
                            <button onClick={handleResetClick} className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                <RefreshCw className="h-4 w-4" /> Reset
                            </button>
                            <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm">
                                <Plus className="h-4 w-4" /> Add Admin
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Info</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" /> Loading data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAdmins.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No admins found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    filteredAdmins.map((admin) => (
                                        <tr key={admin._id || Math.random()} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                                        {admin.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(admin.role)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => confirmDeleteRequest(admin._id)}
                                                    className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Admin Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-[#1111119f] transition-opacity backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                                <h3 className="text-lg font-semibold leading-6 text-gray-900">Add New Member</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Enter username" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="admin@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${formData.role === 'Admin' ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' : 'border-gray-200 hover:border-gray-300'}`}
                                            onClick={() => setFormData({ ...formData, role: 'Admin' })}
                                        >
                                            <Shield className="h-4 w-4" />
                                            <span className="text-sm font-medium">Admin</span>
                                        </div>
                                        <div
                                            className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${formData.role === 'Mod' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                                            onClick={() => setFormData({ ...formData, role: 'Mod' })}
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-sm font-medium">Moderator</span>
                                        </div>
                                    </div>
                                    {!formData.role && <p className="text-xs text-gray-500 mt-1">* Please select a role</p>}
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Add Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="fixed inset-0 bg-[#00000080] backdrop-blur-sm" onClick={() => setShowErrorModal(false)}></div>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-full text-red-600">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Error</h3>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">{errorMessage}</p>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    onClick={() => setShowErrorModal(false)}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="fixed inset-0 bg-[#00000080] backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Delete</h3>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to remove this admin? This action cannot be undone.
                                </p>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    onClick={executeDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminList;