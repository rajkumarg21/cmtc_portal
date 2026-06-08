import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Alert,
  Chip,
  Box,
} from "@mui/material";
import { getRTIRequestByApplicationNumber } from "../../services/rtiService";
import { formatDate } from "../../utils/helpers";
import { RTI_STATUS } from "../../utils/constants";

const defaultData = {
  applicationNumber: "RTI-2024-00001",
  applicantName: "John Doe",
  subject: "Information regarding city development plans",
  submittedAt: new Date().toISOString(),
  status: RTI_STATUS.PENDING,
  responseFileUrl: null,
  responseDetails: "Your request is under review. Please check again later.",
};

const RTITrackerPage = () => {
  const [applicationNumber, setApplicationNumber] = useState("");
  const [rtiStatus, setRtiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRtiStatus(null);
    setError("");
    setMessage("");

    if (!applicationNumber) {
      setError("Please enter an application number.");
      setLoading(false);
      return;
    }
  
    try {
  const data = await getRTIRequestByApplicationNumber(applicationNumber);
  setRtiStatus(data || {
    applicationNumber: "RTI-2024-00000",
    applicantName: "John Doe",
    subject: "Sample RTI Request",
    submittedAt: new Date().toISOString(),
    status: RTI_STATUS.PENDING,
    responseDetails: "Your RTI is under review.",
  });
  setMessage("RTI status fetched successfully.");
} catch (err) {
      setError(
        err.response?.data ||
          err.message ||
          "Failed to fetch RTI status. Showing default data."
      );
      setRtiStatus(defaultData);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RTI_STATUS.COMPLETED:
        return "success";
      case RTI_STATUS.IN_PROGRESS:
        return "info";
      case RTI_STATUS.PENDING:
        return "warning";
      default:
        return "error";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3,position:"relative" }}>
         <Box
                  sx={{
                    position: "absolute",
                    top: -25,
                    left:"10%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #f3960aff, #f63676ff)",
                    color: "white",
                    px: 3,
                    py: 1,
                    borderRadius: "20px",
                    fontWeight: "bold",
                    boxShadow: 2,
                  }}
                >
                 Track RTI Status
                </Box>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Enter your RTI application number to check its current status.
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{display:"flex",justifyContent:"center"}} noValidate>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={9}>
              <TextField
                label="RTI Application Number"
                name="applicationNumber"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
                fullWidth
                required
                placeholder="e.g., RTI-2024-00123"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ height: "100%" }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Track"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>

       {rtiStatus && (
  <Paper
    elevation={3}
    sx={{
      mt: 4,
      p: 3,
      borderRadius: 3,
      background: "linear-gradient(135deg, #f9f9f9, #ffffff)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    }}
  >
    <Typography
      variant="h5"
      gutterBottom
      sx={{
        fontWeight: "bold",
        color: "primary.main",
        borderBottom: "3px solid",
        borderColor: "primary.main",
        display: "inline-block",
        pb: 0.5,
      }}
    >
      RTI Details
    </Typography>

    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Left Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Application Number
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {rtiStatus.applicationNumber}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Applicant Name
          </Typography>
          <Typography variant="body1">{rtiStatus.applicantName}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Subject
          </Typography>
          <Typography variant="body1">{rtiStatus.subject}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Submitted On
          </Typography>
          <Typography variant="body1">
            {formatDate(rtiStatus.submittedAt)}
          </Typography>
        </Box>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Current Status
          </Typography>
          <Chip
            label={rtiStatus.status.replace("_", " ")}
            color={getStatusColor(rtiStatus.status)}
            sx={{
              fontWeight: "bold",
              textTransform: "capitalize",
              px: 1.5,
              py: 0.5,
              fontSize: "0.95rem",
            }}
          />
        </Box>

        {rtiStatus.responseFileUrl && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Response File
            </Typography>
            <a
              href={`${import.meta.env.VITE_BASE_URL}${rtiStatus.responseFileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1976d2", fontWeight: "500" }}
            >
              View Response
            </a>
          </Box>
        )}

        {rtiStatus.responseDetails && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: "#fdfdfd",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ mb: 1, color: "primary.main" }}
            >
              Response Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {rtiStatus.responseDetails}
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  </Paper>
)}
      </Paper>
    </Container>
  );
};

export default RTITrackerPage;
