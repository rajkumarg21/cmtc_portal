import React from "react";
import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";

const ProgressCard = ({
  title = "Progress",
  progressData,
}) => {
  const total = progressData?.totalCenters || 0;
  const submitted = progressData?.submittedCenters || 0;
  const draft = progressData?.draftCenters || 0;
  const notStarted = progressData?.notStartedCenters || 0;

  const percentage =
    total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>

          <Typography variant="h6">
            {submitted} / {total}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={percentage}
          />

          <Typography variant="body2" color="text.secondary">
            {percentage}% Submitted
          </Typography>

          <Box mt={1}>
            <Typography variant="body2">
              Draft: {draft}
            </Typography>
            <Typography variant="body2">
              Not Started: {notStarted}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;