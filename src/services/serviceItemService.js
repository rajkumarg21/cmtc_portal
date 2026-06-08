// NEW FILE: src/services/serviceItemService.js
import api from './apiService';

const SERVICES_API_BASE_URL = '/services';

export const createServiceItem = async (serviceData) => {
    const response = await api.post(SERVICES_API_BASE_URL, serviceData);
    return response.data;
};

export const updateServiceItem = async (id, serviceData) => {
    const response = await api.put(`${SERVICES_API_BASE_URL}/${id}`, serviceData);
    return response.data;
};

export const deleteServiceItem = async (id) => {
    const response = await api.delete(`${SERVICES_API_BASE_URL}/${id}`);
    return response.data;
};

export const getAllServiceItems = async () => {
    const response = await api.get(SERVICES_API_BASE_URL);
    return response.data;
};

export const getServiceItemById = async (id) => {
    const response = await api.get(`${SERVICES_API_BASE_URL}/${id}`);
    return response.data;
};

export const checkServiceAccess = async (serviceId) => {
    const response = await api.get(`${SERVICES_API_BASE_URL}/access-check/${serviceId}`);
    return response.data;
};