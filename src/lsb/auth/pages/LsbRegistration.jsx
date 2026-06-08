import React from "react";
import { Box, Paper, Container, Typography, Avatar, Chip, Divider, ThemeProvider, CssBaseline } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { Link } from "react-router-dom";
import lsbTheme from "../../theme/lsbTheme";

import StepperHeader from "../components/StepperHeader";
import OtpInput from "../components/OtpInput";
import Step2UserVerification from "../components/Step2UserVerification";
import Step3RegistrationForm from "../components/Step3RegistrationForm";

import useRegistration from "../hooks/useRegistration";
import Step1MobileOtp from "../components/Step1MobileOTP";
import { useCaptcha } from "../../../hooks/useCaptcha";

const LsbRegistration = () => {
  const {
    currentStep,
    role,
    step1,
    step2,
    step3,
    setStep1,
    setStep2,
    setStep3,
    otpState,
    actions,
    captcha,
    bankHook,
  } = useRegistration();

  return (
    <ThemeProvider theme={lsbTheme}>
    <CssBaseline />
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1f4e79, #2e75b6)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <Box sx={{
        position: "absolute", top: -120, right: -120,
        width: 400, height: 400, borderRadius: "50%",
        background: "rgba(46, 117, 182, 0.15)",
        filter: "blur(40px)",
      }} />
      <Box sx={{
        position: "absolute", bottom: -80, left: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "rgba(31, 78, 121, 0.2)",
        filter: "blur(40px)",
      }} />

      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 4,
          overflow: "hidden",
          width: { xs: "95%", sm: "90%", md: "950px" },
          maxWidth: 1000,
          minHeight: { md: 550 },
          zIndex: 2,
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          border: "none",
        }}
      >
        {/* Left Panel - Branding */}
        <Box sx={{
          flex: { md: "0 0 320px" },
          background: "linear-gradient(160deg, #1f4e79 0%, #163a5c 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, md: 5 },
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative elements */}
          <Box sx={{
            position: "absolute", top: 30, left: 30,
            width: 60, height: 60, borderRadius: "50%",
            border: "2px solid rgba(255,143,0,0.3)",
          }} />
          <Box sx={{
            position: "absolute", bottom: 40, right: 20,
            width: 100, height: 100, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
          }} />
          <Box sx={{
            position: "absolute", top: "50%", right: -30,
            width: 60, height: 60, borderRadius: "12px",
            background: "rgba(255,143,0,0.12)",
            transform: "rotate(45deg)",
          }} />

          <Avatar sx={{
            width: 72, height: 72, mb: 3,
            bgcolor: "rgba(255,143,0,0.15)",
            border: "2px solid rgba(255,143,0,0.4)",
          }}>
            <AccountBalanceIcon sx={{ fontSize: 36, color: "#ffb300" }} />
          </Avatar>

          <Typography variant="h5" sx={{
            color: "#fff", fontWeight: 700, mb: 1,
            textAlign: "center", letterSpacing: 0.5,
          }}>
            ऋण अनुदान पोर्टल
          </Typography>
          <Typography variant="subtitle1" sx={{
            color: "rgba(255,255,255,0.7)", fontWeight: 400,
            textAlign: "center", mb: 3,
          }}>
            Bank Portal Registration
          </Typography>

          <Divider sx={{ width: "60%", borderColor: "rgba(255,255,255,0.15)", mb: 3 }} />

          <Typography variant="body2" sx={{
            color: "rgba(255,255,255,0.5)", textAlign: "center",
            lineHeight: 1.7, maxWidth: 260,
          }}>
            Madhya Pradesh State Rural Livelihoods Mission
          </Typography>

          <Chip
            label="MP SRLM"
            size="small"
            sx={{
              mt: 3, bgcolor: "rgba(255,143,0,0.12)",
              color: "#ffb300", fontWeight: 600,
              border: "1px solid rgba(255,143,0,0.25)",
            }}
          />
        </Box>

        {/* Right Panel - Registration Form */}
        <Box sx={{
          flex: 1, p: { xs: 3, md: 4 },
          display: "flex", flexDirection: "column",
          justifyContent: "center", bgcolor: "#fff",
          overflowY: "auto",
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f4e79", mb: 0.5 }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: "#616161", mb: 3 }}>
            Role: <strong>{role}</strong>
          </Typography>

          {/* Stepper */}
          <StepperHeader
            currentStep={currentStep}
            goToStep={actions.goToStep}
          />

          {/* STEP CONTENT */}
          <Box mt={3}>
            {currentStep === 1 && (
              <Step1MobileOtp
                step1={step1}
                otpState={otpState}
                actions={actions}
                captcha={captcha}
              />
            )}

            {currentStep === 2 && (
              <Step2UserVerification
                step2={step2}
                role={role}
                bankHook={bankHook}
                actions={actions}
              />
            )}

            {currentStep === 3 && (
              <Step3RegistrationForm
                step3={step3}
                setStep3={actions.setStep3}
                role={role}
                actions={actions}
              />
            )}
          </Box>

          {/* Footer link */}
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                to="/lsb/login"
                style={{ color: "#1f4e79", fontWeight: 600, textDecoration: "none" }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
    </ThemeProvider>
  );
};

export default LsbRegistration;