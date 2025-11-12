import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from "../../services/apiService";

const DefaultHeader = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const staticMenuItems = [
    { text: t('home'), path: '/' },
    { text: t('aboutUs'), path: '/pages/about-us' },
    { text: t('publication'), path: '/books' },
    { text: t('gallery'), path: '/gallery' },
    { text: t('contactUs'), path: '/contact' },
  ];

  // ✅ Desktop navigation links
  const renderDesktopMenu = () => (
      <Box sx={{ display: 'flex', gap: 4 }}>
      {staticMenuItems.map((item) => (
                      <Button
                        key={item.text}
                        component={Link}
                        to={item.path}
                        sx={{
                          color: '#fff',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          '&:hover': {
                            color: '#ffb400',
                          },
                        }}
                      >
                        {item.text}
                      </Button>
                    ))}
          </Box>
  );

  return (
    <>
      <AppBar
              position="static"
              sx={{
                background: '#0b2d46',
                boxShadow: 'none',
              }}
            >
    <Toolbar
             sx={{
               justifyContent: isMobile ? 'space-between' : 'center',
               px: { xs: 2, sm: 4 },
             }}
           >
          {/* Left side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton sx={{ color: "#fff" }} onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Center - Desktop only */}
          { renderDesktopMenu()}

        </Toolbar>
      </AppBar>

    </>
  );
};

export default DefaultHeader;
