import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Providers/AuthProvider';

const fakeData = Array.from({ length: 25 }, (_, i) => ({
  id: 253300 + i,
  member: {
    id: 3718,
    account: 'Alex1883',
    virtual: i % 2 === 0 ? false : true,
  },
  product: {
    id: 260 + i,
    name: i % 2 === 0 ? 'NBA NOW 23' : 'Asphalt 9 Legends',
    price: i % 2 === 0 ? 1214 : 1102,
  },
  orderNumber: `TK_202541013472${600 + i}`,
  revenue: (5 + Math.random()).toFixed(2),
  type: 'Yes',
  settle: 'Yes',
  wheels: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const TaskReport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ memberId: '', account: '', userType: 'all' });
  const [loading, setLoading] = useState(true);
  const pageSize = 5;

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    setTimeout(() => {
      setData(fakeData);
      setLoading(false);
    }, 500);
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ memberId: '', account: '', userType: 'all' });
  };

  const filteredData = data.filter((item) => {
    const matchMemberId = filters.memberId === '' || item.member.id.toString().includes(filters.memberId);
    const matchAccount = filters.account === '' || item.member.account.toLowerCase().includes(filters.account.toLowerCase());
    const matchUserType =
      filters.userType === 'all' ||
      (filters.userType === 'ordinary' && !item.member.virtual) ||
      (filters.userType === 'internal' && item.member.virtual);
    return matchMemberId && matchAccount && matchUserType;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <input name="memberId" value={filters.memberId} onChange={handleFilterChange} type="text" placeholder="Member ID" className="border rounded-md px-3 py-2 w-40" />
          <input name="account" value={filters.account} onChange={handleFilterChange} type="text" placeholder="Member account" className="border rounded-md px-3 py-2 w-40" />
          <select name="userType" value={filters.userType} onChange={handleFilterChange} className="border rounded-md px-3 py-2 w-48">
            <option value="all">All Users</option>
            <option value="ordinary">Ordinary User</option>
            <option value="internal">Internal Account</option>
          </select>
          <input type="date" className="border rounded-md px-3 py-2" />
          <input type="date" className="border rounded-md px-3 py-2" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Search</button>
          <button onClick={handleReset} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">Reset</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-lg">Loading data...</div>
      ) : (
        <div className="overflow-auto bg-white dark:bg-gray-800 shadow rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Serial Number</th>
                <th className="px-4 py-2 text-left">Member Information</th>
                <th className="px-4 py-2 text-left">Product Information</th>
                <th className="px-4 py-2 text-left">Product Pictures</th>
                <th className="px-4 py-2 text-left">Order Number</th>
                <th className="px-4 py-2 text-left">Order Revenue (USDT)</th>
                <th className="px-4 py-2 text-left">Order Type</th>
                <th className="px-4 py-2 text-left">Need to Settle</th>
                <th className="px-4 py-2 text-left">Number Of Task Round</th>
                <th className="px-4 py-2 text-left">Creation Time</th>
                <th className="px-4 py-2 text-left">Update Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">
                    ID: {item.member.id}<br />
                    Account: {item.member.account}<br />
                    Virtual: {item.member.virtual ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-2">
                    ID: {item.product.id}<br />
                    Name: {item.product.name}<br />
                    Price: ${item.product.price}
                  </td>
                  <td className="px-4 py-2 text-gray-400 italic">Loading failure</td>
                  <td className="px-4 py-2">{item.orderNumber}</td>
                  <td className="px-4 py-2">{item.revenue}</td>
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">{item.settle}</td>
                  <td className="px-4 py-2">{item.wheels}</td>
                  <td className="px-4 py-2">{item.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.updatedAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap justify-center items-center gap-2 p-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
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

export default TaskReport;
