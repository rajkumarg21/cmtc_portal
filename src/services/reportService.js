import api from "./apiService";

export const getCmtcReports = async (financialYearId) => {

    const response = await api.get(
        "/admin/cmtc-details/reports",
        {
            params: { financialYearId }
        }
    );

    return response.data.data;
};

export const getCmtcDetailsMonthlyReport = async (cmtcCentersId) => {

    const response = await api.get(
        "/admin/cmtc-details/monthly-reports",
        {
            params: { cmtcCentersId }
        }
    );

    return response.data.data;
};

// Save CMTC Details
export const addCmtcDetails = async (data) => {
    const response = await api.post(
        "/admin/cmtc-details/add",
        data
    );

    return response.data;
};