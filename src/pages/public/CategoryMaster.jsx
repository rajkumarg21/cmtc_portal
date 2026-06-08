// src/components/CategoryMaster.jsx
import React, { useState, useEffect } from 'react';
import { createCategory, fetchAllCategories, updateCategory, deleteCategory } from "../../services/categoryService.js";
import swal from "sweetalert";
const CategoryMaster = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('CIRCULAR');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // 1️⃣ Runs only once, when component mounts
useEffect(() => {
  loadCategories();
}, []);

// 2️⃣ Runs every time error or successMessage changes
useEffect(() => {
  if (error || successMessage) {
    const timer = setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [error, successMessage]);


    const loadCategories = async () => {
        try {
            const data = await fetchAllCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            const categoryData = { name, code, type };
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
                setSuccessMessage('Category updated successfully!');
                setEditingCategory(null);
            } else {
                await createCategory(categoryData);
                setSuccessMessage('Category created successfully!');
            }

            setName('');
            setCode('');
            setType('CIRCULAR');
            loadCategories();
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError('Failed to save category.');
            }
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setName(category.name);
        setCode(category.code);
        setType(category.type);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id);
                setSuccessMessage("Category deleted successfully!");
                loadCategories();
            } catch (err) {
                setError("Failed to delete category.");
            }
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(categories.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
 <div style={{ padding: '20px', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '16px', color: '#07031dff' }}>
            <h1 style={{ fontSize: '28px', textAlign: 'center', color: '#800080' }}>Category Management </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '22px', textAlign: 'center', color: '#800080', marginBottom: '20px', marginTop: '10px' }}>
                     {editingCategory ? "Edit Category" : "Add New Category"}</h2>
                {error && <p style={{ color: 'red', fontSize: '28px', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green', fontSize: '28px', fontWeight: 'bold', textAlign: 'center' }}>{successMessage}</p>}



                {/* Row 1 - Name & Code */}
    <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '80px', marginRight: '10px' }}>Name:</label>
        <input
            type="text"
            value={name}
            onChange={(e) => {
                if (e.target.value.length > 30) {
                    swal({
                        text: "Name cannot be more than 30 characters!",
                        icon: "warning",
                    });

                    return;
                }
                setName(e.target.value);
            }}
            required
            style={{ flex: 1, padding: '8px', fontSize: '16px', fontWeight: '500', color: '#000' }}
        />
    </div>

    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <label style={{ width: '80px', marginRight: '10px' }}>Code:</label>
        <input
            type="text"
            value={code}
            onChange={(e) => {
                if (e.target.value.length > 30) {
                    swal({
                        text: "Code cannot be more than 30 characters!",
                        icon: "warning",
                    });
                    return;
                }
                setCode(e.target.value);
            }}
            required
            style={{ flex: 1, padding: '8px', fontSize: '16px', fontWeight: '500', color: '#000' }}
        />
    </div>
</div>
                {/* Row 2 - Type & Buttons */}
 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '30px' }}>

        {/* Type field */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
            <label style={{ width: '80px', marginRight: '10px' }}>Type:</label>
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
            style={{ width: '300px', padding: '8px' }}
            >
                <option value="CIRCULAR">CIRCULAR</option>
                <option value="GALLERY">GALLERY</option>
                {/* <option value="NEWS">NEWS</option>
                <option value="STATIC_PAGE">STATIC_PAGE</option> */}
            </select>
        </div>

         {/* Buttons (closer now) */}
    <div style={{ display: 'flex', gap: '10px' }}>
        <button
            type="submit"
            style={{
                padding: '10px 40px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
            }}
        >
            {editingCategory ? "Update Category" : "Create Category"}
        </button>

        <button
            type="button"
            onClick={() => {
                setEditingCategory(null);
                setName('');
                setCode('');
                setType('CIRCULAR');
            }}
            style={{
                padding: '10px 40px',
                cursor: 'pointer',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
            }}
        >
            {editingCategory ? "Cancel" : "Reset"}
        </button>
    </div>
</div>

            </form>

            {/* Table */}
            <h2 style={{ fontSize: '24px', textAlign: 'center', color: '#800080', margin: '20px 0' }}>  All Existing Categories</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Code</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Type</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCategories.length > 0 ? (
                        currentCategories.map(cat => (
                            <tr key={cat.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cat.id}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cat.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cat.code}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cat.type}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button onClick={() => handleEdit(cat)} style={{ padding: '5px 10px', marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No categories found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        style={{
                            padding: '8px 12px',
                            margin: '0 5px',
                            cursor: 'pointer',
                            backgroundColor: currentPage === i + 1 ? '#007bff' : '#f2f2f2',
                            color: currentPage === i + 1 ? 'white' : 'black',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryMaster;
