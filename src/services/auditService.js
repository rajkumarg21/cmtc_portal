import api from './apiService';

/**
 * Get all grading questions
 * @returns Promise<Array>
 */
export const getAllAuditQuestions = (scope) => {
  return api.get(`/public/question?scope=${scope}&type=audit`);
};
