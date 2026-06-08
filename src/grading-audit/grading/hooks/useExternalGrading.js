import { useEffect, useState } from "react";
import {
  getExternalAssignedDistrict,
  getExternalTeamMembers,
  getExternalCenters,
  getExternalProgress,
} from "../services/gradingService";

const useExternalGrading = (cycleId) => {
  const [assignedDistrict, setAssignedDistrict] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAssigned, setTeamAssigned] = useState(false);
  const [centers, setCenters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cycleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const districtRes = await getExternalAssignedDistrict(cycleId);
        setAssignedDistrict(districtRes || null);

        const teamRes = await getExternalTeamMembers(cycleId);
        const members = Array.isArray(teamRes) ? teamRes : [];
        setTeamMembers(members);
        setTeamAssigned(members.length > 0);

        const centersRes = await getExternalCenters(cycleId);
        setCenters(Array.isArray(centersRes) ? centersRes : []);

        const progressRes = await getExternalProgress(cycleId);
        setProgress(progressRes || null);
      } catch (err) {
        setError(err);
        setAssignedDistrict(null);
        setTeamMembers([]);
        setTeamAssigned(false);
        setCenters([]);
        setProgress(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cycleId]);

  return {
    assignedDistrict,
    teamMembers,
    teamAssigned,
    centers,
    progress,
    loading,
    error,
  };
};

export default useExternalGrading;