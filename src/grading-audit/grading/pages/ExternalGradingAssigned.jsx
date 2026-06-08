import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

import ProgressCard from "../../shared/components/ProgressCard";
import CenterTable from "../../shared/components/CenterTable";
import ExternalGradingTeam from "../components/ExternalGradingTeam";
import GradingFormDialog from "../components/GradingFormDialog";

import useAssessmentCenters from "../../shared/hooks/useAssessmentCenters";
import useDialogState from "../../shared/hooks/useDialogState";
import AssessmentHeaderCard from "../../shared/components/AssessmentHeaderCard";
import { useAuth } from "../../../context/AuthContext";
import useTableFormPermissions from "../../shared/hooks/useTableFormPermissions";

const ExternalGradingAssigned = ({ cycleId, selectedCycle }) => {

  // ✅ API hook
  const { data, loading, error, refetch } =
    useAssessmentCenters(cycleId, "ASSIGNED");
  const { user, userRole } = useAuth();
  const { getGradingPermissions } = useTableFormPermissions();

  // ✅ Dialog hook
  const {
    open,
    selectedItem,
    readOnly,
    openDialog,
    closeDialog,
    isSubmitted
  } = useDialogState();

  if (!cycleId) return null;

  return (
    <Box mt={2}>
      <AssessmentHeaderCard
        title="External Grading (Assigned District)"
        selectedCycle={selectedCycle}
        districtLabel="Assigned District"
        districtName={data?.districtNameEn}
      />
  
      {/* ✅ keep as-is */}
      <ExternalGradingTeam cycleId={cycleId} />

      {loading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && data && (
        <>
          <ProgressCard
            title="Grading Progress (Assigned District)"
            progressData={data}
          />

          <Box mt={3}>
            <CenterTable
              centers={data.centers || []}
              onOpenForm={openDialog}
              getPermissions={getGradingPermissions}

            />
          </Box>
        </>
      )}

      <GradingFormDialog
        open={open}
        onClose={closeDialog}
        cycleId={cycleId}
        center={selectedItem}
        readOnly={readOnly}
        isSubmitted={isSubmitted}
        onSuccess={refetch} // ✅ clean refresh
      />
    </Box>
  );
};

export default ExternalGradingAssigned;