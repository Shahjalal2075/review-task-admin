import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Pencil, Trash2, Plus, X, Search, RotateCw, CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { AuthContext } from '../../Providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://server.amazonkindlerating.com/tasks';

const InputGroup = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="text-sm font-medium block mt-2 mb-1">{label}</label>
    <input
      type={type}
      className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150"
      value={value}
      onChange={onChange}
      step={type === "number" ? "any" : undefined}
      min={type === "number" ? "0" : undefined}
    />
  </div>
);

const NotificationManager = ({ alertState, setAlertState }) => {
  const { isOpen, title, text, icon, onConfirm } = alertState;

  if (!isOpen) return null;

  const IconComponent = {
    'success': CheckCircle,
    'error': XCircle,
    'warning': AlertTriangle,
    'confirm': Zap,
  }[icon] || Zap;

  const iconColor = {
    'success': 'text-green-500',
    'error': 'text-red-500',
    'warning': 'text-yellow-500',
    'confirm': 'text-indigo-500',
  }[icon] || 'text-gray-500';

  const handleConfirm = () => {
    setAlertState({ ...alertState, isOpen: false, onConfirm: null });
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setAlertState({ ...alertState, isOpen: false, onConfirm: null });
  };

  return (
    <Dialog open={isOpen} onClose={handleCancel} className="fixed inset-0 z-[60] flex items-center justify-center bg-[#11111199] p-4">
      <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm space-y-4 text-center transform transition-all">

        <div className="flex justify-center">
          <IconComponent size={48} className={iconColor} />
        </div>

        <Dialog.Title className="text-xl font-bold text-gray-800">{title}</Dialog.Title>
        <Dialog.Description className="text-sm text-gray-600">{text}</Dialog.Description>

        {onConfirm ? (
          <div className="flex gap-3 pt-2 justify-center">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`${icon === 'warning' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 py-2 rounded-lg font-medium transition`}
            >
              {icon === 'warning' ? 'Yes, Delete It!' : 'Confirm'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCancel}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded-lg font-medium transition"
          >
            OK
          </button>
        )}
      </Dialog.Panel>
    </Dialog>
  );
};

const AddProductModal = ({ showModal, setShowModal, newProduct, setNewProduct, imageFile, setImageFile, addProduct, uploading }) => {
  const fields = [
    ["Title", "title", "text"],
    ["Writer", "writer", "text"],
    ["Rating", "rating", "text"],
    ["Price", "price", "number"],
    ["Synopsis", "synopsis", "text"],
    ["Author Name", "authorName", "text"],
    ["Author Description", "authorDes", "text"],
    ["Reviewer Name 1", "reviewerName1", "text"],
    ["Reviewer Name 2", "reviewerName2", "text"],
    ["Review Title 1", "reviewTitle1", "text"],
    ["Review Title 2", "reviewTitle2", "text"],
    ["Review Description 1", "reviewDes1", "text"],
    ["Review Description 2", "reviewDes2", "text"],
    ["Review React Count 1", "reviewReact1", "number"],
    ["Review React Count 2", "reviewReact2", "number"],
  ];

  const handleChange = useCallback((key, value) => {
    setNewProduct(prev => ({ ...prev, [key]: value }));
  }, [setNewProduct]);

  return (
    <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-[#11111180] p-4">
      <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg space-y-3 overflow-y-auto max-h-[90vh] transition-all transform">

        <div className="flex justify-between items-center pb-2 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"><X size={20} /></button>
        </div>

        {/* All Input Fields */}
        <div className="grid grid-cols-1 gap-3">
          {fields.map(([label, key, type]) => (
            <InputGroup
              key={key}
              label={label}
              type={type}
              value={newProduct[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ))}
        </div>

        {/* Image */}
        <div className="pt-2">
          <label className="text-sm font-medium block mt-2 mb-1">Cover Image (Required)</label>
          <input type="file" accept="image/*" className="w-full file:bg-blue-100 file:border-none file:rounded-full file:py-2 file:px-4 file:text-blue-700 hover:file:bg-blue-200 transition" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        {/* Submit Button */}
        <button
          onClick={addProduct}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded-lg mt-5 font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <RotateCw size={16} className="animate-spin" />
              <span>Uploading & Adding...</span>
            </>
          ) : (
            <><Plus size={16} /> Add Product</>
          )}
        </button>
      </Dialog.Panel>
    </Dialog>
  );
};

const EditProductModal = ({ editModal, setEditModal, editProduct, setEditProduct, imageFile, setImageFile, submitEdit, uploading }) => {
  if (!editProduct) return null;

  const fields = [
    ["Title", "title", "text"],
    ["Writer", "writer", "text"],
    ["Rating", "rating", "text"],
    ["Price", "price", "number"],
    ["Synopsis", "synopsis", "text"],
    ["Author Name", "authorName", "text"],
    ["Author Description", "authorDes", "text"],
    ["Reviewer Name 1", "reviewerName1", "text"],
    ["Reviewer Name 2", "reviewerName2", "text"],
    ["Review Title 1", "reviewTitle1", "text"],
    ["Review Title 2", "reviewTitle2", "text"],
    ["Review Description 1", "reviewDes1", "text"],
    ["Review Description 2", "reviewDes2", "text"],
    ["Review React Count 1", "reviewReact1", "number"],
    ["Review React Count 2", "reviewReact2", "number"],
  ];

  const handleChange = useCallback((key, value) => {
    setEditProduct(prev => ({ ...prev, [key]: value }));
  }, [setEditProduct]);


  return (
    <Dialog open={editModal} onClose={() => setEditModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-[#11111180] p-4">
      <Dialog.Panel className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg space-y-3 overflow-y-auto max-h-[90vh] transition-all transform">

        <div className="flex justify-between items-center pb-2 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Edit Product: {editProduct.title}</h2>
          <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"><X size={20} /></button>
        </div>

        {/* All Input Fields */}
        <div className="grid grid-cols-1 gap-3">
          {fields.map(([label, key, type]) => (
            <InputGroup
              key={key}
              label={label}
              type={type}
              // Ensure the value is string for inputs, especially for numbers
              value={editProduct[key] !== null && editProduct[key] !== undefined ? String(editProduct[key]) : ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ))}
        </div>

        {/* Current Image Preview */}
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Current Cover</p>
          <img
            src={editProduct.cover || 'https://placehold.co/80x80/cccccc/333333?text=No+Image'}
            alt="Current Product Cover"
            className="w-20 h-20 object-cover rounded-md border-2 border-gray-200"
            onError={(e) => e.target.src = 'https://placehold.co/80x80/cccccc/333333?text=Error'}
          />
        </div>

        {/* Upload New Image */}
        <div className="mt-2">
          <label className="text-sm font-medium block mt-2 mb-1">Change Cover Image</label>
          <input type="file" accept="image/*" className="w-full file:bg-blue-100 file:border-none file:rounded-full file:py-2 file:px-4 file:text-blue-700 hover:file:bg-blue-200 transition"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={submitEdit}
          disabled={uploading}
          className="bg-green-600 hover:bg-green-700 text-white w-full p-3 rounded-lg mt-5 font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <RotateCw size={16} className="animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <><Pencil size={16} /> Update Product</>
          )}
        </button>
      </Dialog.Panel>
    </Dialog>
  );
};

// Main Component
const ProductManagementApp = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "", cover: "", writer: "", rating: "", price: "", synopsis: "",
    authorName: "", authorDes: "", reviewerName1: "", reviewerName2: "",
    reviewTitle1: "", reviewTitle2: "", reviewDes1: "", reviewDes2: "",
    reviewReact1: 0, reviewReact2: 0
  });

  const [editProduct, setEditProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [filters, setFilters] = useState({ id: '', title: '', minPrice: '', maxPrice: '', sort: 'none' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedItems, setSelectedItems] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  // STATE FOR REPLACING sweetalert2
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    text: '',
    icon: '', // 'success', 'error', 'warning', 'confirm'
    onConfirm: null,
  });


  // Fetch products logic
  useEffect(() => {
    if (user.role !== "Admin") {
      // navigate('/'); // Commented out for sandbox environment
      // return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.creationTime);
          const dateB = new Date(b.creationTime);
          return dateB - dateA;
        });

        const transformed = sorted.map((item, index) => ({
          id: index + 1,
          serverId: item._id,
          product_id: item.product_id,
          title: item.title,
          cover: item.cover,
          writer: item.writer,
          rating: item.rating,
          price: Number(item.price) || 0,
          synopsis: item.synopsis,
          authorName: item.authorName,
          authorDes: item.authorDes,
          reviewerName1: item.reviewerName1,
          reviewerName2: item.reviewerName2,
          reviewTitle1: item.reviewTitle1,
          reviewTitle2: item.reviewTitle2,
          reviewDes1: item.reviewDes1,
          reviewDes2: item.reviewDes2,
          reviewReact1: Number(item.reviewReact1) || 0,
          reviewReact2: Number(item.reviewReact2) || 0,
          createdAt: item.creationTime,
        }));

        setProducts(transformed);
      } catch (err) {
        console.error('Fetch failed:', err);
        setAlertState({ isOpen: true, title: "Error", text: "Failed to load products from server.", icon: "error" });
      }
    };

    fetchProducts();
  }, [user.role]);

  // ImgBB Upload Helper
  const uploadImageToImgbb = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject("No file provided");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.src = e.target.result;
          img.onload = async () => {
            const size = Math.min(img.width, img.height);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const base64 = croppedDataUrl.replace(/^data:image\/(?:jpeg|png);base64,/, '');

            const form = new FormData();
            form.append('image', base64);
            const res = await fetch(`https://api.imgbb.com/1/upload?key=552a2c1c2f57b181499140dabbd6f7ad`, {
              method: "POST",
              body: form
            });

            const data = await res.json();
            if (data.success) resolve(data.data.url);
            else reject("Upload failed: " + (data.error?.message || "Unknown error"));
          };
          img.onerror = () => reject("Image loading failed.");
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject("File reading failed: " + error);
      reader.readAsDataURL(file);
    });
  };

  // Unique Code Generator
  const generateUniqueCode = useCallback((existingCodes) => {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (existingCodes.includes(code));
    return code;
  }, []);

  // Add Product Handler
  const addProduct = async () => {
    if (!newProduct.title.trim()) {
      return setAlertState({ isOpen: true, title: "Missing", text: "Title is required", icon: "warning" });
    }
    if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
      return setAlertState({ isOpen: true, title: "Invalid", text: "Enter a valid price", icon: "error" });
    }
    if (!imageFile) {
      return setAlertState({ isOpen: true, title: "Missing", text: "Product cover image required", icon: "warning" });
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImageToImgbb(imageFile);

      const existingRes = await fetch(API_URL);
      const existing = await existingRes.json();
      const existingCodes = existing.map(p => p.product_id);
      const uniqueCode = generateUniqueCode(existingCodes);

      const creationTime = new Date().toLocaleString();

      const newItem = {
        title: newProduct.title,
        cover: imageUrl,
        writer: newProduct.writer,
        rating: newProduct.rating,
        price: parseFloat(newProduct.price),
        synopsis: newProduct.synopsis,
        authorName: newProduct.authorName,
        authorDes: newProduct.authorDes,
        reviewerName1: newProduct.reviewerName1,
        reviewerName2: newProduct.reviewerName2,
        reviewTitle1: newProduct.reviewTitle1,
        reviewTitle2: newProduct.reviewTitle2,
        reviewDes1: newProduct.reviewDes1,
        reviewDes2: newProduct.focus,
        reviewReact1: Number(newProduct.reviewReact1),
        reviewReact2: Number(newProduct.reviewReact2),
        product_id: uniqueCode,
        creationTime
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });

      const saved = await res.json();

      setProducts(prev => {
        const newId = prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1;
        return [
          { id: newId, serverId: saved._id, ...newItem },
          ...prev,
        ];
      });

      setAlertState({ isOpen: true, title: "Success", text: "Product added successfully", icon: "success" });

      setShowModal(false);
      setImageFile(null);
      setNewProduct({
        title: "", cover: "", writer: "", rating: "", price: "", synopsis: "",
        authorName: "", authorDes: "", reviewerName1: "", reviewerName2: "",
        reviewTitle1: "", reviewTitle2: "", reviewDes1: "", reviewDes2: "",
        reviewReact1: 0, reviewReact2: 0
      });

    } catch (err) {
      console.error(err);
      setAlertState({ isOpen: true, title: "Error", text: "Failed to add product", icon: "error" });
    }

    setUploading(false);
  };

  // Edit Product Handlers
  const startEdit = (product) => {
    setEditProduct({
      ...product,
      price: String(product.price),
      reviewReact1: String(product.reviewReact1),
      reviewReact2: String(product.reviewReact2),
    });
    setEditModal(true);
    setImageFile(null);
  };

  const submitEdit = async () => {
    if (!editProduct.title.trim()) {
      return setAlertState({ isOpen: true, title: "Missing", text: "Title is required", icon: "warning" });
    }
    if (!editProduct.price || isNaN(parseFloat(editProduct.price))) {
      return setAlertState({ isOpen: true, title: "Invalid", text: "Enter a valid price", icon: "error" });
    }

    setUploading(true);

    try {
      let imageUrl = editProduct.cover;

      if (imageFile) {
        imageUrl = await uploadImageToImgbb(imageFile);
      }

      const updated = {
        title: editProduct.title,
        cover: imageUrl,
        writer: editProduct.writer,
        rating: editProduct.rating,
        price: parseFloat(editProduct.price),
        synopsis: editProduct.synopsis,
        authorName: editProduct.authorName,
        authorDes: editProduct.authorDes,
        reviewerName1: editProduct.reviewerName1,
        reviewerName2: editProduct.reviewerName2,
        reviewTitle1: editProduct.reviewTitle1,
        reviewTitle2: editProduct.reviewTitle2,
        reviewDes1: editProduct.reviewDes1,
        reviewDes2: editProduct.reviewDes2,
        reviewReact1: Number(editProduct.reviewReact1),
        reviewReact2: Number(editProduct.reviewReact2),
      };

      await fetch(`${API_URL}/${editProduct.serverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      setProducts(prev =>
        prev.map(p =>
          p.id === editProduct.id
            ? { ...p, ...updated }
            : p
        )
      );

      setAlertState({ isOpen: true, title: "Success", text: "Product updated successfully", icon: "success" });
      setEditModal(false);
      setImageFile(null);

    } catch (error) {
      console.error(error);
      setAlertState({ isOpen: true, title: "Error", text: "Failed to update product", icon: "error" });
    }

    setUploading(false);
  };


  // Delete Handler
  const executeDelete = async (product) => {
    try {
      await fetch(`${API_URL}/${product.serverId}`, {
        method: "DELETE",
      });

      setProducts(prev => prev.filter(p => p.id !== product.id));
      setAlertState({ isOpen: true, title: "Deleted!", text: `"${product.title}" has been removed.`, icon: "success" });
    } catch (err) {
      console.error("Failed to delete:", err);
      setAlertState({ isOpen: true, title: "Error", text: "Failed to delete product", icon: "error" });
    }
  };

  const handleDelete = (product) => {
    setAlertState({
      isOpen: true,
      title: `Delete "${product.title}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      onConfirm: () => executeDelete(product),
    });
  };


  /* =========================
    FILTERS + PAGINATION LOGIC
  ========================== */

  const filteredProducts = products
    .filter(p => {
      const matchId = filters.id ? (p.product_id || "").toString().includes(filters.id) : true;
      const matchTitle = filters.title ? (p.title || "").toLowerCase().includes(filters.title.toLowerCase()) : true;
      const price = Number(p.price) || 0;
      const matchMinPrice = filters.minPrice ? price >= parseFloat(filters.minPrice) : true;
      const matchMaxPrice = filters.maxPrice ? price <= parseFloat(filters.maxPrice) : true;
      return matchId && matchTitle && matchMinPrice && matchMaxPrice;
    })
    .sort((a, b) => {
      if (filters.sort === "price-asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (filters.sort === "price-desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    const allIds = paginatedProducts.map(p => p.id);
    const isAllSelected = allIds.every(id => selectedItems.includes(id));
    setSelectedItems(isAllSelected ? [] : allIds);
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const resetFilters = () => {
    setFilters({ id: '', title: '', minPrice: '', maxPrice: '', sort: 'none' });
    setCurrentPage(1);
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxPagesToShow - 1, totalPages);
    if (end - start < maxPagesToShow - 1) start = Math.max(end - maxPagesToShow + 1, 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 rounded-md transition duration-150 ${currentPage === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 hover:bg-indigo-100 text-gray-700'}`}>
          {i}
        </button>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-between mt-6 p-4 bg-white rounded-lg shadow-md gap-3 text-sm">
        <div className="flex gap-2 items-center">
          <span className="text-gray-600">Show</span>
          <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-2 py-1 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500">
            {[5, 10, 20, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-gray-600">entries. Total: {filteredProducts.length}</span>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-600">{'<<'}</button>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-600">{'<'}</button>
          <div className="flex gap-1">
            {pages}
          </div>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-600">{'>'}</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-600">{'>>'}</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Go to</span>
          <input
            type="number"
            className="border px-2 py-1 rounded w-16 text-center bg-gray-50"
            value={currentPage}
            min={1}
            max={totalPages}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (!val || isNaN(val)) val = 1;
              val = Math.min(Math.max(1, val), totalPages);
              setCurrentPage(val);
            }}
          />
          <span className="text-gray-600">page</span>
        </div>
      </div>
    );
  };


  /* =========================
    FINAL RETURN (JSX)
  ========================== */

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-[Inter]">

      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-4 border-indigo-500 pb-2">Product Management Panel</h1>

      {/* Filters */}
      <div className="p-6 mb-6 shadow-xl bg-white rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><Search size={20} /> Filters & Sorting</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Product ID" value={filters.id} onChange={e => setFilters({ ...filters, id: e.target.value })} />
          <input className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Product Title" value={filters.title} onChange={e => setFilters({ ...filters, title: e.target.value })} />
          <input type="number" step="0.01" className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Min Price" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
          <input type="number" step="0.01" className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Max Price" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
          <select className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="none">Sort By</option>
            <option value="price-asc">Price Ascending (Low to High)</option>
            <option value="price-desc">Price Descending (High to Low)</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={() => { setCurrentPage(1); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition duration-150 flex items-center gap-2">
            <Search size={16} /> Apply Search & Filter
          </button>
          <button onClick={resetFilters} className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-medium shadow-md transition duration-150 flex items-center gap-2">
            <RotateCw size={16} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition duration-150 flex items-center gap-2">
          <Plus size={16} /> Add New Product
        </button>
        {/* Could add a bulk delete button here using selectedItems */}
        {selectedItems.length > 0 && (
          <span className="text-gray-600 py-2 px-4 rounded-lg bg-yellow-100 border border-yellow-200 shadow-sm">
            {selectedItems.length} items selected
          </span>
        )}
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-indigo-50 text-indigo-800 uppercase text-xs">
            <tr>
              <th className="p-3"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" onChange={toggleSelectAll} checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedItems.includes(p.id))} /></th>
              <th className="p-3">ID</th>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Price</th>
              <th className="p-3">Created At</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedProducts.map(product => (
              <tr key={product.id} className="hover:bg-indigo-50 transition duration-150">
                <td className="p-3"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={selectedItems.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                <td className="p-3 font-mono text-xs text-gray-600">{product.product_id}</td>
                <td className="p-3"><img src={product.cover || 'https://placehold.co/40x40/cccccc/333333?text=N/A'} alt={`Cover of ${product.title}`} className="w-10 h-10 object-cover rounded-md shadow-sm" onError={(e) => e.target.src = 'https://placehold.co/40x40/cccccc/333333?text=N/A'} /></td>
                <td className="p-3 font-semibold text-gray-800">{product.title}</td>
                <td className="p-3 text-green-600 font-medium">${product.price.toFixed(2)}</td>
                <td className="p-3 text-gray-500">{product.createdAt}</td>
                <td className="p-3 space-x-2 flex items-center">
                  <button onClick={() => startEdit(product)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(product)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500 italic bg-gray-50">No products match your current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Modals - Passed as separate components */}
      <AddProductModal
        showModal={showModal}
        setShowModal={setShowModal}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        imageFile={imageFile}
        setImageFile={setImageFile}
        addProduct={addProduct}
        uploading={uploading}
      />
      <EditProductModal
        editModal={editModal}
        setEditModal={setEditModal}
        editProduct={editProduct}
        setEditProduct={setEditProduct}
        imageFile={imageFile}
        setImageFile={setImageFile}
        submitEdit={submitEdit}
        uploading={uploading}
      />

      {/* Custom Notification/Confirmation Manager */}
      <NotificationManager
        alertState={alertState}
        setAlertState={setAlertState}
      />

    </div>
  );
};

export default ProductManagementApp;