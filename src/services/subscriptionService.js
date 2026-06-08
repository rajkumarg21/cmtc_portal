// src/services/subscriptionService.js

// Assuming your apiService is set up to handle the /api prefix correctly,
// e.g., if api.post('/subscriptions/admin/create') translates to
// http://localhost:8080/api/subscriptions/admin/create
import api from './apiService';

const SUBSCRIPTIONS_API_BASE_URL = '/subscriptions'; // This will become /api/subscriptions

// Existing function, modified to explicitly target the public endpoint
export const createPublicSubscription = async (subscriptionData) => {
  // This will hit POST /api/subscriptions/public/subscribe
  const response = await api.post(`${SUBSCRIPTIONS_API_BASE_URL}/public/subscribe`, subscriptionData);
  return response.data;
};

// NEW: Function for Admin to create a subscription
export const createAdminSubscription = async (subscriptionData) => {
  // This will hit POST /api/subscriptions/admin/create
  const response = await api.post(`${SUBSCRIPTIONS_API_BASE_URL}/admin/create`, subscriptionData);
  return response.data;
};

export const getSubscriptionById = async (id) => {
  const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllSubscriptions = async () => {
  const response = await api.get(SUBSCRIPTIONS_API_BASE_URL);
  return response.data;
};

export const getActiveSubscriptions = async () => {
  const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/active`);
  return response.data;
};

export const getSubscriptionsByUserId = async (userId) => {
  const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/user/${userId}`);
  return response.data;
};

export const updateSubscription = async (id, subscriptionData) => {
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/${id}`, subscriptionData);
  return response.data;
};

export const deactivateSubscription = async (id) => {
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/${id}/deactivate`);
  return response.data;
};
export const activateSubscription = async (id) => {
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/${id}/activate`);
  return response.data;
};
export const deleteSubscription = async (id) => {
  const response = await api.delete(`${SUBSCRIPTIONS_API_BASE_URL}/${id}`);
  return response.data;
};
export const disableTrialPlan = async (id) => {
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/plan/trial/disable/${id}`);
  return response.data;
};
export const enableTrialPlan = async (id) => {
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/plan/trial/enable/${id}`);
  return response.data;
};
export const disableSubscriptionPlan = async (id) => {
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/plan/disable/${id}`);
  return response.data;
};
export const enableSubscriptionPlan = async (id) => {
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/plan/enable/${id}`);
  return response.data;
};
export const deleteTrialPlan = async (id) => {
  const response = await api.delete(`${SUBSCRIPTIONS_API_BASE_URL}/delete/plan/trial/${id}`);
  return response.data;
};
export const deleteSubscriptionPlan = async (id) => {
  const response = await api.delete(`${SUBSCRIPTIONS_API_BASE_URL}/delete/plan/${id}`);
  return response.data;
};
// NEW: API call to get all available subscription plans
export const getAllSubscriptionPlans = async () => {
  const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/plans`);
  return response.data;
};

export const getUserTrialPlanByUserId = async (userId) => {
 const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/user-trial-plan/${userId}`);
  return response.data;
};
export const getuserSubscriptionPlans= async (userId) => {
 const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/my-plans/${userId}`);
  return response.data;
};
export const deactivatePlan = async (planId) => {
  const res = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/${planId}/deactivate`);
  return res.data; 
  } ;
export const getUserTrialPlan = async () => {
 const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/user-trial-plan`);
  return response.data;
};
export const getTrialPlans = async () => {
 const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/trial-plan`);
  return response.data;

};

// Create trial plan
export const createTrialPlan = async (formData) => {
  const payload = {
    ...formData,
    durationDays: parseInt(formData.durationInDays, 10),
  };
  const response = await api.post(`${SUBSCRIPTIONS_API_BASE_URL}/plan/trial`, payload);
  return response.data;
};

//Create paid plan
export const createPaidPlan = async (formData) => {
  const payload = {
    ...formData,
    price: parseFloat(formData.price),
    durationDays: parseInt(formData.durationInDays, 10),
  };
  const response = await api.post(`${SUBSCRIPTIONS_API_BASE_URL}/plan`, payload);
  return response.data;
};
// Update trial plan
export const updateTrialPlan = async (editId, formData) => {
  const payload = {
    ...formData,
    durationDays: parseInt(formData.durationInDays, 10),
  };
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/plan/trial/update/${editId}`, payload);
  return response.data;
};

// Update paid plan
export const updatePaidPlan = async (editId, formData) => {
  const payload = {
    ...formData,
    price: parseFloat(formData.price),
    durationDays: parseInt(formData.durationInDays, 10),
  };
  const response = await api.put(`${SUBSCRIPTIONS_API_BASE_URL}/plan/update/${editId}`, payload);
  return response.data;
};

export const checkSubscriptions = async () => {
 const response = await api.get(`${SUBSCRIPTIONS_API_BASE_URL}/check`);
  return response.data;

};
export const activaTerial = async () => {
  const response = await api.post(`${SUBSCRIPTIONS_API_BASE_URL}/trial-plan`);
  return response.data;
};