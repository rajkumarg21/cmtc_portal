import api from './apiService';

const GALLERY_API_URL = '/gallery';

export const getAllGalleryItemsPublic = async () => {
   const response = await api.get(`${GALLERY_API_URL}/public`);
  return response.data;
};

export const getGalleryItemsByCategoryIdPublic = async (categoryId) => {
  const response = await api.get(`${GALLERY_API_URL}/public/category/${categoryId}`);
  return response.data;
};

export const getGalleryItemsByTypePublic = async (mediaType) => {
  const response = await api.get(`${GALLERY_API_URL}/public/type/${mediaType}`);
  return response.data;
};

export const getGalleryItemByIdPublic = async (id) => {
  const response = await api.get(`${GALLERY_API_URL}/public/${id}`);
  return response.data;
};

export const getAllGalleryItemsAdmin = async () => {
  const response = await api.get(`${GALLERY_API_URL}/admin`);
  return response.data;
};

export const getGalleryItemByIdAdmin = async (id) => {
  const response = await api.get(`${GALLERY_API_URL}/admin/${id}`);
  return response.data;
};

export const createGalleryItem = async (itemData, mediaFile, thumbnailFile) => {
  const formData = new FormData();
  formData.append('item', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));
  if (mediaFile) {
    formData.append('mediaFile', mediaFile);
  }
  if (thumbnailFile) {
    formData.append('thumbnailFile', thumbnailFile);
  }
  const response = await api.post(`${GALLERY_API_URL}/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateGalleryItem = async (id, itemData, mediaFile, thumbnailFile) => {
  const formData = new FormData();
  formData.append('item', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));
  if (mediaFile) {
    formData.append('mediaFile', mediaFile);
  }
  if (thumbnailFile) {
    formData.append('thumbnailFile', thumbnailFile);
  }
  const response = await api.put(`${GALLERY_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteGalleryItem = async (id) => {
  const response = await api.delete(`${GALLERY_API_URL}/admin/${id}`);
  return response.data;
};

export const getGalleryCategories = async () => {
  const response = await api.get(`${GALLERY_API_URL}/categories`);
  return response.data;
};