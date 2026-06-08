import { Box, Typography, Paper, Grid } from "@mui/material";

/* Shared */
import CycleTypeSelector from "../../shared/components/CycleSelector";
import AssessmentCycleDropdown from "../../shared/components/AssessmentCycleDropdown";
import ViewTypeSelector from "../../shared/components/ViewTypeSelector";

import useAssessment from "../../shared/hooks/useAssessment";
import useCycles from "../../shared/hooks/useCycles";
import { CycleCategory } from "../../shared/constants/assessmentConstants";

/* Audit */
import InternalAudit from "./InternalAudit";
import ExternalAudit from "./ExternalAudit";
import ExternalAuditSelf from "./ExternalAuditSelf";
import ExternalAuditAssigned from "./ExternalAuditAssigned";

const AuditWorkspace = () => {
  const {
    cycleType,
    setCycleType,
    assessmentType,
    isInternal,
    isExternal,
    viewType,
    setViewType,

  } = useAssessment(CycleCategory.AUDIT);

  const {
    cycles,
    selectedCycle,
    setSelectedCycle,
    loading: cycleLoading,
    error: cycleError,
  } = useCycles(CycleCategory.AUDIT, cycleType);

  const selectedCycleId =
    selectedCycle?.id || selectedCycle?.cycleId || "";

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Audit Workspace
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" mb={2}>
          Select Audit Type
        </Typography>

        <Grid container spacing={2}>
          <Grid item size={{xs:12,md:6}}>
            <CycleTypeSelector
              value={cycleType}
              onChange={(value) => {
                setCycleType(value);
                setSelectedCycle(null);
              }}
            />
          </Grid>
          {isExternal && (
                <Grid item size={{ xs: 12, md: 6 }}>
                  <ViewTypeSelector
                    value={viewType}
                    onChange={setViewType}
                  />
                </Grid>
            )}
          

          <Grid item size={{xs:12, md:6}}>
            <AssessmentCycleDropdown
              cycles={cycles}
              value={selectedCycleId}
              onChange={setSelectedCycle}
              loading={cycleLoading}
              label="Assessment Cycle"
            />
          </Grid>
        </Grid>

        {cycleError && (
          <Typography color="error" mt={2}>
            Failed to load audit cycles.
          </Typography>
        )}
      </Paper>

      {assessmentType && (
        <>
          {!selectedCycleId ? (
            <Typography color="text.secondary">
              Please select an assessment cycle to continue.
            </Typography>
          ) : isInternal ? (
            <InternalAudit
              cycleId={selectedCycleId}
              selectedCycle={selectedCycle}
            />
          ) : isExternal ? (viewType === "SELF" ? (
                      <ExternalAuditSelf
                        cycleId={selectedCycleId}
                        selectedCycle={selectedCycle}
                      />
                    ) : (
                      <ExternalAuditAssigned
                        cycleId={selectedCycleId}
                        selectedCycle={selectedCycle}
                      />
                    )
                  ) : null}
        </>
      )}
    </Box>
  );
};

export default AuditWorkspace;