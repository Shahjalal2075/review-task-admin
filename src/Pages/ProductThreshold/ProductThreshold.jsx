import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProductThreshold = () => {

  const [loading, setLoading] = useState(true);
  const [minRatio, setMinRatio] = useState(30);
  const [maxRatio, setMaxRatio] = useState(90);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    fetch(`https://server.amazonkindlerating.com/task-ratio/officetimealien`)
      .then((res) => res.json())
      .then((data) => {
        setMinRatio(data.min);
        setMaxRatio(data.max);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = () => {
    const updatedData = {
      min: Number(minRatio),
      max: Number(maxRatio),
    };
  
    fetch(`https://server.amazonkindlerating.com/task-ratio/officetimealien`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Threshold ratios updated successfully.',
            confirmButtonColor: '#6366F1', // custom button color (Tailwind indigo-500)
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to update ratios.',
          });
        }
      })
      .catch((error) => {
        console.error('Error updating ratios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'An error occurred while updating ratios.',
        });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-4">
      <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Product absentee setting</h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Minimum threshold ratio
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minRatio}
              onChange={(e) => setMinRatio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-700 font-semibold">%</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Maximum threshold ratio
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={maxRatio}
              onChange={(e) => setMaxRatio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <span className="text-gray-700 font-semibold">%</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ProductThreshold;
