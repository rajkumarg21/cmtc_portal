import api from './apiService';

/**
 * Get all grading questions
 * @returns Promise<Array>
 */
export const getAllGradingQuestions = (scope) => {
  return api.get(`/public/question?scope=${scope}&type=grading`);
};

export const submitGrading = (payload) => {
  return api.post("/grade/submitInternalGrade", payload);
};


// =====================================================
// 🔹 DUMMY / DEVELOPMENT HELPERS
// (Remove later if backend is ready)
// =====================================================

/**
 * Get grading cycles (internal/external)
 */
export const getGradingCycles = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        cycleType: "INTERNAL",
        status: "OPEN",
      },
      {
        id: 2,
        cycleType: "EXTERNAL",
        status: "OPEN",
      },
    ],
  });
};

/**
 * Get centers based on scope (for internal)
 */
export const getCentersByScope = () => {
  return Promise.resolve({
    data: [
      { id: 101, name: "Center A", status: "DRAFT" },
      { id: 102, name: "Center B", status: "SUBMITTED" },
    ],
  });
};

/**
 * Get assigned district (for external)
 */
export const getAssignedDistrict = () => {
  return Promise.resolve({
    data: {
      districtId: 10,
      districtName: "Bhopal",
      districtCode: "BPL",
    },
  });
};

/**
 * Get team members for district
 */
export const getTeamByDistrict = () => {
  return Promise.resolve({
    data: [
      { id: 1, name: "Team Lead", role: "LEAD" },
      { id: 2, name: "Member 1", role: "MEMBER" },
    ],
  });
};

/**
 * Get centers of a district (for external)
 */
export const getCentersByDistrict = (districtId) => {
  return Promise.resolve({
    data: [
      { id: 201, name: "District Center 1", status: "DRAFT" },
      { id: 202, name: "District Center 2", status: "DRAFT" },
    ],
  });
};
