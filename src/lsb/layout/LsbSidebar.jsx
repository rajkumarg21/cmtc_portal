import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

/**
 * Navigation configuration for the LSB sidebar.
 */
export const lsbNavigationConfig = [
  {
    label: 'User Management',
    icon: <GroupIcon />,
    path: '/lsb/user-management',
    roles: ['LSB_NODAL_CHECKER', 'LSB_ADMIN'],
  },
  {
    label: 'Request Loan Subsidy',
    icon: <DescriptionIcon />,
    path: '/lsb/request-new-loan-subsidy',
    roles: ['LSB_BANK_MAKER'],
  },
  {
    label: 'Loan Requests',
    icon: <ListAltIcon />,
    path: '/lsb/loan-requests',
    roles: [],
  },
];

/**
 * Filters navigation links based on user role.
 */
export function getVisibleLinks(userRole, allLinks) {
  return allLinks.filter((link) => {
    if (!link.roles || link.roles.length === 0) return true;
    return link.roles.includes(userRole);
  });
}

const LsbSidebar = ({ isOpen, toggleSidebar }) => {
  const { userRole } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const visibleLinks = getVisibleLinks(userRole, lsbNavigationConfig);
  const currentLang = i18n.language;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #163a5c 0%, #1f4e79 100%)',
        borderRight: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Logo / Brand Area */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          px: isOpen ? 2.5 : 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {isOpen ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255,143,0,0.15)',
                  border: '1.5px solid rgba(255,143,0,0.4)',
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 20, color: '#ffb300' }} />
              </Avatar>
              <Box sx={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s ease' }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2, fontSize: '0.8rem' }}
                >
                  {currentLang === 'hi' ? 'ऋण अनुदान' : 'Loan Subsidy'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
                  MP SRLM Portal
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={toggleSidebar} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <MenuOpenIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={toggleSidebar} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2, px: isOpen ? 1.5 : 1 }}>
        {isOpen && (
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: 1.5,
              px: 1.5,
              mb: 1,
              display: 'block',
            }}
          >
            Navigation
          </Typography>
        )}
        <List disablePadding>
          {visibleLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              location.pathname.startsWith(link.path + '/');

            const button = (
              <ListItemButton
                onClick={() => navigate(link.path)}
                sx={{
                  borderRadius: 2,
                  py: isOpen ? 1.2 : 1.5,
                  px: isOpen ? 2 : 0,
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  color: isActive ? '#ffb300' : 'rgba(255,255,255,0.7)',
                  bgcolor: isActive ? 'rgba(255,143,0,0.12)' : 'transparent',
                  position: 'relative',
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: 3,
                    borderRadius: '0 4px 4px 0',
                    bgcolor: '#ffb300',
                  } : {},
                  '&:hover': {
                    bgcolor: isActive
                      ? 'rgba(255,143,0,0.18)'
                      : 'rgba(255,255,255,0.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isOpen ? 36 : 'auto',
                    color: isActive ? '#ffb300' : 'rgba(255,255,255,0.5)',
                    justifyContent: 'center',
                  }}
                >
                  {link.icon}
                </ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#ffb300' : 'rgba(255,255,255,0.8)',
                      opacity: isOpen ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                      whiteSpace: 'nowrap',
                    },
                  }}
                />
              </ListItemButton>
            );

            return (
              <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
                {isOpen ? button : (
                  <Tooltip title={link.label} placement="right" arrow>
                    {button}
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom section */}
      <Box
        sx={{
          p: isOpen ? 2 : 1,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}
      >
        {isOpen && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>
            v1.0.0
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default LsbSidebar;
