import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Chip,
  InputBase,
  Badge,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TranslateIcon from '@mui/icons-material/Translate';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LsbHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [langAnchor, setLangAnchor] = useState(null);

  const handleProfileOpen = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleLangOpen = (event) => setLangAnchor(event.currentTarget);
  const handleLangClose = () => setLangAnchor(null);

  const handleLogout = () => {
    handleProfileClose();
    logout();
    navigate('/lsb/login');
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    handleLangClose();
  };

  const currentLang = i18n.language;
  const displayName = user?.fullName || user?.username || 'User';

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        background: 'linear-gradient(135deg, #1f4e79 0%, #2e75b6 100%)',
        boxShadow: '0 2px 8px rgba(31,78,121,0.3)',
      }}
    >
      {/* Mobile menu toggle */}
      <IconButton
        onClick={toggleSidebar}
        sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff', mr: 1 }}
      >
        <MenuIcon />
      </IconButton>

      {/* Left: Search */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          bgcolor: 'rgba(255,255,255,0.15)',
          borderRadius: 3,
          px: 2,
          py: 0.5,
          width: { sm: 200, md: 320 },
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'border-color 0.2s',
          '&:focus-within': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.2)' },
        }}
      >
        <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', mr: 1, fontSize: 20 }} />
        <InputBase
          placeholder={t("search") || "Search..."}
          sx={{ flex: 1, fontSize: '0.875rem', color: '#fff', '&::placeholder': { color: 'rgba(255,255,255,0.6)' } }}
        />
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Language */}
        <Tooltip title="Language">
          <IconButton onClick={handleLangOpen} size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            <TranslateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          onClose={handleLangClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 120, mt: 1 } }}
        >
          <MenuItem
            onClick={() => handleLanguageChange('en')}
            selected={currentLang === 'en'}
            sx={{ fontSize: '0.875rem' }}
          >
            English
          </MenuItem>
          <MenuItem
            onClick={() => handleLanguageChange('hi')}
            selected={currentLang === 'hi'}
            sx={{ fontSize: '0.875rem' }}
          >
            हिन्दी
          </MenuItem>
        </Menu>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            <Badge variant="dot" color="error">
              <NotificationsNoneIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 28, alignSelf: 'center', borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* User Profile */}
        <Box
          onClick={handleProfileOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            borderRadius: 3,
            px: 1.5,
            py: 0.5,
            transition: 'background 0.2s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#ff8f00',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>
              {user?.role || 'LSB User'}
            </Typography>
          </Box>
          <ExpandMoreIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
        </Box>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>{displayName}</Typography>
            {user?.email && (
              <Typography variant="caption" color="text.secondary">{user.email}</Typography>
            )}
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileClose} sx={{ fontSize: '0.875rem', py: 1.2 }}>
            <PersonOutlineIcon fontSize="small" sx={{ mr: 1.5, color: '#64748b' }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem', py: 1.2, color: '#dc2626' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
            {t('Logout')}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default LsbHeader;
