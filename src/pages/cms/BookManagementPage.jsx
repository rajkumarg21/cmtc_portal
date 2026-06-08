import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {
  getAllBooksAdmin,
  getBookByIdAdmin,
  createBook,
  updateBook,
  deleteBook,
  approveBook, // <--- NEW IMPORT
  rejectBook  // <--- NEW IMPORT
} from '../../services/bookService';
import { getAllAuthorsAdmin } from '../../services/authorService'; // To get authors for dropdown
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { CONTENT_STATUS } from '../../utils/constants';
import { toast } from 'react-toastify'; // <--- NEW IMPORT: For user notifications

const BookManagementPage = () => {
  const { id } = useParams(); // For editing existing book
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [books, setBooks] = useState([]); // For listing all books
  const [authors, setAuthors] = useState([]); // For author dropdown
  const [formData, setFormData] = useState({
    authorId: '',
    titleHindi: '',
    titleEnglish: '',
    description: '',
    coverImageUrl: '', // To display current cover image URL when editing
    pdfUrl: '', // To display current PDF URL when editing
    publishedAt: '',
    status: CONTENT_STATUS.PENDING_APPROVAL, // Default status for new content
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Kept for consistency, but toast is preferred
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const isEditing = !!id;

  const fetchBooksAndAuthors = async () => {
    setLoading(true);
    setError('');
    try {
      const [booksData, authorsData] = await Promise.all([
        getAllBooksAdmin(),
        getAllAuthorsAdmin()
      ]);
      setBooks(booksData.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))); // Sort by published/created date desc
      setAuthors(authorsData);
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching books or authors:', err);
      toast.error('Failed to fetch books or authors.');
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
      await fetchBooksAndAuthors(); // Fetch all books and authors for the lists

      if (isEditing) {
        try {
          const bookData = await getBookByIdAdmin(id);
          setFormData({
            authorId: bookData.authorId || '',
            titleHindi: bookData.titleHindi || '',
            titleEnglish: bookData.titleEnglish || '',
            description: bookData.description || '',
            coverImageUrl: bookData.coverImageUrl || '',
            pdfUrl: bookData.pdfUrl || '',
            publishedAt: bookData.publishedAt ? new Date(bookData.publishedAt).toISOString().split('T')[0] : '',
            status: bookData.status || CONTENT_STATUS.PENDING_APPROVAL,
          });
        } catch (err) {
          setError('Failed to load book for editing: ' + (err.response?.data?.message || err.message));
          console.error('Error fetching book for edit:', err);
          toast.error('Failed to load book for editing.');
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

  const handleCoverImageChange = (e) => {
     const file = e.target.files[0];
         if (!file) return;
    
         if (file.size >100 * 1024) {
           alert("Image size should not exceed 100 KB.");
           e.target.value = null;
          return;
      }
    setCoverImageFile(file);
  };

  const handlePdfFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage(''); // Clear old message
    setLoading(true);

    try {
      const payload = {
        ...formData,
        // Ensure authorId is a number (Long) for the backend
        authorId: Number(formData.authorId),
        publishedAt: formData.publishedAt || null,
      };

      // Basic validation to prevent sending 0 or NaN as authorId
      if (isNaN(payload.authorId) || payload.authorId === 0) {
          setError("Please select a valid author.");
          toast.error("Please select a valid author.");
          setLoading(false);
          return;
      }

      if (isEditing) {
        await updateBook(id, payload, coverImageFile, pdfFile);
        toast.success('Book updated successfully and sent for approval!');
      } else {
        await createBook(payload, coverImageFile, pdfFile);
        toast.success('Book added successfully and sent for approval!');
        // Reset form after successful creation
        setFormData({
          authorId: '',
          titleHindi: '',
          titleEnglish: '',
          description: '',
          coverImageUrl: '',
          pdfUrl: '',
          publishedAt: '',
          status: CONTENT_STATUS.PENDING_APPROVAL,
        });
        setCoverImageFile(null);
        setPdfFile(null);
      }
      await fetchBooksAndAuthors(); // Refresh the list
      setLoading(false);
      navigate('/cms/books'); // Navigate back to list
    } catch (err) {
      console.error('Operation failed:', err); // Log full error for debugging
      setError('Operation failed: ' + (err.response?.data?.message || err.message));
      toast.error('Operation failed: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await deleteBook(bookToDelete.id);
      toast.success('Book deleted successfully!');
      await fetchBooksAndAuthors(); // Refresh list after delete
    } catch (err) {
      setError('Failed to delete book: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to delete book!');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setBookToDelete(null);
    }
  };

  // NEW: Handlers for Approve/Reject actions for books
  const handleApprove = async (bookId) => {
    setLoading(true);
    setError('');
    try {
      await approveBook(bookId); // Assuming this function exists in bookService
      toast.success('Book approved successfully!');
      await fetchBooksAndAuthors(); // Refresh list to show updated status
    } catch (err) {
      setError('Failed to approve book: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to approve book!');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (bookId) => {
    setLoading(true);
    setError('');
    try {
      await rejectBook(bookId); // Assuming this function exists in bookService
      toast.info('Book rejected!');
      await fetchBooksAndAuthors(); // Refresh list to show updated status
    } catch (err) {
      setError('Failed to reject book: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to reject book!');
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
  if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
    return <div className="text-center text-red-500 py-8">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center" style={{ color: '#4A000E' }}>Publication Management</h1>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEditing ? 'Edit publication' : 'Add New publication'}
        </h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-12">
            <label htmlFor="authorId" className="block text-gray-700 text-sm font-bold mb-2">Author:</label>
            <select
              id="authorId"
              name="authorId"
              value={formData.authorId}
              onChange={handleChange}
              required
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            >
              <option value="">--SELECT AUTHOR--</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>{author.nameEnglish || author.nameHindi}</option>
              ))}
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

          <div className="col-md-6">
            <label htmlFor="coverImage" className="block text-gray-700 text-sm font-bold mb-2">Cover Image:</label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="shadow-none block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isEditing && formData.coverImageUrl && !coverImageFile && (
              <p className="text-sm text-gray-600 mt-2">Current cover: <a href={`${import.meta.env.VITE_BASE_URL}${formData.coverImageUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
            )}
            {coverImageFile && (
              <p className="text-sm text-gray-600 mt-2">New cover selected: {coverImageFile.name}</p>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="pdfFile" className="block text-gray-700 text-sm font-bold mb-2">Book PDF File:</label>
            <input
              type="file"
              id="pdfFile"
              name="pdfFile"
              accept=".pdf"
              onChange={handlePdfFileChange}
              className=" shadow-none block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isEditing && formData.pdfUrl && !pdfFile && (
              <p className="text-sm text-gray-600 mt-2">Current PDF: <a href={`${import.meta.env.VITE_BASE_URL}${formData.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
            )}
            {pdfFile && (
              <p className="text-sm text-gray-600 mt-2">New PDF selected: {pdfFile.name}</p>
            )}
          </div>

          {/* <InputField
            label="Published At"
            id="publishedAt"
            name="publishedAt"
            type="date"
            value={formData.publishedAt}
            onChange={handleChange}
            className="col-span-1"
          /> */}
          <div className="col-md-6">
            <InputField
            label="Published At"
            id="publishedAt"
            name="publishedAt"
            type="date"
            value={formData.publishedAt || new Date().toISOString().split("T")[0]} // default today
            onChange={handleChange}
            className="shadow-none"
          />
          </div>
          
          <div className="col-md-6">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
            <input
              type="text"
              id="status"
              name="status"
              value={formData.status}
              disabled
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-200 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">New content is submitted as 'PENDING_APPROVAL'.</p>
          </div>

          <div className="col-md-12">
            <Button type="submit" disabled={loading} className="float-right">
              {isEditing ? 'Update Book' : 'Submit Book'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{ color: '#4A000E' }}>All Publication</h2>
        {books.length === 0 ? (
          <p className="text-gray-600 text-center">No books found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title (EN)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Author</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Published At</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{book.titleEnglish}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{book.authorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{new Date(book.publishedAt || book.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        book.status === CONTENT_STATUS.PUBLISHED ? 'bg-green-100 text-green-800' :
                        book.status === CONTENT_STATUS.PENDING_APPROVAL ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/cms/books/${book.id}`)}>Edit</Button>
                        {hasRole(['PORTAL_ADMIN']) && ( // Only Admin can delete
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(book)}>Delete</Button>
                        )}
                        {/* APPROVE/REJECT BUTTONS FOR BOOKS - NEWLY ADDED LOGIC */}
                        {(hasRole(['PUBLISHER', 'PORTAL_ADMIN']) && book.status === CONTENT_STATUS.PENDING_APPROVAL) && (
                          <>
                            <Button variant="success" size="sm" onClick={() => handleApprove(book.id)}>Approve</Button>
                            <Button variant="warning" size="sm" onClick={() => handleReject(book.id)}>Reject</Button>
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
        message={`Are you sure you want to delete book "${bookToDelete?.titleEnglish}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default BookManagementPage;
