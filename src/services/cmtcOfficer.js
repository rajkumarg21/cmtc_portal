// import api from "./apiService.js";

// const CMTC_API = `/admin/cmtc-officer`;  
// /**
//  * Get all center officers 
//  */
// export const getAllCenterOfficers = async() => {
//   const response = await  api.get(`${CMTC_API}/all`);
//   return response.data;
// };
// export const getAllUsers = async() => {
  
//   return await  api.get(`${CMTC_API}/all-users`);
// };
// export const addOfficer = async (formData) => {
//   const response = await api.post(`${CMTC_API}`, formData);
//   return response.data;
// };

// export const updateOfficer = async (id, formData) => {
//   const response = await api.put(`${CMTC_API}/${id}`, formData);
//   return response.data;
// };

// export const getCenterOfficerById = async (id) => {
//   const response = await api.get(`${CMTC_API}/${id}`);
//   return response.data;
// }

// export const activateOfficer = (id) => {
//   return api.put(`${CMTC_API}/${id}/activate`);
// };

// /**
//  * ✅ Deactivate CMTC Center
//  */
// export const deactivateOfficer = (id) => {
//   return api.put(`${CMTC_API}/${id}/deactivate`);
// };

// /**
//  * ✅ Delete CMTC Center
//  */
// export const deleteOfficer = (id) => {
//   return api.delete(`${CMTC_API}/${id}`);
// };