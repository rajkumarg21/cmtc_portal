import api from './apiService';

const EVENT_API_URL = '/cmtc/events';

export const getPublicEventSummaries = async (centerId, lang = 'en') => {
  const response = await api.get(`${EVENT_API_URL}/public/${centerId}`, {
    params: { lang },
  });
  return response.data;
};

export const getPublicEventById = async (eventId) => {
  const response = await api.get(`${EVENT_API_URL}/public/event/${eventId}`);
  return response.data;
};

export const getAdminEventSummaryList = async (
  page = 0,
  size = 10,
  sort = 'createdAt,desc'
) => {
  const response = await api.get(`${EVENT_API_URL}/admin`, {
    params: { page, size, sort },
  });
  return response.data;
};

export const getAdminEventById = async (id) => {
  const response = await api.get(`${EVENT_API_URL}/admin/${id}`);
  return response.data;
};

export const createEvent = async (eventData, image, pdf, video) => {
  const formData = new FormData();
  formData.append(
    'event',
    new Blob([JSON.stringify(eventData)], { type: 'application/json' })
  );
  if (image) formData.append('image', image);
  if (pdf) formData.append('pdf', pdf);
  if (video) formData.append('video', video);

  const response = await api.post(EVENT_API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateEvent = async (id, eventData, image, pdf, video) => {
  const formData = new FormData();
  formData.append(
    'event',
    new Blob([JSON.stringify(eventData)], { type: 'application/json' })
  );
  if (image) formData.append('image', image);
  if (pdf) formData.append('pdf', pdf);
  if (video) formData.append('video', video);

  const response = await api.put(`${EVENT_API_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const approveEvent = async (id) => {
  const response = await api.put(`${EVENT_API_URL}/${id}/approve`);
  return response.data;
};

export const rejectEvent = async (id) => {
  const response = await api.put(`${EVENT_API_URL}/${id}/reject`);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`${EVENT_API_URL}/${id}`);
  return response.data;
};
