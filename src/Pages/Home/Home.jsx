import { Users, Upload, Newspaper, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

const Home = () => {

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://review-task-server.vercel.app/user-list');
                const data = await response.json();
                const nowStats = [
                    { title: "Total Users", count: data.length, icon: <Users size={40} className="text-blue-500 mb-2" /> },
                    { title: "Total Releases", count: 0, icon: <Upload size={40} className="text-indigo-500 mb-2" /> },
                    { title: "Total News", count: 0, icon: <Newspaper size={40} className="text-purple-500 mb-2" /> },
                    { title: "Total Orders", count: 0, icon: <ShoppingCart size={40} className="text-pink-500 mb-2" /> }
                ]
                setStats(nowStats);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching member data:', error);
            }
        };
        fetchData();
    }, []);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-[#f0f4ff] to-[#e0e7ff]">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
                Dashboard Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-300"
                    >
                        {stat.icon}
                        <h3 className="text-xl font-semibold text-gray-700">{stat.title}</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{stat.count}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
