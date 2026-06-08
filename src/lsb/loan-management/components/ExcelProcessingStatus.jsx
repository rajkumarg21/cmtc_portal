import { Alert, Box, LinearProgress, Typography } from "@mui/material";

const ExcelProcessingStatus = ({ loading, error, isReady }) => {
  if (!loading && !error && !isReady) return null;

  return (
    <Box>
      {/* Loading */}
      {loading && (
        <Box>
          <LinearProgress />
          <Typography variant="body2" mt={1}>
            Analyzing Excel file...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Ready */}
      {!loading && isReady && (
        <Alert severity="success" sx={{ mt: 1 }}>
          Excel processed successfully
        </Alert>
      )}
    </Box>
  );
};

export default ExcelProcessingStatus;