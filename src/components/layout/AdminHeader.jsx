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
import { getPagesForNavbar } from '../../services/staticPageService';
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
  const { isAuthenticated, hasRole, logout , user} = useAuth();
  const { t, i18n } = useTranslation();
  const [navbarItems, setNavbarItems] = useState([]);
  const [loadingNavbar, setLoadingNavbar] = useState(true);
  const [navbarError, setNavbarError] = useState(null);
  const [anchorEls, setAnchorEls] = useState({});
  const [langMenuAnchor, setLangMenuAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const APP_BAR_COLOR = "#1F3C88";
  const ACTIVE_LINK_COLOR = theme.palette.info.light || '#7e9bf4'; 

  const services = [
    { label: t("services.advertisement"), path: "/advertisementSectionList" },
    { label: t("services.film"), path: "/filmSectionList" },
    { label: t("services.project"), path: "/projectSectionList" },
    { label: t("services.print"), path: "/printingSectionList" },
    { label: t("services.events"), path: "/eventSectionList" },
  ];

  // ✅ Define role checks
  const hasCMSAccess = hasRole(['PORTAL_ADMIN', 'EDITOR', 'PUBLISHER']);
  const hasFullAdminAccess = hasRole(['PORTAL_ADMIN']);
  const hasLimitedAdminAccess = hasRole([
    'ZONAL_HEAD',
    'DISTRICT_OFFICER',
    'BLOCK_OFFICER',
    'CMTC_MANAGER'
  ]);

  // useEffect(() => {
  //   const fetchNavbarItems = async () => {
  //     try {
  //       const items = await getPagesForNavbar();
  //       setNavbarItems(items);
  //     } catch (error) {
  //       setNavbarError(t('navbar.errorLoading'));
  //       setNavbarItems([]);
  //     } finally {
  //       setLoadingNavbar(false);
  //     }
  //   };
  //   fetchNavbarItems();
  // }, [t, i18n.language]);

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

  const handleMainToggle = () => {
    // if (isMobile) {
    //   setMobileOpen(true);
    // } else {
      toggleSidebar();
    // }
  };

  const toggleMobileDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
  };

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
                onClick={() => setMobileOpen(false)}
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
                onClick={() => setMobileOpen(false)}
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
        height: '65px', 
        zIndex: theme.zIndex.drawer + 1,
        left: { xs: 0, md: isSidebarOpen ? 0 : 0 },
        width: { 
            md: isSidebarOpen ? `calc(100% - 0px)` : `calc(100% - 0px)`,
            xs: '100%',
        }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
 
       
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={handleMainToggle}
            aria-label={isMobile ? "open mobile menu" : "toggle sidebar"}
            sx={{ color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
           <Typography variant="h5">
              {t("admin.cmtcheaderTitle")}
            </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
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

          {loadingNavbar ? (
            // <Typography sx={{ color: theme.palette.info.light || 'lightblue' }}>{t('navbar.loading')}</Typography>
             <Typography sx={{ color: theme.palette.info.light || 'lightblue' }}>{('')}</Typography>
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
          sx={{
            fontWeight: 600,
            color: '#ECE7FA' 
          }}
          >
          Language
          </Typography>
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

          {isAuthenticated ? (
            <>
             <Typography 
              sx={{
                  fontWeight: 600,
                  color: '#ece8f7' 
                }}
             >
              {user?.username || user?.fullName || 'User'}
              </Typography>
              <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0 }} aria-label="User Profile Menu">
                <Avatar alt="User Avatar" />
              </IconButton>
              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() => setProfileAnchor(null)}
              >
                <MenuItem component={Link} to="/profile/edit" onClick={() => setProfileAnchor(null)}>
                  {t('Edit Profile')}
                </MenuItem>
                
                {hasRole(['NORMAL_VISITOR']) && (
                  <MenuItem component={Link} to="/MySubscriptionPlans" onClick={() => setProfileAnchor(null)}>
                    {t('My Plans')}
                  </MenuItem>
                )}
                
                {hasCMSAccess && (
                  <MenuItem component={Link} to="/cms/dashboard" onClick={() => setProfileAnchor(null)}>
                    {t('CMS Dashboard')}
                  </MenuItem>
                )}
                
                {hasFullAdminAccess && (
                  <MenuItem component={Link} to="/admin/admin_dashboard" onClick={() => setProfileAnchor(null)}>
                    {t('Admin Dashboard')}
                  </MenuItem>
                )}

                {hasLimitedAdminAccess && (
                  <MenuItem component={Link} to="/admin/users" onClick={() => setProfileAnchor(null)}>
                    {t('User Management')}
                  </MenuItem>
                )}
                
                <MenuItem 
                  onClick={() => { 
                    logout(); 
                    setProfileAnchor(null); 
                  }} 
                  sx={{ color: theme.palette.error.main }}
                >
                  {t('Logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} sx={{ color: 'white' }} to="/login">
                <PersonOutlineIcon />
                <Typography component="span" sx={{ fontSize: '0.9rem', ml: 0.5, fontWeight: 600 }}>
                  {t('Login')}
                </Typography>
              </Button>
              <Button 
                component={Link} 
                sx={{ color: 'white', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }} 
                to="/Signup"
              >
                <Typography component="span" sx={{ fontSize: '0.9rem', ml: 0.5, fontWeight: 600 }}>
                  {t('Signup')}
                </Typography>
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
      
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