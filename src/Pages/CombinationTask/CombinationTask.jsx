import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaTimes, FaSearch, FaUndo } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const CombinationTask = ({ user, onClose }) => {

  //const userEmail = ((user.email === '') ? user.phone : user.email);
  const MySwal = withReactContent(Swal);
  const [sortOption, setSortOption] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [targetTaskNo, setTargetTaskNo] = useState('');

  const [productIdFilter, setProductIdFilter] = useState('');
  const [productTitleFilter, setProductTitleFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('https://review-task-server.vercel.app/tasks');
        const withSelection = res.data.map(task => ({ ...task, selected: false }));
        setTasks(withSelection);
        setFilteredTasks(withSelection);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleReset = () => {
    setSortOption('all');
    setProductIdFilter('');
    setProductTitleFilter('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
    setFilteredTasks(tasks);
  };

  const handleSearch = () => {
    let filtered = tasks.filter((task) => {
      const titleMatch = task.title?.toLowerCase().includes(productTitleFilter.toLowerCase());
      const idMatch = task._id?.includes(productIdFilter);
      const price = parseFloat(task.price);
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const priceMatch = price >= min && price <= max;

      const taskDate = new Date(task.creationTime);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const dateMatch = (!start || taskDate >= start) && (!end || taskDate <= end);

      return titleMatch && idMatch && priceMatch && dateMatch;
    });

    if (sortOption === 'asc') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOption === 'desc') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    setFilteredTasks(filtered);
  };

  const toggleTaskSelect = (productId) => {
    const isSelected = selectedTaskIds.includes(productId);
    let updatedIds;

    if (isSelected) {
      updatedIds = selectedTaskIds.filter(id => id !== productId);
    } else {
      updatedIds = [...selectedTaskIds, productId];
    }

    setSelectedTaskIds(updatedIds);

    const updatedTasks = tasks.map(task => ({
      ...task,
      selected: updatedIds.includes(task.product_id),
    }));

    setTasks(updatedTasks);

    const updatedFilteredTasks = updatedTasks.filter((task) => {
      const titleMatch = task.title?.toLowerCase().includes(productTitleFilter.toLowerCase());
      const idMatch = task._id?.includes(productIdFilter);
      const price = parseFloat(task.price);
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const priceMatch = price >= min && price <= max;
      const taskDate = new Date(task.creationTime);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const dateMatch = (!start || taskDate >= start) && (!end || taskDate <= end);
      return titleMatch && idMatch && priceMatch && dateMatch;
    });

    setFilteredTasks(updatedFilteredTasks);
  };

  const selectedTasks = selectedTaskIds
    .map(id => tasks.find(task => task.product_id === id))
    .filter(Boolean);

  const handleSaveTargetTask = () => {
    if (!targetTaskNo || selectedTasks.length === 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please ensure that both Target Task and Selected Task IDs are filled.',
        confirmButtonColor: '#10b981',
      });
      return;
    }

    const amounts = selectedTasks.map(task => parseFloat(task.price));
    const amountSums = [];
    let cumulative = 0;
    for (let i = 0; i < amounts.length && i < 10; i++) {
      cumulative += amounts[i];
      amountSums.push(parseFloat(cumulative.toFixed(2)));
    }

    const addTargetTask = {
      email: user.email,
      phone: user.phone,
      username: user.username,
      targetTask: parseInt(targetTaskNo),
      taskList: selectedTasks,
      amountSums,
      taskSize: selectedTasks.length,
      runingTask: 2
    };

    fetch('https://review-task-server.vercel.app/combine-task', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(addTargetTask)
    })
      .then(() => {
        onClose();
        MySwal.fire({
          icon: 'success',
          title: '🎉 Success!',
          html: `<strong>${user.username}</strong>'s Task Added.`,
          confirmButtonColor: '#10b981',
        });
      })
      .catch(() => {
        MySwal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'There was a problem saving the task.',
        });
      });
  };

  return (
    <div className="p-6 bg-gradient-to-b from-blue-100 to-white min-h-screen text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Combination Task</h2>

      <div className="mb-6 space-y-2">
        <div><strong>Username:</strong> <span className="text-blue-700">{user.username}</span></div>
        <div><strong>Wallet balance:</strong> <span className="text-red-600">${user.totalBal.toFixed(2)}</span></div>

        <div><strong>Order schedule:</strong> {user.taskCount}</div>

        <div className="space-y-2">
          <div>
            <label className="font-semibold">Target Task</label>
            <input
              type="text"
              value={targetTaskNo}
              onChange={(e) => setTargetTaskNo(e.target.value)}
              className="w-full border px-3 py-2 rounded shadow bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Selected Task IDs</label>
            <textarea
              value={selectedTaskIds.join(', ')}
              readOnly
              className="w-full border px-3 py-2 rounded shadow bg-gray-100"
              rows={2}
            />
          </div>
        </div>

        <div className="flex flex-wrap space-x-4 mt-4">
          <button
            onClick={handleSaveTargetTask}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 flex items-center gap-2"
          >
            <FaSave /> Save data
          </button>
          <button
            onClick={handleClose}
            className="bg-orange-400 text-white px-4 py-2 rounded shadow hover:bg-orange-500 flex items-center gap-2"
          >
            <FaTimes /> Close
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Task List</h3>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input type="text" placeholder="Product ID" className="border px-2 py-1 rounded" value={productIdFilter} onChange={(e) => setProductIdFilter(e.target.value)} />
          <input type="text" placeholder="Product title" className="border px-2 py-1 rounded" value={productTitleFilter} onChange={(e) => setProductTitleFilter(e.target.value)} />
          <input type="text" placeholder="Minimum price" className="border px-2 py-1 rounded" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input type="text" placeholder="Highest price" className="border px-2 py-1 rounded" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <select className="border px-2 py-1 rounded" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="all">All</option>
            <option value="asc">Product prices are sorted</option>
            <option value="desc">Product price reverse ranking</option>
          </select>
          <input type="date" className="border px-2 py-1 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span>-</span>
          <input type="date" className="border px-2 py-1 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 flex items-center gap-2">
            <FaSearch /> Search
          </button>
          <button onClick={handleReset} className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500 flex items-center gap-2">
            <FaUndo /> Reset
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full border text-sm text-center">
            <thead className="bg-blue-200 text-blue-900">
              <tr>
                <th className="p-2 border">Select</th>
                <th className="p-2 border">Product ID</th>
                <th className="p-2 border">Product title</th>
                <th className="p-2 border">Product price</th>
                <th className="p-2 border">Creation time</th>
                <th className="p-2 border">Cover</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-gray-500">No tasks found.</td></tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task._id} className="bg-white hover:bg-blue-50">
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.product_id)}
                        onChange={() => toggleTaskSelect(task.product_id)}
                      />
                    </td>
                    <td className="p-2 border">{task.product_id}</td>
                    <td className="p-2 border">{task.title}</td>
                    <td className="p-2 border">৳{task.price}</td>
                    <td className="p-2 border">{task.creationTime}</td>
                    <td className="p-2 border">
                      <img src={task.cover} alt="cover" className="w-16 h-16 object-cover rounded shadow" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CombinationTask;
