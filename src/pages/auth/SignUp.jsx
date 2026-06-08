import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  InputAdornment,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../services/apiService";
// import Captcha from "./Captcha";
import loginBanner from "../../assets/images/defaultImages.jpg";
import { useTranslation } from "react-i18next";
import Captcha from "../../components/common/Captcha"
import { useCaptcha } from "../../hooks/useCaptcha";
const TEAL = {
  main: "#0f766e",
  dark: "#115e59",
  light: "#14b8a6",
  bg: "#f8fafc",
};
const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    organizationName: "",
    mobileNo: "",
    password: undefined,
    confirmPassword: "",
    mainDepartmentId: "",
    subDepartmentId: "",
    officerName: "",
    designation: "",
    authorizationLetter: null,
  });
  const { t } = useTranslation();
  const [mainDepartments, setMainDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  // ✅ Field-level UI validation
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  // const [captchaValue, setCaptchaValue] = useState("");
  // const [captchaInput, setCaptchaInput] = useState("");
  // const [captchaError, setCaptchaError] = useState("");

    const {
      captchaInput,
      setGeneratedCaptcha,
      handleCaptchaChange,
      validateCaptcha,
      resetCaptcha,
      captchaRef,
      isLocked,
      failedAttempts
    } = useCaptcha({
      isRequired: true,
      maxAttempts: 3,
      lockTime: 10
    });
  // ✅ Rules (as per your requirement)
  const validateUsernameLength = (v) =>
    v.trim().length >= 3 && v.trim().length <= 25;
  const validatePasswordLength = (v) => v.length >= 6 && v.length <= 14;
  const validateMobile = (mobileNo) => /^[0-9]{10}$/.test(mobileNo);
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const setFieldTouched = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateField = (name, value, currentForm = formData) => {
    const v = typeof value === "string" ? value : value;

    switch (name) {
      case "mobileNo":
        if (!v) return "Mobile number is required";
        if (!validateMobile(v)) return "Enter valid 10-digit mobile number";
        return "";

      case "otp":
        if (!v) return "OTP is required";
        if (!/^\d{6}$/.test(v)) return "OTP must be 6 digits";
        return "";

      case "fullName":
        if (!v.trim()) return "Full Name is required";
        return "";

      
      case "organizationName":
        if (!v.trim()) return "Organization Name is required";
        return "";

      case "email":
        if (!v.trim()) return "Email is required";
        if (!validateEmail(v)) return "Enter a valid email address";
        return "";

      case "username":
        if (!v.trim()) return "Username is required";

        const username = v.trim();

        // No spaces
        if (/\s/.test(username)) {
          return "Spaces are not allowed";
        }

        // Allowed characters
        if (!/^[a-zA-Z0-9._]+$/.test(username)) {
          return "Only letters, numbers, dot (.) and underscore (_) allowed";
        }

        // Start & end check
        if (/^[._]|[._]$/.test(username)) {
          return "Username cannot start or end with special character";
        }

        // Max 1 special character
        const specialChars = username.match(/[._]/g);
        if (specialChars && specialChars.length > 1) {
          return "Only one special character (._) is allowed";
        }

        // Length
        if (username.length < 5 || username.length > 20) {
          return "Username must be between 5 and 20 characters";
        }
        return "";

      case "password":
        if (!v) return "Password is required";
        if (!validatePasswordLength(v))
          return "Password must be between 6 and 14 characters";
        return "";

      case "confirmPassword":
        if (!v) return "Confirm Password is required";
        if (!validatePasswordLength(v))
          return "Confirm Password must be between 6 and 14 characters";
        if (v !== currentForm.password) return "Passwords do not match";
        return "";

      case "mainDepartmentId":
        if (!v) return "Main Department is required";
        return "";

      case "subDepartmentId":
        if (!v) return "Sub Department is required";
        return "";

      case "officerName":
        if (!v.trim()) return "Officer Name is required";
        return "";

      case "designation":
        if (!v.trim()) return "Designation is required";
        return "";

      case "authorizationLetter":
        if (!v) return "Authorization letter (PDF) is required";
        return "";

      default:
        return "";
    }
  };

  const setOneFieldError = (name, value, currentForm) => {
    const msg = validateField(name, value, currentForm);
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
    return msg;
  };

  const validateRegistrationBlock = (currentForm) => {
    const requiredFields = [
      "fullName",
      "email",
      "username",
      "organizationName",
      "password",
      "confirmPassword",
      "mainDepartmentId",
      "subDepartmentId",
      "officerName",
      "designation",
      "authorizationLetter",
    ];

    let ok = true;
    const nextErrors = { ...fieldErrors };
    const nextTouched = { ...touched };

    requiredFields.forEach((f) => {
      nextTouched[f] = true;
      const value = currentForm[f];
      const msg = validateField(f, value, currentForm);
      nextErrors[f] = msg;
      if (msg) ok = false;
    });

    setTouched(nextTouched);
    setFieldErrors(nextErrors);
    return ok;
  };

  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError("");
        setMessage("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  useEffect(() => {
    loadMainDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMainDepartments = async () => {
    try {
      const res = await api.get("/admin/departments/main");
      setMainDepartments(res.data);

      if (res.data.length > 0 && !formData.mainDepartmentId) {
        const firstDept = res.data[0];
        setFormData((prev) => ({ ...prev, mainDepartmentId: firstDept.id }));
        loadSubDepartments(firstDept.id);
      }
    } catch (err) {
      setError("Failed to load main departments");
    }
  };

  const loadSubDepartments = async (mainId) => {
    try {
      if (!mainId) {
        setSubDepartments([]);
        setFormData((prev) => ({ ...prev, subDepartmentId: "" }));
        return;
      }

      const res = await api.get(`/public/master/departments/${mainId}/sub`);
      setSubDepartments(res.data);

      if (res.data.length > 0) {
        const firstSub = res.data[0];
        setFormData((prev) => ({ ...prev, subDepartmentId: firstSub.id }));
      } else {
        setFormData((prev) => ({ ...prev, subDepartmentId: "" }));
      }
    } catch (err) {
      setError("Failed to load sub departments");
    }
  };

  const handleReset = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      organizationName: "",
      mobileNo: "",
      password: "",
      confirmPassword: "",
      mainDepartmentId: "",
      subDepartmentId: "",
      officerName: "",
      designation: "",
      authorizationLetter: null,
    });

    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setLoading(false);
    setOtpLoading(false);
    setError("");
    setMessage("");
    setSubDepartments([]);

    // ✅ reset validation UI
    setTouched({});
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // File upload
    if (name === "authorizationLetter") {
      const file = files?.[0] || null;
      const updated = { ...formData, authorizationLetter: file };
      setFormData(updated);

      // validate immediately if touched
      if (touched.authorizationLetter) {
        setOneFieldError("authorizationLetter", file, updated);
      }
      return;
    }

    // OTP field is separate state
    if (name === "otp") {
      const onlyDigits = value.replace(/\D/g, "");
      setOtp(onlyDigits);
      if (touched.otp) {
        setOneFieldError("otp", onlyDigits, formData);
      }
      return;
    }

    // Mobile numeric only
    if (name === "mobileNo") {
      const onlyDigits = value.replace(/\D/g, "");
      const updated = { ...formData, mobileNo: onlyDigits };
      setFormData(updated);

      if (touched.mobileNo) {
        setOneFieldError("mobileNo", onlyDigits, updated);
      }
      return;
    }

    // Normal fields
    const updated = { ...formData, [name]: value };

    if (name === "mainDepartmentId") {
      loadSubDepartments(value);
      updated.subDepartmentId = "";
      // validate dependent
      if (touched.subDepartmentId) {
        setOneFieldError("subDepartmentId", "", updated);
      }
    }

    setFormData(updated);

    // live validate if touched
    if (touched[name]) {
      setOneFieldError(name, value, updated);
    }

    // confirmPassword depends on password
    if (name === "password" && touched.confirmPassword) {
      setOneFieldError("confirmPassword", updated.confirmPassword, updated);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched(name);

    if (name === "otp") {
      setOneFieldError("otp", otp, formData);
      return;
    }

    const value = formData[name];
    setOneFieldError(name, value, formData);
  };

  const sendOtp = async () => {
    setFieldTouched("mobileNo");

    // Mobile validation
    const mobileMsg = setOneFieldError("mobileNo", formData.mobileNo, formData);
    if (mobileMsg) return;

    // ✅ CAPTCHA VALIDATION
    // if (!captchaInput.trim()) {
    //   toast.error("Captcha is required");
    //   setLoading(false);
    //   return;
    // }

    if (!validateCaptcha()) {
      toast.error("Captcha does not match");
      setLoading(false);
      return;
    }

    setOtpLoading(true);
    setError("");

    try {
      const res = await api.post("/public/send-otp", {
        mobileNo: formData.mobileNo,
      });
      setOtpSent(true);
      setMessage(res.data);
    } catch (error) {
      setError(error.response.data || "Something went wrong");
    }

    setOtpLoading(false);
  };


  useEffect(() => {
    if (otp.length === 6 && otpSent && !otpVerified) verifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);
  const verifyOtp = async () => {
    setOtpLoading(true);
    try {
      await api.post("/public/verify-otp", {
        mobileNo: formData.mobileNo,
        otp,
      });
      setOtpVerified(true);
      setMessage("OTP verified successfully");
      setActiveTab(1); // ✅ switch to Registration tab
    } catch {
      setError("Invalid OTP");
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // OTP checks
    setFieldTouched("otp");
    const otpMsg = setOneFieldError("otp", otp, formData);

    if (!otpVerified) {
      setError("Verify OTP first");
      return;
    }
    if (otpMsg) return;

    // Validate registration block fields
    const ok = validateRegistrationBlock(formData);
    if (!ok) {
      setError("Please fill all mandatory fields correctly");
      return;
    }

    // Existing checks (kept)
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.mainDepartmentId || !formData.subDepartmentId) {
      setError("Please select both main and sub department");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      const { authorizationLetter, ...formDataWithoutFile } = formData;

      data.append("data", JSON.stringify(formDataWithoutFile));

      if (authorizationLetter) {
        data.append("file", authorizationLetter);
      }

      await api.post("/public/register-department-user", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Registration successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }

    setLoading(false);
  };

  const getSelectedMainDeptName = () => {
    if (!formData.mainDepartmentId) return "Select Main Department";
    const dept = mainDepartments.find(
      (d) => d.id === formData.mainDepartmentId,
    );
    return dept ? dept.name : "Select Main Department";
  };

  const getSelectedSubDeptName = () => {
    if (!formData.subDepartmentId) {
      if (!formData.mainDepartmentId) return "Select Main Department First";
      if (subDepartments.length === 0) return "No Sub Departments Available";
      return "Select Sub Department";
    }
    const sub = subDepartments.find((s) => s.id === formData.subDepartmentId);
    return sub ? sub.name : "Select Sub Department";
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
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 960,
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
          backdropFilter: "blur(12px)",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: 2,
            textAlign: "center",
            background: `linear-gradient(90deg, ${TEAL.main}, ${TEAL.light})`,
            color: "#fff",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {t("login_signup_page.departmentRegistration")}
          </Typography>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            mb: 4,
            backgroundColor: "#e6f4f1",
            borderRadius: 3,
            p: 0.5,
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "1rem",
              borderRadius: 2,
              color: TEAL.dark,
            },
            "& .Mui-selected": {
              backgroundColor: TEAL.main,
              color: "#fff !important",
            },
          }}
        >
          <Tab label={t("login_signup_page.mobileVerification")} />
          <Tab
            label={t("login_signup_page.registrationDetails")}
            disabled={!otpVerified}
          />
        </Tabs>
        <form onSubmit={handleSubmit}>
          {(error || message) && (
            <Alert
              severity={error ? "error" : "success"}
              variant="filled"
              icon={false}
              sx={{
                mb: 3,
                py: 2,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 600,
                textAlign: "center",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {error || message}
            </Alert>
          )}

          {/* OTP BLOCK */}
          {activeTab === 0 && (
            <Box
              sx={{
                border: "1px solid #d0d7de",
                borderRadius: 2,
                p: 3,
                background: "#fff",
              }}
            >
              {/* Section Title */}
              <Typography
                sx={{
                  mb: 3,
                  color: TEAL.main,
                  textAlign: "center",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                }}
              >
                {t("login_signup_page.mobileVerification")}
              </Typography>

              {/* ROW 1: Mobile + Captcha + Send OTP */}
              <Grid container spacing={2} alignItems="center">
                {/* Mobile Number */}
                <Grid item size={{xs :12,sm:12,md:12}}>
                  <TextField
                    fullWidth
                    label={t("login_signup_page.mobileNumber")}
                    name="mobileNo"
                    disabled={otpVerified}
                    value={formData.mobileNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    inputProps={{ maxLength: 10 }}
                    required
                    error={Boolean(touched.mobileNo && fieldErrors.mobileNo)}
                    helperText={touched.mobileNo && fieldErrors.mobileNo}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                  />
                </Grid>

                {/* Captcha Block */}
                <Box>
                  <Grid container spacing={2} alignItems="center">

                    {/* Captcha Image */}
                    <Grid item size={{xs :12,sm:12,md:8}}>
                      <Captcha ref={captchaRef} onChange={setGeneratedCaptcha} />
                    </Grid>

                    {/* Captcha Input Field */}
                    <Grid item size={{xs :7,sm:8,md:4}}>
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
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: '#fff',
                          },
                        }}
                      />
                    </Grid>

                  </Grid>
                </Box>
              </Grid>

              {/* ROW 2: OTP */}
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Send OTP */}
                <Grid item size={{xs :12,md:6}}>
                  <Button
                  fullWidth
                    variant="outlined"
                    onClick={sendOtp}
                    disabled={otpSent || otpLoading || otpVerified}
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
                    {otpLoading ? (
                      <CircularProgress size={22} />
                    ) : (
                      t("login_signup_page.sendOtp")
                    )}
                  </Button>
                </Grid>
                <Grid item size={{xs :12,md:6}}>
                  <TextField
                    fullWidth
                    label={t("login_signup_page.otp")}
                    name="otp"
                    value={otp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!otpSent || otpVerified}
                    inputProps={{ maxLength: 6 }}
                    required
                    error={Boolean(touched.otp && fieldErrors.otp)}
                    helperText={touched.otp && fieldErrors.otp}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    InputProps={{
                      endAdornment: otpVerified && (
                        <InputAdornment position="end">
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 10,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: "#dcfce7",
                              color: "#166534",
                            }}
                          >
                            Verified
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* REGISTRATION BLOCK */}
          {activeTab === 1 && otpVerified && (
            <Box
              sx={{
                border: "1px solid #d0d7de",
                borderRadius: 2,
                p: 3,
                background: "#fff",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: "#1976d2",
                  textAlign: "center",
                  fontSize: "1.8rem",
                }}
              >
                {t("login_signup_page.registrationDetails")}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    label={t("login_signup_page.fullName")}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={Boolean(touched.fullName && fieldErrors.fullName)}
                    helperText={touched.fullName && fieldErrors.fullName}
                  />
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    label={t("login_signup_page.organizationName")}
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={Boolean(
                      touched.organizationName && fieldErrors.organizationName,
                    )}
                    helperText={
                      touched.organizationName && fieldErrors.organizationName
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    label={t("login_signup_page.signupEmail")}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={Boolean(touched.email && fieldErrors.email)}
                    helperText={touched.email && fieldErrors.email}
                  />
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    label={t("login_signup_page.userName")}
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    inputProps={{ maxLength: 25 }} // ✅ stop at 25
                    error={Boolean(touched.username && fieldErrors.username)}
                    helperText={touched.username && fieldErrors.username}
                  />
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    type="password"
                    label={t("login_signup_page.password")}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    inputProps={{ maxLength: 14 }} // ✅ stop at 14
                    error={Boolean(touched.password && fieldErrors.password)}
                    helperText={touched.password && fieldErrors.password}
                  />
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    type="password"
                    label={t("login_signup_page.confirmPassword")}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    inputProps={{ maxLength: 14 }} // ✅ stop at 14
                    error={Boolean(
                      touched.confirmPassword && fieldErrors.confirmPassword,
                    )}
                    helperText={
                      touched.confirmPassword && fieldErrors.confirmPassword
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    select
                    name="mainDepartmentId"
                    value={formData.mainDepartmentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("login_signup_page.mainDepartment")}
                    required
                    SelectProps={{
                      renderValue: () => getSelectedMainDeptName(),
                    }}
                    error={Boolean(
                      touched.mainDepartmentId && fieldErrors.mainDepartmentId,
                    )}
                    helperText={
                      touched.mainDepartmentId && fieldErrors.mainDepartmentId
                    }
                  >
                    {mainDepartments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    select
                    name="subDepartmentId"
                    value={formData.subDepartmentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("login_signup_page.subDepartment")}
                    required
                    disabled={
                      !formData.mainDepartmentId || subDepartments.length === 0
                    }
                    SelectProps={{
                      renderValue: () => getSelectedSubDeptName(),
                    }}
                    error={Boolean(
                      touched.subDepartmentId && fieldErrors.subDepartmentId,
                    )}
                    helperText={
                      touched.subDepartmentId && fieldErrors.subDepartmentId
                    }
                  >
                    {subDepartments.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    label={t("login_signup_page.officerName")}
                    name="officerName"
                    value={formData.officerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={Boolean(
                      touched.officerName && fieldErrors.officerName,
                    )}
                    helperText={touched.officerName && fieldErrors.officerName}
                  />
                </Grid>

                <Grid item xs={12} md={6} size={6}>
                  <TextField
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: TEAL.bg,
                      },
                    }}
                    label={t("login_signup_page.designation")}
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={Boolean(
                      touched.designation && fieldErrors.designation,
                    )}
                    helperText={touched.designation && fieldErrors.designation}
                  />
                </Grid>

                <Grid item xs={12} md={12} size={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    sx={{ height: "56px", fontSize: "16px" }}
                    onBlur={() => {
                      setFieldTouched("authorizationLetter");
                      setOneFieldError(
                        "authorizationLetter",
                        formData.authorizationLetter,
                        formData,
                      );
                    }}
                  >
                    {formData.authorizationLetter
                      ? `File Selected: ${formData.authorizationLetter.name}`
                      : t("login_signup_page.uploadLetter")}
                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      name="authorizationLetter"
                      onChange={handleChange}
                    />
                  </Button>

                  {touched.authorizationLetter &&
                    fieldErrors.authorizationLetter && (
                      <Typography
                        sx={{
                          color: "#d32f2f",
                          fontSize: "0.75rem",
                          mt: 0.5,
                          ml: 0.5,
                        }}
                      >
                        {fieldErrors.authorizationLetter}
                      </Typography>
                    )}
                </Grid>
              </Grid>

              <Grid container justifyContent="center" sx={{ mt: 4 }}>
                <Grid
                  item
                  xs={12}
                  md={6}
                  display="flex"
                  justifyContent="center"
                  gap={2}
                >
                  {/* REGISTER BUTTON */}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.6,
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${TEAL.main}, ${TEAL.light})`,
                      boxShadow: "0 6px 18px rgba(20,184,166,0.4)",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${TEAL.dark}, ${TEAL.main})`,
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      t("login_signup_page.signupRegister")
                    )}
                  </Button>

                  {/* RESET BUTTON */}
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    sx={{
                      height: 56,
                      borderColor: TEAL.main,
                      color: TEAL.main,
                      "&:hover": {
                        backgroundColor: "rgba(15,118,110,0.08)",
                      },
                    }}
                  >
                    {t("login_signup_page.signupReset")}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
             {t("login_signup_page.alreadyRegistered")}{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium cursor-pointer hover:underline"
            >
              {t("login_signup_page.loginHere")}
            </span>
          </p>
        </div>
      </Paper>
      
    </Box>
  );
};

export default SignupPage;
