// src/grading/hooks/useGrading.js

import { useEffect, useState } from "react";
import {
  getCentersByScope,
  getAssignedDistrict,
  getTeamByDistrict,
  getCentersByDistrict,
  submitGrading
} from "../../../services/gradingService";

const useGrading = (assessmentType, cycleId) => {
  const [centers, setCenters] = useState([]);
  const [district, setDistrict] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!assessmentType) return;

    try {
      setLoading(true);
      setError(null);

      // 🔵 INTERNAL FLOW
      if (assessmentType === "INTERNAL_GRADING") {
        const centersRes = await getCentersByScope();
        setCenters(centersRes?.data || []);
      }

      // 🟢 EXTERNAL FLOW
      if (assessmentType === "EXTERNAL_GRADING") {
        const districtRes = await getAssignedDistrict();
        setDistrict(districtRes?.data || null);

        const teamRes = await getTeamByDistrict(
          districtRes?.data?.districtId
        );
        setTeam(teamRes?.data || []);

        const centersRes = await getCentersByDistrict(
          districtRes?.data?.districtId
        );
        setCenters(centersRes?.data || []);
      }

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (payload) => {
    return submitGrading(payload);
  };

  useEffect(() => {
    fetchData();
  }, [assessmentType, cycleId]);

  return {
    centers,
    district,
    team,
    loading,
    error,
    refetch: fetchData,
    submit,
  };
};

export default useGrading;