import { useEffect, useState, useCallback } from "react";
import { getAssessmentCenters } from "../services/assessmentService";

const useAssessmentCenters = (cycleId,type=null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchCenters = useCallback(async () => {
        if (!cycleId) return;

        try {
            setLoading(true);
            setError("");

            const response = await getAssessmentCenters(cycleId,type);
            setData(response);
        } catch (err) {
            console.error("Failed to fetch internal grading centers", err);
            setError("Failed to load internal grading centers.");
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [cycleId]);

    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    return {
        data,
        loading,
        error,
        refetch: fetchCenters,
    };
};

export default useAssessmentCenters;