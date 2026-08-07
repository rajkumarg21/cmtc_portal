import { useEffect, useState } from "react";
import { getAssessmentCenters } from "../../shared/services/assessmentService";
import {
  getAssignedTeam,
  assignAuditLead,
  generateAuditTeam,
} from "../services/auditService";
import { USER_ROLES } from "./../../../utils/constants";
import { ViewType } from "../../shared/constants/assessmentConstants";
import { useAuth } from "../../../context/AuthContext";

const useAudit = (cycleId, districtId, viewType,assessmentType) => {  // add AssessmentType
  const { user } = useAuth(); // ✅ add

  const [data, setData] = useState(null);

  const [assignedTeam, setAssignedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [eligibleLeads, setEligibleLeads] = useState([]);
  const [assignedLead, setAssignedLead] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 🔹 Fetch Assigned Team
   */
  const fetchAssignedTeam = async (cycleId, districtId) => {
    if (!cycleId || !districtId) return;

    const team = await getAssignedTeam({ cycleId, districtId, viewType });

    setAssignedTeam(team);

    const members = team?.members || [];
    setTeamMembers(members);

    // ✅ Only Mission Staff (eligible for lead)
    const missionStaff = members.filter(
      (m) => m.role === USER_ROLES.MISSION_STAFF
    );
    setEligibleLeads(missionStaff);

    // ✅ Lead = Mission Staff + teamRole === LEAD
    const lead =
      members.find(
        (m) =>
          m.teamRole === "LEAD" &&
          m.role === USER_ROLES.MISSION_STAFF
      ) || null;

    setAssignedLead(lead);
  };

  /**
   * 🔁 Fetch All Data
   */
  const fetchData = async () => {
    if (!cycleId) return;

    try {
      setLoading(true);
      setError(null);

      // ✅ Step 1: Get center data
      const res = await getAssessmentCenters(cycleId, viewType);
      setData(res);

      const districtId = res?.districtId;

      if (ViewType.SELF === viewType) {
        await fetchAssignedTeam(cycleId, districtId);
      } else {
        await fetchAssignedTeam(cycleId, user.districtId);

      }
      // ✅ Step 2: Get assigned team

    } catch (err) {
      console.error("Audit fetch error:", err);

      setError(err);
      setData(null);
      setAssignedTeam(null);
      setTeamMembers([]);
      setEligibleLeads([]);
      setAssignedLead(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 Assign Lead
   */
  const assignLead = async (userId) => {
    try {
      if (!data?.districtId) {
        throw new Error("District ID missing");
      }
      const targetDistrictId =
            ViewType.SELF === viewType
            ? data.districtId
            : user.districtId;
      console.log("Generate District =", user.districtId);
      console.log("Assign District =", data.districtId);

      await assignAuditLead({
        cycleId,
        // districtId: data.districtId,
        districtId: targetDistrictId, // add to fix generate team id and lead assign team id is differ
        userId,
        assessmentType, // add to pass
      });

      // ✅ Refetch team (source of truth = backend)
      // await fetchAssignedTeam(cycleId, data.districtId);
      await fetchAssignedTeam(cycleId, targetDistrictId);  // add to fix 

    } catch (err) {
      console.error("Assign lead failed:", err);
      throw err;
    }
  };

  const handleGenerateTeam = async () => {
    try {
      setLoading(true);

      console.log("generating team : ")
      if (!cycleId || !user?.districtId) {
        throw new Error("Missing cycleId or districtId");
      }

      await generateAuditTeam({
        cycleId,
        districtId: user.districtId,
      });

      // ✅ Refresh team
      await fetchAssignedTeam(cycleId, user.districtId);

    } catch (err) {
      console.error("Generate team failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [cycleId, viewType]);

  const isLead = user?.id && assignedLead?.id
    ? user.id === assignedLead.id
    : false;

  return {
    // data
    data,

    // team
    assignedTeam,
    teamMembers,
    eligibleLeads,
    assignedLead,
    isLead,

    // actions
    assignLead,
    handleGenerateTeam,

    // state
    loading,
    error,

    // utils
    refetch: fetchData,
  };
};

export default useAudit;