import api from "./apiService.js";
const PUBLIC_API = "public";

export const getAllDistricts = async () => {
     const response = await api.get(`${PUBLIC_API}/districts`);
  return response.data;
};
export const getBlocksByDistrict = async ( districtId) => {
     const response = await api.get(`${PUBLIC_API}/blocks/${districtId}`);
  return response.data;
};
export const getCentersByBlock = async (blockId) => {
     const response = await api.get(`${PUBLIC_API}/centers/block/${blockId}`);
  return response.data;
};