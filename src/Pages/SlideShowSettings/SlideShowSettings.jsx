import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const SlideShowSettings = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [adding, setAdding] = useState(false);

    const API_URL = 'https://server.amazonkindlerating.com/slideshow';
    const IMGBB_API_KEY = "31305da6f416afe11565950430cdcbbb";

    // 1. Fetch Slides
    const fetchSlides = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSlides(data);
            }
        } catch (error) {
            console.error("Error fetching slides:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    // 2. Handle Image Upload to ImgBB
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setImageUrl(data.data.url);
            } else {
                toast("Failed to upload image to ImgBB");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast("Network error during upload");
        } finally {
            setUploading(false);
        }
    };

    // 3. Add Slide to Server
    const handleAddSlide = async () => {
        if (!title || !imageUrl) {
            toast('Please enter a title and upload an image.');
            return;
        }

        setAdding(true);
        try {
            const payload = { title, image_url: imageUrl };
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast('Slide added successfully!');
                closeModal();
                fetchSlides();
            } else {
                toast('Failed to add slide');
            }
        } catch (error) {
            console.error("Add slide error:", error);
            toast('Network error');
        } finally {
            setAdding(false);
        }
    };

    // 4. Delete Slide Handler
    const handleDelete = async (id) => {
        if (slides.length <= 2) {
            toast('Minimum 2 slides are required. Cannot delete.');
            return;
        }

        if (window.confirm("Are you sure you want to delete this slide?")) {
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    setSlides(slides.filter(slide => slide._id !== id));
                } else {
                    toast('Failed to delete slide');
                }
            } catch (error) {
                toast('Network error');
            }
        }
    };

    // Helper: Reset & Close Modal
    const closeModal = () => {
        setShowModal(false);
        setTitle("");
        setImageUrl("");
        setUploading(false);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Slideshow Settings</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your home page slider images</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md active:scale-95"
                    >
                        <Plus size={20} />
                        Add Slide
                    </button>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
                        </div>
                    ) : slides.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <ImageIcon className="mx-auto w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg">No slides found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                                        <th className="p-4 w-16 text-center">SL</th>
                                        <th className="p-4 w-32">Preview</th>
                                        <th className="p-4">Title</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {slides.map((slide, index) => (
                                        <tr key={slide._id || index} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-4 text-center font-medium text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                                                    <img
                                                        src={slide.image_url}
                                                        alt={slide.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = 'https://placehold.co/100x60?text=No+Image'; }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <h3 className="font-semibold text-gray-800 text-base">{slide.title}</h3>

                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(slide._id)}
                                                    disabled={slides.length <= 2}
                                                    title={slides.length <= 2 ? "Minimum 2 slides required" : "Delete Slide"}
                                                    className={`p-2 rounded-lg transition-all ${slides.length <= 2
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-red-50 text-red-500 hover:bg-red-100 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                {!loading && (
                    <div className="text-right mt-4 text-xs text-gray-400">
                        Total Slides: {slides.length} (Min required: 2)
                    </div>
                )}

                {/* --- Add Slide Modal --- */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Slide</h2>

                            <div className="space-y-5">
                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slide Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter a descriptive title"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload Image</label>

                                    {!imageUrl ? (
                                        <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                                            {uploading ? (
                                                <div className="flex flex-col items-center text-blue-500">
                                                    <Loader2 className="animate-spin mb-2" size={24} />
                                                    <span className="text-sm font-medium">Uploading...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" size={32} />
                                                    <span className="text-sm text-gray-500 font-medium">Click to upload image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => setImageUrl("")}
                                                    className="bg-white/90 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white shadow-sm"
                                                >
                                                    Change Image
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSlide}
                                        disabled={adding || uploading || !imageUrl}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold flex justify-center items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    >
                                        {adding ? <Loader2 className="animate-spin" size={20} /> : "Save Slide"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            <ToastContainer />
        </div>
    );
};

export default SlideShowSettings;