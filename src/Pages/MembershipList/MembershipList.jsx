import React, { useState, useEffect, useContext } from 'react';
import { FaSync, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Member from './Member';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { AuthContext } from '../../Providers/AuthProvider';
import { Plus, RefreshCcw, Search } from 'lucide-react';

const MembershipList = () => {

  const { userAccount } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const MySwal = withReactContent(Swal);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchData, setSearchData] = useState({
    memberId: '',
    memberAccount: '',
    mobileNumber: '',
    emailAddress: '',
    inviterId: '',
    invitationCode: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://review-task-server.vercel.app/user-list');
        const data = await response.json();
        const reversedData = data.reverse();
        setAllData(reversedData);
        setFilteredData([]);
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
          vipLevel: 'New',
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
          trainingBal: 0,
          redemPoint: 0,
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
          },
          createdAt: new Date().toISOString(),
          lastClaim: "",
          totalClaim: 0,
          isVerify: "Unverified"
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
    const hasValue = Object.values(searchData).some(val => val.trim() !== '');

    if (!hasValue) {
      toast.warn("Please enter at least one field to search");
      setFilteredData([]);
      setHasSearched(false);
      return;
    }

    const result = allData.filter((item) => {
      const matchId = searchData.memberId ? item.invitationCode?.toString() === searchData.memberId.trim() : true;
      const matchAccount = searchData.memberAccount ? item.username === searchData.memberAccount.trim() : true;
      const matchMobile = searchData.mobileNumber ? item.phone === searchData.mobileNumber.trim() : true;
      const matchEmail = searchData.emailAddress ? item.email === searchData.emailAddress.trim() : true;
      const matchInviter = searchData.inviterId ? item.superviser?.toString() === searchData.inviterId.trim() : true;
      const matchInvitationCode = searchData.invitationCode ? item.invitationCode?.toString() === searchData.invitationCode.trim() : true;

      return matchId && matchAccount && matchMobile && matchEmail && matchInviter && matchInvitationCode;
    });

    setFilteredData(result);
    setHasSearched(true);
    setCurrentPage(1);
  };


  const handleReset = () => {
    setSearchData({
      memberId: '',
      memberAccount: '',
      mobileNumber: '',
      emailAddress: '',
      inviterId: '',
      invitationCode: '',
    });
    setFilteredData([]);
    setHasSearched(false);
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

      {/* --- Search Panel --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <input name="memberId" onChange={handleChange} value={searchData.memberId} placeholder="Member ID" className="border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition" />
          <input name="memberAccount" onChange={handleChange} value={searchData.memberAccount} placeholder="Member Account" className="border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition" />
          <input name="mobileNumber" onChange={handleChange} value={searchData.mobileNumber} placeholder="Mobile Number" className="border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition" />
          <input name="emailAddress" onChange={handleChange} value={searchData.emailAddress} placeholder="Email Address" className="border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition" />
          <input name="inviterId" onChange={handleChange} value={searchData.inviterId} placeholder="Inviter ID" className="border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition" />
          <input name="invitationCode" onChange={handleChange} value={searchData.invitationCode} placeholder="Invitation Code" className="border p-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition" />
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg shadow hover:opacity-90 flex items-center gap-2">
            <Search size={18} /> Search
          </button>
          <button onClick={handleAddMember} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-lg shadow hover:opacity-90 flex items-center gap-2">
            <Plus size={18} /> Add Member
          </button>
          <button onClick={handleReset} className="bg-gray-500 text-white px-6 py-2.5 rounded-lg shadow hover:opacity-90 flex items-center gap-2">
            <RefreshCcw size={18} /> Reset
          </button>
        </div>
      </div>

      {/* --- Results Area --- */}
      {!hasSearched ? (
        <div className="text-center text-gray-500 mt-12 bg-white p-10 rounded-lg border border-dashed border-gray-300">
          <Search className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-lg">Please use the search bar to find a member.</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-100 mt-6">
          <p className="text-red-500 font-bold text-xl">User not found</p>
          <p className="text-red-400 text-sm mt-1">Please check your search criteria (Exact Match Required)</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-[white]">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Member Info</th>
                  <th className="px-4 py-3 text-left">Superior</th>
                  <th className="px-4 py-3 text-center">VIP</th>
                  <th className="px-4 py-3 text-left">Wallet</th>
                  <th className="px-4 py-3 text-center">Tasks</th>
                  <th className="px-4 py-3 text-left">Registration</th>
                  <th className="px-4 py-3 text-left">Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((user) => (
                  <Member key={user._id} data={user} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default MembershipList;
