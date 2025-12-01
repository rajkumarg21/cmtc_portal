import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// PUBLIC
export const getYoutubePublic = () => {
  return axios.get(`${BASE_URL}/api/rojgar/public/youtube`);
};

// ADMIN — GET ALL
export const adminGetAllYoutube = () => {
  return axios.get(`${BASE_URL}/api/rojgar/admin/youtube`);
};

// ADMIN — ADD
export const adminAddYoutube = (data) => {
  return axios.post(`${BASE_URL}/api/rojgar/admin/youtube`, data);
};

// ADMIN — UPDATE
export const adminUpdateYoutube = (id, data) => {
  return axios.put(`${BASE_URL}/api/rojgar/admin/youtube/${id}`, data);
};

// ADMIN — APPROVE / REJECT
export const adminApproveYoutube = (id, status) => {
  return axios.put(`${BASE_URL}/api/rojgar/admin/youtube/${id}/approve/${status}`);
};

// export const adminApproveYoutube = (id, status) => {
//   return axios.put(`${BASE_URL}/api/rojgar/admin/youtube/${id}/approve/${status}`);
// };

// ADMIN — DELETE
export const adminDeleteYoutube = (id) => {
  return axios.delete(`${BASE_URL}/api/rojgar/admin/youtube/${id}`);
};
