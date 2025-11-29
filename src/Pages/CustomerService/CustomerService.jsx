import React, { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { AuthContext } from '../../Providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const CustomerService = () => {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [telegram1, setTelegram1] = useState('');
  const [telegram2, setTelegram2] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
      fetch(`https://review-task-server.vercel.app/support-link/supportlinkalien`)
        .then((res) => res.json())
        .then((data) => {
          setTelegram1(data.telegram1);
          setTelegram2(data.telegram2);
          setWhatsapp(data.whatsapp);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

  const handleSave = () => {

    fetch(`https://review-task-server.vercel.app/support-link/supportlinkalien`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ telegram1: telegram1, telegram2: telegram2, whatsapp: whatsapp })
    })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Changes Saved!',
          text: 'Your customer service links have been updated successfully.',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
      .catch(() => {
        console.log('Not Save.');
      });

  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <div className="w-full max-w-3xl bg-white/90 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Online customer service settings
        </h2>

        <div className="text-center text-red-600 font-semibold mb-6">
          It needs to be preserved after operation to take effect!!
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
            <label className="w-60 font-medium">Customer Service Telegram:</label>
            <input
              type="text"
              value={telegram1}
              onChange={(e) => setTelegram1(e.target.value)}
              className="flex-1 border rounded px-3 py-2 min-w-[200px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
            <label className="w-60 font-medium">Customer Service Telegram2:</label>
            <input
              type="text"
              value={telegram2}
              onChange={(e) => setTelegram2(e.target.value)}
              className="flex-1 border rounded px-3 py-2 min-w-[200px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
            <label className="w-60 font-medium">Customer Service WhatsApp:</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="flex-1 border rounded px-3 py-2 min-w-[200px]"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded shadow transition"
          >
            Save all
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;
