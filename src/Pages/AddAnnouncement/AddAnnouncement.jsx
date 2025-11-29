import React, { useState } from 'react';
import { UploadCloud, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddAnnouncement = () => {
  const [formData, setFormData] = useState({
    id: '',
    image: null,
    title: '',
    description: '',
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    // You can now upload formData.image to backend using FormData
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        {/* Back Button */}
        <div className="mb-4">
          <Link to="/announcement">
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
              <ArrowLeft className="w-5 h-5" />
              Back to Announcements
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center text-gradient bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent mb-6">
          Add New Announcement
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ID */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">ID</label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter announcement ID"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
              required
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-24 h-24 rounded-lg object-cover border"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Announcement title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Write a short description"
              required
            />
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="flex items-center gap-2 mx-auto px-5 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform"
            >
              <UploadCloud className="w-5 h-5" />
              Submit Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncement;
