// src/services/rtiDocumentService.js
import api from './apiService';

const API_BASE_URL = "http://localhost:8080/api/rti-document/public";

// Get all RTI documents (admin endpoint)
export const getAllRtiDocuments = async () => {
  const response = await api.get('/rti-document/admin/fetch/all');
  return response;
};

// Get all published RTI documents (public endpoint)
export const getAllPublishedRtiDocuments = async () => {
  const response = await api.get('/rti-document/public/fetch/all');
  return response;
};

// Upload a new RTI document (admin endpoint)
export const uploadRtiDocument = async (formData) => {
  const response = await api.post('/rti-document/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Edit an existing RTI document (admin endpoint)
export const editRtiDocument = async (id, formData) => {
  const response = await api.put(`/rti-document/admin/edit/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Delete a specific RTI document
export const deleteRtiDocument = async (id) => {
  const response = await api.delete(`/rti-document/admin/delete/${id}`);
  return response;
};

// Approve an RTI document
export const approveRtiDocument = async (id) => {
  const response = await api.put(`/rti-document/admin/approve/${id}`);
  return response;
};

export const toggleRtiDocumentVisibility = async (id) => {
  const response = await api.put(`/rti-document/admin/toggle-visibility/${id}`);
  return response.data;
};

export const fetchApprovedVisibleDocs = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/fetch-approved-visible/all`);
    return res.data;
  } catch (err) {
    console.error("Error fetching RTI docs:", err);
    throw err;
  }
};
