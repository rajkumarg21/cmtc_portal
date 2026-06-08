import api from "./apiService";

/**
 * ===========================
 * PUBLIC APIs
 * ===========================
 */

// PUBLIC — GET APPROVED VIDEOS
export const getYoutubePublic = () => {
  return api.get("/rojgar/public/youtube");
};

/**
 * ===========================
 * ADMIN APIs (JWT REQUIRED)
 * ===========================
 */

// ADMIN — GET ALL VIDEOS
export const adminGetAllYoutube = () => {
  return api.get("/rojgar/admin/youtube");
};

// ADMIN — ADD VIDEO
export const adminAddYoutube = (data) => {
  return api.post("/rojgar/admin/youtube", data);
};

// ADMIN — UPDATE VIDEO
export const adminUpdateYoutube = (id, data) => {
  return api.put(`/rojgar/admin/youtube/${id}`, data);
};

// ADMIN — APPROVE / REJECT VIDEO
export const adminApproveYoutube = (id, status) => {
  return api.put(`/rojgar/admin/youtube/${id}/approve/${status}`);
};

// ADMIN — DELETE VIDEO
export const adminDeleteYoutube = (id) => {
  return api.delete(`/rojgar/admin/youtube/${id}`);
};
