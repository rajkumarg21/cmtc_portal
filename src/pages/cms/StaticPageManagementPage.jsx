// src/pages/cms/StaticPageManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {
  getAllStaticPages,
  getStaticPageById,
  createStaticPage,
  updateStaticPage,
  deleteStaticPage,
  approveStaticPage,
  rejectStaticPage
} from '../../services/staticPageService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import CustomisedReactQuill from '../../components/common/CustomReactQuill';

const StaticPageManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [pages, setPages] = useState([]);
  const [parentPages, setParentPages] = useState([]); // This will hold pages available as parents

  const [formData, setFormData] = useState({
    titleHindi: '',
    titleEnglish: '',
    slug: '',
    contentHindi: '',
    contentEnglish: '',
    showInNavbar: 'NO',
    parentPageId: '', // Will be string ID from select, converted to Number or null for API
    menuLevel: 0,
    order: 0, // Frontend uses 'order', backend uses 'orderInNavbar'
    status: 'PENDING_APPROVAL',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);

  const isEditing = !!id;

  // fetchData function to load all static pages and, if editing, the specific page data
  // Wrapped in useCallback to prevent unnecessary re-creations
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    const userHasRole = hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN']);
    if (!userHasRole) {
      setLoading(false);
      setError('You do not have permission to access this page.');
      return;
    }

    try {
      const allPagesRaw = (await getAllStaticPages()) ?? [];
      const fetchedPages = Array.isArray(allPagesRaw) ? allPagesRaw : [];

      setPages(fetchedPages);

      // Filter pages for the parent dropdown:
      // Exclude the current page if in edit mode (a page cannot be its own parent)
      // and only include pages that are PUBLISHED or ACTIVE (to ensure only stable pages can be parents)
      setParentPages(
        fetchedPages.filter(p =>
          (p.status === 'PUBLISHED' || p.status === 'ACTIVE') && // Only published/active pages can be parents
          (!isEditing || p.id !== Number(id)) // Exclude self if editing
        )
      );

      if (isEditing) {
        const pageData = await getStaticPageById(id);
        setFormData({
          titleHindi: pageData.titleHindi || '',
          titleEnglish: pageData.titleEnglish || '',
          slug: pageData.slug || '',
          contentHindi: pageData.contentHindi || '',
          contentEnglish: pageData.contentEnglish || '',
          showInNavbar: pageData.showInNavbar ? 'YES' : 'NO',
          // Crucial: parentId from backend should be used directly for dropdown
          // If it's null/undefined, default to empty string for the "--SELECT PARENT--" option
          parentPageId: pageData.parentId ? String(pageData.parentId) : '',
          menuLevel: pageData.menuLevel || 0,
          order: pageData.orderInNavbar || 0, // Backend uses orderInNavbar
          status: pageData.status || 'PENDING_APPROVAL',
        });
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load initial data: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to load initial data!');
      setPages([]); // Ensure state is reset on error
      setParentPages([]); // Ensure state is reset on error
    } finally {
      setLoading(false);
    }
  }, [id, isEditing, hasRole]); // Dependencies for useCallback

  useEffect(() => {
    fetchData(); // Call fetchData on component mount and when its dependencies change
  }, [fetchData]); // fetchData is a dependency because it's wrapped in useCallback

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuillHindiChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      contentHindi: value,
    }));
  };

  const handleQuillEnglishChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      contentEnglish: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    if (!formData.titleHindi || !formData.titleEnglish) {
      setError("Both Hindi and English titles are required.");
      toast.error("Both Hindi and English titles are required.");
      setLoading(false);
      return;
    }
    if (!formData.contentHindi || !formData.contentEnglish) {
      setError("Both Hindi and English content are required.");
      toast.error("Both Hindi and English content are required.");
      setLoading(false);
      return;
    }
    try {
      const payload = {
        ...formData,
        showInNavbar: formData.showInNavbar === 'YES',
        // Convert parentPageId from string (from select) to Number or null
        parentId: formData.parentPageId ? Number(formData.parentPageId) : null,
        menuLevel: Number(formData.menuLevel),
        orderInNavbar: Number(formData.order), // Map frontend 'order' to backend 'orderInNavbar'
      };

      // This check is good if 0 is used to explicitly mean no parent.
      // However, if the select value for '--SELECT PARENT--' is an empty string,
      // the `formData.parentPageId ? Number(...) : null` already handles it correctly.
      // This line becomes more of a defensive check for unexpected '0' values.
      if (payload.parentId === 0) {
        payload.parentId = null;
      }

      if (isEditing) {
        await updateStaticPage(id, payload);
        toast.success('Static page updated successfully and sent for approval!');
      } else {
        await createStaticPage(payload);
        toast.success('Static page added successfully and sent for approval!');
        // Reset form after successful creation
        setFormData({
          titleHindi: '',
          titleEnglish: '',
          slug: '',
          contentHindi: '',
          contentEnglish: '',
          showInNavbar: 'NO',
          parentPageId: '', // Reset to empty string for the dropdown
          menuLevel: 0,
          order: 0,
          status: 'PENDING_APPROVAL',
        });
      }
      // Re-fetch pages after submit to update the list
      await fetchData();
      setLoading(false);
      navigate('/cms/pages'); // Navigate back to the list view after save
    } catch (err) {
      console.error('Operation failed:', err);
      setError('Operation failed: ' + (err.response?.data?.message || err.message));
      toast.error('Operation failed: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleDeleteClick = (page) => {
    setPageToDelete(page);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await deleteStaticPage(pageToDelete.id);
      toast.success('Static page deleted successfully!');
      // Re-fetch pages after delete
      // await fetchData(); // Call fetchData directly to refresh the list
      navigate('/cms/pages');
    } catch (err) {
      setError('Failed to delete static page: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to delete static page!');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setPageToDelete(null);
    }
  };

  const handleApprove = async (pageId) => {
    setLoading(true);
    setError('');
    try {
      await approveStaticPage(pageId);
      toast.success('Static page approved successfully!');
      // Re-fetch pages after approve
      await fetchData(); // Call fetchData directly to refresh the list
    } catch (err) {
      setError('Failed to approve static page: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to approve static page!');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (pageId) => {
    setLoading(true);
    setError('');
    try {
      await rejectStaticPage(pageId);
      toast.info('Static page rejected!');
      // Re-fetch pages after reject
      await fetchData(); // Call fetchData directly to refresh the list
    } catch (err) {
      setError('Failed to reject static page: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to reject static page!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) return <p className="text-red-500 text-center py-8">{error}</p>;
  if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
    return <div className="text-center text-red-500 py-8">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center" style={{ color: '#4A000E' }}>Static Page Management</h1>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEditing ? 'Edit Static Page' : 'Add New Static Page'}
        </h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{message}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Title (Hindi)"
            id="titleHindi"
            name="titleHindi"
            value={formData.titleHindi}
            onChange={handleChange}
            required
            className="col-span-1"
          />
          <InputField
            label="Title (English)"
            id="titleEnglish"
            name="titleEnglish"
            value={formData.titleEnglish}
            onChange={handleChange}
            required
            className="col-span-1"
          />
          <div className="col-span-1">
            <InputField
              label="Slug (Path)"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="e.g., about-us, contact-info,"
            />
            <p className="text-xs text-gray-500 mt-1">⚠ Do not start with “/”</p>
          </div>
          {/* Quill editor for Hindi content */}
          <div className="col-span-2">
            <label htmlFor="contentHindi" className="block text-gray-700 text-sm font-bold mb-2">Content (Hindi):</label>
            <CustomisedReactQuill
              value={formData.contentHindi}
              onChange={handleQuillHindiChange}
            />
            {/* <ReactQuill
              theme="snow"
              value={formData.contentHindi}
              onChange={handleQuillHindiChange}
              className="bg-white rounded-md shadow-sm"
              modules={{
                toolbar: [
                  [{ 'font': [] }],
                  // [{ 'size': ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '36px'] }],

                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'script': 'sub' }, { 'script': 'super' }],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  [{ 'indent': '-1' }, { 'indent': '+1' }],
                  [{ 'direction': 'rtl' }, { 'align': [] }],
                  ['blockquote', 'code-block'],
                  ['link', 'image', 'video', 'formula'],
                  ['clean']
                ]

              }}  
            /> */}
          </div>

          {/* Quill editor for English content */}
          <div className="col-span-2">
            <label htmlFor="contentEnglish" className="block text-gray-700 text-sm font-bold mb-2">Content (English):</label>
            <CustomisedReactQuill
              value={formData.contentEnglish}
              onChange={handleQuillEnglishChange}
            />

            {/* <ReactQuill
              theme="snow"
              value={formData.contentEnglish}
              onChange={handleQuillEnglishChange}
              className="bg-white rounded-md shadow-sm"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  [{ 'script': 'sub' }, { 'script': 'super' }],
                  [{ 'indent': '-1' }, { 'indent': '+1' }],
                  [{ 'direction': 'rtl' }],
                  [{ 'size': ['small', false, 'large', 'huge'] }],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'font': [] }],
                  [{ 'align': [] }],
                  ['link', 'image', 'video'],
                  ['clean']
                ],
              }}
            /> */}
          </div>

          <div className="col-span-1">
            <label htmlFor="showInNavbar" className="block text-gray-700 text-sm font-bold mb-2">Show in Navbar:</label>
            <select
              id="showInNavbar"
              name="showInNavbar"
              value={formData.showInNavbar}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            >
              <option value="NO">No</option>
              <option value="YES">Yes</option>
            </select>
          </div>

          <div className="col-span-1">
            <label htmlFor="parentPageId" className="block text-gray-700 text-sm font-bold mb-2">Parent Page (for dropdowns):</label>
            <select
              id="parentPageId"
              name="parentPageId"
              value={formData.parentPageId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            >
              <option value="">--SELECT PARENT--</option>
              {/* Ensure parentPages is an array before mapping */}
              {(Array.isArray(parentPages) ? parentPages : []).map((page) => (
                <option key={page.id} value={page.id}>
                  {page.titleEnglish || page.titleHindi}
                  {/* Optionally, display status for clarity in the dropdown */}
                  {page.status !== 'PUBLISHED' && page.status !== 'ACTIVE' ? ` (Status: ${page.status.replace('_', ' ')})` : ''}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Select if this page is a sub-item in a menu.</p>
          </div>

          <InputField
            label="Menu Level"
            id="menuLevel"
            name="menuLevel"
            type="number"
            value={formData.menuLevel}
            onChange={handleChange}
            className="col-span-1"
            min="0"
            placeholder="0 for top-level, 1 for sub-item"
          />

          <InputField
            label="Order"
            id="order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            className="col-span-1"
            min="0"
            placeholder="Order in menu (lower is first)"
          />

          <div className="col-span-2">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
            <input
              type="text"
              id="status"
              name="status"
              value={formData.status}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-200 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">New content is submitted as 'PENDING_APPROVAL'.</p>
          </div>

          <div className="col-span-2 flex justify-center mt-6">
            <Button type="submit" disabled={loading}>
              {isEditing ? 'Update Page' : 'Submit Page'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ color: '#4A000E' }} >All Static Pages</h2>
        {pages.length === 0 ? (
          <p className="text-gray-600 text-center">No static pages found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title (EN)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Slug</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Show in Navbar</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Parent Page</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Menu Level</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Order</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Last Updated</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{page.titleEnglish}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <Link to={`/pages/${page.slug}`} className="text-blue-600 hover:underline">
                        /{page.slug}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{page.showInNavbar ? 'Yes' : 'No'}</td>
                    {/* MODIFIED LOGIC for displaying Parent Page Name */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {page.parentId
                        ? pages.find(p => p.id === page.parentId)?.titleEnglish || 'N/A'
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{page.menuLevel}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{page.orderInNavbar}</td> {/* Backend uses orderInNavbar */}
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${page.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        page.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {page.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(page.updatedAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/cms/pages/edit/${page.id}`)}>Edit</Button>
                        {hasRole(['PORTAL_ADMIN']) && (
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(page)}>Delete</Button>
                        )}
                        {/* Approval/Rejection buttons */}
                        {(hasRole(['PUBLISHER', 'PORTAL_ADMIN']) && page.status === 'PENDING_APPROVAL') && (
                          <>
                            <Button variant="success" size="sm" onClick={() => handleApprove(page.id)}>Approve</Button>
                            <Button variant="warning" size="sm" onClick={() => handleReject(page.id)}>Reject</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete page "${pageToDelete?.titleEnglish || pageToDelete?.titleHindi}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default StaticPageManagementPage;