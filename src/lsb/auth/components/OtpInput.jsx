import React from "react";
import { Box, TextField, Button, Grid } from "@mui/material";
import Captcha from "../../../components/common/Captcha";

const OtpInput = ({ step1, actions }) => {
  return (
    <Box>

      <Grid container spacing={2}>

        {/* MOBILE */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mobile Number"
            value={step1.mobileNo}
            onChange={(e) =>
              actions.setStep1({ ...step1, mobileNo: e.target.value })
            }
          />
        </Grid>

        {/* CAPTCHA */}
        <Grid item xs={12}>
          <Captcha
            onChange={(val) =>
              actions.setStep1({ ...step1, captcha: val })
            }
          />

          <TextField
            fullWidth
            label="Enter Captcha"
            value={step1.captchaInput || ""}
            onChange={(e) =>
              actions.setStep1({
                ...step1,
                captchaInput: e.target.value,
              })
            }
            sx={{ mt: 2 }}
          />
        </Grid>

        {/* SEND OTP */}
        <Grid item xs={6}>
          <Button fullWidth variant="outlined">
            Send OTP
          </Button>
        </Grid>

        {/* OTP INPUT */}
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="OTP"
            value={step1.otp}
            onChange={(e) =>
              actions.setStep1({ ...step1, otp: e.target.value })
            }
          />
        </Grid>

        {/* NEXT */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => actions.nextStep()}
          >
            Verify & Continue
          </Button>
        </Grid>

      </Grid>
    </Box>
  );
};

export default OtpInput;