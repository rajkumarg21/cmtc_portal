import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,Grid
} from "@mui/material";
import { USER_ROLES } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { signup } from "../../services/authService";
import mpbuildingImage from "../../assets/images/mpmadhyam-building.png";
import loginbg from "../../assets/images/login-bg.jpg";
import "react-toastify/dist/ReactToastify.css";
const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: USER_ROLES.NORMAL_VISITOR,
    mobileNo: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate email format
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Validate mobile number
  const validateMobile = (mobileNo) => /^[0-9]{10}$/.test(mobileNo);

  const registerUser = async (data) => {
  try {
    const response = await signup(data);

    if (response.status === 201) {
      const backendMessage = response.data?.message || "Registration successful";
      setMessage(backendMessage);

      // Hide success message after 4 seconds
      setTimeout(() => {
        setMessage("");
      }, 4000);

      return response.data;
    } else {
      const backendMessage = response.data?.message || "Something went wrong";
      setError(backendMessage);
      throw new Error(backendMessage);
    }
  } catch (error) {
    const backendError = error.response?.data?.message || "Signup failed";
    setError(backendError);

    // Optionally clear error after 4s
    setTimeout(() => {
      setError("");
    }, 4000);

    throw new Error(backendError);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.fullName ||
      !formData.mobileNo ||
      !formData.password
    ) {
      setError("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validateMobile(formData.mobileNo)) {
      setError("Please enter a valid mobile number (10 digits).");
      return;
    }
if (formData.password !== formData.confirmpassword) {
  setError("Passwords do not match.");
  return;
}
    setLoading(true);

    try {
      await registerUser(formData);
      setFormData({
        username: "",
        email: "",
        fullName: "",
        mobileNo: "",
        password: "",
        confirmpassword: "", 
        role: USER_ROLES.NORMAL_VISITOR,
      });

    // Delay navigation so user sees the message
    setTimeout(() => {
      navigate("/login");
    }, 1500);
    } catch (err) {
      // Error already handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#e0e0e0"
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          borderRadius: 3,
          overflow: "hidden",
          height: "550px",
          width:"80%"
        }}
      >
        {/* LEFT PANEL */}
   
 <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${mpbuildingImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textAlign: 'center',
              px: 3,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Welcome to CMTC
            </Typography>
            
          </Box>
          
        </Box>
        {/* RIGHT PANEL */}
        <Box flex={1.5} bgcolor="white"  sx={{
            flex: 1,
            p: { xs: 6, md: 8 },
            background: `url(${loginbg})`,
            backgroundSize: "cover",
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: "relative",
          }}>
          <Box
            sx={{
              alignSelf: "center",
              mb: 4,
              background: "linear-gradient(90deg, #f3960aff, #f63676ff)",
              color: "white",
              px: 4,
              borderRadius: "25px",
              boxShadow: 2,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            Register Here
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
  <Grid container spacing={2}>
    {/* Full Name */}
    <Grid item xs={12} sm={6} size={6}>
      <TextField
        fullWidth
        margin="normal"
        placeholder="Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
         sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#fff',
                      },
                      '& .Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                        borderWidth: 2,
                      },
                    }}
        required
      />
    </Grid>

    {/* Email */}
    <Grid item xs={12} sm={6} size={6}>
      <TextField
        fullWidth
        margin="normal"
        placeholder="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
         sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#fff',
                      },
                      '& .Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                        borderWidth: 2,
                      },
                    }}
      />
    </Grid>

    {/* Username */}
    <Grid item xs={12} sm={6} size={6}>
      <TextField
        fullWidth
        margin="normal"
        placeholder="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
         sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#fff',
                      },
                      '& .Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                        borderWidth: 2,
                      },
                    }}
        required
      />
    </Grid>

    {/* Mobile No */}
    <Grid item xs={12} sm={6} size={6}>
      <TextField
        fullWidth
        margin="normal"
        placeholder="Mobile No"
        name="mobileNo"
        value={formData.mobileNo}
        onChange={handleChange}
         sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#fff',
                      },
                      '& .Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                        borderWidth: 2,
                      },
                    }}
        required
      />
    </Grid>

    {/* Password (full width) */}
    <Grid item xs={12} size={6}>
      <TextField
        fullWidth
        margin="normal"
        placeholder="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
         sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#fff',
                      },
                      '& .Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                        borderWidth: 2,
                      },
                    }}
        required
      />
    </Grid>

        <Grid item xs={12} size={6}>
      <TextField
        fullWidth
        margin="normal"
        placeholder="Confirm Password"
        name="confirmpassword"
        type="password"
        value={formData.confirmpassword}
        onChange={handleChange}
         sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#fff',
                      },
                      '& .Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                        borderWidth: 2,
                      },
                    }}
        required
      />
    </Grid>
  </Grid>

  <Button
    type="submit"
    fullWidth
    variant="contained"
    sx={{
      mt: 3,
      py: 1.2,
      background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
      '&:hover': { background: 'linear-gradient(90deg, #2563EB, #0891B2)' },
    }}
    disabled={loading}
  >
    {loading ? <CircularProgress size={24} color="inherit" /> : "SIGN UP"}
  </Button>
</Box>

        </Box>
      </Paper>
    </Box>
  );
};

export default SignupPage;
