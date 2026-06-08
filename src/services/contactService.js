import api from './apiService';

const CONTACT_API_URL = '/contact';

export const submitContactMessage = async (messageData) => {
  const response = await api.post(`${CONTACT_API_URL}/submit`, messageData);
  return response.data;
};

export const getAllContactMessages = async () => {
  const response = await api.get(`${CONTACT_API_URL}/admin`);
  return response.data;
};

export const getUnreadContactMessages = async () => {
  const response = await api.get(`${CONTACT_API_URL}/admin/unread`);
  return response.data;
};

export const getContactMessageById = async (id) => {
  const response = await api.get(`${CONTACT_API_URL}/admin/${id}`);
  return response.data;
};

export const markMessageAsRead = async (id) => {
  const response = await api.put(`${CONTACT_API_URL}/admin/${id}/mark-read`);
  return response.data;
};

export const deleteContactMessage = async (id) => {
  const response = await api.delete(`${CONTACT_API_URL}/admin/${id}`);
  return response.data;
};