import apiService from './apiService';

export const fetchMenuHierarchy = async () => {
  try {
    const response = await apiService.get('/static-pages/menu-hierarchy');
    return response.data;
  } catch (error) {
    console.error('Failed to load menu hierarchy', error);
    return [];
  }
};
