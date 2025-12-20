import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { AuthContext } from '../../Providers/AuthProvider';

const DepositRecord = () => {
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

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' or 'success'
    item: null,
    newStatus: '',
    title: '',
    message: ''
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Approved', label: '✅ Approve' },
    { value: 'Rejected', label: '❌ Cancel' }
  ];

  // Helper to parse "DD/MM/YYYY, HH:MM:SS" or ISO string
  const parseDateStr = (dateStr) => {
    if (!dateStr) return new Date(0);
    try {
      if (dateStr.includes(',')) {
        const [datePart, timePart] = dateStr.split(', ');
        const [day, month, year] = datePart.split('/');
        return new Date(`${year}-${month}-${day}T${timePart}`);
      }
      return new Date(dateStr);
    } catch (e) {
      return new Date(0);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('https://review-task-server.vercel.app/deposit');
      const data = await response.json();
      const formattedData = data
        .map((item, index) => {
          const parsedDate = parseDateStr(item.submissionTime);

          return {
            id: item._id,
            memberId: data.length - index,
            account: `${item.username}`,
            phone: item.phone,
            email: item.email,
            type: item.type || 'TRX',
            amount: Number(item.amount),
            submissionTime: item.submissionTime,
            parsedSubmissionTime: parsedDate,
            auditTime: item.auditTime,
            trxID: item.trxID,
            senderNumber: item.senderNumber,
            wallet: item.agent,
            status: item.status,
            operator: item.operator === 'None' ? '-' : item.operator,
          };
        })
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
        setActiveDropdownId(null);
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
      const submissionDate = item.parsedSubmissionTime;
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

  const handleCopy = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWalletId(id);
      toast.success("Copied!");
      setTimeout(() => setCopiedWalletId(null), 1000);
    } catch (err) {
      toast.error("Failed to copy.");
    }
  }, []);

  // 1. Open Confirm Modal
  const initiateStatusUpdate = (item, newStatus) => {
    if (item.status !== 'Pending') {
      toast.warning(`Request is already ${item.status}`);
      return;
    }
    setModalState({
      isOpen: true,
      type: 'confirm',
      item: item,
      newStatus: newStatus,
      title: `Confirm ${newStatus}`,
      message: `Are you sure you want to ${newStatus.toLowerCase()} this deposit request of ৳${item.amount}?`
    });
    setActiveDropdownId(null);
  };

  // 2. Execute Update
  const confirmStatusUpdate = async () => {
    const { item, newStatus } = modalState;
    if (!item) return;


    try {
      console.log(item);
      const depositRes = await fetch(`https://review-task-server.vercel.app/deposit/${item.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!depositRes.ok) throw new Error("Failed to update deposit status");

      // If Approved, Update Balance
      if (newStatus === 'Approved') {
        const userRes = await fetch(`https://review-task-server.vercel.app/user-list/${item.email}`);
        const userData = await userRes.json();

        if (userData && userData.totalBal !== undefined) {
          const depositBal = {
            totalBal: (userData.totalBal) + parseFloat(item.amount),
            totalDeposit: (userData.totalDeposit) + parseFloat(item.amount),
            totalWithdraw: userData.totalWithdraw
          };

          await fetch(`https://review-task-server.vercel.app/user-list/bal-update/${item.email}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(depositBal)
          });
        }
      }

      // Optimistic UI Update
      const updatedList = originalData.map(row =>
        row.id === item.id ? { ...row, status: newStatus } : row
      );
      setOriginalData(updatedList);
      setFilteredData(prev => prev.map(row => row.id === item.id ? { ...row, status: newStatus } : row));

      // Show Success Modal
      setModalState({
        isOpen: true,
        type: 'success',
        item: null,
        newStatus: '',
        title: 'Success!',
        message: `Request has been ${newStatus.toLowerCase()} successfully.`
      });

    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Error updating status.');
      setModalState({ ...modalState, isOpen: false });
    }
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-6 pb-24 font-sans relative">
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="text-3xl font-bold text-center mb-8 text-purple-700">Deposit Record</h3>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <input name="memberId" value={filters.memberId} onChange={handleInputChange} className="p-2 border rounded shadow-inner w-full" placeholder="Member ID" />
        <input name="account" value={filters.account} onChange={handleInputChange} className="p-2 border rounded shadow-inner w-full" placeholder="Username" />
        <select name="status" value={filters.status} onChange={handleInputChange} className="p-2 border rounded shadow-inner w-full bg-white">
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
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
      <div className="overflow-x-auto bg-white rounded-xl shadow min-h-screen">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-purple-200 to-indigo-200 text-indigo-900 text-sm font-semibold">
            <tr>
              {['User Info', 'Method', 'Amount', 'TrxID', 'Sender', 'Time', 'Status', 'Action'].map(header => (
                <th key={header} className="p-3 border text-center" scope="col">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map(item => (
              <tr key={item.id} className="text-center even:bg-purple-50 odd:bg-white hover:bg-purple-100 transition-all duration-200">
                <td className="p-2 border text-left">
                  <div className="font-bold">{item.account}</div>
                  <div className="text-xs text-gray-500">{item.phone}</div>
                </td>
                <td className="p-2 border capitalize">{item.type}</td>
                <td className="p-2 border text-green-600 font-bold">+৳{item.amount}</td>
                <td className="p-2 border font-mono text-xs cursor-pointer hover:bg-gray-100" onClick={() => handleCopy(item.trxID, item.id)} title="Copy TrxID">
                  {item.trxID}
                </td>
                <td className="p-2 border font-mono text-xs cursor-pointer hover:bg-gray-100" onClick={() => handleCopy(item.senderNumber, item.id)} title="Copy Number">
                  {item.senderNumber}
                </td>
                <td className="p-2 border text-xs">{item.submissionTime}</td>

                {/* Status Badge */}
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${item.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                      item.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                    {item.status}
                  </span>
                </td>

                {/* Action Dropdown */}
                <td className="p-2 border relative">
                  <button
                    onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                    className={`px-3 py-1 border rounded shadow text-xs font-medium w-24
                      ${item.status !== 'Pending' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-indigo-50 text-indigo-600'}`}
                    disabled={item.status !== 'Pending'}
                  >
                    {item.status === 'Pending' ? 'Action ▼' : 'Completed'}
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdownId === item.id && item.status === 'Pending' && (
                    <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg z-50 w-32 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => initiateStatusUpdate(item, 'Approved')}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 text-sm font-medium border-b"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => initiateStatusUpdate(item, 'Rejected')}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-medium"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-500 italic">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-3 py-4 mt-4">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Next</button>
        </div>
      )}

      {/* --- Action Modal (Confirm & Success) --- */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100 animate-in zoom-in-95 relative">

            {modalState.type === 'confirm' ? (
              <>
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modalState.newStatus === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{modalState.title}</h3>
                <p className="text-gray-500 mb-6 text-sm">{modalState.message}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalState({ ...modalState, isOpen: false })}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    className={`flex-1 py-2.5 text-white rounded-xl font-medium transition-colors ${modalState.newStatus === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 text-green-600">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{modalState.title}</h3>
                <p className="text-gray-500 mb-6 text-sm">{modalState.message}</p>
                <button
                  onClick={() => setModalState({ ...modalState, isOpen: false })}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Okay
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DepositRecord;