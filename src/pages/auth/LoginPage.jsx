import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Switch, FormControlLabel } from "@mui/material";
import { isSafeRoute } from "../../utils/security";
import {
  TextField,
  Paper,
  Typography,
  Stack,
  Divider,
  Box,
  Grid,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
// import Captcha from './Captcha';
import { toast } from "react-toastify";
import loginbg from "../../assets/images/login-bg.jpg";
import loginBanner from "../../assets/images/defaultImages.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { LOGIN_MODE, USER_ROLES } from "../../utils/constants";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";
import Captcha from "../../components/common/Captcha"; // adjust path
import { useCaptcha } from "../../hooks/useCaptcha";
const TEAL = {
  main: "#0f766e",
  dark: "#115e59",
  light: "#14b8a6",
  bg: "#f8fafc",
};
const LoginPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  // const [captchaInput, setCaptchaInput] = useState('');
  // const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, userRole, loginWithMobileOtp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  // const captchaRef = useRef();
  // const isCaptchaNeeded=true;
  const location = useLocation();
  const from = location.state?.redirectTo || null;
  const navigate = useNavigate();

  const [mobileNo, setMobileNo] = useState("");
  const [loginMode, setLoginMode] = useState(LOGIN_MODE.USERNAME_PASSWORD);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const RESEND_COOLDOWN = 60; // seconds
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);
  const [mobileError, setMobileError] = useState("");
  const [mobileTouched, setMobileTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [otpError, setOtpError] = useState("");
  const validateOtp = (value) => /^\d{6}$/.test(value);

  const mode = location.pathname.includes("/lsb") ? "LSB" : "CMTC";
  console.log("mode", mode);
  const MODE_CONFIG = {
    CMTC: {
      signupLink: "/signup",
      title: "Login",
    },
    LSB: {
      signupLink: "/lsb/registration",
      title: "LSB Login",
    },
  };

  const config = MODE_CONFIG[mode];
  console.log("config", config);
  const {
    captchaInput,
    setGeneratedCaptcha,
    handleCaptchaChange,
    validateCaptcha,
    resetCaptcha,
    captchaRef,
    isLocked,
    failedAttempts,
  } = useCaptcha({
    isRequired: true,
    maxAttempts: 3,
    lockTime: 10,
  });

  // ✅ Username/Password length policies
  const validateUsernameLength = (value) =>
    value.length >= 3 && value.length <= 25;
  const validatePasswordLength = (value) =>
    value.length >= 6 && value.length <= 14;

  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    if (usernameTouched) {
      if (!value)
        setUsernameError(t("login_signup_page.usernameValidationMessage2"));
      else if (!validateUsernameLength(value))
        setUsernameError(t("login_signup_page.usernameValidationMessage1"));
      else setUsernameError("");
    }
  };

  const handleUsernameBlur = () => {
    setUsernameTouched(true);
    if (!username)
      setUsernameError(t("login_signup_page.usernameValidationMessage2"));
    else if (!validateUsernameLength(username))
      setUsernameError(t("login_signup_page.usernameValidationMessage1"));
    else setUsernameError("");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (passwordTouched) {
      if (!value)
        setPasswordError(t("login_signup_page.passwordValidationMessage2"));
      else if (!validatePasswordLength(value))
        setPasswordError(t("login_signup_page.passwordValidationMessage1"));
      else setPasswordError("");
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    if (!password)
      setPasswordError(t("login_signup_page.passwordValidationMessage2"));
    else if (!validatePasswordLength(password))
      setPasswordError(t("login_signup_page.passwordValidationMessage1"));
    else setPasswordError("");
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setMobileNo(value);
    if (mobileTouched) {
      if (!value) {
        setMobileError(t("login_signup_page.mobileValidationMessage2"));
      } else if (!validateMobile(value)) {
        setMobileError(t("login_signup_page.mobileValidationMessage1"));
      } else {
        setMobileError("");
      }
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);

    if (otpTouched) {
      if (!value) {
        setOtpError(t("login_signup_page.otpValidationMessage2"));
      } else if (!validateOtp(value)) {
        setOtpError(t("login_signup_page.otpValidationMessage1"));
      } else {
        setOtpError("");
      }
    }
  };

  const handleMobileBlur = () => {
    setMobileTouched(true);

    if (!mobileNo) {
      setMobileError(t("login_signup_page.mobileValidationMessage2"));
    } else if (!validateMobile(mobileNo)) {
      setMobileError(t("login_signup_page.mobileValidationMessage1"));
    } else {
      setMobileError("");
    }
  };

  const handleOtpBlur = () => {
    setOtpTouched(true);

    if (!otp) {
      setOtpError(t("login_signup_page.otpValidationMessage2"));
    } else if (!validateOtp(otp)) {
      setOtpError(t("login_signup_page.otpValidationMessage1"));
    } else {
      setOtpError("");
    }
  };

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Prevent double submit / multiple clicks
    if (loading) return;

    setError("");
    setLoading(true);

    // ✅ Enforce username/password length validations ONLY for password login mode
    if (loginMode === LOGIN_MODE.USERNAME_PASSWORD) {
      const u = username.trim();

      let hasLocalError = false;

      if (!u) {
        setUsernameTouched(true);
        setUsernameError(t("login_signup_page.usernameValidationMessage2"));
        hasLocalError = true;
      } else if (!validateUsernameLength(u)) {
        setUsernameTouched(true);
        setUsernameError(t("login_signup_page.usernameValidationMessage1"));
        hasLocalError = true;
      } else {
        setUsernameError("");
      }

      if (!password) {
        setPasswordTouched(true);
        setPasswordError(t("login_signup_page.passwordValidationMessage2"));
        hasLocalError = true;
      } else if (!validatePasswordLength(password)) {
        setPasswordTouched(true);
        setPasswordError(t("login_signup_page.passwordValidationMessage1"));
        hasLocalError = true;
      } else {
        setPasswordError("");
      }

      if (hasLocalError) {
        setLoading(false);
        return;
      }
    }

    // Captcha check
    if (!validateCaptcha()) {
      // toast.error("Captcha does not match");
      setLoading(false);
      return;
    }
    try {
      //let success = false;
      let role;

      if (loginMode === LOGIN_MODE.MOBILE_OTP) {
        if (!validateMobile(mobileNo)) {
          setError(t("login_signup_page.mobileValidationMessage1"));
          setLoading(false);
          return;
        }
        if (!validateOtp(otp)) {
          setError(t("login_signup_page.otpValidationMessage2"));
          setLoading(false);
          return;
        }
        // success
        role = await loginWithMobileOtp(mobileNo, otp);
      } else {
        // keep same call; do not change functionality
        // success =
        role = await login(username, password);
      }

      // ✅ Show success toast ONLY when success is true (prevents false-success spam)
      if (role) {
        toast.success("logged in successfully !");
      }

      resetCaptcha();

      if (role) {
        if (role === "PORTAL_ADMIN") {
          navigate("/admin/admin_dashboard");
        } else if (role === "EDITOR" || role === "PUBLISHER") {
          navigate("/cms/dashboard");
        } else if (role === "BLOCK_OFFICER" || role === "DISTRICT_OFFICER") {
          navigate("/admin/officer_dashboard");
        } else if (role === USER_ROLES.MISSION_STAFF || role === USER_ROLES.AUDIT_ACCOUNTANT || role === USER_ROLES.AUDITOR) {
          navigate("/officer/audit-page");
        } else if (role === "GOV_DEPARTMENT") {
          navigate("/user/dashboard");
        } 
        else if(
          role === USER_ROLES.LSB_ADMIN ||
          role === USER_ROLES.LSB_NODAL_MAKER || 
          role === USER_ROLES.LSB_NODAL_CHECKER || 
          role === USER_ROLES.LSB_BANK_MAKER || 
          role === USER_ROLES.LSB_BANK_CHECKER ){
            navigate("/lsb/dashboard");
        } else {
          const pending = sessionStorage.getItem("PENDING_BOOKING_FORM");

          if (sessionStorage.getItem("BOOK_AFTER_LOGIN") && pending) {
            const parsed = JSON.parse(pending);

            const centerId = parsed.redirect?.centerId || 1;

            const date = parsed.redirect?.date;

            let url = `/cmtc-booking/${centerId}`;

            if (date) {
              url += `?date=${date}`;
            }

            // ✅ SECURE REDIRECT
            if (isSafeRoute(url)) {
              navigate(url);
            } else {
              console.warn("Blocked unsafe redirect:", url);

              navigate("/");
            }
          }
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const message =
        typeof data === "string" ? data : data?.message || err.message;
      if (status === 403) {
        toast.error("Your account is disabled. Please contact admin.");
      }

      setError(message);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const validateMobile = (mobileNo) => /^[6-9]\d{9}$/.test(mobileNo);

  const sendOtp = async () => {
    if (!validateMobile(mobileNo)) {
      setError(t("login_signup_page.mobileValidationMessage1"));
      return;
    }
    if (!validateCaptcha()) {
      // toast.error("Captcha does not match");
      setLoading(false);
      return;
    }
    if (cooldown > 0) return;

    setOtpLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/send-otp", {
        mobileNo: mobileNo,
      });
      setOtpSent(true);
      toast.success(res.data);
      startCooldown();
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to send OTP";

      setError(message);
    }

    setOtpLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundImage: `url(${loginBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        // 🔥 Dark overlay
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)", // adjust darkness here
          zIndex: 1,
        },
      }}
    >
      <Paper
        elevation={12}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // 👈 key fix
          borderRadius: 5,
          overflow: "hidden",
          width: { xs: "95%", sm: "90%", md: "80%" }, // 👈 wider on mobile
          maxWidth: 800,
          minHeight: 600,
          zIndex: 2,
        }}
      >
        {/* Right Side - Login Form */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 3, md: 8 },
            backgroundSize: "cover",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Floating Gradient Heading */}
          <Box
            sx={{
              alignSelf: "center",
              mb: 3,
              background: "linear-gradient(90deg, #0F766E, #14B8A6)",
              color: "white",
              px: 4,
              py: 0.8,
              borderRadius: "20px",
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: 0.5,
              boxShadow: "0 6px 18px rgba(20,184,166,0.5)",
            }}
          >
            {t("Login")}
          </Box>
          {error && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: "#FFE4E6",
                border: "1px solid #F87171",
                color: "#B91C1C",
                width: "100%",
                textAlign: "center",
              }}
            >
              {error}
            </Paper>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              mb: 2,
              position: "relative",
            }}
          >
            {[
              {
                label: t("login_signup_page.loginWithPassword"),
                mode: LOGIN_MODE.USERNAME_PASSWORD,
              },
              {
                label: t("login_signup_page.loginWithOtp"),
                mode: LOGIN_MODE.MOBILE_OTP,
              },
            ].map((item) => {
              const isActive = loginMode === item.mode;

              return (
                <Box
                  key={item.mode}
                  onClick={() => {
                    setLoginMode(item.mode);

                    // reset states on switch
                    setOtp("");
                    setError("");
                    resetCaptcha();

                    // ✅ reset local validation states (doesn't affect existing flows)
                    setUsernameTouched(false);
                    setUsernameError("");
                    setPasswordTouched(false);
                    setPasswordError("");
                  }}
                  sx={{
                    cursor: "pointer",
                    pb: 0.5,
                    position: "relative",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "primary.main" : "text.secondary",
                    transition: "color 0.3s ease, font-weight 0.3s ease",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: isActive ? "100%" : "0%",
                      height: "2px",
                      backgroundColor: "primary.main",
                      transition: "width 0.3s ease",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>
          {loginMode === LOGIN_MODE.USERNAME_PASSWORD && (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <>
                  <TextField
                    label={t("login_signup_page.userName")}
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    fullWidth
                    required
                    disabled={loading}
                    error={usernameTouched && Boolean(usernameError)}
                    helperText={usernameTouched && usernameError}
                    inputProps={{ maxLength: 25 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        background: "#fff",
                      },
                      "& .Mui-focused fieldset": {
                        borderColor: "#3B82F6",
                        borderWidth: 2,
                      },
                    }}
                  />
                  <TextField
                    label={t("login_signup_page.password")}
                    type={showPassword ? "text" : "password"} // <-- toggle type
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    fullWidth
                    required
                    disabled={loading}
                    error={passwordTouched && Boolean(passwordError)}
                    helperText={passwordTouched && passwordError}
                    inputProps={{ maxLength: 14 }} // ✅ stop at 14
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        background: "#fff",
                      },
                      "& .Mui-focused fieldset": {
                        borderColor: "#3B82F6",
                        borderWidth: 2,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box>
                    <Grid container spacing={2} alignItems="center">
                      {/* Captcha Image */}
                      <Grid item xs={5} sm={4} md={3}>
                        <Captcha
                          ref={captchaRef}
                          onChange={setGeneratedCaptcha}
                        />
                      </Grid>

                      {/* Captcha Input Field */}
                      <Grid item xs={7} sm={8} md={9}>
                        <TextField
                          label={t("login_signup_page.captcha")}
                          fullWidth
                          required
                          value={captchaInput}
                          onChange={(e) => handleCaptchaChange(e.target.value)}
                          disabled={isLocked}
                          helperText={
                            isLocked
                              ? `Locked after ${failedAttempts} failed attempts`
                              : "Enter the captcha"
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              background: "#fff",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </>

                <LoadingButton
                  type="submit"
                  variant="outlined"
                  loading={loading} // ✅ FIX: was otpLoading
                  disabled={loading} // ✅ prevent double click
                  fullWidth
                  sx={{
                    height: "56px",
                    fontWeight: 600,
                    borderColor: TEAL.main,
                    color: TEAL.main,
                    "&:hover": {
                      backgroundColor: "rgba(15,118,110,0.08)",
                    },
                  }}
                >
                  {t("login_signup_page.signin")}
                </LoadingButton>

                <Divider sx={{ my: 1 }} />

                <Typography textAlign="center" variant="body2" sx={{ mt: 2 }}>
                  <Box component="span" sx={{ display: "inline-flex", gap: 2 }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        textDecoration: "none",
                        color: "#3B82F6",
                        fontWeight: 500,
                      }}
                    >
                      {t("login_signup_page.forgotPassword")}
                    </Link>
                    <span style={{ color: "#9CA3AF" }}>|</span>
                    <Link
                      to={config.signupLink}
                      style={{
                        textDecoration: "none",
                        color: "#3B82F6",
                        fontWeight: 500,
                      }}
                    >
                      {t("Signup")}
                    </Link>
                  </Box>
                </Typography>
              </Stack>
            </form>
          )}
          {loginMode === LOGIN_MODE.MOBILE_OTP && (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {/* Step 1: Mobile Number */}
                <TextField
                  label={t("login_signup_page.mobileNumber")}
                  value={mobileNo}
                  fullWidth
                  onChange={handleMobileChange}
                  onBlur={handleMobileBlur}
                  error={mobileTouched && Boolean(mobileError)}
                  helperText={
                    mobileTouched && mobileError
                      ? mobileError
                      : t("login_signup_page.mobileValidationMessage3")
                  }
                  inputProps={{ maxLength: 10 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: "#fff",
                    },
                  }}
                />

                {/* Step 2: Captcha (BEFORE OTP) */}
                <Box>
                  <Grid container spacing={2} alignItems="center">
                    {/* Captcha Image */}
                    <Grid item xs={5} sm={4} md={3}>
                      <Captcha
                        ref={captchaRef}
                        onChange={setGeneratedCaptcha}
                      />
                    </Grid>

                    {/* Captcha Input Field */}
                    <Grid item xs={7} sm={8} md={9}>
                      <TextField
                        label={t("login_signup_page.captcha")}
                        fullWidth
                        required
                        value={captchaInput}
                        onChange={(e) => handleCaptchaChange(e.target.value)}
                        disabled={isLocked}
                        helperText={
                          isLocked
                            ? `Locked after ${failedAttempts} failed attempts`
                            : "Enter the captcha"
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            background: "#fff",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
                {/* Step 3: Send OTP Button */}
                <LoadingButton
                  onClick={sendOtp}
                  loading={otpLoading}
                  fullWidth
                  variant="contained"
                  sx={{
                    height: 48,
                    borderRadius: 3,
                    fontWeight: 600,
                    background: `linear-gradient(90deg, ${TEAL.main}, ${TEAL.light})`,
                    "&:hover": {
                      background: `linear-gradient(90deg, ${TEAL.dark}, ${TEAL.main})`,
                    },
                  }}
                  disabled={
                    cooldown > 0 ||
                    otpLoading ||
                    loading ||
                    !mobileNo ||
                    !captchaInput ||
                    isLocked
                  }
                >
                  {cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : otpSent
                      ? t("login_signup_page.resendOtp")
                      : t("login_signup_page.sendOtp")}
                </LoadingButton>

                {/* OTP Sent Success Hint */}
                {otpSent && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: TEAL.main,
                      fontWeight: 500,
                      textAlign: "center",
                      mt: -1,
                    }}
                  >
                    OTP sent successfully to {mobileNo}
                  </Typography>
                )}

                {/* Step 4: OTP Field (Appears ONLY after OTP Sent) */}
                {otpSent && (
                  <TextField
                    label={t("login_signup_page.otp")}
                    value={otp}
                    fullWidth
                    onChange={handleOtpChange}
                    onBlur={handleOtpBlur}
                    error={otpTouched && Boolean(otpError)}
                    helperText={
                      otpTouched && otpError ? otpError : "Enter 6-digit OTP"
                    }
                    inputProps={{ maxLength: 6 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        background: "#fff",
                      },
                    }}
                  />
                )}

                {/* Step 5: Sign In */}
                <LoadingButton
                  type="submit"
                  variant="outlined"
                  loading={loading}
                  fullWidth
                  disabled={!otpSent || !otp || loading}
                  sx={{
                    height: "56px",
                    fontWeight: 600,
                    borderColor: TEAL.main,
                    color: TEAL.main,
                    "&:hover": {
                      backgroundColor: "rgba(15,118,110,0.08)",
                    },
                  }}
                >
                  {t("login_signup_page.signin")}
                </LoadingButton>

                <Divider sx={{ my: 1 }} />

                {/* Links */}
                <Typography textAlign="center" variant="body2">
                  <Box component="span" sx={{ display: "inline-flex", gap: 2 }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        textDecoration: "none",
                        color: "#3B82F6",
                        fontWeight: 500,
                      }}
                    >
                      {t("login_signup_page.forgotPassword")}
                    </Link>
                    <span style={{ color: "#9CA3AF" }}>|</span>
                    <Link
                      to={config.signupLink}
                      style={{
                        textDecoration: "none",
                        color: "#3B82F6",
                        fontWeight: 500,
                      }}
                    >
                      {t("Signup")}
                    </Link>
                  </Box>
                </Typography>
              </Stack>
            </form>
          )}{" "}
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
