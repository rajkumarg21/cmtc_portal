import api from './apiService';

const FEEDBACK_API_URL = '/feedback';

export const submitFeedback = async (feedbackData) => {
  const response = await api.post(`${FEEDBACK_API_URL}/submit`, feedbackData);
  return response.data;
};

export const getAllFeedback = async () => {
  const response = await api.get(`${FEEDBACK_API_URL}/admin`);
  return response.data;
};

export const getUnreviewedFeedback = async () => {
  const response = await api.get(`${FEEDBACK_API_URL}/admin/unreviewed`);
  return response.data;
};

export const getFeedbackById = async (id) => {
  const response = await api.get(`${FEEDBACK_API_URL}/admin/${id}`);
  return response.data;
};

export const markFeedbackAsReviewed = async (id) => {
  const response = await api.put(`${FEEDBACK_API_URL}/admin/${id}/mark-reviewed`);
  return response.data;
};

export const deleteFeedback = async (id) => {
  const response = await api.delete(`${FEEDBACK_API_URL}/admin/${id}`);
  return response.data;
};