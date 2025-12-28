import React, { useEffect, useState } from 'react';
import BindWalletModal from './BindWalletModal';

const UsdtAddress = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchAccount, setSearchAccount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const pageSize = 25;
  const [editWalltInfo, setEditWalletInfo] = useState(null);

  // Fetch data from API
  useEffect(() => {
    fetch('https://server.amazonkindlerating.com/wallet')
      .then((res) => res.json())
      .then((resData) => {
        setData([...resData].reverse());
        setFilteredData([]);
      });
  }, []);

  const handleSearch = () => {
    const filtered = data.filter((item) =>
      (searchId ? item._id.includes(searchId) : true) &&
      (searchAccount ? item.username.toLowerCase().includes(searchAccount.toLowerCase()) : true)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleEditWallet = (item) => {
    setEditWalletInfo(item);
    setShowWalletModal(true);
  }
  const handleDelete = (id) => {
    console.log(id)
    fetch(`https://server.amazonkindlerating.com/wallet/${id}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then((data) => {
        console.log("Delete Response:", data);
        setFilteredData(filteredData.filter(job => job._id !== id));
      })
      .catch(err => console.error("Error deleting notification:", err));

  };

  return (
    <div className="p-6 bg-gradient-to-tr from-blue-50 to-purple-100 min-h-screen text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Wallet Address Record</h2>

      {/* Search Section */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded shadow-md">
        <input
          type="text"
          placeholder="Member ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="border border-blue-300 rounded p-2 w-full sm:w-40"
        />
        <input
          type="text"
          placeholder="Member account"
          value={searchAccount}
          onChange={(e) => setSearchAccount(e.target.value)}
          className="border border-blue-300 rounded p-2 w-full sm:w-40"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Search
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-blue-200 text-blue-900">
            <tr>
              <th className="p-2 text-left">Serial Number</th>
              <th className="p-2 text-left">Member Information</th>
              <th className="p-2 text-left">Wallet Information</th>
              <th className="p-2 text-center">Operation</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item._id} className="border-t hover:bg-blue-50 transition">
                <td className="p-3">
                  <span className="border border-yellow-500 rounded px-2 py-0.5">{(currentPage - 1) * pageSize + index + 1}</span>
                </td>
                <td className="p-3">
                  <div>Account: {item.username}</div>
                  <div className="text-green-700 font-medium">Phone: {item.phone || 'N/A'}</div>
                  <div className="text-green-700 font-medium">Email: {item.email || 'N/A'}</div>
                </td>
                <td className="p-3">
                  <div>Cumulative recharge: {item.walletType}</div>
                  <div>Address: {item.walletAddress}</div>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-blue-800 font-medium">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {showWalletModal && <BindWalletModal userDetails={editWalltInfo} onClose={() => setShowWalletModal(false)} />}
    </div>
  );
};

export default UsdtAddress;
