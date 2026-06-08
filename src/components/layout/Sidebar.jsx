   import React from 'react';
   import {
     Typography,
     Box,
     Container,
     Grid,
     List,
     ListItem,
     ListItemText,
     ListItemIcon,useTheme
   } from '@mui/material';
   import VisitorCounter from './VisitorCounter';
   import aboutImage from './../../assets/img/about-company.png';
   const AdminSidebar = () => {
      const theme = useTheme();
     return ( <Box
              sx={{
                display: 'flex',
                animation: 'fadeInLeft 1.5s',
                visibility: 'visible',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                <Box
                  component="img"
                  src={aboutImage}
                  alt="Welcome"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    zIndex: 2,
                    position: 'relative',
                  }}
                />
                {/* Decorative shapes */}
                <Box
                  className="welcome-one__shape-1"
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    width: 60,
                    height: 60,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '50%',
                    opacity: 0.2,
                  }}
                />
                <Box
                  className="welcome-one__shape-2"
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: -20,
                    width: 40,
                    height: 40,
                    backgroundColor: "#ba2e00",
                    borderRadius: '50%',
                    opacity: 0.3,
                  }}
                />

                {/* Trusted by */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#fff',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: 'center',
                    zIndex: 3,
                  }}
                >
                  <VisitorCounter />
                </Box>
              </Box>
            </Box>
              );
};

export default AdminSidebar;