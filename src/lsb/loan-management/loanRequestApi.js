import api from "../../services/apiService";

export const getLoanRequests = async (
  page = 0,
  size = 10
) => {
  const response = await api.get(
    "/shg-loan-details/applications",
    {
      params: { page, size },
    }
  );

  return response.data;
};

export const getLoanRequestDetails = async (
  applicationId
) => {
  const response = await api.get(
    `/shg-loan-details/applications/${applicationId}/rows`
  );

  return response.data;
};

/**
 * =========================================
 * SINGLE ROW STATUS UPDATE
 * =========================================
 */
export const updateRowStatus =
  async (payload) => {

    const response = await api.post(
      "/shg-loan-details/rows/status",
      payload
    );

    return response.data;
  };

/**
 * =========================================
 * BULK ROW STATUS UPDATE
 * =========================================
 */
export const updateRowStatusBatch =
  async (payload) => {

    const response = await api.post(
      "/shg-loan-details/rows/status/batch",
      payload
    );

    return response.data;
  };

export const refreshLoanApplicationStatus  = async (applicationId) => {
  const response = await api.post(`/shg-loan-details/applications/${applicationId}/refresh-status`);
  return response.data;
};
  

export const approveLoanRow = async (id, payload) => {
  const response = await api.post(
    `/shg-loan-details/approve/${id}`,
    payload
  );

  return response.data;
};

export const rejectLoanRow = async (id, payload) => {
  const response = await api.post(
    `/shg-loan-details/reject/${id}`,
    payload
  );

  return response.data;
};

export const bulkApprove = async (payload) => {
  const response = await api.post(
    "/shg-loan-details/bulk-approve",
    payload
  );

  return response.data;
};

export const bulkReject = async (payload) => {
  const response = await api.post(
    "/shg-loan-details/bulk-reject",
    payload
  );

  return response.data;
};