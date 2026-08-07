import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Alert, CircularProgress } from "@mui/material";

import ProgressCard from "../../shared/components/ProgressCard";
import CenterTable from "../../shared/components/CenterTable";
import { getAssessmentCenters } from "../../shared/services/assessmentService";
import ExternalGradingTeam from "./../components/ExternalGradingTeam";
import { useAuth } from "../../../context/AuthContext";
import { USER_ROLES } from "../../../utils/constants";

const ExternalGrading = ({ cycleId, selectedCycle}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { userRole } = useAuth();

  const fetchExternalData = async () => {
    if (!cycleId ) return;

    try {
      setLoading(true);
      setError("");

      const response = await getAssessmentCenters(cycleId);
      setData(response);
    } catch (err) {
      console.error("Failed to fetch external grading data", err);
      setError("Failed to load external grading data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExternalData();
  }, [cycleId]);

  if (!cycleId) return null;

  return (
    <Box mt={2}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          External Grading
        </Typography>

        {selectedCycle && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            Cycle: {selectedCycle?.name || `Cycle ${selectedCycle?.id}`}
          </Typography>
        )}

        {data?.districtNameEn && (
          <Typography variant="body2" color="text.secondary">
            Assigned District: {data.districtNameEn}
          </Typography>
        )}
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && data && (
        <>
          {/* Team Selection Component */}
          <ExternalGradingTeam cycleId={cycleId}  />

          {/* Progress Card */}
          <ProgressCard title="External Grading Progress" progressData={data} />

          {/* Center Table */}
          <Box mt={3}>
            <CenterTable centers={data.centers || []} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ExternalGrading;