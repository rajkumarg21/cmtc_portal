import React from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  InputAdornment,
  Grid,
} from "@mui/material";
import Captcha from "../../../components/common/Captcha";

const Step1MobileOtp = ({
  step1,
  otpState,
  actions,
  captcha,
}) => {
  return (
    <Box>

      <Typography variant="h6" textAlign="center" mb={2}>
        Mobile Verification
      </Typography>

      {/* MOBILE */}
      <TextField
        fullWidth
        label="Mobile Number"
        value={step1.mobileNo || ""}
        onChange={(e) =>
          actions.setStep1((prev) => ({
            ...prev,
            mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10),
          }))
        }
        inputProps={{ maxLength: 10 }}
        sx={{ mb: 2 }}
      />

      {/* CAPTCHA */}
      <Box mb={2}>
        <Grid container spacing={2} alignItems="center">

          {/* Captcha Image */}
          <Grid item xs={12} md={8}>
            <Captcha
              ref={captcha.captchaRef}
              onChange={captcha.setGeneratedCaptcha}
            />
          </Grid>

          {/* Captcha Input */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Enter Captcha"
              value={captcha.captchaInput}
              onChange={(e) =>
                captcha.handleCaptchaChange(e.target.value)
              }
              disabled={captcha.isLocked}
              helperText={
                captcha.isLocked
                  ? `Locked after ${captcha.failedAttempts} attempts`
                  : "Enter captcha"
              }
            />
          </Grid>

        </Grid>
      </Box>

      {/* SEND OTP */}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          if (!captcha.validateCaptcha()) return;
          actions.sendOtp();
        }}
        disabled={otpState.sent || otpState.loading}
        sx={{ mb: 2 }}
      >
        {otpState.loading ? (
          <CircularProgress size={20} />
        ) : (
          "Send OTP"
        )}
      </Button>

      {/* OTP INPUT */}
      <TextField
        fullWidth
        label="Enter OTP"
        value={step1.otp || ""}
        onChange={(e) =>
          actions.setStep1((prev) => ({
            ...prev,
            otp: e.target.value.replace(/\D/g, "").slice(0, 6),
          }))
        }
        disabled={!otpState.sent || otpState.verified}
        inputProps={{ maxLength: 6 }}
      />

      {/* VERIFY */}
      {!otpState.verified && otpState.sent && (
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={actions.verifyOtp}
        >
          Verify OTP
        </Button>
      )}

    </Box>
  );
};

export default Step1MobileOtp;