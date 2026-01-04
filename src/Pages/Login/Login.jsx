import React, { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Providers/AuthProvider';

// Internal Toast Component (Replaces react-toastify)
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white ${bgColors[type] || bgColors.info} transition-all transform animate-in slide-in-from-right`}>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

// Internal Success Modal (Replaces SweetAlert2)
const SuccessModal = ({ isOpen, title, text }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 animate-in zoom-in-95">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6">{text}</p>
            </div>
        </div>
    );
};

const Login = () => {

    const { setUser } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
    const [loading, setLoading] = useState(false);

    // Custom UI States
    const [toast, setToast] = useState(null); // { message, type }
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', text: '' });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (loginMethod === 'email') {
                if (!formData.email || !formData.password) {
                    showToast('Please fill in all login details.', 'warning');
                    setLoading(false);
                    return;
                }

                // Fetch admin list from API
                const response = await fetch('https://server.amazonkindlerating.com/admin-list');
                const data = await response.json();

                // Check credentials
                const admin = data.find(
                    (user) =>
                        user.email.toLowerCase() === formData.email.toLowerCase() &&
                        user.password === formData.password
                );

                if (admin) {
                    // Logic for Role Mapping
                    let role = 'Mod';
                    if (admin.role === 'superadmin' || admin.role === 'admin') {
                        role = 'Admin';
                    } else if (admin.role === 'moderator') {
                        role = 'Mod';
                    }

                    const userData = {
                        name: admin.username,
                        email: admin.email,
                        role: role
                    };

                    // Set to LocalStorage
                    localStorage.setItem('userStatus', admin.email);
                    localStorage.setItem('user', JSON.stringify(userData));

                    setUser(userData);

                    // Show Success Modal
                    setSuccessMessage({
                        title: 'Login Successful',
                        text: `Welcome back, ${admin.username}!`
                    });
                    setShowSuccess(true);

                    // Navigate after short delay
                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                } else {
                    showToast('Invalid email or password.', 'error');
                }
            } else {
                // Mobile Login Logic
                if (formData.phone === '' || formData.password === '') {
                    showToast('Fill login details.', 'warning');
                    setLoading(false);
                    return;
                }

                const res = await fetch('https://server.amazonkindlerating.com/user-list');
                const users = await res.json();

                const existingUser = users.find(user => user.phone === formData.phone);

                if (existingUser) {
                    if (existingUser.password === formData.password) {
                        showToast('Login Successful.', 'success');
                        localStorage.setItem('userStatus', formData.phone);
                        setTimeout(() => {
                            navigate('/');
                        }, 1000);
                    } else {
                        showToast('Password Incorrect.', 'error');
                    }
                } else {
                    showToast('Phone Number Not Registered!', 'error');
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
            showToast('Something went wrong! Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSwapBtn = (method) => {
        setLoginMethod(method);
        setFormData({
            email: '',
            password: '',
            phone: '',
        });
    };

    return (
        <div className="bg-gradient-to-r from-[#4e54c8] to-[#8f94fb] min-h-screen flex items-center justify-center p-4 font-sans">
            {/* Custom Toast Render */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Custom Success Modal Render */}
            <SuccessModal
                isOpen={showSuccess}
                title={successMessage.title}
                text={successMessage.text}
            />

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                        Task
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-500 text-sm">Please sign in to continue</p>
                </div>

                {/* Toggle login method */}
                <div className="flex mb-8 rounded-full bg-teal-50 p-1 border border-teal-100">
                    <button
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${loginMethod === 'email'
                                ? 'bg-teal-500 text-white shadow-md'
                                : 'text-teal-600 hover:bg-teal-100'
                            }`}
                        onClick={() => handleSwapBtn('email')}
                    >
                        Email
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${loginMethod === 'mobile'
                                ? 'bg-teal-500 text-white shadow-md'
                                : 'text-teal-600 hover:bg-teal-100'
                            }`}
                        onClick={() => handleSwapBtn('mobile')}
                    >
                        Mobile
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    {loginMethod === 'email' ? (
                        <div className="space-y-4">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Mobile Number"
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;