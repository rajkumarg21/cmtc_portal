import api from './apiService';

const ADVERTISEMENT_API_URL = '/advertisementDetails'; // ✅ must match backend

// --------------------------- Public Endpoints --------------------------- //

/**
 * Get all published HSG PRODUCTS (public)
 * GET /api/advertisementDetails/public/fetch/published
 */
export const getPublishedAdvertisements = async () => {
  const response = await api.get(`${ADVERTISEMENT_API_URL}/public/fetch/published`);
  return response.data;
};

/**
 * Get single published HSG PRODUCTS by ID (public)
 * GET /api/advertisementDetails/public/fetch/{id}
 */
export const getPublishedAdvertisementById = async (id) => {
  const response = await api.get(`${ADVERTISEMENT_API_URL}/public/fetch/${id}`);
  return response.data;
};

/**
 * Get latest published HSG PRODUCTS (limit from server if supported)
 */
export const getLatestPublishedAdvertisements = async (limit = 3) => {
  try {
    const response = await api.get(`${ADVERTISEMENT_API_URL}/public/fetch/published?limit=${limit}`);
    if (Array.isArray(response.data)) return response.data.slice(0, limit);
    if (response.data?.items) return response.data.items.slice(0, limit);
  } catch (err) {
    console.warn('Server-side limit not supported. Fallback to client slice.', err);
  }

  try {
    const all = await getPublishedAdvertisements();
    return Array.isArray(all) ? all.slice(0, limit) : [];
  } catch (error) {
    console.error('Error fetching latest HSG PRODUCTS:', error);
    return [];
  }
};

// --------------------------- Admin Endpoints --------------------------- //

/**
 * Get all HSG PRODUCTS (admin)
 * GET /api/advertisementDetails/admin/fetch/all
 */
export const getAllAdvertisements = async () => {
  const response = await api.get(`${ADVERTISEMENT_API_URL}/admin/fetch/all`);
  return response.data;
};

/**
 * Get all HSG PRODUCTS list with server side pagination (admin)
 * GET /api/advertisementDetails/admin/fetch/list
 */
export const getAllAdvertisementsList = async (page = 0, size = 10, sortBy = "advertDate", direction = "DESC") => {
  const response = await api.get(`${ADVERTISEMENT_API_URL}/admin/fetch/list`, {
    params: { page, size, sortBy, direction },
  });
  return response.data; // contains content, totalPages, totalElements, etc.
};
/**
 * Get HSG PRODUCTS by ID (admin)
 * GET /api/advertisementDetails/admin/fetch/{id}
 */
export const getAdvertisementById = async (id) => {
  const response = await api.get(`${ADVERTISEMENT_API_URL}/admin/fetch/${id}`);
  return response.data;
};

/**
 * Create HSG PRODUCTS (multipart/form-data)
 * POST /api/advertisementDetails/admin/create
 */
export const createAdvertisement = async (advertisementData, imageFile) => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(advertisementData)], { type: 'application/json' }));
  if (imageFile) formData.append('imageFile', imageFile);

  const response = await api.post(`${ADVERTISEMENT_API_URL}/admin/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update HSG PRODUCTS (multipart/form-data)
 * PUT /api/advertisementDetails/admin/edit/{id}
 */
export const updateAdvertisement = async (id, advertisementData, imageFile) => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(advertisementData)], { type: 'application/json' }));
  if (imageFile) formData.append('imageFile', imageFile);

  const response = await api.put(`${ADVERTISEMENT_API_URL}/admin/edit/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete HSG PRODUCTS (admin)
 * DELETE /api/advertisementDetails/admin/delete/{id}
 */
export const deleteAdvertisement = async (id) => {
  const response = await api.delete(`${ADVERTISEMENT_API_URL}/admin/delete/${id}`);
  return response.data;
};

/**
 * Approve HSG PRODUCTS (admin)
 * POST /api/advertisementDetails/admin/approve/{id}
 */
export const approveAdvertisement = async (id) => {
  const response = await api.post(`${ADVERTISEMENT_API_URL}/admin/approve/${id}`);
  return response.data;
};

/**
 * Reject HSG PRODUCTS (admin)
 * POST /api/advertisementDetails/admin/reject/{id}
 */
export const rejectAdvertisement = async (id) => {
   try {
  const response = await api.post(`${ADVERTISEMENT_API_URL}/admin/reject/${id}`);
  return response.data;
   } catch (error) {
    console.error(`Error rejecting HSG PRODUCTS with ID "${id}":`, error);
    throw error;
  }
};
