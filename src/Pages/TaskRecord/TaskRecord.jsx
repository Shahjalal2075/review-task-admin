import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskRecord = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ username: '', product_id: '', status: '' });
  const [loading, setLoading] = useState(true);
  const pageSize = 500;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://review-task-server.vercel.app/user-tasks/');
        // Sort by taskStart descending
        const sortedData = res.data.sort((a, b) => new Date(b.taskStart) - new Date(a.taskStart));
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ username: '', product_id: '', status: '' });
  };

  // Apply filters
  const filteredData = data.filter((item) => {
    const matchUsername =
      filters.username === '' || item.username.toLowerCase().includes(filters.username.toLowerCase());
    const matchProductId =
      filters.product_id === '' || item.product_id.toLowerCase().includes(filters.product_id.toLowerCase());
    const matchStatus =
      filters.status === '' || item.status.toLowerCase().includes(filters.status.toLowerCase());
    return matchUsername && matchProductId && matchStatus;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="p-4 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <input
            name="username"
            value={filters.username}
            onChange={handleFilterChange}
            type="text"
            placeholder="Username"
            className="border rounded-md px-3 py-2 w-40"
          />
          <input
            name="product_id"
            value={filters.product_id}
            onChange={handleFilterChange}
            type="text"
            placeholder="Task ID"
            className="border rounded-md px-3 py-2 w-40"
          />
          <input
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            type="text"
            placeholder="Status"
            className="border rounded-md px-3 py-2 w-40"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Search</button>
          <button onClick={handleReset} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">
            Reset
          </button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-lg">Loading data...</div>
      ) : (
        <div className="overflow-auto bg-white dark:bg-gray-800 shadow rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">SL</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Task Title</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Profit</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">Complete</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item, idx) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-2">{item.username}</td>
                  <td className="px-4 py-2">{item.title}</td>
                  <td className="px-4 py-2">{item.amount}</td>
                  <td className="px-4 py-2">{item.profit}</td>
                  <td className="px-4 py-2">{item.taskStart}</td>
                  <td className="px-4 py-2">{item.taskEnd}</td>
                  <td className="px-4 py-2">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-wrap justify-center items-center gap-2 p-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRecord;
