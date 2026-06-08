import api from "./apiService.js";

const CMTC_API = `/admin/amenity`;  
/**
 * Get all amenities 
 */
export const getAllAmenity = async() => {
  const response = await  api.get(`${CMTC_API}/all`);
  return response.data;
};

export const addAmenity = async (formData) => {
  const response = await api.post(`${CMTC_API}`, formData);
  return response.data;
};

export const updateAmenity = async (id, formData) => {
  const response = await api.put(`${CMTC_API}/${id}`, formData);
  return response.data;
};

export const getAmenityById = async (id) => {
  const response = await api.get(`${CMTC_API}/${id}`);
  return response.data;
}

export const enableAmenity     = (id) => {
  return api.put(`${CMTC_API}/${id}/enable`);
};

/**
 * ✅ Deactivate CMTC Center
 */
export const disableAmenity = (id) => {
  return api.put(`${CMTC_API}/${id}/disable`);
};

/**
 * ✅ Delete CMTC Center
 */
export const deleteAmenity = (id) => {
  return api.delete(`${CMTC_API}/${id}`);
};
export const getAmenitiesByCenter = (centerId) =>
  api.get(`/api/public/master/amenities/${centerId}`);

export const saveCenterAmenities = (centerId, payload) =>
  api.put(`/api/admin/cmtc-centers/${centerId}/amenities`, payload);