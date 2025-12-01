import api from './apiService';

const IMPORTANT_LINK_API = '/admin/important-links';

export const getImportantLinks = async () => {
  const res = await api.get(IMPORTANT_LINK_API);
  return res.data;
};

export const getEnabledImportantLinks = async () => {
  const res = await api.get(`${IMPORTANT_LINK_API}/enabled`);
  return res.data;
};

export const createImportantLink = async (payload) => {
  const res = await api.post(IMPORTANT_LINK_API, payload);
  return res.data;
};

export const updateImportantLink = async (id, payload) => {
  const res = await api.put(`${IMPORTANT_LINK_API}/${id}`, payload);
  return res.data;
};

export const enableImportantLink = async (id) => {
  const res = await api.put(`${IMPORTANT_LINK_API}/${id}/enable`);
  return res.data;
};

export const disableImportantLink = async (id) => {
  const res = await api.put(`${IMPORTANT_LINK_API}/${id}/disable`);
  return res.data;
};

export const deleteImportantLink = async (id) => {
  const res = await api.delete(`${IMPORTANT_LINK_API}/${id}`);
  return res.data;
};
