import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { AuthContext } from "../../Providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const VipLevel = () => {
  const [vipLevels, setVipLevels] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    fetchVipLevels();
  }, []);

  const fetchVipLevels = async () => {
    try {
      const res = await fetch("https://server.amazonkindlerating.com/vip-level");
      const data = await res.json();
      setVipLevels(data);
    } catch (error) {
      console.error("Failed to fetch VIP levels:", error);
    }
  };

  const handleAdd = () => {
    Swal.fire({
      title: "Add VIP Level",
      html: `
        <input id="vip" class="swal2-input" placeholder="VIP Name" />
        <input id="price" type="number" class="swal2-input" placeholder="Price" />
        <input id="taskLimit" type="number" class="swal2-input" placeholder="Task Limit" />
        <input id="profit" type="number" step="0.01" class="swal2-input" placeholder="Profit" />
        <input id="minWithdraw" type="number" step="0.01" class="swal2-input" placeholder="Minimum Withdraw" />
        <input id="maxWithdraw" type="number" step="0.01" class="swal2-input" placeholder="Maximum Withdraw" />
      `,
      showCancelButton: true,
      confirmButtonText: "Add",
      preConfirm: () => {
        const vip = document.getElementById("vip").value;
        const price = parseFloat(document.getElementById("price").value);
        const taskLimit = parseInt(document.getElementById("taskLimit").value);
        const profit = parseFloat(document.getElementById("profit").value);
        const minWithdraw = parseFloat(document.getElementById("minWithdraw").value);
        const maxWithdraw = parseFloat(document.getElementById("maxWithdraw").value);

        if (
          !vip ||
          isNaN(price) ||
          isNaN(taskLimit) ||
          isNaN(profit) ||
          isNaN(minWithdraw) ||
          isNaN(maxWithdraw)
        ) {
          Swal.showValidationMessage("Please fill out all fields correctly.");
          return;
        }

        return { vip, price, taskLimit, profit, minWithdraw, maxWithdraw };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("https://server.amazonkindlerating.com/vip-level", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value),
          });

          if (res.ok) {
            Swal.fire("Success!", "VIP level added.", "success");
            fetchVipLevels();
          } else {
            Swal.fire("Error", "Failed to add VIP level", "error");
          }
        } catch (error) {
          console.error("Add failed:", error);
          Swal.fire("Error", "Failed to add VIP level", "error");
        }
      }
    });
  };

  const handleEdit = (level) => {
    Swal.fire({
      title: "Edit VIP Level",
      html: `
        <input id="vip" class="swal2-input" placeholder="VIP Name" value="${level.vip}" />
        <input id="price" type="number" class="swal2-input" placeholder="Price" value="${level.price}" />
        <input id="taskLimit" type="number" class="swal2-input" placeholder="Task Limit" value="${level.taskLimit}" />
        <input id="profit" type="number" step="0.01" class="swal2-input" placeholder="Profit" value="${level.profit}" />
        <input id="minWithdraw" type="number" step="0.01" class="swal2-input" placeholder="Minimum Withdraw" value="${level.minWithdraw || 0}" />
        <input id="maxWithdraw" type="number" step="0.01" class="swal2-input" placeholder="Maximum Withdraw" value="${level.maxWithdraw || 0}" />
      `,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: () => {
        const vip = document.getElementById("vip").value;
        const price = parseFloat(document.getElementById("price").value);
        const taskLimit = parseInt(document.getElementById("taskLimit").value);
        const profit = parseFloat(document.getElementById("profit").value);
        const minWithdraw = parseFloat(document.getElementById("minWithdraw").value);
        const maxWithdraw = parseFloat(document.getElementById("maxWithdraw").value);

        return { vip, price, taskLimit, profit, minWithdraw, maxWithdraw };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`https://server.amazonkindlerating.com/vip-level/${level._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value),
          });

          const data = await res.json();
          if (data.modifiedCount > 0) {
            Swal.fire("Success!", "VIP level updated.", "success");
            fetchVipLevels();
          } else {
            Swal.fire("No change", "No data was modified.", "info");
          }
        } catch (err) {
          console.error("Edit failed:", err);
          Swal.fire("Error", "Failed to update VIP level", "error");
        }
      }
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the VIP level.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`https://server.amazonkindlerating.com/vip-level/${id}`, {
          method: "DELETE",
        });

        const result = await res.json();
        if (result.deletedCount > 0) {
          Swal.fire("Deleted!", "VIP level has been deleted.", "success");
          fetchVipLevels();
        }
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Error", "Failed to delete VIP level", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-200 via-pink-100 to-blue-200 p-4">
      <div className="max-w-7xl mx-auto bg-white/90 p-6 rounded-2xl shadow-xl overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">VIP level setting</h2>
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Add VIP Level
          </button>
        </div>

        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 border">Serial Number</th>
              <th className="p-3 border">Level Name</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Mission Info</th>
              <th className="p-3 border">Withdraw Info</th>
              <th className="p-3 border">Operating</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {vipLevels.map((level, index) => (
              <tr key={level._id} className="hover:bg-yellow-100">
                <td className="p-3 border text-center">{index + 1}</td>
                <td className="p-3 border text-center">{level.vip}</td>
                <td className="p-3 border text-center">{level.price}</td>
                <td className="p-3 border whitespace-pre-line text-left">
                  Number of tasks: {level.taskLimit}
                  {"\n"}
                  Reward per task: {level.profit}
                </td>
                <td className="p-3 border whitespace-pre-line text-left">
                  Min: {level.minWithdraw}
                  {"\n"}
                  Max: {level.maxWithdraw}
                </td>
                <td className="p-3 border text-center space-x-2">
                  <button
                    onClick={() => handleEdit(level)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(level._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VipLevel;
