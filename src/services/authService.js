import axios from 'axios';
import api from './apiService';

export const loginUser = async (username, password, recaptchaToken) => {
  const response = await api.post('/auth/login', { username, password, recaptchaToken });
  return response.data;
};

export const forgotPassword = async (email, recaptchaToken) => {
  const response = await api.post('/auth/forgot-password', { email, recaptchaToken });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const signup = async (data) => {
  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/auth/public/register`,
    data
  );
  return response;
};

