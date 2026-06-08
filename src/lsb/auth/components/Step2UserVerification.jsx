import React from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
} from "@mui/material";

const Step2UserVerification = ({
  step2,
  role,
  bankHook,
  actions,
}) => {

  const {
    banks,
    validateBank,
    validating,
  } = bankHook;

  console.log("banks : ", banks)

  const roles = [
    { label: "Bank Maker", value: "LSB_BANK_MAKER" },
    { label: "Bank Checker", value: "LSB_BANK_CHECKER" },
  ];

  const handleVerify = async () => {
    if (!step2.bankId) return alert("Select bank");
    if (!step2.role) return alert("Select role");

    const res = await validateBank(step2.bankId,step2.role);

    if (!res?.valid) {
      alert("Bank validation failed");
      return;
    }

    actions.nextStep();
    };

  return (
    <Box>

      <Typography variant="h6" mb={2}>
        Bank & Role Verification
      </Typography>

      <Grid container spacing={2}>

        {/* BANK */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            select
            fullWidth
            label="Select Bank"
            value={step2.bankId || ""}
            onChange={(e) =>
              actions.setStep2({ ...step2, bankId: e.target.value })
            }
          >
            {banks.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.bankName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* ROLE */}
        <Grid item size={{ xs: 12, md: 6 }} >
          <TextField
            select
            fullWidth
            label="Select Role"
            value={step2.role || ""}
            onChange={(e) =>
              actions.setStep2({ ...step2, role: e.target.value })
            }
          >
            {roles.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

      </Grid>

      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={validating}
        >
          {validating ? (
            <CircularProgress size={20} />
          ) : (
            "Verify & Continue"
          )}
        </Button>
      </Box>

    </Box>
  );
};

export default Step2UserVerification;