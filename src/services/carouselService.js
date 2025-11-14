import api from './apiService';
import axios from 'axios';

const CAROUSEL_API_URL = '/carousel';

/**
 * ===========================
 * 📌 Public APIs (no auth)
 * ===========================
 */
export const getAllCarouselSlidesPublic = async () => {
  const response = await api.get(`${CAROUSEL_API_URL}/public`);
  return response;
};

export const getCarouselSlideByIdPublic = async (id) => {
  const response = await api.get(`${CAROUSEL_API_URL}/public/${id}`);
  return response;
};

/**
 * ===========================
 * 📌 Admin APIs (secured)
 * ===========================
 */
export const getAllCarouselSlidesAdmin = async () => {
  const response = await api.get(`${CAROUSEL_API_URL}/admin`);
  return response;
};

export const getCarouselSlideByIdAdmin = async (id) => {
  const response = await api.get(`${CAROUSEL_API_URL}/admin/${id}`);
  return response;
};

export const createCarouselSlide = async (formData) => {
  const response = await api.post(`${CAROUSEL_API_URL}/admin`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const updateCarouselSlide = async (id, formData) => {
  const response = await api.put(`${CAROUSEL_API_URL}/admin/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const deleteCarouselSlide = async (id) => {
  const response = await api.delete(`${CAROUSEL_API_URL}/admin/${id}`);
  return response;
};

/**
 * ===========================
 * 📌 File download helper
 * (if carousel image/PDF is stored remotely)
 * ===========================
 */
export const downloadCarouselFile = async (url) => {
  return await axios.get(
    `${import.meta.env.VITE_BASE_URL}${url}`,
    { responseType: 'blob' } // important for images/pdfs
  );
};

export const approveCarouselSlide = (id) => api.put(`${CAROUSEL_API_URL}/admin/${id}/approve`);
export const rejectCarouselSlide = (id) => api.put(`${CAROUSEL_API_URL}/admin/${id}/reject`);
