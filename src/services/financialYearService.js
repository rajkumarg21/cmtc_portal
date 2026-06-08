

// services/financialYearService.js

import api from "./apiService";

const FINANCIAL_YEAR_BASE_URL = "/public/financial";

/**
 * Get Current and Previous Financial Years
 */
export const getCurrentPreviousFinancialYears = async () => {
  const response = await api.get(
    `${FINANCIAL_YEAR_BASE_URL}/current-previous-year`
  );

  return response.data;
};

export default {
  getCurrentPreviousFinancialYears,
};