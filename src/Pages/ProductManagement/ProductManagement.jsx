import React, { useState, useEffect, useContext } from 'react';
import { Pencil, Trash2, Plus, X, Search, RotateCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Providers/AuthProvider';
import axios from 'axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ id: '', title: '', minPrice: '', maxPrice: '', status: 'all', sort: 'none' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch('https://review-task-server.vercel.app/tasks');
        const data = await res.json();

        // Sort by creationTime (newest first)
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.creationTime.split('/').reverse().join('-'));
          const dateB = new Date(b.creationTime.split('/').reverse().join('-'));
          return dateB - dateA;
        });

        const transformed = sorted.map((item, index) => ({
          id: index + 1,
          serverId: item._id,
          product_id: item.product_id ? item.product_id : "404",
          title: item.title,
          price: item.amount,
          createdAt: item.creationTime,
          image: item.cover,
        }));

        setProducts(transformed);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };

    fetchProducts();
  }, []);


  const uploadImageToImgbb = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
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
          const croppedDataUrl = canvas.toDataURL('image/jpeg');
          const base64Image = croppedDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

          try {
            const formData = new FormData();
            formData.append('image', base64Image);
            const response = await fetch(`https://api.imgbb.com/1/upload?key=31305da6f416afe11565950430cdcbbb`, {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
            if (data.success) {
              resolve(data.data.url);
            } else {
              reject('Upload failed');
            }
          } catch (error) {
            reject(error);
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const generateUniqueCode = async (existingCodes) => {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
    } while (existingCodes.includes(code));
    return code;
  };

  const addProduct = async () => {
    const { title, price } = newProduct;
    const parsedPrice = parseFloat(price?.trim());

    if (!title?.trim() || isNaN(parsedPrice)) {
      Swal.fire('Invalid Input', 'Please enter a valid title and price', 'error');
      return;
    }

    if (!imageFile) {
      Swal.fire('Image Required', 'Please upload a product image', 'warning');
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImageToImgbb(imageFile);

      const { data: users } = await axios.get('https://review-task-server.vercel.app/tasks');
      const existingCodes = users.map(user => user.product_id);
      const uniqueCode = await generateUniqueCode(existingCodes);

      const creationTime = new Date().toLocaleString();
      const newItemUp = {
        title: title.trim(),
        amount: parsedPrice,
        cover: imageUrl,
        product_id: uniqueCode,
        creationTime,
      };

      const postRes = await fetch('https://review-task-server.vercel.app/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemUp),
      });

      if (!postRes.ok) throw new Error('Failed to save product');
      const data = await postRes.json();

      const newItem = {
        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
        serverId: data._id,
        title: newItemUp.title,
        price: newItemUp.amount,
        image: imageUrl,
        createdAt: creationTime,
      };

      setProducts(prev => [...prev, newItem]);
      setShowModal(false);
      setNewProduct({ title: '', price: '' });
      setImageFile(null);
      Swal.fire('Success', 'Product added!', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      Swal.fire('Error', 'Something went wrong while adding the product', 'error');
    } finally {
      setUploading(false);
    }
  };


  const startEdit = (product) => {
    setEditProduct(product);
    setEditModal(true);
    setImageFile(null);
  };

  const handleDelete = async (product) => {
    const confirm = await Swal.fire({
      title: `Delete "${product.title}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`https://review-task-server.vercel.app/tasks/${product.serverId}`, {
          method: 'DELETE',
        });

        setProducts(prev => prev.filter(p => p.id !== product.id));
        Swal.fire('Deleted!', `"${product.title}" has been removed.`, 'success');
      } catch (err) {
        console.error('Failed to delete:', err);
        Swal.fire('Error', 'Failed to delete product', 'error');
      }
    }
  };


  const submitEdit = async () => {
    if (!editProduct.title || isNaN(parseFloat(editProduct.price))) {
      Swal.fire('Invalid Input', 'Please enter a valid title and price', 'error');
      return;
    }

    setUploading(true);
    let imageUrl = editProduct.image;

    try {
      if (imageFile) {
        imageUrl = await uploadImageToImgbb(imageFile);
      }

      const updated = {
        title: editProduct.title,
        amount: parseFloat(editProduct.price),
        cover: imageUrl,
      };

      console.log(editProduct.serverId);

      await fetch(`https://review-task-server.vercel.app/tasks/${editProduct.serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      setProducts(prev =>
        prev.map(p => p.id === editProduct.id ? { ...p, title: updated.title, price: updated.amount, image: updated.cover } : p)
      );
      setEditModal(false);
      Swal.fire('Updated', 'Product updated successfully', 'success');
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire('Error', 'Failed to update product', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchId = filters.id ? p.product_id.toString().includes(filters.id) : true;
      const matchTitle = filters.title ? p.title.toLowerCase().includes(filters.title.toLowerCase()) : true;
      const matchMinPrice = filters.minPrice ? p.price >= parseFloat(filters.minPrice) : true;
      const matchMaxPrice = filters.maxPrice ? p.price <= parseFloat(filters.maxPrice) : true;
      return matchId && matchTitle && matchMinPrice && matchMaxPrice;
    })
    .sort((a, b) => {
      if (filters.sort === 'price-asc') return a.price - b.price;
      if (filters.sort === 'price-desc') return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
    setFilters({ id: '', title: '', minPrice: '', maxPrice: '', status: 'all', sort: 'none' });
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
        <button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}>
          {i}
        </button>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-between mt-6 gap-2 text-sm">
        <div className="flex gap-2 items-center">
          <span>Show</span>
          <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="border rounded px-2 py-1">
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>entries</span>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>{'<<'}</button>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>{'<'}</button>
          {pages}
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>{'>'}</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>{'>>'}</button>
        </div>
        <div className="flex items-center gap-2">
          <span>Go to</span>
          <input
            type="number"
            className="border px-2 py-1 rounded w-16"
            value={currentPage}
            min={1}
            max={totalPages}
            onChange={(e) => {
              const val = Math.min(Math.max(1, +e.target.value), totalPages);
              setCurrentPage(val);
            }}
          />
          <span>page</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-100 to-blue-200 min-h-screen">
      {/* Filters */}
      <div className="p-4 mb-4 shadow-xl bg-white rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input className="p-2 border rounded" placeholder="Product ID" value={filters.id} onChange={e => setFilters({ ...filters, id: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Product title" value={filters.title} onChange={e => setFilters({ ...filters, title: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Min price" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Max price" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
          <select className="p-2 border rounded col-span-1" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="none">Sort By</option>
            <option value="price-asc">Price Ascending</option>
            <option value="price-desc">Price Descending</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <button onClick={() => setCurrentPage(1)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"><Search size={16} /> Search</button>
          <button onClick={resetFilters} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-1"><RotateCw size={16} /> Reset</button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setShowModal(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"><Plus size={16} /> Add Product</button>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2"><input type="checkbox" onChange={toggleSelectAll} checked={paginatedProducts.every(p => selectedItems.includes(p.id))} /></th>
              <th className="p-2">Product ID</th>
              <th className="p-2">Product Image</th>
              <th className="p-2">Title</th>
              <th className="p-2">Price</th>
              <th className="p-2">Created At</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(product => (
              <tr key={product.id} className="hover:bg-blue-50">
                <td className="p-2"><input type="checkbox" checked={selectedItems.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                <td className="p-2">{product.product_id}</td>
                <td className="p-2"><img src={product.image || 'https://via.placeholder.com/40'} alt="product" className="w-10 h-10 object-cover rounded" /></td>
                <td className="p-2">{product.title}</td>
                <td className="p-2">${product.price}</td>
                <td className="p-2">{product.createdAt}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => startEdit(product)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"><Pencil size={16} className="inline" /> Edit</button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Add Product Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-[#11111180]">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg font-semibold">Add Product</Dialog.Title>
            <button onClick={() => setShowModal(false)}><X /></button>
          </div>
          <input type="text" placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} className="w-full border p-2 rounded" />
          <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border p-2 rounded" />
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full" />
          <button onClick={addProduct} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2">
            {uploading ? 'Uploading...' : 'Add Product'}
          </button>
        </Dialog.Panel>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-[#11111180]">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg font-semibold">Edit Product</Dialog.Title>
            <button onClick={() => setEditModal(false)}><X /></button>
          </div>
          <input type="text" placeholder="Title" value={editProduct?.title || ''} onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })} className="w-full border p-2 rounded" />
          <input type="number" placeholder="Price" value={editProduct?.price || ''} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} className="w-full border p-2 rounded" />
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full" />
          <button onClick={submitEdit} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2">
            {uploading ? 'Updating...' : 'Update Product'}
          </button>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
