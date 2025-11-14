import api from './apiService';

const TENDERS_API_URL = '/tenders';


export const createTender = async (tenderData, attachmentFile) => {
  const formData = new FormData();
  formData.append('circular', new Blob([JSON.stringify(tenderData)], { type: 'application/json' }));
  if (attachmentFile) {
    formData.append('attachment', attachmentFile);
  }
  const response = await api.post(`${TENDERS_API_URL}/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateTender = async (id, tenderData, attachmentFile) => {
  const formData = new FormData();
  formData.append('circular', new Blob([JSON.stringify(tenderData)], { type: 'application/json' }));
  if (attachmentFile) {
    formData.append('attachment', attachmentFile);
  }
  const response = await api.put(`${TENDERS_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getTenderById = async (id) => {
  const response = await api.get(`${TENDERS_API_URL}/admin/${id}`);
  return response.data;
};

export const getAllTenders = async () => {
  const response = await api.get(`${TENDERS_API_URL}/admin`);
  return response.data;
};

export const getPublishedTenders = async () => {
  const response = await api.get(`${TENDERS_API_URL}/public`);
  return response.data;
};

export const approveTender = async (id) => {
  const response = await api.put(`${TENDERS_API_URL}/admin/${id}/approve`);
  return response.data;
};

export const rejectTender = async (id) => {
  const response = await api.put(`${TENDERS_API_URL}/admin/${id}/reject`);
  return response.data;
};

export const deleteTender = async (id) => {
  const response = await api.delete(`${TENDERS_API_URL}/admin/${id}`);
  return response.data;
};

export const getLatestTenders = async () => {
  const response = await api.get(`${TENDERS_API_URL}/public/latest`);
  return response.data;
};