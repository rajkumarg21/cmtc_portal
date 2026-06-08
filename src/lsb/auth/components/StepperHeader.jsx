import React from "react";
import { Stepper, Step, StepLabel, Box } from "@mui/material";

const steps = ["Mobile Verification", "User Details", "Review & Submit"];

const StepperHeader = ({ currentStep = 0, goToStep }) => {
  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Stepper
        activeStep={currentStep - 1}
        alternativeLabel
        sx={{
          "& .MuiStepIcon-root.Mui-active": { color: "#1f4e79" },
          "& .MuiStepIcon-root.Mui-completed": { color: "#2e7d32" },
          "& .MuiStepLabel-label.Mui-active": { fontWeight: 600, color: "#1f4e79" },
        }}
      >
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StepperHeader;