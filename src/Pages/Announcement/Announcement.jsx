import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../Providers/AuthProvider";

const Announcement = () => {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const apiUrl = "https://review-task-server.vercel.app/announcement";

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      setAnnouncements(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    fetchAnnouncements();
  }, []);

  const getCurrentTime = () => {
    const date = new Date();
    return date.toLocaleString(); // Will return time in human-readable format
  };

  const handleAddOrUpdate = async () => {
    if (!title || !details) return;

    try {
      const dataToSend1 = { title, details, currentTime };
      const dataToSend2 = { title, details };

      if (editAnnouncement) {
        // Edit
        await fetch(`${apiUrl}/${editAnnouncement._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend2),
        });
        Swal.fire("Updated!", "Announcement updated successfully", "success");
      } else {
        // Add
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend1),
        });
        Swal.fire("Added!", "Announcement added successfully", "success");
      }
      fetchAnnouncements();
      setShowModal(false);
      setTitle("");
      setDetails("");
      setCurrentTime("");
      setEditAnnouncement(null);
    } catch (error) {
      console.error("Error adding/updating announcement:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        Swal.fire("Deleted!", "Announcement deleted successfully", "success");
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const openAddModal = () => {
    setTitle("");
    setDetails("");
    setCurrentTime(getCurrentTime()); // Automatically set the current time
    setEditAnnouncement(null);
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setTitle(announcement.title);
    setDetails(announcement.details);
    setCurrentTime(announcement.currentTime || getCurrentTime()); // If currentTime is empty, set the current time
    setEditAnnouncement(announcement);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <button
          onClick={openAddModal}
          className="bg-[#4101d8] text-white px-4 py-2 rounded"
        >
          + Add
        </button>
      </div>

      {announcements.length === 0 ? (
        <p className="text-gray-500">No announcements available.</p>
      ) : (
        <ul className="space-y-3">
          {announcements.map((announcement) => (
            <li
              key={announcement._id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <h3 className="font-semibold">{announcement.title}</h3>
                <p>{announcement.details}</p>
                {announcement.currentTime && (
                  <p className="text-sm text-gray-500">{announcement.currentTime}</p>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => openEditModal(announcement)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-[#11111180] flex justify-center items-center">
          <div className="bg-white p-6 rounded w-80 space-y-4">
            <h3 className="text-xl font-semibold">
              {editAnnouncement ? "Edit Announcement" : "Add Announcement"}
            </h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter title"
            />
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter details"
            />
            <input
              type="text"
              value={editAnnouncement?"":currentTime}
              disabled
              className="w-full border p-2 rounded"
              placeholder="Current Time"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdate}
                className="px-4 py-2 bg-[#4101d8] text-white rounded"
              >
                {editAnnouncement ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
