import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { getAllGalleryItemsAdmin, getGalleryItemByIdAdmin, createGalleryItem, updateGalleryItem, deleteGalleryItem, getGalleryCategories } from '../../services/galleryService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { MEDIA_TYPES } from '../../utils/constants';

const GalleryManagementPage = () => {
  const { id } = useParams(); // For editing existing gallery item
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [galleryItems, setGalleryItems] = useState([]); // For listing all gallery items
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    titleHindi: '',
    titleEnglish: '',
    description: '',
    mediaType: MEDIA_TYPES.IMAGE, // Default media type
    mediaUrl: '', // To display current media URL when editing
    thumbnailUrl: '', // To display current thumbnail URL for videos
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null); // For video thumbnails
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const isEditing = !!id;

  const fetchGalleryData = async () => {
    setLoading(true);
    setError('');
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getAllGalleryItemsAdmin(),
        getGalleryCategories()
      ]);
      setGalleryItems(itemsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // Sort by creation date desc
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to fetch gallery data: ' + (err.response?.data || err.message));
      console.error('Error fetching gallery data:', err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
      setLoading(false);
      setError('You do not have permission to access this page.');
      return;
    }

    const fetchData = async () => {
      await fetchGalleryData(); // Fetch all items for the list

      if (isEditing) {
        try {
          const itemData = await getGalleryItemByIdAdmin(id);
          setFormData({
            categoryId: itemData.categoryId || '',
            titleHindi: itemData.titleHindi || '',
            titleEnglish: itemData.titleEnglish || '',
            description: itemData.description || '',
            mediaType: itemData.mediaType || MEDIA_TYPES.IMAGE,
            mediaUrl: itemData.mediaUrl || '',
            thumbnailUrl: itemData.thumbnailUrl || '',
          });
        } catch (err) {
          setError('Failed to load gallery item for editing: ' + (err.response?.data || err.message));
          console.error('Error fetching gallery item for edit:', err);
        }
      }
    };

    fetchData();
  }, [id, isEditing, hasRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMediaFileChange = (e) => {
     const file = e.target.files[0];
     if (!file) return;
     const isImage = formData.mediaType === MEDIA_TYPES.IMAGE;

     if (isImage && file.size >100 * 1024) {
       alert("Image size should not exceed 100 KB.");
       e.target.value = null;
      return;
  }
    setMediaFile(file);
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
  if (!file) return;
  const isVideo = formData.mediaType === MEDIA_TYPES.VIDEO;
  if (isVideo && file.size > 25 * 1024 * 1024) {
    alert("Video size should not exceed 25 MB.");
    e.target.value = null;
    return;
  }
    setThumbnailFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = { ...formData }; // No need to modify dates here

      if (isEditing) {
        await updateGalleryItem(id, payload, mediaFile, thumbnailFile);
        setMessage('Gallery item updated successfully!');
      } else {
        await createGalleryItem(payload, mediaFile, thumbnailFile);
        setMessage('Gallery item added successfully!');
        setFormData({
          categoryId: '',
          titleHindi: '',
          titleEnglish: '',
          description: '',
          mediaType: MEDIA_TYPES.IMAGE,
          mediaUrl: '',
          thumbnailUrl: '',
        });
        setMediaFile(null);
        setThumbnailFile(null);
      }
      await fetchGalleryData(); // Refresh the list and categories
      setLoading(false);
      navigate('/cms/gallery'); // Navigate back to list
    } catch (err) {
      setError('Operation failed: ' + (err.response?.data || err.message));
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await deleteGalleryItem(itemToDelete.id);
      setMessage('Gallery item deleted successfully!');
      setGalleryItems(galleryItems.filter(item => item.id !== itemToDelete.id));
    } catch (err) {
      setError('Failed to delete gallery item: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
  if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
    return <div className="text-center text-red-500 py-8">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center" style={{ color: '#4A000E' }}>Gallery Management</h1>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEditing ? 'Edit Gallery Item' : 'Add New Gallery Item'}
        </h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label htmlFor="categoryId" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            >
              <option value="">--SELECT CATEGORY--</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="mediaType" className="block text-gray-700 text-sm font-bold mb-2">Media Type:</label>
            <select
              id="mediaType"
              name="mediaType"
              value={formData.mediaType}
              onChange={handleChange}
              required
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            >
              <option value={MEDIA_TYPES.IMAGE}>Image</option>
              <option value={MEDIA_TYPES.VIDEO}>Video</option>
            </select>
          </div>
          <div className="col-md-6">
             <InputField
            label="Title (Hindi)"
            id="titleHindi"
            name="titleHindi"
            value={formData.titleHindi}
            onChange={handleChange}
            required
            className="shadow-none"
          />
          </div>
           <div className="col-md-6">
             <InputField
            label="Title (English)"
            id="titleEnglish"
            name="titleEnglish"
            value={formData.titleEnglish}
            onChange={handleChange}
            required
            className="shadow-none"
          />

          </div>
         
          <div className="col-md-12">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            ></textarea>
          </div>

          <div className="col-md-12">
            <label htmlFor="mediaFile" className="block text-gray-700 text-sm font-bold mb-2">
              {formData.mediaType === MEDIA_TYPES.IMAGE ? 'Image File:' : 'Video File:'}
            </label>
            <input
              type="file"
              id="mediaFile"
              name="mediaFile"
              accept={formData.mediaType === MEDIA_TYPES.IMAGE ? 'image/*' : 'video/*'}
              onChange={handleMediaFileChange}
              className=" shadow-none block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isEditing && formData.mediaUrl && !mediaFile && (
              <p className="text-sm text-gray-600 mt-2">Current media: <a href={`${import.meta.env.VITE_BASE_URL}${formData.mediaUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
            )}
            {mediaFile && (
              <p className="text-sm text-gray-600 mt-2">New media selected: {mediaFile.name}</p>
            )}
          </div>

          {formData.mediaType === MEDIA_TYPES.VIDEO && (
            <div className="col-md-12">
              <label htmlFor="thumbnailFile" className="block text-gray-700 text-sm font-bold mb-2">Video Thumbnail:</label>
              <input
                type="file"
                id="thumbnailFile"
                name="thumbnailFile"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                className=" shadow-none block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {isEditing && formData.thumbnailUrl && !thumbnailFile && (
                <p className="text-sm text-gray-600 mt-2">Current thumbnail: <a href={`${import.meta.env.VITE_BASE_URL}${formData.thumbnailUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
              )}
              {thumbnailFile && (
                <p className="text-sm text-gray-600 mt-2">New thumbnail selected: {thumbnailFile.name}</p>
              )}
            </div>
          )}

          <div className="col-md-12">
            <Button type="submit" disabled={loading} className="float-right">
              {isEditing ? 'Update Gallery Item' : 'Submit Gallery Item'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">All Gallery Items</h2>
        {galleryItems.length === 0 ? (
          <p className="text-gray-600 text-center">No gallery items found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title (EN)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleryItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{item.titleEnglish}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.mediaType}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.categoryName}</td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">{formatDate(item.createdAt)}</td> */}
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/cms/gallery/${item.id}`)}>Edit</Button>
                        {hasRole(['PORTAL_ADMIN']) && ( // Only Admin can delete
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(item)}>Delete</Button>
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
        message={`Are you sure you want to delete gallery item "${itemToDelete?.titleEnglish}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default GalleryManagementPage;
