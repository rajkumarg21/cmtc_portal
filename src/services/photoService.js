// src/services/photoService.js

import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL || "";

// -------------------------------
// TOKEN HEADER
// -------------------------------
const getAuthHeaders = () => {
  const token =
    sessionStorage.getItem("jwtToken") ||
    localStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// -------------------------------
// PUBLIC LIST
// -------------------------------
export const getPublicPhoto = async () => {
  const res = await axios.get(`${BASE}/api/photos/public`);
  return Array.isArray(res.data) ? res.data : [];
};

// -------------------------------
// ADMIN LIST
// -------------------------------
export const adminGetAllPhotos = async () => {
  const res = await axios.get(`${BASE}/api/photos/manage`, {
    headers: getAuthHeaders(),
  });
  return Array.isArray(res.data) ? res.data : [];
};

// -------------------------------
// CREATE / UPDATE (multipart ONLY)
// -------------------------------
export const adminSavePhoto = async (photo, file) => {
  const form = new FormData();
  form.append("item", JSON.stringify(photo));

  if (file) {
    form.append("mediaFile", file);
  }

  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "multipart/form-data",
  };

  // UPDATE
  if (photo.id) {
    const res = await axios.put(
      `${BASE}/api/photos/manage/${photo.id}`,
      form,
      { headers }
    );
    return res.data;
  }

  // CREATE
  const res = await axios.post(
    `${BASE}/api/photos/manage`,
    form,
    { headers }
  );
  return res.data;
};

// -------------------------------
// DELETE
// -------------------------------
export const adminDeletePhoto = async (id) => {
  const res = await axios.delete(`${BASE}/api/photos/manage/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// -------------------------------
// APPROVE
// -------------------------------
export const adminApprovePhoto = async (id) => {
  const res = await axios.put(
    `${BASE}/api/photos/manage/${id}/approve`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// -------------------------------
// REJECT
// -------------------------------
export const adminRejectPhoto = async (id) => {
  const res = await axios.put(
    `${BASE}/api/photos/manage/${id}/reject`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};
