import React, { useEffect, useState } from 'react';

const WalletRecord = () => {
    const [filters, setFilters] = useState({
        memberId: '',
        Account: '',
        outputType: '',
        userType: '',
        startDate: '',
        endDate: '',
    });

    const [records, setRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            const fakeData = Array.from({ length: 23 }, (_, i) => ({
                serialNumber: 1530750 + i,
                memberId: 3597,
                Account: `Rmodesto077${i}@wallet.io`,
                amountBefore: (Math.random() * 100 + 1).toFixed(2),
                changeAmount: (Math.random() * 100).toFixed(2),
                amountAfter: (Math.random() * 100 - 50).toFixed(2),
                type: 'Robbing deduction',
                changeDate: `2025-04-10 11:18:${(30 + i).toString().padStart(2, '0')}`,
            }));
            setRecords(fakeData); // ← removed setTimeout
        };

        fetchData();
    }, []);

    const handleReset = () => {
        setFilters({
            memberId: '',
            Account: '',
            outputType: '',
            userType: '',
            startDate: '',
            endDate: '',
        });
    };

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = records.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(records.length / recordsPerPage);

    return (
        <div className="min-h-screen bg-gradient-to-tr from-purple-100 to-blue-100 p-6 text-sm text-gray-800 font-sans">
            <h2 className="text-2xl font-bold mb-4 text-purple-700">Inquiry Conditions</h2>

            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Member ID"
                    value={filters.memberId}
                    onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-40 focus:ring-2 ring-purple-400"
                />
                <input
                    type="text"
                    placeholder="Member account"
                    value={filters.Account}
                    onChange={(e) => setFilters({ ...filters, Account: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-48 focus:ring-2 ring-purple-400"
                />
                <select
                    value={filters.outputType}
                    onChange={(e) => setFilters({ ...filters, outputType: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-56 focus:ring-2 ring-purple-400"
                >
                    <option value="">All output types</option>
                    <option>Fill value</option>
                    <option>Agency commission revenue</option>
                    <option>Grab single income</option>
                    <option>Backstage gift</option>
                    <option>Reflect failure</option>
                    <option>Registered gift</option>
                </select>
                <select
                    value={filters.userType}
                    onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-48 focus:ring-2 ring-purple-400"
                >
                    <option value="">All users</option>
                    <option>Official user</option>
                    <option>Internal user</option>
                </select>
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="border border-gray-300 p-2 rounded focus:ring-2 ring-purple-400"
                />
                <span className="flex items-center">-</span>
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="border border-gray-300 p-2 rounded focus:ring-2 ring-purple-400"
                />
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
                    Search
                </button>
                <button
                    onClick={handleReset}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                    Reset
                </button>
            </div>

            <h2 className="text-lg font-semibold mb-3 text-green-700">Wallet Running Water Details</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full border text-left text-sm bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-green-200 via-blue-100 to-purple-200 text-gray-800">
                        <tr>
                            <th className="p-3 border">Serial number</th>
                            <th className="p-3 border">Member ID</th>
                            <th className="p-3 border">Member account</th>
                            <th className="p-3 border">Amount before change</th>
                            <th className="p-3 border">Change amount</th>
                            <th className="p-3 border">Amount after change</th>
                            <th className="p-3 border">Type</th>
                            <th className="p-3 border">Change date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.map((record, index) => (
                            <tr
                                key={index}
                                className={`hover:bg-yellow-100 transition ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-purple-50'
                                }`}
                            >
                                <td className="p-3 border">{record.serialNumber}</td>
                                <td className="p-3 border">{record.memberId}</td>
                                <td className="p-3 border relative group">
                                    <span className="cursor-pointer underline decoration-dotted">
                                        {record.Account.slice(0, 12)}...
                                    </span>
                                    <div className="absolute z-10 hidden group-hover:block bg-white text-xs border p-2 rounded shadow-md top-full mt-1 left-0 whitespace-nowrap">
                                        {record.Account}
                                    </div>
                                </td>
                                <td className="p-3 border">{record.amountBefore}</td>
                                <td className="p-3 border text-red-600 font-semibold">{record.changeAmount}</td>
                                <td className="p-3 border text-green-600">{record.amountAfter}</td>
                                <td className="p-3 border">{record.type}</td>
                                <td className="p-3 border">{record.changeDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex justify-center items-center gap-2">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-purple-500 text-white rounded disabled:bg-gray-300"
                >
                    Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded border ${
                            currentPage === i + 1
                                ? 'bg-purple-600 text-white'
                                : 'bg-white hover:bg-purple-100 text-gray-700'
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-purple-500 text-white rounded disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default WalletRecord;
