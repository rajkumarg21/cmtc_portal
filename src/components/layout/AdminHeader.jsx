import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LanguageIcon from '@mui/icons-material/Language';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '../../context/AuthContext';
//import { getPagesForNavbar } from '../../services/staticPageService';
import { defaultHeaderLinks } from '../../DummyData';
import { useTranslation } from 'react-i18next';

// --- Utility Component for Desktop Nav Items ---
const DesktopNavItem = ({ item, handleMenuOpen, handleMenuClose, anchorEls, isHindi }) => {
  const displayTitle = isHindi ? item.titleHindi : item.titleEnglish;
  const itemPath = item.slug ? `/pages/${item.slug}` : '#';

  if (item.children && item.children.length > 0) {
    return (
      <Box key={item.id} sx={{ ml: 1 }}>
        <Button
          onClick={(e) => handleMenuOpen(e, item.id)}
          endIcon={<ArrowDropDownIcon sx={{ color: 'white' }} />}
          sx={{ color: 'white', textTransform: 'none' }}
        >
          {displayTitle}
        </Button>
        <Menu
          anchorEl={anchorEls[item.id]}
          open={Boolean(anchorEls[item.id])}
          onClose={() => handleMenuClose(item.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {item.children.map((child) => {
            const childTitle = isHindi ? child.titleHindi : child.titleEnglish;
            return (
              <MenuItem
                key={child.id}
                component={Link}
                to={`/pages/${child.slug}`}
                onClick={() => handleMenuClose(item.id)}
              >
                {childTitle}
              </MenuItem>
            );
          })}
        </Menu>
      </Box>
    );
  }

  return (
    <Button
      key={item.id}
      component={Link}
      to={itemPath}
      sx={{ color: 'white', textTransform: 'none' }}
    >
      {displayTitle}
    </Button>
  );
};

// --- Main Component ---
const AdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { isAuthenticated, hasRole, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [navbarItems, setNavbarItems] = useState([]);
  const [loadingNavbar, setLoadingNavbar] = useState(true);
  const [navbarError, setNavbarError] = useState(null);
  const [anchorEls, setAnchorEls] = useState({});
  const [langMenuAnchor, setLangMenuAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false); // State for mobile drawer
  
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const APP_BAR_COLOR = "#0b2d46";
  const ACTIVE_LINK_COLOR = theme.palette.info.light || '#7e9bf4'; 

  const services = [
    { label: t("services.advertisement"), path: "/advertisementSectionList" },
    { label: t("services.film"), path: "/filmSectionList" },
    { label: t("services.project"), path: "/projectSectionList" },
    { label: t("services.print"), path: "/printingSectionList" },
    { label: t("services.events"), path: "/eventSectionList" },
    // { label: t("services.rojgar-nirman"), path: "/rojgarAndNirman" },
  ];


  useEffect(() => {
    const fetchNavbarItems = async () => {
      try {
        const items = await getPagesForNavbar();
        setNavbarItems(items);
      } catch (error) {
        setNavbarError(t('navbar.errorLoading'));
        setNavbarItems([]);
      } finally {
        setLoadingNavbar(false);
      }
    };
    fetchNavbarItems();
  }, [t, i18n.language]);

  const isNavLinkActive = (path) => location.pathname === path;

  const handleMenuOpen = (event, id) => {
    setAnchorEls({ ...anchorEls, [id]: event.currentTarget });
  };

  const handleMenuClose = (id) => {
    setAnchorEls({ ...anchorEls, [id]: null });
  };

  const handleLanguageMenuOpen = (event) => {
    setLangMenuAnchor(event.currentTarget);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setLangMenuAnchor(null);
  };

  // Consolidated toggle function for the leftmost icon
  const handleMainToggle = () => {
    if (isMobile) {
      setMobileOpen(true); // Open the mobile drawer
    } else {
      toggleSidebar(); // Toggle the desktop sidebar
    }
  };

  // Toggle function for closing the mobile drawer
  const toggleMobileDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
  };

    // ✅ Mobile Drawer menu
    const renderMobileMenu = () => (
      <Drawer anchor="left" open={mobileOpen} onClose={toggleMobileDrawer(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <IconButton onClick={toggleMobileDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {defaultHeaderLinks.map(({ path, labelKey }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={path}
                  onClick={(e) => {
                    checkUserLogin(e, path, labelKey);
                    setMobileOpen(false);
                  }}
                >
                  <ListItemText primary={t(labelKey)} />
                </ListItemButton>
              </ListItem>
            ))}
            {services.map(({ path, label }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={path}
                  onClick={(e) => {
                    checkUserLogin(e, path, label);
                    setMobileOpen(false);
                  }}
                >
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    );


  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: APP_BAR_COLOR, 
        height: '64px', 
        zIndex: theme.zIndex.drawer + 1,
        left: { xs: 0, md: isSidebarOpen ? 240 : 67 },
        width: { 
            md: isSidebarOpen ? `calc(100% - 240px)` : `calc(100% - 67px)`,
            xs: '100%',
        }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
        
        {/* Left Side: Main Toggle Icon & Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          
          {/* Main Toggle Icon: Function changes based on screen size */}
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={handleMainToggle} // Consolidated logic
            aria-label={isMobile ? "open mobile menu" : "toggle sidebar"}
            sx={{ color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Center - Desktop only Navigation (Hidden on Mobile) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          
          {/* Default Static Links */}
          {defaultHeaderLinks.map(({ path, labelKey }) => (
            <Button
              key={path}
              component={Link}
              to={path}
              sx={{
                color: isNavLinkActive(path) ? ACTIVE_LINK_COLOR : 'white',
                textTransform: 'none'
              }}
            >
              {t(labelKey)}
            </Button>
          ))}

          {/* Dynamic API Links */}
          {loadingNavbar ? (
            <Typography sx={{ color: theme.palette.info.light || 'lightblue' }}>{t('navbar.loading')}</Typography>
          ) : navbarError ? (
            <Typography sx={{ color: theme.palette.error.main || 'red' }}>{navbarError}</Typography> 
          ) : (
            navbarItems.map(item => (
                <DesktopNavItem
                    key={item.id}
                    item={item}
                    handleMenuOpen={handleMenuOpen}
                    handleMenuClose={handleMenuClose}
                    anchorEls={anchorEls}
                    isHindi={i18n.language === "hi"}
                />
            ))
          )}
        </Box>
        
        {/* Right Side: Utilities (Language and Profile) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Language switcher */}
          <IconButton sx={{ color: 'white' }} onClick={handleLanguageMenuOpen} aria-label="Language selection">
            <LanguageIcon />
          </IconButton>
          <Menu
            anchorEl={langMenuAnchor}
            open={Boolean(langMenuAnchor)}
            onClose={() => setLangMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
            <MenuItem onClick={() => handleLanguageChange('hi')}>हिन्दी</MenuItem>
          </Menu>

          {/* Profile / Login / Signup */}
          {isAuthenticated ? (
            <>
              <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0 }} aria-label="User Profile Menu">
                <Avatar alt="User Avatar" />
              </IconButton>
              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() => setProfileAnchor(null)}
              >
                <MenuItem component={Link} to="/profile/edit" onClick={() => setProfileAnchor(null)}>{t('Edit Profile')}</MenuItem>
                {hasRole(['NORMAL_VISITOR']) && (<MenuItem component={Link} to="/MySubscriptionPlans" onClick={() => setProfileAnchor(null)}> {t('My Plans')} </MenuItem>)}
                {hasRole(['PORTAL_ADMIN', 'EDITOR', 'PUBLISHER']) && (<MenuItem component={Link} to="/cms/dashboard" onClick={() => setProfileAnchor(null)}>{t('CMS Dashboard')}</MenuItem>)}
                {hasRole(['PORTAL_ADMIN']) && (<MenuItem component={Link} to="/admin/dashboard" onClick={() => setProfileAnchor(null)}>{t('Admin Dashboard')}</MenuItem>)}
                <MenuItem onClick={() => { logout(); setProfileAnchor(null); }} sx={{ color: theme.palette.error.main }}>
                  {t('Logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} sx={{ color: 'white' }} to="/login">
                <PersonOutlineIcon />
                <Typography component="span" sx={{ fontSize: '0.9rem', ml: 0.5, fontWeight: 600 }}>{t('Login')}</Typography>
              </Button>
              {/* Hide Signup on mobile for cleaner header */}
              <Button 
                component={Link} 
                sx={{ color: 'white', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }} 
                to="/Signup"
              >
                <Typography component="span" sx={{ fontSize: '0.9rem', ml: 0.5, fontWeight: 600 }}>{t('Signup')}</Typography>
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
      
      {/* Mobile Drawer (Only visible/used when isMobile is true) */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleMobileDrawer(false)}
        ModalProps={{ keepMounted: true }}
      >
        {renderMobileMenu()}
      </Drawer>
    </AppBar>
  );
};

export default AdminHeader;