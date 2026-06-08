import api from './apiService';

const AUTHORS_API_URL = '/authors';

export const getAllAuthorsPublic = async () => {
  const response = await api.get(`${AUTHORS_API_URL}/public`);
  return response.data;
};

export const getAuthorByIdPublic = async (id) => {
  const response = await api.get(`${AUTHORS_API_URL}/public/${id}`);
  return response.data;
};

export const getAllAuthorsAdmin = async () => {
  const response = await api.get(`${AUTHORS_API_URL}/admin`);
  return response.data;
};

export const getAuthorByIdAdmin = async (id) => {
  const response = await api.get(`${AUTHORS_API_URL}/admin/${id}`);
  return response.data;
};

export const createAuthor = async (authorData, imageFile) => {
  const formData = new FormData();
  formData.append('author', new Blob([JSON.stringify(authorData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  const response = await api.post(`${AUTHORS_API_URL}/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateAuthor = async (id, authorData, imageFile) => {
  const formData = new FormData();
  formData.append('author', new Blob([JSON.stringify(authorData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  const response = await api.put(`${AUTHORS_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteAuthor = async (id) => {
  const response = await api.delete(`${AUTHORS_API_URL}/admin/${id}`);
  return response.data;
};