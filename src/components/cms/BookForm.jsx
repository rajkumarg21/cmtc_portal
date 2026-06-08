// src/components/cms/BookForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllAuthors } from '../../services/authorService'; // Assuming you have an author service

const BookForm = ({ book, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    titleHindi: '',
    titleEnglish: '',
    authorId: '',
    description: '',
    publisher: '',
    isbn: '',
    publicationYear: '',
    coverImageFile: null, // For new file upload
    pdfFile: null,       // For new file upload
    existingCoverImageUrl: '', // To display existing image URL if editing
    existingPdfUrl: '',        // To display existing PDF URL if editing
  });
  const [authors, setAuthors] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Populate form for editing
    if (book) {
      setFormData({
        titleHindi: book.titleHindi || '',
        titleEnglish: book.titleEnglish || '',
        authorId: book.authorId || '',
        description: book.description || '',
        publisher: book.publisher || '',
        isbn: book.isbn || '',
        publicationYear: book.publicationYear || '',
        coverImageFile: null,
        pdfFile: null,
        existingCoverImageUrl: book.coverImageUrl || '',
        existingPdfUrl: book.pdfUrl || '',
      });
    } else {
      // Reset form for adding new
      setFormData({
        titleHindi: '',
        titleEnglish: '',
        authorId: '',
        description: '',
        publisher: '',
        isbn: '',
        publicationYear: '',
        coverImageFile: null,
        pdfFile: null,
        existingCoverImageUrl: '',
        existingPdfUrl: '',
      });
    }
  }, [book]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const data = await getAllAuthors(); // Assuming this service call exists
        setAuthors(data);
      } catch (error) {
        console.error('Error fetching authors:', error);
        toast.error('Failed to load authors.');
      }
    };
    fetchAuthors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.titleHindi.trim()) errors.titleHindi = 'Hindi title is required.';
    if (!formData.titleEnglish.trim()) errors.titleEnglish = 'English title is required.';
    if (!formData.authorId) errors.authorId = 'Author is required.';
    if (!formData.publisher.trim()) errors.publisher = 'Publisher is required.';
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required.';
    if (!formData.publicationYear || isNaN(formData.publicationYear) || formData.publicationYear < 1000 || formData.publicationYear > new Date().getFullYear()) {
      errors.publicationYear = 'Valid publication year is required.';
    }

    if (!book) { // For new book creation, files are required
      if (!formData.coverImageFile) errors.coverImageFile = 'Cover image is required.';
      if (!formData.pdfFile) errors.pdfFile = 'PDF file is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    const data = new FormData();
    data.append('titleHindi', formData.titleHindi);
    data.append('titleEnglish', formData.titleEnglish);
    data.append('authorId', formData.authorId);
    data.append('description', formData.description);
    data.append('publisher', formData.publisher);
    data.append('isbn', formData.isbn);
    data.append('publicationYear', formData.publicationYear);

    if (formData.coverImageFile) {
      data.append('coverImageFile', formData.coverImageFile);
    } else if (book && book.coverImageUrl) {
      // If no new file is uploaded, retain the existing URL
      data.append('coverImageUrl', book.coverImageUrl);
    }
    
    if (formData.pdfFile) {
      data.append('pdfFile', formData.pdfFile);
    } else if (book && book.pdfUrl) {
      // If no new file is uploaded, retain the existing URL
      data.append('pdfUrl', book.pdfUrl);
    }

    onSave(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{book ? 'Edit Book' : 'Add New Book'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="titleEnglish" className="block text-sm font-medium text-gray-700">Title (English)</label>
            <input
              type="text"
              name="titleEnglish"
              id="titleEnglish"
              value={formData.titleEnglish}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {formErrors.titleEnglish && <p className="text-red-500 text-xs mt-1">{formErrors.titleEnglish}</p>}
          </div>
          <div>
            <label htmlFor="titleHindi" className="block text-sm font-medium text-gray-700">Title (Hindi)</label>
            <input
              type="text"
              name="titleHindi"
              id="titleHindi"
              value={formData.titleHindi}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {formErrors.titleHindi && <p className="text-red-500 text-xs mt-1">{formErrors.titleHindi}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="authorId" className="block text-sm font-medium text-gray-700">Author</label>
          <select
            name="authorId"
            id="authorId"
            value={formData.authorId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select an Author</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.nameEnglish} ({author.nameHindi})
              </option>
            ))}
          </select>
          {formErrors.authorId && <p className="text-red-500 text-xs mt-1">{formErrors.authorId}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            id="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">Publisher</label>
            <input
              type="text"
              name="publisher"
              id="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {formErrors.publisher && <p className="text-red-500 text-xs mt-1">{formErrors.publisher}</p>}
          </div>
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN</label>
            <input
              type="text"
              name="isbn"
              id="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {formErrors.isbn && <p className="text-red-500 text-xs mt-1">{formErrors.isbn}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700">Publication Year</label>
          <input
            type="number"
            name="publicationYear"
            id="publicationYear"
            value={formData.publicationYear}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {formErrors.publicationYear && <p className="text-red-500 text-xs mt-1">{formErrors.publicationYear}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="coverImageFile" className="block text-sm font-medium text-gray-700">Cover Image</label>
          <input
            type="file"
            name="coverImageFile"
            id="coverImageFile"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {formErrors.coverImageFile && <p className="text-red-500 text-xs mt-1">{formErrors.coverImageFile}</p>}
          {book && book.coverImageUrl && !formData.coverImageFile && (
            <p className="text-sm text-gray-500 mt-2">Current Image: <a href={book.coverImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Current</a></p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">Book PDF</label>
          <input
            type="file"
            name="pdfFile"
            id="pdfFile"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {formErrors.pdfFile && <p className="text-red-500 text-xs mt-1">{formErrors.pdfFile}</p>}
          {book && book.pdfUrl && !formData.pdfFile && (
            <p className="text-sm text-gray-500 mt-2">Current PDF: <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Current</a></p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : (book ? 'Update Book' : 'Add Book')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;