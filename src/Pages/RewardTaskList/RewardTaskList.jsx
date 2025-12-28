import { useEffect, useState } from 'react';

const RewardTaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchRunningTask, setSearchRunningTask] = useState('');

    useEffect(() => {
        fetch('https://server.amazonkindlerating.com/reward-task')
            .then((res) => res.json())
            .then((data) => {
                setTasks(data);
                setFilteredTasks(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const handleSearch = () => {
        const filtered = tasks.filter((task) => {
            const emailMatch = task.username.toLowerCase().includes(searchEmail.toLowerCase());
            const runMatch = searchRunningTask
                ? task.targetTask === parseInt(searchRunningTask)
                : true;
            return emailMatch && runMatch;
        });
        setFilteredTasks(filtered);
    };

    const handleReset = () => {
        setSearchEmail('');
        setSearchRunningTask('');
        setFilteredTasks(tasks);
    };

    const handleDelete = (id) => {
        fetch(`https://server.amazonkindlerating.com/reward-task/${id}`, {
            method: 'DELETE',
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.deletedCount > 0) {
                    const updated = tasks.filter((task) => task._id !== id);
                    setTasks(updated);
                    setFilteredTasks(updated);
                }
            })
            .catch((err) => console.error('Delete failed:', err));
    };

    return (
        <div className="mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 pb-10">
                Reward Task List
            </h1>

            {/* Search Panel */}
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-wrap gap-4 justify-between items-end mb-10 border border-gray-200">
                <div className="w-full md:w-auto flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Search by Username"
                    />
                </div>
                {/* <div className="w-full md:w-auto flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Target Task</label>
                    <input
                        type="number"
                        value={searchRunningTask}
                        onChange={(e) => setSearchRunningTask(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. 5"
                    />
                </div> */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSearch}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-md font-semibold shadow hover:shadow-lg transition"
                    >
                        🔍 Search
                    </button>
                    <button
                        onClick={handleReset}
                        className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-2 rounded-md font-semibold shadow hover:shadow-lg transition"
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Task Cards */}
            {filteredTasks.length === 0 ? (
                <p className="text-center text-gray-500 text-lg font-medium">No matching tasks found.</p>
            ) : (
                filteredTasks.map((task) => (
                    <div
                        key={task._id}
                        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition mb-8"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-sm space-y-1">
                                <p><span className="font-semibold text-gray-700">📧 Username:</span> {task.username}</p>
                                <p><span className="font-semibold text-gray-700">🎯 Maximum Point:</span> {task.maximumRewardPoint}</p>
                                <p><span className="font-semibold text-gray-700">⏳ Running Task:</span> {task.runingTask - 1}</p>
                                <p><span className="font-semibold text-gray-700">🧾 Task Size:</span> {task.taskSize}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(task._id)}
                                className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-md font-medium shadow hover:shadow-lg transition"
                            >
                                🗑 Delete
                            </button>
                        </div>

                        {/* Task Table */}
                        <div className="overflow-x-auto mt-3">
                            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
                                <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 font-semibold">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Product ID</th>
                                        <th className="border px-4 py-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {task.taskList.map((item, index) => (
                                        <tr
                                            key={item._id}
                                            className="text-center hover:bg-gray-50 transition"
                                        >
                                            <td className="border px-4 py-2">{index + 1}</td>
                                            <td className="border px-4 py-2">{item.product_id}</td>
                                            <td className="border px-4 py-2">৳{item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default RewardTaskList;
