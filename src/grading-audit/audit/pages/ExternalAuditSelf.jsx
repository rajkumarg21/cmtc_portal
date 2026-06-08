import {
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

import ProgressCard from "../../shared/components/ProgressCard";
import CenterTable from "../../shared/components/CenterTable";
import AssessmentHeaderCard from "../../shared/components/AssessmentHeaderCard";

import useAudit from "../hooks/useAudit";
import { useAuth } from "../../../context/AuthContext";
import { ViewType } from "../../shared/constants/assessmentConstants";
import AuditFormDialog from "../components/AuditFormDialog";
import useDialogState from "../../shared/hooks/useDialogState";
import AuditTeamSection from "../components/AuditTeamSection";
import useTableFormPermissions from "../../shared/hooks/useTableFormPermissions";

const ExternalAuditSelf = ({ cycleId, selectedCycle }) => {
  const { user, userRole } = useAuth();

  const {
    data,
    teamMembers,
    assignedLead,
    assignLead,
    loading,
    error,
    refetch,
  } = useAudit(cycleId, user.districtId, ViewType.SELF);

  const {getAuditPermissions} = useTableFormPermissions();

    // ✅ Dialog
  const {
    open,
    selectedItem,
    readOnly,
    openDialog,
    closeDialog,
  } = useDialogState();

  if (!cycleId) return null;

  return (
    <Box mt={2}>
      {/* ✅ Header */}
      <AssessmentHeaderCard
        title="External Audit (My District)"
        selectedCycle={selectedCycle}
        districtLabel="District which will do external Grading"
        districtName={data?.districtNameEn}
      />

      {/* ✅ Team Section */}
      <AuditTeamSection
        teamMembers={teamMembers}
        assignedLead={assignedLead}
        loading={loading}
        onAssign={assignLead}
        userRole={userRole}
        readOnly={true}
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
            title="Audit Progress (My District)"
            progressData={data}
          />

          <Box mt={3}>
            <CenterTable
              centers={data.centers || []}
              onOpenForm={openDialog}
              readOnly // 🔥 view-only
              getPermissions={getAuditPermissions}

            />
          </Box>
        </>
      )}

      <AuditFormDialog
        open={open}
        onClose={closeDialog}
        cycleId={cycleId}
        center={selectedItem}
        readOnly={readOnly}
        onSuccess={refetch}
      />
    </Box>
  );
};

export default ExternalAuditSelf;