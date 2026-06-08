import api from './apiService';

// Use the CMTC admin amenities API paths implemented in the backend
// Controller base: /api/admin/amenities

export const getCenterAmenities = async (centerId) => {
  const resp = await api.get(`/admin/amenities/center/${centerId}`);
  return resp.data;
};

export const addCenterAmenity = async (payload) => {
  const resp = await api.post(`/admin/amenities`, payload);
  return resp.data;
};

export const updateCenterAmenity = async (id, payload) => {
  const resp = await api.put(`/admin/amenities/${id}`, payload);
  return resp.data;
};

export const deleteCenterAmenity = async (id) => {
  const resp = await api.delete(`/admin/amenities/${id}`);
  return resp.data;
};

export const getAvailableAmenitiesForCenter = async (centerId) => {
  const resp = await api.get(`/admin/amenities/available/${centerId}`);
  return resp.data;
};

export const getAllAmenityTypes = async () => {
  const resp = await api.get(`/admin/amenities/types`);
  return resp.data;
};

export const getCenterAmenityStats = async (centerId) => {
  const resp = await api.get(`/admin/amenities/center/${centerId}/stats`);
  return resp.data;
};

export default {
  getCenterAmenities,
  addCenterAmenity,
  updateCenterAmenity,
  deleteCenterAmenity,
  getAvailableAmenitiesForCenter,
  getAllAmenityTypes,
  getCenterAmenityStats,
};
