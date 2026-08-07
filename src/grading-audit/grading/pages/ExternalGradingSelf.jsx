import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

import ProgressCard from "../../shared/components/ProgressCard";
import CenterTable from "../../shared/components/CenterTable";

import useAssessmentCenters from "../../shared/hooks/useAssessmentCenters";
import GradingFormDialog from "../components/GradingFormDialog";
import useDialogState from "../../shared/hooks/useDialogState";
import AssessmentHeaderCard from "../../shared/components/AssessmentHeaderCard";
import { useAuth } from "../../../context/AuthContext";
import useTableFormPermissions from "../../shared/hooks/useTableFormPermissions";
import ExternalGradingTeam from "../components/ExternalGradingTeam";
import { AssessmentType } from "../../shared/constants/assessmentConstants";
import useGrading from "../hooks/useGrading";

const ExternalGradingSelf = ({ cycleId, selectedCycle }) => {

  const { data, loading, error, refetch } = useAssessmentCenters(cycleId, "SELF");

  const { team } = useGrading(AssessmentType.EXTERNAL_GRADING, cycleId);

  const { user, userRole } = useAuth();
  const { getGradingPermissions} = useTableFormPermissions();
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
        title="External Grading (My District)"
        selectedCycle={selectedCycle}
        districtLabel="District which will do external Grading"
        districtName={data?.districtNameEn}
      />

      <ExternalGradingTeam
          cycleId={cycleId}
          readOnly={true}
          team={team}
      />

      {loading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && data && (
        <>
          <ProgressCard
            title="Grading Progress (My District)"
            progressData={data}
          />

          <Box mt={3}>
            <CenterTable
              centers={data.centers || []}
              onOpenForm={openDialog}
              getPermissions={getGradingPermissions}
              readOnly={true}
            />
          </Box>
        </>
      )}

      <GradingFormDialog
        open={open}
        onClose={closeDialog}
        cycleId={cycleId}
        center={selectedItem}
        isSubmitted={isSubmitted}
        readOnly={readOnly}
        onSuccess={refetch} // ✅ clean refresh
      />
    </Box>
  );
};

export default ExternalGradingSelf;