import React from "react";
import { Box, TextField, Button, Grid } from "@mui/material";
import { toast } from "react-toastify";

const Step3RegistrationForm = ({ step3, setStep3, actions }) => {

  // 🔹 handle input change
  const handleChange = (field) => (e) => {
    setStep3((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // 🔹 submit handler
  const handleSubmit = async () => {

    // Basic validation
    if (!step3.firstName || !step3.lastName) {
      toast.error("Enter full name");
      return;
    }

    if (!step3.email) {
      toast.error("Email is required");
      return;
    }

    if (!step3.username) {
      toast.error("Username is required");
      return;
    }

    if (!step3.password) {
      toast.error("Password is required");
      return;
    }

    if (step3.password !== step3.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    await actions.submitRegistration();
  };

  return (
    <Box>
      <h3>Final Registration</h3>

      <Grid container spacing={2}>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="First Name"
            value={step3.firstName || ""}
            onChange={handleChange("firstName")}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={step3.lastName || ""}
            onChange={handleChange("lastName")}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Email"
            value={step3.email || ""}
            onChange={handleChange("email")}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Username"
            value={step3.username || ""}
            onChange={handleChange("username")}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={step3.password || ""}
            onChange={handleChange("password")}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            value={step3.confirmPassword || ""}
            onChange={handleChange("confirmPassword")}
            error={
              step3.confirmPassword &&
              step3.password !== step3.confirmPassword
            }
            helperText={
              step3.confirmPassword &&
              step3.password !== step3.confirmPassword
                ? "Passwords do not match"
                : ""
            }
          />
        </Grid>

      </Grid>

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={actions.prevStep}>
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !step3.firstName ||
            !step3.lastName ||
            !step3.email ||
            !step3.username ||
            !step3.password ||
            step3.password !== step3.confirmPassword
          }
        >
          Submit Registration
        </Button>
      </Box>
    </Box>
  );
};

export default Step3RegistrationForm;