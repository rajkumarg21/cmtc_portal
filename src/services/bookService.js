// src/services/bookService.js
import api from './apiService'; // Assuming you have an apiService instance

const BOOK_API_URL = '/books'; // Base URL for book-related API calls

// --- Public Endpoints ---

export const getPublishedBooks = async () => {
  const response = await api.get(`${BOOK_API_URL}/public`);
  return response.data;
};

export const getBookByIdPublic = async (id) => {
  const response = await api.get(`${BOOK_API_URL}/public/${id}`);
  return response.data;
};

export const getBooksByAuthorPublic = async (authorId) => {
  const response = await api.get(`${BOOK_API_URL}/public/author/${authorId}`);
  return response.data;
};

// --- Admin/CMS Endpoints ---

export const getAllBooksAdmin = async () => {
  const response = await api.get(`${BOOK_API_URL}/admin`);
  return response.data;
};

export const getBookByIdAdmin = async (id) => {
  const response = await api.get(`${BOOK_API_URL}/public/${id}`);
  return response.data;
};

export const createBook = async (bookData, coverImage, pdfFile) => {
  const formData = new FormData();
  formData.append('book', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
  if (coverImage) {
    formData.append('coverImage', coverImage);
  }
  if (pdfFile) {
    formData.append('pdfFile', pdfFile);
  }
  const response = await api.post(`${BOOK_API_URL}/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateBook = async (id, bookData, coverImage, pdfFile) => {
  const formData = new FormData();
  formData.append('book', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
  if (coverImage) {
    formData.append('coverImage', coverImage);
  }
  if (pdfFile) {
    formData.append('pdfFile', pdfFile);
  }
  const response = await api.put(`${BOOK_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`${BOOK_API_URL}/admin/${id}`);
  return response.data;
};

// --- NEW: Approve/Reject Book Endpoints ---
export const approveBook = async (id) => {
  const response = await api.put(`${BOOK_API_URL}/admin/${id}/approve`);
  return response.data;
};

export const rejectBook = async (id) => {
  const response = await api.put(`${BOOK_API_URL}/admin/${id}/reject`);
  return response.data;
};

export const checkSubscription  = async () =>  {
const response = await api.get('/subscriptions/check');
return response.data;
}
