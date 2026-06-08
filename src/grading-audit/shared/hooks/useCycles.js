import { useEffect, useState, useCallback } from "react";
import { getAssessmentCycles } from '../services/assessmentService';

const useCycles = (cycleCategory, cycleType) => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const fetchCycles = useCallback(async () => {
    if (!cycleCategory || !cycleType) {
      setCycles([]);
      setSelectedCycle(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getAssessmentCycles(cycleCategory, cycleType);
      const cycleList = Array.isArray(response) ? response : response?.data || [];

      setCycles(cycleList);
      setSelectedCycle(null);
    } catch (err) {
      setError(err);
      setCycles([]);
      setSelectedCycle(null);
    } finally {
      setLoading(false);
    }
  }, [cycleCategory, cycleType]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  return {
    cycles,
    loading,
    error,
    refetch: fetchCycles,
    selectedCycle,
    setSelectedCycle,
  };
};

export default useCycles;