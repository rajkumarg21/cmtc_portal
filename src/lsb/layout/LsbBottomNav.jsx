import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';

const navItems = [
  { label: 'Loan Requests', icon: <ListAltIcon />, path: '/lsb/loan-requests' },
  { label: 'Request Subsidy', icon: <DescriptionIcon />, path: '/lsb/request-new-loan-subsidy' },
  { label: 'Users', icon: <GroupIcon />, path: '/lsb/user-management' },
];

const LsbBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active index based on current path
  const activeIndex = navItems.findIndex(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/')
  );

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        borderTop: '1px solid #e0e0e0',
        bgcolor: '#ffffff',
      }}
    >
      <BottomNavigation
        value={activeIndex >= 0 ? activeIndex : false}
        onChange={(_, newValue) => {
          navigate(navItems[newValue].path);
        }}
        showLabels
        sx={{
          width: '100%',
          height: 56,
          bgcolor: '#ffffff',
          '& .Mui-selected': {
            color: '#1f4e79',
          },
          '& .MuiBottomNavigationAction-root': {
            color: '#9e9e9e',
            minWidth: 'auto',
            '&.Mui-selected': {
              color: '#1f4e79',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            '&.Mui-selected': {
              fontSize: '0.7rem',
              fontWeight: 600,
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default LsbBottomNav;
