import api from '../../../services/apiService'

const API_BASE = "/audit/team";

/**
 * 🔹 Get Assigned Team
 * GET /api/audit/team/assigned
 */
export const getAssignedTeam = async ({ cycleId, districtId, viewType }) => {
  try {
    const response = await api.get(`${API_BASE}/assigned`, {
      params: { cycleId, districtId, viewType },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching assigned team:", error);
    throw error;
  }
};

/**
 * 🔹 Assign Audit Lead 
 * POST /api/audit/team/assign/lead
 */
export const assignAuditLead = async ({ cycleId, districtId, userId }) => {
  try {
    const response = await api.post(
      `${API_BASE}/assign/lead`,
      null,
      {
        params: { cycleId, districtId, userId },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error assigning audit lead:", error);
    throw error;
  }
};

/**
 * 🔹 Generate Audit Team
 * POST /api/audit/team/generate
 */
export const generateAuditTeam = async ({ cycleId, districtId }) => {
  try {
    console.log("cycleId", cycleId);
    
    const response = await api.post(
      `${API_BASE}/create`,
      {},
      {
        params: { cycleId, districtId },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating audit team:", error);
    throw error;
  }
};