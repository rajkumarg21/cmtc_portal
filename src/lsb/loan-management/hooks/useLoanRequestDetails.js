import { useEffect, useState } from "react";

import { getLoanRequestDetails } from "../loanRequestApi";

const useLoanRequestDetails = (
  applicationId
) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] =
    useState(false);

  const [pagination, setPagination] =
    useState({
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 20,
    });

  useEffect(() => {
    if (applicationId) {
      fetchDetails();
    }
  }, [applicationId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const response =
        await getLoanRequestDetails(
          applicationId
        );

      setRows(response?.content || []);

      setPagination({
        totalElements:
          response?.totalElements || 0,
        totalPages:
          response?.totalPages || 0,
        pageNumber:
          response?.number || 0,
        pageSize:
          response?.size || 20,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    rows,
    loading,
    pagination,
    refresh: fetchDetails,
  };
};

export default useLoanRequestDetails;