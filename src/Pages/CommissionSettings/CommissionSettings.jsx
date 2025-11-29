import React, { useState } from 'react';

const CommissionSettings = () => {
  const [level1, setLevel1] = useState(20);

  const handleSave = () => {
    alert(`Saved!\nLevel 1: ${level1}%\n`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 p-4">
      <div className="w-full max-w-xl bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Agency commission setting</h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Proportion of first-level agents returning to domestic help
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={level1}
              onChange={(e) => setLevel1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-700 font-semibold">%</span>
          </div>
        </div>

       {/*  <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Secondary agency domestic helper ratio
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={level2}
              onChange={(e) => setLevel2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-700 font-semibold">%</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Proportion of third-level agents returning to domestic help
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={level3}
              onChange={(e) => setLevel3(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-700 font-semibold">%</span>
          </div>
        </div> */}

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

export default CommissionSettings;
