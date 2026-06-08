
import api from './apiService';
import { CONTENT_STATUS } from '../utils/constants'; // Assuming this constant is defined

const FILM_PAGES_API_URL = '/film'; // Changed from STATIC_PAGE_API_URL to match your old file

// --- Public API Functions (for frontend display) ---


export const getPublishedFilmPages = async () => {
  try {
    const response = await api.get(`${FILM_PAGES_API_URL}/public/all`);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('API returned non-array data for published Livelihood Activities:', response.data);
      return []; 
    }
  } catch (error) {
    console.error('Error fetching all Livelihood Activities:', error);
    throw error;
  }
};


// --- CMS/Admin API Functions (for management) ---

export const getAllFilmPages = async () => {
  try {
    const response = await api.get(`${FILM_PAGES_API_URL}/public/fetch/all`); 
    // Ensure the response data is an array. If not, return an empty array.
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('API returned non-array data for all static pages (admin):', response.data);
      return []; // Return empty array if data is not an array
    }
  } catch (error) {
    console.error('Error fetching all static pages (admin):', error);
    throw error; // Re-throw the error so the component's catch block can handle it for toast/error state
  }
};

/**
 * Fetch all Livelihood Activities (admin)
 * GET /filmSection/admin/fetch/all
 */
export const getAllFilmsList  = async (page = 0, size = 10, sortBy = "id", direction = "DESC") => {
  const response = await api.get(`${FILM_PAGES_API_URL}/public/fetch/list`, {
    params: { page, size, sortBy, direction},
  });
  return response.data; // contains content, totalPages, totalElements, etc.
};

export const getFilmPageById = async (id) => {
  try {
    const response = await api.get(`${FILM_PAGES_API_URL}/public/${id}`); 
    return response.data;
  } catch (error) {
    console.error(`Error fetching static page by ID "${id}":`, error);
    throw error;
  }
};

export const createFilmPage = async (pageData,imageFile,pdfFile,videoFile) => {
  const formData = new FormData();
  formData.append('filmpage', new Blob([JSON.stringify(pageData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  if (pdfFile) {
    formData.append('pdfFile', pdfFile);
  }
  if (videoFile) {
    formData.append('videoFile', videoFile);
  }
   const response = await api.post(`${FILM_PAGES_API_URL}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateFilmPage = async (id, pageData,imageFile,pdfFile,videoFile) => {


    const formData = new FormData();
  formData.append('filmpage', new Blob([JSON.stringify(pageData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }
  if (pdfFile) {
    formData.append('pdfFile', pdfFile);
  }
  if (videoFile) {
    formData.append('videoFile', videoFile);
  }
  const response = await api.put(`${FILM_PAGES_API_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;

};

export const deleteFilmPage = async (id) => {
  try {
    const response = await api.delete(`${FILM_PAGES_API_URL}/${id}`); 
    return response.data;
  } catch (error) {
    console.error(`Error deleting static page with ID "${id}":`, error);
    throw error;
  }
};

export const approveFilmPage = async (id) => {
  try {
    const response = await api.put(`${FILM_PAGES_API_URL}/${id}/approve`); 
    return response.data;
  } catch (error) {
    console.error(`Error approving static page with ID "${id}":`, error);
    throw error;
  }
};

export const rejectFilmPage = async (id) => {
  try {
    const response = await api.put(`${FILM_PAGES_API_URL}/${id}/reject`); 
    return response.data;
  } catch (error) {
    console.error(`Error rejecting static page with ID "${id}":`, error);
    throw error;
  }
};

export const getLatestPublishedFilm = async (limit = 3) => {
  // try server-side limit param
  try {
    const resp = await api.get(`${FILM_PAGES_API_URL}/public/all?limit=${limit}`);
    // expect array
    if (Array.isArray(resp.data)) {
      return resp.data;
    }
    // if server returns an object with items property, handle it
    if (resp.data && Array.isArray(resp.data.items)) {
      return resp.data.items.slice(0, limit);
    }
  } catch (err) {
  }

  try {
    const all = await getPublishedFilmPages();
    if (Array.isArray(all)) {
      return all.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching Livelihood Activities (fallback):', error);
    return [];
  }
};

export const deleteFilm = async (id) => {
  try {
    const response = await api.delete(`${FILM_PAGES_API_URL}/${id}`); 
    return response.data;
  } catch (error) {
    console.error(`Error deleting Livelihood Activities with ID "${id}":`, error);
    throw error;
  }
};
