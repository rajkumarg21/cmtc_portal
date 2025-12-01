import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  TextField,
  Paper,
  Typography,
  Stack,
  Divider,
  Box,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Captcha from './Captcha';
import { toast } from 'react-toastify';
import mpbuildingImage from "../../assets/images/mpmadhyam-building.png";
import loginbg from "../../assets/images/login-bg.jpg";
import rojgarbg from "../../assets/rojgar-login-left.svg";
import { useLocation } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const captchaRef = useRef();
  const location = useLocation();
  const isRojgarniman = location.state?.rojgarniman === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

      if (captchaInput.trim().toUpperCase() !== generatedCaptcha.toUpperCase()) {
        toast.error('Captcha does not match');
        setCaptchaInput(""); 
        captchaRef.current?.refreshCaptcha();
        setLoading(false);
        return;
      }
      try {
        await login(username, password);
        toast.success('logged in successfully !');
       setCaptchaInput(""); 
        captchaRef.current?.refreshCaptcha();
        if (userRole === "PORTAL_ADMIN") {
            navigate("/admin/dashboard");
          } else if (userRole === "EDITOR" || userRole === "PUBLISHER") {
            navigate("/cms/dashboard");
          } else {
            navigate("/");
          }
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        const message = typeof data === "string" ? data : data?.message || err.message;
        if (status === 403) {
          toast.error("Your account is disabled. Please contact admin.");
        } 

        setError(message);
       setCaptchaInput('');
       captchaRef.current?.refreshCaptcha();
      } finally {
        setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 8,
        minHeight: "100vh"
      }}
    >
      <Paper
        elevation={12}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // 👈 key fix
          borderRadius: 5,
          overflow: 'hidden',
          width: { xs: '95%', sm: '90%', md: '80%' }, // 👈 wider on mobile
          maxWidth: 1000,
          minHeight: 600,
        }}
      >
        {/* Left Side - Illustration */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${isRojgarniman ? rojgarbg : mpbuildingImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            backgroundRepeat:"no-repeat",
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `${isRojgarniman ?"":'rgba(0,0,0,0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textAlign: 'center',
              px: 3,
            }}
          >
           {!isRojgarniman && (<Typography variant="h4" fontWeight={700}>
              Welcome to MP Madhyam
            </Typography>)}
          </Box>
        </Box>

        {/* Right Side - Login Form */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 3, md: 8 },
            background: `url(${loginbg})`,
            backgroundSize: "cover",
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: "relative",
          }}
        >
          {/* Floating Gradient Heading */}
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
            Login
          </Box>

          {error && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#FFE4E6',
                border: '1px solid #F87171',
                color: '#B91C1C',
                width: '100%',
                textAlign: 'center',
              }}
            >
              {error}
            </Paper>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
                <>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    required
                    disabled={loading}
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
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"} // <-- toggle type
                    // type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#fff',
                      },
                      '& .Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                        borderWidth: 2,
                      },
                    }} InputProps={{
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
                    <Captcha ref={captchaRef} onChange={(text) => setGeneratedCaptcha(text)} />
                    <TextField
                      label="Enter Captcha"
                      variant="outlined"
                      fullWidth
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      sx={{ mt: 1, borderRadius: 3 }}
                    />
                  </Box>
                </>
              
                  
              <LoadingButton
                type="submit"
                variant="contained"
                loading={loading}
                fullWidth
                sx={{
                  background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
                  color: '#fff',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  '&:hover': { background: 'linear-gradient(90deg, #2563EB, #0891B2)' },
                }}
              >
                Sign In
              </LoadingButton>

              <Divider sx={{ my: 1 }} />

              <Typography textAlign="center" variant="body2" sx={{ mt: 2 }}>
                <Box component="span" sx={{ display: 'inline-flex', gap: 2 }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      textDecoration: 'none',
                      color: '#3B82F6',
                      fontWeight: 500,
                    }}
                  >
                    Forgot Password
                  </Link>
                  <span style={{ color: '#9CA3AF' }}>|</span>
                  <Link
                    to="/signup"
                    style={{
                      textDecoration: 'none',
                      color: '#3B82F6',
                      fontWeight: 500,
                    }}
                  >
                    Sign Up
                  </Link>
                </Box>
              </Typography>

            </Stack>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
