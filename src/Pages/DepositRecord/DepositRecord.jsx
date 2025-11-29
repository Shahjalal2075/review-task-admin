import React, { useEffect, useState } from 'react';

const DepositRecord = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({
    username: '',
    transactionStatus: '',
    startDate: '',
    endDate: '',
  });
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 25;

  // Fetch data
  useEffect(() => {
    fetch(`https://review-task-server.vercel.app/deposit`)
      .then((res) => res.json())
      .then((resData) => {
        const sortedData = resData.sort(
          (a, b) => new Date(b.depositTime) - new Date(a.depositTime)
        );
        setData(sortedData);
        setFilteredData(sortedData); // initially show all
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  // Filter data when "Search" is clicked
  const handleSearch = () => {
    const username = search.username.trim().toLowerCase();
    const transactionStatus = search.transactionStatus.trim().toLowerCase();
    const startDate = search.startDate;
    const endDate = search.endDate;
  
    const filtered = data.filter((item) => {
      console.log(item);
      const matchesUsername = username
        ? item?.username.toLowerCase().includes(username)
        : true;
  
      const matchesStatus = transactionStatus
        ? item.status.toLowerCase() === transactionStatus
        : true;
  
      const depositDate = new Date(item.depositTime);
      const matchesStartDate = startDate ? depositDate >= new Date(startDate) : true;
      const matchesEndDate = endDate ? depositDate <= new Date(endDate) : true;
  
      return matchesUsername && matchesStatus && matchesStartDate && matchesEndDate;
    });
  
    setFilteredData(filtered);
    setCurrentPage(1);
  };
  

  const handleReset = () => {
    setSearch({
      username: '',
      transactionStatus: '',
      startDate: '',
      endDate: '',
    });
    setFilteredData(data);
    setCurrentPage(1);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-6 bg-gradient-to-tr from-pink-50 to-purple-100 space-y-6">
      <h3 className="text-2xl font-bold text-purple-700">Deposit Record</h3>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded shadow">
        <input
          name="username"
          placeholder="Username"
          value={search.username}
          onChange={handleChange}
          className="border border-purple-300 px-2 py-1 rounded"
        />
        <select
          name="transactionStatus"
          value={search.transactionStatus}
          onChange={handleChange}
          className="border border-purple-300 px-2 py-1 rounded"
        >
          <option value="">All Transaction Status</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
        </select>
        <input
          type="date"
          name="startDate"
          value={search.startDate}
          onChange={handleChange}
          className="border border-purple-300 px-2 py-1 rounded"
        />
        <input
          type="date"
          name="endDate"
          value={search.endDate}
          onChange={handleChange}
          className="border border-purple-300 px-2 py-1 rounded"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto bg-white shadow rounded mt-4">
        {paginatedData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No records found.</div>
        ) : (
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-purple-100 text-purple-700">
              <tr>
                <th className="p-3 border border-gray-200">SL</th>
                <th className="p-3 border border-gray-200">Member Info</th>
                <th className="p-3 border border-gray-200">Deposit Type</th>
                <th className="p-3 border border-gray-200">Amount</th>
                <th className="p-3 border border-gray-200">Status</th>
                <th className="p-3 border border-gray-200">Deposit At</th>
                <th className="p-3 border border-gray-200">Operator</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => (
                <tr key={item._id} className="hover:bg-purple-50">
                  <td className="p-3 border border-gray-200 text-center">
                    {(currentPage - 1) * recordsPerPage + idx + 1}
                  </td>
                  <td className="p-3 border border-gray-200">
                    <p><strong>Username:</strong> {item.username}</p>
                  </td>
                  <td className="p-3 border border-gray-200">{item.depositType}</td>
                  <td className="p-3 border border-gray-200">{item.amount} USDT</td>
                  <td className={`p-3 border border-gray-200 font-semibold ${item.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.status}
                  </td>
                  <td className="p-3 border border-gray-200">{formatDate(item.depositTime)}</td>
                  <td className="p-3 border border-gray-200">{item.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-white text-gray-800 border hover:bg-gray-100 disabled:bg-gray-300"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 7) return true;
              if (currentPage <= 4) return page <= 5 || page === totalPages;
              if (currentPage >= totalPages - 3)
                return page >= totalPages - 4 || page === 1;
              return (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              );
            })
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              const showDots = prev && page - prev > 1;

              return (
                <React.Fragment key={page}>
                  {showDots && <span className="px-2">...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded border text-sm ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-800 hover:bg-purple-100'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-white text-gray-800 border hover:bg-gray-100 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DepositRecord;
