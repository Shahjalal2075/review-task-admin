import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const NationalAgents = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({ userId: '', accountNumber: '', type: 'All' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetch('https://server.amazonkindlerating.com/user-list');
        const json = await response.json();
        setData(json);
        setFilteredData(json);
      } catch (error) {
        console.error('Error fetching member data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (filters.userId) {
      filtered = filtered.filter(Agent => String(Agent.id).includes(filters.userId));
    }
    if (filters.accountNumber) {
      filtered = filtered.filter(Agent => Agent.account.includes(filters.accountNumber));
    }
    if (filters.type !== 'All') {
      filtered = filtered.filter(Agent => Agent.type === filters.type);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [filters, data]);

  const handleReset = () => {
    setFilters({ userId: '', accountNumber: '', type: 'All' });
  };

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const filterOptions = ['All', 'First-level Agent', 'Secondary Agent', 'Level 3 agency'];

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif', background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#5b3cc4' }}>Inquiry Conditions</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <input
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
          style={{ padding: '10px', width: '120px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <input
          placeholder="Account Number"
          value={filters.accountNumber}
          onChange={(e) => setFilters(prev => ({ ...prev, accountNumber: e.target.value }))}
          style={{ padding: '10px', width: '160px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          style={{ padding: '10px', width: '180px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          {filterOptions.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <input type="date" style={{ padding: '10px', width: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <span>-</span>
        <input type="date" style={{ padding: '10px', width: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <button style={{ padding: '10px 20px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Search</button>
        <button onClick={handleReset} style={{ padding: '10px 20px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>List of National Agents</h2>
      <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#d3cce3' }}>
            <tr>
              <th style={{ padding: '12px' }}>No.</th>
              <th style={{ padding: '12px' }}>Member Info</th>
              <th style={{ padding: '12px' }}>Superior Info</th>
              <th style={{ padding: '12px' }}>VIP Level</th>
              <th style={{ padding: '12px' }}>Wallet Info</th>
              <th style={{ padding: '12px' }}>Mission Info</th>
              <th style={{ padding: '12px' }}>Registration Info</th>
              <th style={{ padding: '12px' }}>Login Info</th>
              <th style={{ padding: '12px' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((user, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                <td style={{ padding: '12px' }}>
                  <strong>ID:</strong> {user?.invitationCode}<br />
                  <strong>Account:</strong> {user?.username}<br />
                  <strong>Email:</strong> {user?.email || '-'}<br />
                  <strong>Mobile:</strong> {user?.phone}<br />
                  <strong>Invite Code:</strong> {user?.invitationCode}<br />
                  <strong>Reputation:</strong> {user?.reputation}
                </td>
                <td style={{ padding: '12px' }}>
                  <strong>Invitation User:</strong> {user?.superviser}
                </td>
                <td style={{ padding: '12px' }}>{user?.vipLevel}</td>
                <td style={{ padding: '12px' }}>
                  Wallet Balance: ${user?.totalBal}<br />
                  In Transit: $0<br />
                  Frozen: ${user?.frozenBal}<br />
                  Status: {user?.withdrawalStatus ? 'Enabled' : 'Disabled'}<br />
                  Recharge: ${user?.totalDeposit}<br />
                  Withdraw: ${user?.totalWithdraw}<br />
                  System Profit: ${user?.systemProfit}
                </td>
                <td style={{ padding: '12px' }}>
                  Done Task: {user?.taskCount}<br />
                  Total: 40<br />
                  Resets: 0
                </td>
                <td style={{ padding: '12px' }}>
                  IP: 116.212.150.58<br />
                  Address: City 0, Cambodia<br />
                  Date: 2025-04-01 20:07:15
                </td>
                <td style={{ padding: '12px' }}>
                  IP: 5.90.130.20<br />
                  Address: Region 0, Italy<br />
                  Date: 2025-04-01 21:58:05
                </td>
                <td style={{ padding: '12px' }}>
                  {user?.nottification || '-'}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', backgroundColor: currentPage === 1 ? '#ccc' : '#9b59b6', color: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
          Prev
        </button>
        <span style={{ fontWeight: 'bold', color: '#333' }}>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', backgroundColor: currentPage === totalPages ? '#ccc' : '#9b59b6', color: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
          Next
        </button>
      </div>
    </div>
  );
};

export default NationalAgents;
