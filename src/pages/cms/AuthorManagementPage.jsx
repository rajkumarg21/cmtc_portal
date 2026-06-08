import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { getAllAuthorsAdmin, getAuthorByIdAdmin, createAuthor, updateAuthor, deleteAuthor } from '../../services/authorService';
import { useAuth } from '../../context/AuthContext';

const AuthorManagementPage = () => {
  const { id } = useParams(); // For editing existing author
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [authors, setAuthors] = useState([]); // For listing all authors
  const [formData, setFormData] = useState({
    nameHindi: '',
    nameEnglish: '',
    biographyHindi: '',
    biographyEnglish: '',
    imageUrl: '', // To display current image URL when editing
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState(null);

  const isEditing = !!id;

  const fetchAuthors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllAuthorsAdmin();
      setAuthors(data.sort((a, b) => a.nameEnglish.localeCompare(b.nameEnglish))); // Sort by English name alphabetically
    } catch (err) {
      setError('Failed to fetch authors: ' + (err.response?.data || err.message));
      console.error('Error fetching authors:', err);
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
      await fetchAuthors(); // Fetch all authors for the list

      if (isEditing) {
        try {
          const authorData = await getAuthorByIdAdmin(id);
          setFormData({
            nameHindi: authorData.nameHindi || '',
            nameEnglish: authorData.nameEnglish || '',
            biographyHindi: authorData.biographyHindi || '',
            biographyEnglish: authorData.biographyHindi || '',
            imageUrl: authorData.imageUrl || '',
          });
          
        } catch (err) {
          setError('Failed to load author for editing: ' + (err.response?.data || err.message));
          console.error('Error fetching author for edit:', err);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
         if (!file) return;
    
         if (file.size >100 * 1024) {
           alert("Image size should not exceed 100 KB.");
           e.target.value = null;
          return;
      }
     setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = { ...formData }; // No date fields to handle

      if (isEditing) {
        await updateAuthor(id, payload, imageFile);
        setMessage('Author updated successfully!');
      } else {
        await createAuthor(payload, imageFile);
        setMessage('Author added successfully!');
        setFormData({
          nameHindi: '',
          nameEnglish: '',
          biographyHindi: '',
          biographyEnglish: '',
          imageUrl: '',
        });
        setImageFile(null);
      }
      await fetchAuthors(); // Refresh the list
      setLoading(false);
      navigate('/cms/authors'); // Navigate back to list
    } catch (err) {
      setError('Operation failed: ' + (err.response?.data || err.message));
      setLoading(false);
    }
  };

  const handleDeleteClick = (author) => {
    setAuthorToDelete(author);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await deleteAuthor(authorToDelete.id);
      setMessage('Author deleted successfully!');
      setAuthors(authors.filter(a => a.id !== authorToDelete.id));
    } catch (err) {
      setError('Failed to delete author: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setAuthorToDelete(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
  if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
    return <div className="text-center text-red-500 py-8">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center" style={{ color: '#4A000E' }}>Author Management</h1>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEditing ? 'Edit Author' : 'Add New Author'}
        </h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <InputField
            label="Name (Hindi)"
            id="nameHindi"
            name="nameHindi"
            value={formData.nameHindi}
            onChange={handleChange}
            required
            className="shadow-none"
          />
          <InputField
            label="Name (English)"
            id="nameEnglish"
            name="nameEnglish"
            value={formData.nameEnglish}
            onChange={handleChange}
            required
            className="shadow-none"
          />

          <div className="col-md-12">
            <label htmlFor="bioHindi" className="block text-gray-700 text-sm font-bold mb-2">Biography (Hindi):</label>
            <textarea
              id="biographyHindi"
              name="biographyHindi"
              value={formData.biographyHindi}
              onChange={handleChange}
              rows="4"
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            ></textarea>
          </div>
          <div className="col-md-12">
            <label htmlFor="bioEnglish" className="block text-gray-700 text-sm font-bold mb-2">Biography (English):</label>
            <textarea
              id="biographyEnglish"
              name="biographyEnglish"
              value={formData.biographyEnglish}
              onChange={handleChange}
              rows="4"
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            ></textarea>
          </div>

          <div className="col-md-12">
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">Author Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isEditing && formData.imageUrl && (
              <p className="text-sm text-gray-600 mt-2">Current image: <a href={`${import.meta.env.VITE_BASE_URL}${formData.imageUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
            )}
            {imageFile && (
              <p className="text-sm text-gray-600 mt-2">New image selected: {imageFile.name}</p>
            )}
          </div>

          <div className="col-md-12">
            <Button type="submit" disabled={loading} className="float-right">
              {isEditing ? 'Update Author' : 'Submit Author'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">All Authors</h2>
        {authors.length === 0 ? (
          <p className="text-gray-600 text-center">No authors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name (EN)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Biography (EN)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{author.nameEnglish}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{author.biographyEnglish ? author.biographyEnglish.substring(0, 75) + '......' : 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/cms/authors/${author.id}`)}>Edit</Button>
                        {hasRole(['PORTAL_ADMIN']) && ( // Only Admin can delete
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(author)}>Delete</Button>
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
        message={`Are you sure you want to delete author "${authorToDelete?.nameEnglish}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AuthorManagementPage;
