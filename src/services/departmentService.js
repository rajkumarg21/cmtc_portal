import api from './apiService';

const DEPARTMENT_API_URL = '/admin/departments';

export const createDepartment = async (departmentData) => {
  const response = await api.post(DEPARTMENT_API_URL, departmentData);
  return response.data;
};

export const getDepartmentById = async (id) => {
  const response = await api.get(`${DEPARTMENT_API_URL}/${id}`);
  return response.data;
};

export const getAllDepartments = async () => {
     const response = await api.get(`${DEPARTMENT_API_URL}/main`);
      return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await api.put(`${DEPARTMENT_API_URL}/${id}`, departmentData);
  return response.data;
};

export const enableDepartment = async (id) => {
  const response = await api.put(`${DEPARTMENT_API_URL}/${id}/enable`);
  return response.data;
};

export const disableDepartment = async (id) => {
  const response = await api.put(`${DEPARTMENT_API_URL}/${id}/disable`);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`${DEPARTMENT_API_URL}/${id}`);
  return response.data;
};