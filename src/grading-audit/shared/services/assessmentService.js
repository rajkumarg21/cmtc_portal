import api from '../../../services/apiService';

/* ================================
   🔹 CYCLES
================================ */
export const getAssessmentCycles = async (cycleCategory, cycleType) => {
  const response = await api.get("/assessment/cycles", {
    params: {
      cycleCategory,
      cycleType,
    },
  });

  return response.data;
};

/* ================================
   🔹 CENTERS
================================ */
export const getAssessmentCenters = async (cycleId,viewType) => {
  const params = { cycleId };

  if (viewType) {
    params.viewType = viewType;
  }
  const response = await api.get("/assessment/centers", { params });

  return response.data;
};

/* ================================
   🔹 EXTERNAL ASSIGNED DISTRICT
================================ */
export const getExternalAssignedDistrict = async (cycleId) => {
  const response = await api.get("/assessment/external-assigned-district", {
    params: { cycleId },
  });

  return response.data;
};

/* ================================
   🔹 FORM (CORE API)
================================ */
export const getAssessmentForm = async ({ cycleId, centerId }) => {
  const response = await api.get("/assessment/form", {
    params: {
      cycleId,
      centerId,
    },
  });

  return response.data;
};

/* ================================
   🔹 SUBMIT / SAVE FORM
================================ */
export const submitAssessment = async (payload) => {
  const response = await api.post("/assessment/form/save", payload);
  return response.data;
};

/* ================================
   🔹 OPTIONAL / FUTURE APIs
================================ */

/* 🔸 Progress (if you enable later) */
export const getAssessmentProgress = async ({ cycleId, districtId, type }) => {
  const response = await api.get("/assessment/progress", {
    params: {
      cycleId,
      districtId,
      type,
    },
  });

  return response.data;
};

/* 🔸 Form Schema (if you ever separate schema) */
export const getFormSchema = async (type) => {
  const response = await api.get("/assessment/form-schema", {
    params: { type },
  });

  return response.data;
};

/* 🔸 External Team Options (if you enable later) */
export const getExternalTeamOptions = async (districtId) => {
  const response = await api.get("/assessment/external/team/options", {
    params: { districtId },
  });

  return response.data;
};