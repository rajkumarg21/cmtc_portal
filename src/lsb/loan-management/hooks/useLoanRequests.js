import { useEffect, useState } from "react";
import { approveLoanRow, getLoanRequests, refreshLoanApplicationStatus } from "../loanRequestApi";

const useLoanRequests = (page, size) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await getLoanRequests(page, size);

      setData(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async (
    applicationId
  ) => {

    try {

      await refreshLoanApplicationStatus(applicationId);

      refresh?.();

    } catch (error) {

      console.error(error);
    }
  };

  return {
    data,
    loading,
    totalElements,
    handleRefreshStatus,
    refresh: fetchData,
  };
};

export default useLoanRequests;