import api from './apiService';

const CIRCULARS_API_URL = '/circulars';

export const getCircularCategories = async () => {
  const response = await api.get(`${CIRCULARS_API_URL}/categories`);
  return response.data;
};

export const createCircular = async (circularData, attachmentFile) => {
  const formData = new FormData();
  formData.append('circular', new Blob([JSON.stringify(circularData)], { type: 'application/json' }));
  if (attachmentFile) {
    formData.append('attachment', attachmentFile);
  }
  const response = await api.post(`${CIRCULARS_API_URL}/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateCircular = async (id, circularData, attachmentFile) => {
  const formData = new FormData();
  formData.append('circular', new Blob([JSON.stringify(circularData)], { type: 'application/json' }));
  if (attachmentFile) {
    formData.append('attachment', attachmentFile);
  }
  const response = await api.put(`${CIRCULARS_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getCircularById = async (id) => {
  const response = await api.get(`${CIRCULARS_API_URL}/admin/${id}`);
  return response.data;
};

export const getAllCirculars = async () => {
  const response = await api.get(`${CIRCULARS_API_URL}/admin`);
  return response.data;
};

export const getPublishedCirculars = async () => {
  const response = await api.get(`${CIRCULARS_API_URL}/public`);
  return response.data;
};

export const approveCircular = async (id) => {
  const response = await api.put(`${CIRCULARS_API_URL}/admin/${id}/approve`);
  return response.data;
};

export const rejectCircular = async (id) => {
  const response = await api.put(`${CIRCULARS_API_URL}/admin/${id}/reject`);
  return response.data;
};

export const deleteCircular = async (id) => {
  const response = await api.delete(`${CIRCULARS_API_URL}/admin/${id}`);
  return response.data;
};

export const getLatestCircular = async () => {
  const response = await api.get(`${CIRCULARS_API_URL}/public/latest`);
  return response.data;
};