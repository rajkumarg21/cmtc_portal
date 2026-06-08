// src/services/rtiService.js

import api from './apiService';

const RTI_API_URL = '/rti';

export const submitRTIRequest = async (requestData) => {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
  // No file for initial submit
  const response = await api.post(`${RTI_API_URL}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getRTIRequestByApplicationNumber = async (applicationNumber) => {
  // MODIFIED: Send applicationNumber as a query parameter
  const response = await api.get(`${RTI_API_URL}/public/status?applicationNumber=${encodeURIComponent(applicationNumber)}`);
  return response.data;
};

export const getAllRTIRequests = async () => {
  const response = await api.get(`${RTI_API_URL}/admin`);
  return response.data;
};

export const getRTIRequestsByStatus = async (status) => {
  const response = await api.get(`${RTI_API_URL}/admin/status/${status}`);
  return response.data;
};

export const getRTIRequestById = async (id) => {
  const response = await api.get(`${RTI_API_URL}/admin/${id}`);
  return response.data;
};

export const updateRTIRequestStatusAndResponse = async (id, updateData, responseFile) => {
  const formData = new FormData();
  formData.append('update', new Blob([JSON.stringify(updateData)], { type: 'application/json' }));
  if (responseFile) {
    formData.append('responseFile', responseFile);
  }
  const response = await api.put(`${RTI_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteRTIRequest = async (id) => {
  const response = await api.delete(`${RTI_API_URL}/admin/${id}`);
  return response.data;
};
