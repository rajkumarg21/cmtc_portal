import React from "react";
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
import useTableFormPermissions from "../../shared/hooks/useTableFormPermissions";

const InternalAudit = ({ cycleId, selectedCycle }) => {
  const {
    data,
    teamMembers,
    assignedLead,
    assignLead,
    loading,
    error,
    refetch,
    handleGenerateTeam
  } = useAudit(cycleId);

  const { user, userRole } = useAuth();
  const { getAuditPermissions } = useTableFormPermissions();
  

  // ✅ Dialog state
  const {
    open,
    selectedItem,
    readOnly,
    openDialog,
    closeDialog,
  } = useDialogState();

  // ✅ Permission-aware handler
  const handleOpenForm = (center, options = {}) => {
    // ❌ no lead assigned → block
    if (!assignedLead) {
      alert("Please assign a Mission Staff as Audit Lead first.");
      return;
    }

    const isLead = user?.id === assignedLead?.id;

    openDialog(center, {
      ...options,
      readOnly: !isLead, // ✅ non-lead → readOnly
    });
  };

  if (!cycleId) return null;

  return (
    <Box mt={2}>
      {/* ✅ Header */}
      <AssessmentHeaderCard
        title="Internal Audit"
        selectedCycle={selectedCycle}
        districtLabel="District"
        districtName={data?.districtNameEn}
      />

      {/* ✅ Team Section */}
      <AuditTeamSection
        teamMembers={teamMembers}
        assignedLead={assignedLead}
        onAssign={assignLead}
        loading={loading}
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
            title="Internal Audit Progress"
            progressData={data}
          />

          <CenterTable
            centers={data.centers || []}
            onOpenForm={handleOpenForm} // ✅ controlled
            getPermissions={getAuditPermissions}

          />
        </>
      )}

      {/* ✅ Dialog */}
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

export default InternalAudit;