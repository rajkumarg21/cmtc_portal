import {
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

import ProgressCard from "../../shared/components/ProgressCard";
import CenterTable from "../../shared/components/CenterTable";
import AssessmentHeaderCard from "../../shared/components/AssessmentHeaderCard";

import useAudit from "../hooks/useAudit";
import useDialogState from "../../shared/hooks/useDialogState";

import AuditTeamSection from "../components/AuditTeamSection";
import AuditFormDialog from "../components/AuditFormDialog";

import { useAuth } from "../../../context/AuthContext";
import { ViewType } from "../../shared/constants/assessmentConstants";
import useTableFormPermissions from "../../shared/hooks/useTableFormPermissions";

const ExternalAuditAssigned = ({ cycleId, selectedCycle }) => {
  const {
    data,
    teamMembers,
    assignedLead,
    assignLead,
    isLead,
    loading,
    error,
    refetch,
    handleGenerateTeam
  } = useAudit(cycleId, ViewType.ASSIGNED);

  const {getAuditPermissions} = useTableFormPermissions();

  const { user, userRole } = useAuth();

  const {
      open,
      selectedItem,
      readOnly,
      openDialog,
      isSubmitted,
      closeDialog
  } = useDialogState();

  if (!cycleId) return null;

  return (
    <Box mt={2}>
      {/* ✅ Header */}
      <AssessmentHeaderCard
        title="External Audit (Assigned District)"
        selectedCycle={selectedCycle}
        districtLabel="Assigned District"
        districtName={data?.districtNameEn}
      />

      {/* ✅ Team Section */}
      <AuditTeamSection
        teamMembers={teamMembers}
        assignedLead={assignedLead}
        loading={loading}
        onAssign={assignLead}
        userRole={userRole}
        onGenerateTeam={handleGenerateTeam}
      />

      {/* ✅ Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      )}

      {/* ✅ Error */}
      {error && <Alert severity="error">Failed to load data</Alert>}

      {/* ✅ Data */}
      {!loading && !error && data && (
        <>
          <ProgressCard
            title="Audit Progress (Assigned District)"
            progressData={data}
          />

          <Box mt={3}>
            <CenterTable
              centers={data.centers || []}
              onOpenForm={open}
              getPermissions={(center) =>
                  getAuditPermissions(center, {
                    isLead,
                    parentReadOnly: false, 
                  })
                }           
            />
          </Box>
        </>
      )}

      {/* ✅ Dialog */}
      <AuditFormDialog
        open={open}
        onClose={closeDialog}
        cycleId={cycleId}
        center={selectedItem}
        isSubmitted={isSubmitted}
        readOnly={readOnly}
        onSuccess={refetch}
      />
    </Box>
  );
};

export default ExternalAuditAssigned;