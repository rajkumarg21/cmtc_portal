import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import {
  TextField,
  Paper,
  Typography,
  Stack,
  Divider,
  Box,
  Grid,
  Chip,
  Avatar,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LOGIN_MODE, USER_ROLES } from "../../../utils/constants";
import api from "../../../services/apiService";
import { useTranslation } from "react-i18next";
import Captcha from "../../../components/common/Captcha";
import { useCaptcha } from "../../../hooks/useCaptcha";

import lsbTheme from "../../theme/lsbTheme";

const LsbLoginPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithMobileOtp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [mobileNo, setMobileNo] = useState("");
  const [loginMode, setLoginMode] = useState(LOGIN_MODE.USERNAME_PASSWORD);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const RESEND_COOLDOWN = 60;
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);
  const [mobileError, setMobileError] = useState("");
  const [mobileTouched, setMobileTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [otpError, setOtpError] = useState("");
  const validateOtp = (value) => /^\d{6}$/.test(value);

  const {
    captchaInput,
    setGeneratedCaptcha,
    handleCaptchaChange,
    validateCaptcha,
    resetCaptcha,
    captchaRef,
    isLocked,
    failedAttempts,
  } = useCaptcha({ isRequired: true, maxAttempts: 3, lockTime: 10 });

  const validateUsernameLength = (value) => value.length >= 3 && value.length <= 25;
  const validatePasswordLength = (value) => value.length >= 6 && value.length <= 14;

  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (usernameTouched) {
      if (!value) setUsernameError(t("login_signup_page.usernameValidationMessage2"));
      else if (!validateUsernameLength(value)) setUsernameError(t("login_signup_page.usernameValidationMessage1"));
      else setUsernameError("");
    }
  };

  const handleUsernameBlur = () => {
    setUsernameTouched(true);
    if (!username) setUsernameError(t("login_signup_page.usernameValidationMessage2"));
    else if (!validateUsernameLength(username)) setUsernameError(t("login_signup_page.usernameValidationMessage1"));
    else setUsernameError("");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordTouched) {
      if (!value) setPasswordError(t("login_signup_page.passwordValidationMessage2"));
      else if (!validatePasswordLength(value)) setPasswordError(t("login_signup_page.passwordValidationMessage1"));
      else setPasswordError("");
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    if (!password) setPasswordError(t("login_signup_page.passwordValidationMessage2"));
    else if (!validatePasswordLength(password)) setPasswordError(t("login_signup_page.passwordValidationMessage1"));
    else setPasswordError("");
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setMobileNo(value);
    if (mobileTouched) {
      if (!value) setMobileError(t("login_signup_page.mobileValidationMessage2"));
      else if (!validateMobile(value)) setMobileError(t("login_signup_page.mobileValidationMessage1"));
      else setMobileError("");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);
    if (otpTouched) {
      if (!value) setOtpError(t("login_signup_page.otpValidationMessage2"));
      else if (!validateOtp(value)) setOtpError(t("login_signup_page.otpValidationMessage1"));
      else setOtpError("");
    }
  };

  const handleMobileBlur = () => {
    setMobileTouched(true);
    if (!mobileNo) setMobileError(t("login_signup_page.mobileValidationMessage2"));
    else if (!validateMobile(mobileNo)) setMobileError(t("login_signup_page.mobileValidationMessage1"));
    else setMobileError("");
  };

  const handleOtpBlur = () => {
    setOtpTouched(true);
    if (!otp) setOtpError(t("login_signup_page.otpValidationMessage2"));
    else if (!validateOtp(otp)) setOtpError(t("login_signup_page.otpValidationMessage1"));
    else setOtpError("");
  };

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    if (loginMode === LOGIN_MODE.USERNAME_PASSWORD) {
      const u = username.trim();
      let hasLocalError = false;
      if (!u) { setUsernameTouched(true); setUsernameError(t("login_signup_page.usernameValidationMessage2")); hasLocalError = true; }
      else if (!validateUsernameLength(u)) { setUsernameTouched(true); setUsernameError(t("login_signup_page.usernameValidationMessage1")); hasLocalError = true; }
      else setUsernameError("");
      if (!password) { setPasswordTouched(true); setPasswordError(t("login_signup_page.passwordValidationMessage2")); hasLocalError = true; }
      else if (!validatePasswordLength(password)) { setPasswordTouched(true); setPasswordError(t("login_signup_page.passwordValidationMessage1")); hasLocalError = true; }
      else setPasswordError("");
      if (hasLocalError) { setLoading(false); return; }
    }

    if (!validateCaptcha()) { setLoading(false); return; }

    try {
      let role;
      if (loginMode === LOGIN_MODE.MOBILE_OTP) {
        if (!validateMobile(mobileNo)) { setError(t("login_signup_page.mobileValidationMessage1")); setLoading(false); return; }
        if (!validateOtp(otp)) { setError(t("login_signup_page.otpValidationMessage2")); setLoading(false); return; }
        role = await loginWithMobileOtp(mobileNo, otp);
      } else {
        role = await login(username, password);
      }

      if (role) {
        toast.success("Logged in successfully!");
        resetCaptcha();
        if (
          role === USER_ROLES.LSB_ADMIN || role === USER_ROLES.LSB_NODAL_MAKER ||
          role === USER_ROLES.LSB_NODAL_CHECKER || role === USER_ROLES.LSB_BANK_MAKER ||
          role === USER_ROLES.LSB_BANK_CHECKER
        ) {
          navigate("/lsb/loan-requests");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const message = typeof data === "string" ? data : data?.message || err.message;
      if (status === 403) toast.error("Your account is disabled. Please contact admin.");
      setError(message);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const validateMobile = (mobileNo) => /^[6-9]\d{9}$/.test(mobileNo);

  const sendOtp = async () => {
    if (!validateMobile(mobileNo)) { setError(t("login_signup_page.mobileValidationMessage1")); return; }
    if (!validateCaptcha()) { setLoading(false); return; }
    if (cooldown > 0) return;
    setOtpLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/send-otp", { mobileNo });
      setOtpSent(true);
      toast.success(res.data);
      startCooldown();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || err.message || "Failed to send OTP";
      setError(message);
    }
    setOtpLoading(false);
  };

  return (
    <ThemeProvider theme={lsbTheme}>
    <CssBaseline />
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1f4e79, #2e75b6)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Back to Home Button */}
        {/* Animated background circles */}
        <Box sx={{
          position: "absolute", top: -120, right: -120,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(124, 58, 237, 0.08)",
          filter: "blur(40px)",
        }} />
        <Box sx={{
          position: "absolute", bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(167, 139, 250, 0.08)",
          filter: "blur(40px)",
        }} />

        <Paper elevation={0} sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 4,
          overflow: "hidden",
          width: { xs: "92%", sm: "85%", md: "900px" },
          maxWidth: 950,
          minHeight: { md: 580 },
          zIndex: 2,
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        }}>
          {/* Left Panel - Branding */}
          <Box sx={{
            flex: { md: "0 0 380px" },
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
              Loan Subsidy Portal
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

          {/* Right Panel - Login Form */}
          <Box sx={{
            flex: 1, p: { xs: 3, md: 5 },
            display: "flex", flexDirection: "column",
            justifyContent: "center", bgcolor: "#fff",
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Sign in to access your LSB dashboard
            </Typography>

            {error && (
              <Box sx={{
                p: 1.5, mb: 2, borderRadius: 2,
                bgcolor: "#fef2f2", border: "1px solid #fecaca",
                color: "#dc2626", fontSize: "0.875rem", textAlign: "center",
              }}>
                {error}
              </Box>
            )}

            {/* Mode Toggle */}
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              {[
                { label: t("login_signup_page.loginWithPassword") || "Password", mode: LOGIN_MODE.USERNAME_PASSWORD, icon: <LockOutlinedIcon sx={{ fontSize: 16 }} /> },
                { label: t("login_signup_page.loginWithOtp") || "OTP", mode: LOGIN_MODE.MOBILE_OTP, icon: <PhoneAndroidIcon sx={{ fontSize: 16 }} /> },
              ].map((item) => (
                <Chip
                  key={item.mode}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => {
                    setLoginMode(item.mode);
                    setOtp(""); setError(""); resetCaptcha();
                    setUsernameTouched(false); setUsernameError("");
                    setPasswordTouched(false); setPasswordError("");
                  }}
                  variant={loginMode === item.mode ? "filled" : "outlined"}
                  color={loginMode === item.mode ? "primary" : "default"}
                  sx={{ fontWeight: 600, px: 1 }}
                />
              ))}
            </Box>

            {/* Username/Password Form */}
            {loginMode === LOGIN_MODE.USERNAME_PASSWORD && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    label={t("login_signup_page.userName")}
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    fullWidth required disabled={loading}
                    error={usernameTouched && Boolean(usernameError)}
                    helperText={usernameTouched && usernameError}
                    inputProps={{ maxLength: 25 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon sx={{ color: "#616161" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label={t("login_signup_page.password")}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    fullWidth required disabled={loading}
                    error={passwordTouched && Boolean(passwordError)}
                    helperText={passwordTouched && passwordError}
                    inputProps={{ maxLength: 14 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: "#616161" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Captcha */}
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={5} sm={4}>
                      <Captcha ref={captchaRef} onChange={setGeneratedCaptcha} />
                    </Grid>
                    <Grid item xs={7} sm={8}>
                      <TextField
                        label={t("login_signup_page.captcha")}
                        fullWidth required size="small"
                        value={captchaInput}
                        onChange={(e) => handleCaptchaChange(e.target.value)}
                        disabled={isLocked}
                        helperText={isLocked ? `Locked (${failedAttempts} attempts)` : ""}
                      />
                    </Grid>
                  </Grid>

                  <LoadingButton
                    type="submit" variant="contained" color="primary" loading={loading}
                    disabled={loading} fullWidth
                    sx={{ height: 48, fontSize: "1rem" }}
                  >
                    {t("login_signup_page.signin")}
                  </LoadingButton>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link to="/lsb/forgot-password" style={{ textDecoration: "none", color: "#1f4e79", fontWeight: 500, fontSize: "0.85rem" }}>
                      {t("login_signup_page.forgotPassword")}
                    </Link>
                    <Link to="/lsb/registration" style={{ textDecoration: "none", color: "#ff8f00", fontWeight: 600, fontSize: "0.85rem" }}>
                      {t("Signup") || "Create Account"}
                    </Link>
                  </Box>
                </Stack>
              </form>
            )}

            {/* Mobile OTP Form */}
            {loginMode === LOGIN_MODE.MOBILE_OTP && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    label={t("login_signup_page.mobileNumber")}
                    value={mobileNo} fullWidth
                    onChange={handleMobileChange}
                    onBlur={handleMobileBlur}
                    error={mobileTouched && Boolean(mobileError)}
                    helperText={mobileTouched && mobileError ? mobileError : t("login_signup_page.mobileValidationMessage3")}
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneAndroidIcon sx={{ color: "#616161" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Captcha */}
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={5} sm={4}>
                      <Captcha ref={captchaRef} onChange={setGeneratedCaptcha} />
                    </Grid>
                    <Grid item xs={7} sm={8}>
                      <TextField
                        label={t("login_signup_page.captcha")}
                        fullWidth required size="small"
                        value={captchaInput}
                        onChange={(e) => handleCaptchaChange(e.target.value)}
                        disabled={isLocked}
                        helperText={isLocked ? `Locked (${failedAttempts} attempts)` : ""}
                      />
                    </Grid>
                  </Grid>

                  <LoadingButton
                    onClick={sendOtp} loading={otpLoading} fullWidth variant="outlined" color="primary"
                    sx={{ height: 44 }}
                    disabled={cooldown > 0 || otpLoading || loading || !mobileNo || !captchaInput || isLocked}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : otpSent ? t("login_signup_page.resendOtp") : t("login_signup_page.sendOtp")}
                  </LoadingButton>

                  {otpSent && (
                    <Typography variant="caption" sx={{ color: "#2e7d32", fontWeight: 500, textAlign: "center" }}>
                      OTP sent to {mobileNo}
                    </Typography>
                  )}

                  {otpSent && (
                    <TextField
                      label={t("login_signup_page.otp")}
                      value={otp} fullWidth
                      onChange={handleOtpChange}
                      onBlur={handleOtpBlur}
                      error={otpTouched && Boolean(otpError)}
                      helperText={otpTouched && otpError ? otpError : "Enter 6-digit OTP"}
                      inputProps={{ maxLength: 6 }}
                    />
                  )}

                  <LoadingButton
                    type="submit" variant="contained" color="primary" loading={loading} fullWidth
                    disabled={!otpSent || !otp || loading}
                    sx={{ height: 48, fontSize: "1rem" }}
                  >
                    {t("login_signup_page.signin")}
                  </LoadingButton>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link to="/lsb/forgot-password" style={{ textDecoration: "none", color: "#1f4e79", fontWeight: 500, fontSize: "0.85rem" }}>
                      {t("login_signup_page.forgotPassword")}
                    </Link>
                    <Link to="/lsb/registration" style={{ textDecoration: "none", color: "#ff8f00", fontWeight: 600, fontSize: "0.85rem" }}>
                      {t("Signup") || "Create Account"}
                    </Link>
                  </Box>
                </Stack>
              </form>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default LsbLoginPage;
