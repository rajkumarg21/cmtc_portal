// src/pages/public/RTIFormPage.jsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Paper,
  Alert,
  Grid,
} from "@mui/material";
import { submitRTIRequest } from "../../services/rtiService";
import { toast } from "react-toastify";

const RTIFormPage = () => {
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    requestSubject: "",
    requestDetails: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    applicationDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!formData.applicationDate) {
        setError("Application date is required.");
        toast.error("Application date is required.");
        setLoading(false);
        return;
      }

      const payload = { ...formData };
      const response = await submitRTIRequest(payload);

      toast.success(
        `Your RTI request has been submitted successfully! Your application number is: ${response.applicationNumber}. Please save this for tracking.`
      );

      setMessage(
        `Your RTI request has been submitted successfully! Your application number is: ${response.applicationNumber}. Please save this for tracking.`
      );

      setFormData({
        applicantName: "",
        applicantEmail: "",
        applicantPhone: "",
        requestSubject: "",
        requestDetails: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        applicationDate: "",
      });
    } catch (err) {
      console.error("RTI submission error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      setError("Failed to submit RTI request: " + errorMessage);
      toast.error("Failed to submit RTI request: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          pt: 6,
          borderRadius: 3,
          backgroundColor: "white",
          position: "relative",
        }}
      >
        {/* Floating Heading */}
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
          Submit RTI Request
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3, mt: 1 }}
        >
          Please fill out the form below to submit your Right to Information request.
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* Row 1: Full Name + Email */}
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Full Name"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Email Address"
                name="applicantEmail"
                type="email"
                value={formData.applicantEmail}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Row 2: Phone Number + Pincode */}
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Phone Number"
                name="applicantPhone"
                type="tel"
                value={formData.applicantPhone}
                onChange={handleChange}
                fullWidth
                placeholder="Optional (10 digits)"
              />
            </Grid>
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Row 3: Address */}
            <Grid item xs={12} size={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Row 4: City + State */}
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Row 5: Subject */}
            <Grid item xs={12} size={12}>
              <TextField
                label="Subject of Information"
                name="requestSubject"
                value={formData.requestSubject}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Row 6: Request Details */}
            <Grid item xs={12} size={12}>
              <TextField
                label="Details of Information Required"
                name="requestDetails"
                value={formData.requestDetails}
                onChange={handleChange}
                fullWidth
                multiline
                rows={6}
                required
              />
            </Grid>

            {/* Row 7: Application Date */}
            <Grid item xs={12} md={6} size={6}>
              <TextField
                label="Application Date"
                name="applicationDate"
                type="date"
                value={formData.applicationDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 3, py: 1.2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Submit RTI Request"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RTIFormPage;
