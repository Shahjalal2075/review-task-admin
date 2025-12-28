import React, { useState, useEffect, useContext } from 'react';
import ReportTable from './ReportTable';
import { AuthContext } from '../../Providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const FillReport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState({
    username: '',
    amount: '',
    type: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depositRes, withdrawRes] = await Promise.all([
        fetch('https://server.amazonkindlerating.com/deposit'),
        fetch('https://server.amazonkindlerating.com/withdraw')
      ]);

      const [depositData, withdrawData] = await Promise.all([
        depositRes.json(),
        withdrawRes.json()
      ]);

      const deposits = depositData
        .filter(item =>
          (item.status === 'Success' || item.status === 'Approved') &&
          item.depositType !== 'Deductbalance'
        )
        .map(item => ({
          username: item.username,
          amount: item.amount,
          time: item.depositTime,
          type: 'deposit'
        }));

      const withdraws = withdrawData
        .filter(item => item.status === 'Success' || item.status === 'Approved')
        .map(item => ({
          username: item.username,
          amount: item.amount,
          time: item.submissionTime,
          type: 'withdraw'
        }));

      const combined = [...deposits, ...withdraws];

      combined.sort((a, b) => new Date(b.time) - new Date(a.time));

      setOriginalData(combined);
      setFilteredData(combined);
      setLoading(false);

    } catch (error) {
      console.error('Fetching error:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = originalData.filter(row =>
      (!searchInput.username || row.username.toLowerCase().includes(searchInput.username.toLowerCase())) &&
      (!searchInput.amount || row.amount.toString().includes(searchInput.amount)) &&
      (searchInput.type === 'all' || row.type === searchInput.type) &&
      (!searchInput.startDate || new Date(row.time) >= new Date(searchInput.startDate)) &&
      (!searchInput.endDate || new Date(row.time) <= new Date(searchInput.endDate))
    );
    setFilteredData(filtered);
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput({ username: '', amount: '', type: 'all', startDate: '', endDate: '' });
    setFilteredData(originalData);
    setPage(1);
  };

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="p-4 space-y-6 bg-gradient-to-tr from-blue-100 to-purple-200 min-h-screen">
      <div>
        <h2 className="text-xl font-bold">Inquiry conditions</h2>
        <div className="grid md:grid-cols-6 gap-2 mt-2 items-end">

          <input
            className="p-2 border rounded"
            placeholder="Username"
            value={searchInput.username}
            onChange={e => setSearchInput({ ...searchInput, username: e.target.value })}
          />

          <input
            className="p-2 border rounded"
            placeholder="Amount"
            value={searchInput.amount}
            onChange={e => setSearchInput({ ...searchInput, amount: e.target.value })}
          />

          <select
            className="p-2 border rounded"
            value={searchInput.type}
            onChange={e => setSearchInput({ ...searchInput, type: e.target.value })}
          >
            <option value="all">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>

          <input
            className="p-2 border rounded"
            type="date"
            value={searchInput.startDate}
            onChange={e => setSearchInput({ ...searchInput, startDate: e.target.value })}
          />

          <input
            className="p-2 border rounded"
            type="date"
            value={searchInput.endDate}
            onChange={e => setSearchInput({ ...searchInput, endDate: e.target.value })}
          />

          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              className="bg-white border border-gray-400 px-4 py-2 rounded"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">Fill report</h2>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">SL</th>
                <th className="p-2 text-left">Member Information</th>
                <th className="p-2 text-left">Current Balance</th>
                <th className="p-2 text-left">Total Recharge</th>
                <th className="p-2 text-left">Total Withdraw</th>
                <th className="p-2 text-left">Transaction Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <ReportTable
                  key={idx}
                  row={row}
                  page={page}
                  pageSize={pageSize}
                  idx={idx}
                />
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-4 flex justify-center gap-1 flex-wrap">
          {/* First page */}
          {page > 3 && (
            <>
              <button
                className="px-3 py-1 rounded bg-white border"
                onClick={() => setPage(1)}
              >
                1
              </button>
              {page > 4 && <span className="px-2">...</span>}
            </>
          )}

          {/* Middle pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === page || p === page - 1 || p === page + 1)
            .map(p => (
              <button
                key={p}
                className={`px-3 py-1 rounded ${page === p ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

          {/* Last page */}
          {page < totalPages - 2 && (
            <>
              {page < totalPages - 3 && <span className="px-2">...</span>}
              <button
                className="px-3 py-1 rounded bg-white border"
                onClick={() => setPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default FillReport;
