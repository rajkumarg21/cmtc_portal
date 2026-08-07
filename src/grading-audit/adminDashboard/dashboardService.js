import api from "../../services/apiService";
const BASE_URL= "/admin";


export const getDashboardSummary = (cycleId) => {
  return api.get(`${BASE_URL}/dashboard/cycles/${cycleId}/summary`);
};

export const getCycles = async (cycleCategory, cycleType) => {
  const response = await api.get("/assessment/cycles", {
    params: {
      cycleCategory,
      cycleType,
    },
  });

  return response.data;
};