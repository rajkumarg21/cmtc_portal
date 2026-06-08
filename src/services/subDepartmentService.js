// src/services/subDepartmentService.js
import api from './apiService'; 

/*
  WHY: sub-department API always requires a mainDepartmentId for nested resources.
*/
const DEPARTMENT_API_URL = '/admin/departments';
export const getAllSubDepartments = async () => {
  const res = await api.get(`${DEPARTMENT_API_URL}/sub`);
  return res.data;
};

export const getSubDepartmentsByDepartmentId = async (mainId) => {
  const res = await api.get(`${DEPARTMENT_API_URL}/${mainId}/sub`);
  return res.data;
};

export const getSubDepartmentById = async (mainId, subId) => {
  const res = await api.get(`${DEPARTMENT_API_URL}/${mainId}/sub/${subId}`);
  return res.data;
};

export const createSubDepartment = async (mainId, payload) => {
  const res = await api.post(`${DEPARTMENT_API_URL}/${mainId}/sub`, payload);
  return res.data;
};

export const updateSubDepartment = async (mainId, subId, payload) => {
  const res = await api.put(`${DEPARTMENT_API_URL}/${mainId}/sub/${subId}`, payload);
  return res.data;
};

export const deleteSubDepartment = async (mainId, subId) => {
  const res = await api.delete(`${DEPARTMENT_API_URL}/${mainId}/sub/${subId}`);
  return res.data;
};

export const enableSubDepartment = async (mainId, subId) => {
  const res = await api.put(`${DEPARTMENT_API_URL}/${mainId}/sub/${subId}/enable`);
  return res.data;
};

export const disableSubDepartment = async (mainId, subId) => {
  const res = await api.put(`${DEPARTMENT_API_URL}/${mainId}/sub/${subId}/disable`);
  return res.data;
};
