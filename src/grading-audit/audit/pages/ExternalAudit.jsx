import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

import ProgressCard from "../../shared/components/ProgressCard";
import CenterTable from "../../shared/components/CenterTable";

import useAudit from "../hooks/useAudit";
import AuditTeamSection from "../components/AuditTeamSection";
import { useAuth } from "../../../context/AuthContext";

const ExternalAudit = ({ cycleId, selectedCycle, viewType }) => {
  const {
    data,
    teamMembers,        // ✅ FIXED
    assignedLead,
    assignLead,
    loading,
    error,
  } = useAudit(cycleId, viewType); // ✅ FIXED (removed true)
  const {userRole}= useAuth();
  if (!cycleId) return null;

  return (
    <Box mt={2}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          External Audit
        </Typography>

        {selectedCycle && (
          <Typography variant="body2" color="text.secondary">
            Cycle: {selectedCycle?.name || `Cycle ${selectedCycle?.id}`}
          </Typography>
        )}

        {data?.districtNameEn && (
          <Typography variant="body2" color="text.secondary">
            Assigned District: {data.districtNameEn}
          </Typography>
        )}
      </Paper>

      {/* ✅ Team Section (same as internal) */}
      <AuditTeamSection
        teamMembers={teamMembers}
        assignedLead={assignedLead}
        loading={loading}
        onAssign={assignLead}
        currentUserRole={userRole}
      />

      {loading && <CircularProgress />}

      {error && <Alert severity="error">Failed to load data</Alert>}
        {assignLead}

      {!loading && !error && data && (
        <>
          <ProgressCard
            title="External Audit Progress"
            progressData={data}
          />

          <Box mt={3}>
            <CenterTable centers={data.centers || []} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ExternalAudit;