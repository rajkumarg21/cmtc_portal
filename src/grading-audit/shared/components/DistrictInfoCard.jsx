import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

/**
 * Shared Component
 * Used in:
 *  - Grading (External)
 *  - Audit (External)
 *
 * Pure UI Component
 */
const DistrictInfoCard = ({ districtName, districtCode }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Assigned District
          </Typography>

          <Typography variant="h6" fontWeight="bold">
            {districtName || "Not Assigned"}
          </Typography>

          {districtCode && (
            <Typography variant="body2" color="text.secondary">
              Code: {districtCode}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DistrictInfoCard;