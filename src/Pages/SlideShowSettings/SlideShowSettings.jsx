import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import 'sweetalert2/dist/sweetalert2.min.css';

const SlideShowSettings = () => {
    const [data, setData] = useState([
        {
            id: 1,
            name: '01',
            switch: 'open',
            image: '',
            link: 'https://apps.apple.com/us/app/qantas-airways/id640437525',
        },
        {
            id: 2,
            name: '02',
            switch: 'open',
            image: '',
            link: 'https://apps.apple.com/us/app/paramount/id530168168',
        },
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const handleAdd = () => {
        let imagePreview = null;
        let imageFile = null;

        Swal.fire({
            title: 'New wheel broadcast',
            html: `
                <input type="text" id="picNum" class="swal2-input" placeholder="Picture number" />
                <input type="text" id="picName" class="swal2-input" placeholder="Picture name" />
                <div style="text-align:left;margin-left:20px;">
                    <label>Picture switch:</label><br/>
                    <input type="radio" name="picSwitch" value="close" checked /> Close
                    <input type="radio" name="picSwitch" value="open" style="margin-left:10px;" /> Open
                </div>
                <br/>
                <div style="text-align:left;margin-left:20px;">
                    <label>Rotating pictures (360×430):</label>
                    <input type="file" id="picImage" accept="image/*" class="swal2-file" />
                    <img id="imagePreview" src="" style="display:none; max-width: 100px; margin-top: 10px;" />
                </div>
                <textarea id="picLink" class="swal2-textarea" placeholder="Link address"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Take away',
            didOpen: () => {
                const fileInput = document.getElementById('picImage');
                const previewImg = document.getElementById('imagePreview');

                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        imageFile = file;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            imagePreview = event.target.result;
                            previewImg.src = imagePreview;
                            previewImg.style.display = 'block';
                        };
                        reader.readAsDataURL(file);
                    }
                });
            },
            preConfirm: () => {
                const number = document.getElementById('picNum').value;
                const name = document.getElementById('picName').value;
                const link = document.getElementById('picLink').value;
                const switchValue = document.querySelector('input[name="picSwitch"]:checked').value;

                if (!number || !name || !link || !imagePreview) {
                    Swal.showValidationMessage('All fields including image are required');
                    return false;
                }

                return {
                    id: Date.now(),
                    name,
                    switch: switchValue,
                    image: imagePreview,
                    link,
                };
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                setData((prev) => [...prev, result.value]);
                Swal.fire('Success', 'New broadcast added!', 'success');
            }
        });
    };

    const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(data.length / pageSize);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">🎡 Rotating Graph Settings</h1>
                <button
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-5 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all"
                    onClick={handleAdd}
                >
                    <FaPlus /> New wheel broadcast
                </button>
            </div>
            <p className="text-sm text-red-500 mb-4">⚠️ Please ensure at least 3 pictures are marked as "Open".</p>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Switch</th>
                            <th className="px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left">Link</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, idx) => (
                            <tr
                                key={item.id}
                                className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-all`}
                            >
                                <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                                <td className="px-4 py-2">{item.id}</td>
                                <td className="px-4 py-2 font-medium">{item.name}</td>
                                <td className="px-4 py-2 capitalize">{item.switch}</td>
                                <td className="px-4 py-2">
                                    {item.image ? (
                                        <img src={item.image} alt="Preview" className="w-20 h-auto rounded shadow" />
                                    ) : (
                                        <span className="text-gray-400 italic">No image</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline break-words"
                                    >
                                        {item.link}
                                    </a>
                                </td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1">
                                        <FaEdit /> Edit
                                    </button>
                                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1">
                                        <FaTrash /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center items-center gap-4">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all"
                >
                    Previous
                </button>
                <span className="text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SlideShowSettings;
