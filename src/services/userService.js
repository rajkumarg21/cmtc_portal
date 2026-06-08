import api from './apiService';

const USERS_API_URL = '/admin/users';

export const createUser = async (userData) => {
  const response = await api.post(USERS_API_URL, userData);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`${USERS_API_URL}/${id}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get(USERS_API_URL);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`${USERS_API_URL}/${id}`, userData);
  return response.data;
};

export const enableUser = async (id) => {
  const response = await api.put(`${USERS_API_URL}/${id}/enable`);
  return response.data;
};

export const disableUser = async (id) => {
  const response = await api.put(`${USERS_API_URL}/${id}/disable`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`${USERS_API_URL}/${id}`);
  return response.data;
};