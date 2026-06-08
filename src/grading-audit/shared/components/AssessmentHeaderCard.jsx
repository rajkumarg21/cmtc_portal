import { Paper, Typography } from "@mui/material";

const AssessmentHeaderCard = ({ title, selectedCycle, districtLabel, districtName }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold">
        {title}
      </Typography>

      {selectedCycle && (
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cycle: {selectedCycle?.name || `Cycle ${selectedCycle?.id}`}
        </Typography>
      )}

      {districtName && (
        <Typography variant="body2" color="text.secondary">
          {districtLabel}: {districtName}
        </Typography>
      )}
    </Paper>
  );
};

export default AssessmentHeaderCard;