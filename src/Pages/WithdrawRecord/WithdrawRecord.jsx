import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../Providers/AuthProvider';

const WithdrawRecord = () => {
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    memberId: '',
    account: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [copiedWalletId, setCopiedWalletId] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const statusLabels = {
    approve: '✅ Approve',
    cancel: '❌ Cancel',
    hold: '⏸️ Hold',
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'hold', label: '⏸️ Hold' },
    { value: 'cancel', label: '❌ Cancel' },
    { value: 'approve', label: '✅ Approve' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // If it's already in the custom format "DD/MM/YYYY, HH:mm:ss", just return it
    if (dateStr.includes('/')) return dateStr;
    
    const date = new Date(dateStr);
    return isNaN(date) ? '-' : date.toLocaleString();
  };

  // Helper function to parse "DD/MM/YYYY, HH:mm:ss" to JS Date object
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Check if it matches "DD/MM/YYYY, HH:mm:ss" format
      if (dateStr.includes(',')) {
        const [datePart, timePart] = dateStr.split(', ');
        const [day, month, year] = datePart.split('/');
        // Note: Month is 0-indexed in JS Date
        return new Date(`${year}-${month}-${day}T${timePart}`);
      }
      // Fallback for standard ISO strings
      return new Date(dateStr);
    } catch (e) {
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('https://review-task-server.vercel.app/withdraw');
      const data = await response.json();
      const formattedData = data
        .map((item, index) => {
           // Parse the date strictly for sorting
           const parsedDate = parseDateStr(item.submissionTime);
           
           return {
            id: item._id,
            memberId: data.length - index,
            account: `${item.username}`,
            phone: item.phone,
            email: item.email,
            type: item.type || 'TRX', // Use item.type if available
            cashWithdraw: Number(item.amount),
            paymentAmount: Number(item.amount),
            handlingFee: parseFloat((Number(item.amount) * 0.05).toFixed(2)),
            submissionTime: item.submissionTime, // Keep original string for display
            parsedSubmissionTime: parsedDate, // Store object for sorting/filtering
            auditTime: item.auditTime,
            wallet: item.wallet,
            status: item.status.toLowerCase(),
            operator: item.operator === 'None' ? '-' : item.operator,
          };
        })
        // Sort by parsedSubmissionTime (Newest first)
        .sort((a, b) => b.parsedSubmissionTime - a.parsedSubmissionTime);

      setOriginalData(formattedData);
      setFilteredData(formattedData);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Failed to load records. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    const result = originalData.filter((item) => {
      // Use the parsed date object we created during mapping
      const submissionDate = item.parsedSubmissionTime;
      
      // Setup filter dates (Start of day for start date, End of day for end date)
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);

      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);

      return (
        (!filters.memberId || item.memberId.toString().includes(filters.memberId)) &&
        (!filters.account || item.account.toLowerCase().includes(filters.account.toLowerCase())) &&
        (!filters.status || item.status === filters.status) &&
        (!startDate || (submissionDate && submissionDate >= startDate)) &&
        (!endDate || (submissionDate && submissionDate <= endDate))
      );
    });
    setFilteredData(result);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      memberId: '',
      account: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setFilteredData(originalData);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setItemsPerPage(value);
      setCurrentPage(1);
    }
  };

  const handleCopyWallet = useCallback(async (wallet, id) => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedWalletId(id);
      toast.success("Wallet copied!");
      setTimeout(() => setCopiedWalletId(null), 1000);
    } catch (err) {
      toast.error("Failed to copy wallet.");
    }
  }, []);

  const handleStatusUpdate = async (item, newStatus) => {
    const userEmail = item.email || item.phone;
    const timestamp = new Date().toISOString();
    try {
      const userRes = await fetch(`https://review-task-server.vercel.app/user-list/${userEmail}`);
      const userData = await userRes.json();
      const depositBal = {
        totalBal: userData.totalBal + parseFloat(item.cashWithdraw),
        totalDeposit: userData.totalDeposit,
        totalWithdraw: userData.totalWithdraw - parseFloat(item.cashWithdraw)
      };

      if (newStatus === 'hold') {
        await fetch(`https://review-task-server.vercel.app/withdraw/${item.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: "Hold", operator: user.name, auditTime: timestamp })
        });
      } else if (newStatus === 'approve') {
        await fetch(`https://review-task-server.vercel.app/withdraw/${item.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: "Approved", operator: user.name, auditTime: timestamp })
        });
      } else if (newStatus === 'cancel') {
        await fetch(`https://review-task-server.vercel.app/user-list/bal-update/${userEmail}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(depositBal)
        });
        await fetch(`https://review-task-server.vercel.app/withdraw/${item.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: "Rejected", operator: user.name, auditTime: timestamp })
        });
      }

      toast.success(`Status updated to ${newStatus}`);
      setFilteredData(prev =>
        prev.map(row =>
          row.id === item.id ? { ...row, status: newStatus } : row
        )
      );
      setOriginalData(prev =>
        prev.map(row =>
          row.id === item.id ? { ...row, status: newStatus } : row
        )
      );
      setActiveDropdownId(null);
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Error updating status.');
    }
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-6 pb-24">
      <ToastContainer />
      <h3 className="text-3xl font-bold text-center mb-8 text-purple-700">Withdraw Record</h3>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <input name="memberId" value={filters.memberId} onChange={handleInputChange} className="p-2 border rounded shadow-inner w-full" placeholder="Member ID" />
        <input name="account" value={filters.account} onChange={handleInputChange} className="p-2 border rounded shadow-inner w-full" placeholder="Account" />
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowStatusDropdown(!showStatusDropdown)} className="p-2 border rounded shadow-inner w-full bg-white text-left">
            {statusOptions.find(opt => opt.value === filters.status)?.label || 'All Status'}
          </button>
          {showStatusDropdown && (
            <ul className="absolute z-10 mt-1 bg-white border rounded shadow w-full">
              {statusOptions.map(option => (
                <li key={option.value} onClick={() => {
                  setFilters({ ...filters, status: option.value });
                  setShowStatusDropdown(false);
                }} className="px-4 py-2 hover:bg-purple-100 cursor-pointer text-sm">
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input name="startDate" type="date" value={filters.startDate} onChange={handleInputChange} className="p-2 border rounded shadow-inner w-full" />
        <input name="endDate" type="date" value={filters.endDate} onChange={handleInputChange} className="p-2 border rounded shadow-inner w-full" />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={handleSearch} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 shadow-md">Search</button>
        <button onClick={handleReset} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 shadow-md">Reset</button>
        <button onClick={fetchData} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 shadow-md">Reload</button>
      </div>

      {loading && <div className="text-center text-indigo-600 mb-4">Loading records...</div>}
      {error && <div className="text-red-600 text-center my-4">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-purple-200 to-indigo-200 text-indigo-900 text-sm font-semibold">
            <tr>
              {['Member ID', 'Account', 'Type', 'Withdraw', 'Payment', 'Submitted', 'Audited', 'Wallet', 'Status', 'Operator'].map(header => (
                <th key={header} className="p-3 border" scope="col">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map(item => (
              <tr key={item.id} className="text-center even:bg-purple-50 odd:bg-white hover:bg-purple-100 transition-all duration-200">
                <td className="p-2 border">{item.memberId}</td>
                <td className="p-2 border">{item.account}</td>
                <td className="p-2 border">{item.type}</td>
                <td className="p-2 border text-blue-600 font-semibold">{item.cashWithdraw}</td>
                <td className="p-2 border">{item.paymentAmount}</td>
                <td className="p-2 border">{item.submissionTime}</td>
                <td className="p-2 border">{formatDate(item.auditTime)}</td>
                <td className="p-2 border cursor-pointer hover:bg-indigo-100 transition rounded text-indigo-700 font-mono" onClick={() => handleCopyWallet(item.wallet, item.id)} title="Click to copy">
                  {item.wallet}
                  {copiedWalletId === item.id && <span className="ml-2 text-green-600 text-xs font-semibold">Copied!</span>}
                </td>
                <td className="p-2 border relative">
                  <button
                    onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                    className={`px-2 py-1 border rounded shadow text-sm w-full
      ${item.status === 'approved' ? 'bg-green-100 text-green-700 cursor-not-allowed' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-700 cursor-not-allowed' :
                          'bg-white hover:bg-purple-100'}`}
                    disabled={item.status === 'approved' || item.status === 'rejected'}
                  >
                    {item.status === 'approved' ? '✅ Approved' :
                      item.status === 'rejected' ? '❌ Rejected' :
                        item.status === 'rejected' ? '⏸️ Hold' :
                          statusLabels[item.status] || 'Set Status'}
                  </button>

                  {/* Show dropdown only if not approved or rejected */}
                  {activeDropdownId === item.id && item.status !== 'approve' && item.status !== 'cancel' && (
                    <ul className="absolute left-0 mt-1 bg-white border rounded shadow w-32 z-20">
                      {statusOptions.filter(opt => opt.value).map(opt => (
                        <li
                          key={opt.value}
                          onClick={() => handleStatusUpdate(item, opt.value)}
                          className="px-4 py-1 hover:bg-purple-100 cursor-pointer text-sm"
                        >
                          {opt.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>

                <td className="p-2 border">{item.operator}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="11" className="text-center p-6 text-gray-500 italic">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-3 py-2 px-4 mt-8">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white text-gray-800 hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded border text-sm ${currentPage === i + 1 ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 hover:bg-purple-100'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white text-gray-800 hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500">Next</button>
          <div className="ml-4 flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-700 font-medium">Show:</label>
            <input type="number" id="pageSize" value={itemsPerPage} onChange={handlePageSizeChange} className="w-16 p-1 border rounded text-center text-sm" min="1" />
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawRecord;