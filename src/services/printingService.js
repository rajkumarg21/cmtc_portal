// src/services/printingService.js
import api from './apiService';

const PRINTING_API_URL = '/printingSection';

/**
 * Fetch all published printings (public view)
 * GET /printingSection/public/fetch/published
 */
export const getPublishedPrintings = async () => {
  const response = await api.get(`${PRINTING_API_URL}/public/fetch/published`);
  return response.data;
};

/**
 * Fetch a single published printing by id (public view)
 * GET /printingSection/public/fetch/:id
 */
export const getPublishedPrintingById = async (id) => {
  const response = await api.get(`${PRINTING_API_URL}/public/fetch/${id}`);
  return response.data;
};

/**
 * Fetch all printings (admin)
 * GET /printingSection/admin/fetch/all
 */
export const getAllPrintings = async () => {
  const response = await api.get(`${PRINTING_API_URL}/admin/fetch/all`);
  return response.data;
};

/**
 * Fetch all printings (admin)
 * GET /printingSection/admin/fetch/list
 */
export const getAllPrintingsList  = async (page = 0, size = 10, sortBy = "printDate", direction = "DESC") => {
  const response = await api.get(`${PRINTING_API_URL}/admin/fetch/list`, {
    params: { page, size, sortBy, direction },
  });
  return response.data; // contains content, totalPages, totalElements, etc.
};
/**
 * Fetch a single printing by id (admin)
 * GET /printingSection/admin/fetch/:id
 */
export const getPrintingById = async (id) => {
  const response = await api.get(`${PRINTING_API_URL}/admin/fetch/${id}`);
  return response.data;
};

/**
 * Create printing (multipart/form-data)
 * POST /printingSection/admin/create
 */
export const createPrinting = async (printingData, imageFile) => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(printingData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  const response = await api.post(`${PRINTING_API_URL}/admin/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update printing (multipart/form-data)
 * PUT /printingSection/admin/edit/:id
 */
export const updatePrinting = async (id, printingData, imageFile) => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(printingData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  const response = await api.put(`${PRINTING_API_URL}/admin/edit/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete printing
 * DELETE /printingSection/admin/delete/:id
 */
export const deletePrinting = async (id) => {
  const response = await api.delete(`${PRINTING_API_URL}/admin/delete/${id}`);
  return response.data;
};

/**
 * Approve printing
 * POST /printingSection/admin/approve/:id
 */
export const approvePrinting = async (id) => {
  const response = await api.post(`${PRINTING_API_URL}/admin/approve/${id}`);
  return response.data;
};

/**
 * Reject printing
 * POST /printingSection/admin/reject/:id
 */
export const rejectPrinting = async (id) => {
  const response = await api.post(`${PRINTING_API_URL}/admin/reject/${id}`);
  return response.data;
};

/**
 * Fetch featured printings (public)
 * GET /printingSection/public/fetch/featured
 */
export const getFeaturedPrintings = async () => {
  const response = await api.get(`${PRINTING_API_URL}/public/fetch/featured`);
  return response.data;
};

/**
 * Fetch latest published printings (public)
 * GET /printingSection/public/fetch/published?limit=3
 */
export const getLatestPublishedPrintings = async (limit = 3) => {
  try {
    const response = await api.get(`${PRINTING_API_URL}/public/fetch/published?limit=${limit}`);
    if (Array.isArray(response.data)) return response.data.slice(0, limit);
  } catch (error) {
    console.error('Error fetching latest printings:', error);
  }
  return [];
};
