import api from "./apiService";

/**
 * Get assessment cycles
 * @param {string} cycleCategory
 * @param {string} cycleType
 */
export const getAssessmentCycles = (cycleCategory, cycleType) => {
  return api.get("/assessment/cycles", {
    params: {
      cycleCategory,
      cycleType,
    },
  });
};