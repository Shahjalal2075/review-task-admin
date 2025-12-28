import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../Providers/AuthProvider';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [endTime, setEndTime] = useState('');
  const [currentUTC, setCurrentUTC] = useState(new Date().toISOString().split('T')[1].split('.')[0]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Function to add 12 hours to current UTC time
  const add12HoursToUTC = () => {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 12);
    return now.toISOString().split('T')[1].split('.')[0];
  };

  // Function to get current UTC time in "HH:MM:SS"
  const getCurrentUTCTime = () => {
    return new Date().toISOString().split('T')[1].split('.')[0];
  };

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    fetch(`https://server.amazonkindlerating.com/office-time/officetimealien`)
      .then((res) => res.json())
      .then((data) => {
        setEndTime(data.end);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUTC(getCurrentUTCTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateEndTime = (newEndTime, message) => {
    setEndTime(newEndTime);

    fetch('https://server.amazonkindlerating.com/user-list/daily-reset', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetCount: 0,
        newBal: 0
      })
    })
    fetch(`https://server.amazonkindlerating.com/office-time/officetimealien`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ end: newEndTime })
    })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: message,
          text: `Task end time set to ${newEndTime} UTC.`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
      .catch(() => {
        console.log('Failed to update end time.');
      });
  };

  const handleStartTask = () => {
    const newEndTime = add12HoursToUTC();
    updateEndTime(newEndTime, 'Task Started!');
  };

  const handleEndTask = () => {
    //const currentTime = getCurrentUTCTime();
    const currentTime = "No Time";
    updateEndTime(currentTime, 'Task Ended!');
  };

  const isTaskActive = endTime !== "No Time";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 p-4">
      <div className="w-full max-w-lg bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-600 mb-2">
          Current UTC Time: <span className="text-gray-800">{currentUTC}</span>
        </h2>

        <h2 className="text-xl font-bold text-gray-800 mb-6">Task Manager</h2>

        <div className="mb-6">
          <p className="text-gray-700 font-medium mb-1">
            Task End Time: <span className="font-bold">{endTime} UTC</span>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleStartTask}
            disabled={isTaskActive}
            className={`w-full ${isTaskActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              } text-white font-bold py-2 px-4 rounded-lg transition duration-200`}
          >
            Start Task
          </button>

          <button
            onClick={handleEndTask}
            disabled={!isTaskActive}
            className={`w-full ${!isTaskActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              } text-white font-bold py-2 px-4 rounded-lg transition duration-200`}
          >
            End Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
