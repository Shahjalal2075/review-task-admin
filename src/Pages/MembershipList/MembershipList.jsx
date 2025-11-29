import React, { useState, useEffect, useContext } from 'react';
import { FaSync, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Member from './Member';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { AuthContext } from '../../Providers/AuthProvider';

const MembershipList = () => {

  const { userAccount } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const MySwal = withReactContent(Swal);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchData, setSearchData] = useState({
    memberId: '',
    memberAccount: '',
    mobileNumber: '',
    inviterId: '',
    invitationCode: '',
    ipAddress: '',
    startDate: '',
    endDate: '',
    accountStatus: '',
    vipLevel: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://review-task-server.vercel.app/user-list');
        const data = await response.json();
        const reversedData = data.reverse();
        setAllData(reversedData);
        setFilteredData(reversedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching member data:', error);
      }
    };
    fetchData();
  }, []);

  const generateUniqueCode = async (existingCodes) => {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (existingCodes.includes(code));
    return code;
  };

  const handleAddMember = () => {
    MySwal.fire({
      title: '➕ Add New Member',
      html: `
        <div style="text-align: right;">
          <label style="font-weight: 500;">Email</label>
          <input id="member-email" type="email" class="swal2-input" placeholder="Enter email" />
  <br>
          <label style="font-weight: 500;">Mobile</label>
          <input id="member-mobile" type="text" class="swal2-input" placeholder="Enter mobile number" />
  
          <label style="font-weight: 500;">Username</label>
          <input id="member-username" type="text" class="swal2-input" placeholder="Enter username" />

          <label style="font-weight: 500;">Reffer Code</label>
          <input id="member-reffer" type="text" class="swal2-input" placeholder="Enter Refercode" />
  
          <label style="font-weight: 500;">Password</label>
          <input id="member-password" type="password" class="swal2-input" placeholder="Enter password" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add Member',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#9CA3AF',
      focusConfirm: false,
      preConfirm: () => {
        const email = document.getElementById('member-email').value.trim();
        const mobile = document.getElementById('member-mobile').value.trim();
        const username = document.getElementById('member-username').value.trim();
        const reffer = document.getElementById('member-reffer').value.trim();
        const password = document.getElementById('member-password').value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !mobile || !username || !password || !reffer) {
          Swal.showValidationMessage('All fields are required.');
          return false;
        }

        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Please enter a valid email address.');
          return false;
        }

        return { email, mobile, username, reffer, password };
      }

    }).then(async (result) => {
      if (result.isConfirmed) {

        const formData = {
          email: result.value.email,
          phone: result.value.mobile,
          username: result.value.username,
          password: result.value.password,
          rePassword: result.value.password,
          superviser: result.value.reffer,
          invitationCode: '',
          invitationStatus: false,
          reputation: '100%',
          isOfficial: false,
          vipLevel: 'VIP 0',
          totalBal: 0.00,
          frozenBal: 0.00,
          depositReq: 0.00,
          totalWithdraw: 0.00,
          totalDeposit: 0.00,
          systemProfit: 0.00,
          withdrawStatus: false,
          nottification: '',
          withdrawPass: '',
          frozenStatus: false,
          taskCount: 0,
          resetTime: "2025-03-16T18:39:02.064Z",
          newBal: 0,
          resetCount: 0,
          isPromotion: false,
          promotionMsg: {
            cover: "",
            message: ""
          },
          isCombinationActive: false,
          combinationEndTine: "",
          regType: userAccount,
          regInfo: {
            time: "",
            city: "",
            country: "",
            ip: ""
          },
          loginInfo: {
            time: "",
            city: "",
            country: "",
            ip: ""
          }
        }

        try {
          const res = await axios.get('https://review-task-server.vercel.app/user-list');
          const users = res.data;
          const existingUserEmail = res.data.find(user => user.email === formData.email);
          const existingUserPhone = res.data.find(user => user.phone === formData.phone);
          const existingUsername = res.data.find(user => user.username === formData.username);
          const existingCodes = users.map(user => user.invitationCode);

          const uniqueCode = await generateUniqueCode(existingCodes);
          const updatedData = {
            ...formData,
            invitationCode: uniqueCode,
          };

          if (existingUserEmail) {
            toast.error('This Email Already Registered.');
          }
          else if (existingUserPhone) {
            toast.error('This Phone Number Already Registered.');
          }
          else if (existingUsername) {
            toast.error('This Username Already Registered.');
          }
          else {
            await axios.post('https://review-task-server.vercel.app/user-list', updatedData);
            Swal.fire({
              icon: 'success',
              title: 'Member Added',
              text: `Member ${result.value.username} has been added.`,
              timer: 1800,
              showConfirmButton: false
            });
          }

        }
        catch (error) {
          console.error('Error during registration:', error);
          toast.error('Something went wrong! Try Again.');
        }
      }
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };

  const handleSearch = () => {
    const result = allData.filter((item) => {
      const registrationDate = item.resetTime ? new Date(item.resetTime) : null;
      const start = searchData.startDate ? new Date(searchData.startDate) : null;
      const end = searchData.endDate ? new Date(searchData.endDate) : null;

      return (
        (!searchData.memberId || item.invitationCode.toString().includes(searchData.memberId)) &&
        (!searchData.memberAccount || item.username?.toLowerCase().includes(searchData.memberAccount.toLowerCase())) &&
        (!searchData.mobileNumber || item.phone?.includes(searchData.mobileNumber)) &&
        (!searchData.inviterId || item.superviser?.toString().includes(searchData.inviterId)) &&
        (!searchData.invitationCode || item.invitationCode?.includes(searchData.invitationCode)) &&
        (!searchData.accountStatus ||
          (searchData.accountStatus === 'Normal' && item.frozenStatus === false) ||
          (searchData.accountStatus === 'Prohibited' && item.frozenStatus === true)) &&
        (!searchData.vipLevel || item.vipLevel?.toLowerCase() === searchData.vipLevel.toLowerCase()) &&
        (!start || (registrationDate && registrationDate >= start)) &&
        (!end || (registrationDate && registrationDate <= end))
      );
    });
    setFilteredData(result);
    setCurrentPage(1);
  };


  const handleReset = () => {
    setSearchData({
      memberId: '',
      memberAccount: '',
      mobileNumber: '',
      inviterId: '',
      invitationCode: '',
      ipAddress: '',
      startDate: '',
      endDate: '',
      accountStatus: '',
      vipLevel: ''
    });
    setFilteredData(allData);
    setCurrentPage(1);
  };

  // delete 
  const handleDelete = (id) => {
    console.log(id)
    fetch(`https://review-task-server.vercel.app/user-list/${id}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then((data) => {
        console.log("Delete Response:", data);
        setFilteredData(filteredData.filter(job => job._id !== id));
      })
      .catch(err => console.error("Error deleting notification:", err));

  };


  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <h3 className="text-2xl font-bold text-center mb-6 text-blue-800">Member List</h3>

      {/* Search Filters */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <input name="memberId" onChange={handleChange} value={searchData.memberId} placeholder="Member ID" className="border p-2 rounded" />
        <input name="memberAccount" onChange={handleChange} value={searchData.memberAccount} placeholder="Member Account" className="border p-2 rounded" />
        <select name="accountStatus" onChange={handleChange} value={searchData.accountStatus} className="border p-2 rounded">
          <option value="">All account statuses</option>
          <option value="Normal">Normal</option>
          <option value="Prohibited">Prohibited</option>
        </select>
        <select name="vipLevel" onChange={handleChange} value={searchData.vipLevel} className="border p-2 rounded">
          <option value="">All members</option>
          <option value="vip1">vip1</option>
          <option value="vip2">vip2</option>
          <option value="vip3">vip3</option>
          <option value="vip4">vip4</option>
        </select>
        <input name="mobileNumber" onChange={handleChange} value={searchData.mobileNumber} placeholder="Mobile Number" className="border p-2 rounded" />
        <input name="inviterId" onChange={handleChange} value={searchData.inviterId} placeholder="Inviter ID" className="border p-2 rounded" />
        <input name="invitationCode" onChange={handleChange} value={searchData.invitationCode} placeholder="Invitation Code" className="border p-2 rounded" />
        <input name="ipAddress" onChange={handleChange} value={searchData.ipAddress} placeholder="IP Address" className="border p-2 rounded" />
        <div className="col-span-2 flex items-center gap-2">
          <input type="date" name="startDate" onChange={handleChange} value={searchData.startDate} className="border p-2 rounded w-full" />
          <span>-</span>
          <input type="date" name="endDate" onChange={handleChange} value={searchData.endDate} className="border p-2 rounded w-full" />
        </div>
        <div className="flex gap-2 col-span-2">
          <button onClick={handleSearch} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow">Search</button>
          <button onClick={handleAddMember} className="bg-gradient-to-r from-green-400 to-emerald-600 text-white px-4 py-2 rounded shadow flex items-center gap-1"><FaPlus /> Add Member</button>
          <button onClick={handleReset} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded shadow flex items-center gap-1"><FaSync /> Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Member Info</th>
              <th className="border px-4 py-2">Superior Info</th>
              <th className="border px-4 py-2">VIP Level</th>
              <th className="border px-4 py-2">Wallet Info</th>
              <th className="border px-4 py-2">Task Info</th>
              <th className="border px-4 py-2">Registration Info</th>
              <th className="border px-4 py-2">Last Login Info</th>
              <th className="border px-4 py-2">Operation</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((user) => (
              <Member
                key={user._id}
                data={user}
                onDelete={handleDelete}
              ></Member>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center flex-wrap gap-2">
        {currentPage > 3 && (
          <>
            <button onClick={() => setCurrentPage(1)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">1</button>
            <span className="px-2 text-gray-500">...</span>
          </>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2))
          .map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded transition-all ${currentPage === page ? 'bg-blue-600 text-white font-bold shadow' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {page}
            </button>
          ))}

        {currentPage < totalPages - 2 && (
          <>
            <span className="px-2 text-gray-500">...</span>
            <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">{totalPages}</button>
          </>
        )}
      </div>
      <ToastContainer />


    </div>
  );
};

export default MembershipList;
