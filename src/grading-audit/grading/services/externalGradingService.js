// src/shared/services/externalGradingService.js
  import api from '../../../services/apiService'

/**
 * Fetch eligible users for external grading in a district
 * @param {number} districtId 
 */
export const getEligibleUsers = async () => {
  const response = await api.get(
    `/external-grading/team/eligible`
  );
  return response.data;
};

/**
 * Save selected external grading team
 * @param {object} teamData - { cycleId, districtId, memberIds }
 */
export const saveExternalTeam = async (teamData) => {
  const response = await api.post(`/external-grading/team/save`, teamData);
  return response.data;
};

/**
 * Get assigned team for a cycle & district
 * @param {number} cycleId 
 * @param {number} districtId 
 */
export const getAssignedTeam = async (cycleId) => {
  const response = await api.get(
    `/external-grading/team/assigned?cycleId=${cycleId}`
  );
  return response.data;
};