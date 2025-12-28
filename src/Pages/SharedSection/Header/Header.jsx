import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Home,
    Users,
    FileText,
    Repeat,
    Wallet,
    MapPin,
    ShoppingBag,
    Globe,
    Archive,
    Settings,
    Volume2,
    Layers,
    UserCheck,
    Menu,
    X,
    Headset,
    LogOut,
    Bell,
    Star,
} from "lucide-react";
import { AuthContext } from "../../../Providers/AuthProvider";
import { IoIdCard } from "react-icons/io5";
import { TbCoinTaka } from "react-icons/tb";

const Header = () => {
    const navigate = useNavigate();
    const { user, signOutUser } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({
        member: false,
        agency: false,
        app: false,
    });

    const [hasInteracted, setHasInteracted] = useState(false);

    const handleUserInteraction = () => {
        setHasInteracted(true);
    };

    useEffect(() => {
        let intervalId;
        let dataLength = 0;
        const fetchData = async () => {
            try {
                const response = await fetch('https://server.amazonkindlerating.com/withdraw');
                const data = await response.json();

                if (data.length > dataLength && hasInteracted) {
                    console.log(data.length);
                    console.log(dataLength);
                    dataLength = data.length;
                    console.log(dataLength);
                    const audio = new Audio('/notufy.wav');
                    audio.play();
                }

            } catch (err) {
                console.error("Auto-fetch failed:", err);
            }
        };

        fetchData();
        intervalId = setInterval(fetchData, 3000);

        return () => clearInterval(intervalId);
    }, [hasInteracted]);

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    const handleLogout = () => {
        signOutUser();
        navigate('/login');
    }

    return (
        <>
            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-purple-700 to-pink-500 p-4 text-white shadow-lg">
                <h2 className="text-2xl font-bold">🎯 Dashboard</h2>
                <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white w-72 p-5 min-h-screen transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 fixed md:relative z-50 shadow-2xl`}
            >
                <div className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                    🌐 Admin Portal
                </div>

                <Link
                    to="/"
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-indigo-700 transition"
                >
                    <Home size={20} /> HomePage
                </Link>

                {/* Member Center */}
                <div className="mt-4">
                    <button
                        onClick={() => toggleMenu("member")}
                        className="flex items-center justify-between w-full px-4 py-2 bg-indigo-600 rounded font-semibold hover:bg-indigo-500"
                    >
                        <div className="flex items-center gap-2">
                            <Users size={20} /> Member Center
                        </div>
                        <span>▾</span>
                    </button>
                    {openMenus.member && (
                        <div className="ml-6 mt-2 space-y-1 text-sm text-gray-300">
                            <Link to="/membership-list" className="flex items-center gap-2 hover:text-white">
                                <UserCheck size={16} /> Membership list
                            </Link>
                            <Link to="/deposit-record" className="flex items-center gap-2 hover:text-white">
                                <FileText size={16} /> Deposit Record
                            </Link>
                            <Link to="/withdraw-record" className="flex items-center gap-2 hover:text-white">
                                <Repeat size={16} /> Withdraw Record
                            </Link>
                            <Link to="/combine-task-list" className="flex items-center gap-2 hover:text-white">
                                <FileText size={16} /> Combination Task
                            </Link>
                            <Link to="/combine-task-history" className="flex items-center gap-2 hover:text-white">
                                <FileText size={16} /> Combination Task History
                            </Link>
                            <Link to="/reward-task-list" className="flex items-center gap-2 hover:text-white">
                                <FileText size={16} /> Reward Task
                            </Link>
                            <Link to="/reward-task-history" className="flex items-center gap-2 hover:text-white">
                                <FileText size={16} /> Reward Task History
                            </Link>
                            <Link to="/kyc" className="flex items-center gap-2 hover:text-white">
                                <IoIdCard size={16} /> KYC Verify
                            </Link>
                            <Link to="/usdt-address" className="flex items-center gap-2 hover:text-white">
                                <MapPin size={16} /> Wallet address
                            </Link>
                            <Link to="/task-record" className="flex items-center gap-2 hover:text-white">
                                <ShoppingBag size={16} /> Task Record
                            </Link>
                        </div>
                    )}
                </div>

                {/* Agency Center */}
                {/* {
                    user.role === "Admin" &&
                    <div className="mt-4">
                        <button
                            onClick={() => toggleMenu("agency")}
                            className="flex items-center justify-between w-full px-4 py-2 bg-green-600 rounded font-semibold hover:bg-green-500"
                        >
                            <div className="flex items-center gap-2">
                                <Globe size={20} /> Agency Center
                            </div>
                            <span>▾</span>
                        </button>
                        {openMenus.agency && (
                            <div className="ml-6 mt-2 space-y-1 text-sm text-gray-300">
                                <Link to="/national-agents" className="flex items-center gap-2 hover:text-white">
                                    <Users size={16} /> National agents
                                </Link>
                                <Link to="/fill-report" className="flex items-center gap-2 hover:text-white">
                                    <FileText size={16} /> Fill report
                                </Link>
                                <Link to="/task-report" className="flex items-center gap-2 hover:text-white">
                                    <FileText size={16} /> Task report
                                </Link>
                            </div>
                        )}
                    </div>
                } */}

                {/* App Management */}
                {
                    user.role === "Admin" &&
                    <div className="mt-4">
                        <button
                            onClick={() => toggleMenu("app")}
                            className="flex items-center justify-between w-full px-4 py-2 bg-pink-600 rounded font-semibold hover:bg-pink-500"
                        >
                            <div className="flex items-center gap-2">
                                <Settings size={20} /> App Management
                            </div>
                            <span>▾</span>
                        </button>
                        {openMenus.app && (
                            <div className="ml-6 mt-2 space-y-1 text-sm text-gray-300">
                                <Link to="/product-management" className="flex items-center gap-2 hover:text-white">
                                    <Archive size={16} /> Product management
                                </Link>
                                <Link to="/deposit-agent" className="flex items-center gap-2 hover:text-white">
                                    <TbCoinTaka size={16} /> Deposit Agent
                                </Link>
                                <Link to="/product-threshold" className="flex items-center gap-2 hover:text-white">
                                    <Layers size={16} /> Product threshold
                                </Link>
                                <Link to="/commission-settings" className="flex items-center gap-2 hover:text-white">
                                    <Wallet size={16} /> Commission settings
                                </Link>
                                <Link to="/announcement" className="flex items-center gap-2 hover:text-white">
                                    <Volume2 size={16} /> Announcement
                                </Link>
                                <Link to="/system-settings" className="flex items-center gap-2 hover:text-white">
                                    <ShoppingBag size={16} /> System settings
                                </Link>
                                <Link to="/signup-bonus" className="flex items-center gap-2 hover:text-white">
                                    <Star size={16} /> Sign Up Bonus
                                </Link>
                                <Link to="/promo-code" className="flex items-center gap-2 hover:text-white">
                                    <Star size={16} /> Promo Code
                                </Link>
                                <Link to="/term-settings" className="flex items-center gap-2 hover:text-white">
                                    <ShoppingBag size={16} /> T&C
                                </Link>
                                <Link to="/faq-settings" className="flex items-center gap-2 hover:text-white">
                                    <ShoppingBag size={16} /> FAQ
                                </Link>
                                <Link to="/about-settings" className="flex items-center gap-2 hover:text-white">
                                    <ShoppingBag size={16} /> About
                                </Link>
                                <Link to="/vip-level" className="flex items-center gap-2 hover:text-white">
                                    <Users size={16} /> VIP Level
                                </Link>
                                <Link to="/slide-show-settings" className="flex items-center gap-2 hover:text-white">
                                    <Layers size={16} /> Slide Show settings
                                </Link>
                                <Link to="/customer-service" className="flex items-center gap-2 hover:text-white">
                                    <Headset size={16} /> Customer Service
                                </Link>
                            </div>
                        )}
                    </div>
                }
                <div className="mt-4">
                    <button
                        onClick={handleUserInteraction}
                        className="flex items-center gap-2 w-full px-4 py-2 bg-[#25ac0a] rounded font-semibold text-white hover:bg-[#25ac0ad2]"
                    >
                        <Bell size={20} />
                        {hasInteracted ? "Sound Active" : "Enable Sound"}
                    </button>
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 bg-pink-600 rounded font-semibold text-white hover:bg-pink-500"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Header;
