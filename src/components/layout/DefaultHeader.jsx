import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  Divider,
  Collapse
} from '@mui/material';
import CelebrationIcon from "@mui/icons-material/Celebration";
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LanguageIcon from '@mui/icons-material/Language';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
//import logo from './../../assets/img/logo.png';
import { useTranslation } from 'react-i18next';
import { getPagesForNavbar } from '../../services/staticPageService';
import { defaultHeaderLinks } from '../../DummyData';
import { useAuth } from '../../context/AuthContext';
import { getUserTrialPlan } from '../../services/subscriptionService';
import api from "../../services/apiService";
import LockIcon from '@mui/icons-material/Lock';



const DefaultHeader = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEls, setAnchorEls] = useState({});
  const [langMenuAnchor, setLangMenuAnchor] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const [menuItems, setMenuItems] = useState([]);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [trialPopupOpen, setTrialPopupOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = (open) => () => setMobileOpen(open);

  const staticMenuItems = [
    { text: t('home'), path: '/' },
    { text: t('aboutUs'), path: '/contact' },
    { text: t('OrganizationStructure'), path: '/contact' },
    { text: t('gallery'), path: '/gallery' },
    { text: t('HumanResource'), path: '/contact' },
    { text: t('CMTC'), path: '/cmtc-page' },
    { text: t('Brosher'), path: '/books' },
    { text: t('book'), path: '/books' },
    { text: t('contactUs'), path: '/contact' },
  ];

  const checkUserLogin = async (e, path, labelKey) => {
    e.preventDefault();    
    navigate(path);
  };

  useEffect(() => {
    const fetchNavbarItems = async () => {
      try {
        const items = await getPagesForNavbar();
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch navbar items:", error);
        setMenuItems([]);
      }
    };
    fetchNavbarItems();
  }, []);

  const isNavLinkActive = (path) => location.pathname === path;
    const handleMenuOpen = (event, id) => {
    setAnchorEls({ ...anchorEls, [id]: event.currentTarget });
  };

  const handleMenuClose = (id) => {
    setAnchorEls({ ...anchorEls, [id]: null });
  };
const renderMenuItems = (items) => {
  return items.map((menu) => {
    const isHindi = i18n.language === "hi";
    const displayTitle = isHindi ? menu.titleHindi : menu.titleEnglish;

    return (
      
      <Box key={menu.id} sx={{ ml: 1 }}>
        {menu.children && menu.children.length > 0 ? (
          <>
            <Button
              onClick={(e) => handleMenuOpen(e, menu.id)}
              endIcon={<ArrowDropDownIcon sx={{ color: 'white' }} />}
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
              {displayTitle}
            </Button>
            <Menu
              anchorEl={anchorEls[menu.id]}
              open={Boolean(anchorEls[menu.id])}
              onClose={() => handleMenuClose(menu.id)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
             
            >
              {menu.children.map((child) => {
                const childTitle = isHindi ? child.titleHindi : child.titleEnglish;
                return (
                  <MenuItem
                    key={child.id}
                    component={Link}
                    to={`/pages/${child.slug}`}
                    onClick={() => handleMenuClose(menu.id)}
                  >
                    {childTitle}
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        ) : (
          <Button
            component={Link}
            to={`/pages/${menu.slug}`}
            sx={{ color: isNavLinkActive(`/pages/${menu.slug}`) ? '#7e9bf4ff' : '#fff',fontWeight: 600,
                            textTransform: 'none',
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            '&:hover': {
                              color: '#ffb400',
             } }}  
                 
          >
            {displayTitle}
          </Button>
        )}
      </Box>
    );
  });
};
const renderMobileDynamicMenus = (items) => {
  const isHindi = i18n.language === "hi";
  const [openMenus, setOpenMenus] = useState({});

  const handleToggle = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMenuList = (menus) =>
    menus.map((menu) => {
      const displayTitle = isHindi ? menu.titleHindi : menu.titleEnglish;
      const isOpen = openMenus[menu.id] || false;

      // 🟢 If menu has children → show collapsible
      if (menu.children && menu.children.length > 0) {
        return (
          <React.Fragment key={menu.id}>
            <ListItemButton
              onClick={() => handleToggle(menu.id)}
              sx={{
                color: "#0b2d46",
                py: 1,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
            >
              <ListItemText
                primary={displayTitle}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "1.05rem",
                }}
              />
              <ArrowDropDownIcon
                sx={{
                  color: "#0b2d46",
                  transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            </ListItemButton>

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {menu.children.map((child) => {
                  const childTitle = isHindi
                    ? child.titleHindi
                    : child.titleEnglish;
                  return (
                    <ListItemButton
                      key={child.id}
                      component={Link}
                      to={`/pages/${child.slug}`}
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        pl: 4,
                        color: "#0b2d46",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                      }}
                    >
                      <ListItemText
                        primary={childTitle}
                        primaryTypographyProps={{
                          fontSize: "1rem",
                          fontWeight: 400,
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }

      // 🟢 If no children → single menu item
      return (
        <ListItemButton
          key={menu.id}
          component={Link}
          to={`/pages/${menu.slug}`}
          onClick={() => setMobileOpen(false)}
          sx={{
            color: "#0b2d46",
            py: 1,
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          <ListItemText
            primary={displayTitle}
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: "1.05rem",
            }}
          />
        </ListItemButton>
      );
    });

  return renderMenuList(items);
};


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
       
   
      {renderMenuItems(menuItems)}
      {/* {menuItems.map((menu) => (
        <Button
          key={menu.id}
          component={Link}
          to={`/pages/${menu.slug}`}
          sx={{
            color: gradient ? '#fff' : 'inherit',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: `${fontSize}px`,
          }}
        >
          {menu.titleEnglish}
        </Button>
      ))} */}
    </Box>
  );

  // ✅ Mobile Drawer menu
  const renderMobileMenu = () => (
    <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer(false)}>
      <Box sx={{ width: 250, p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          {/* <img src={logo} alt="logo" style={{ height: 50 }} /> */}
          <IconButton onClick={toggleDrawer(false)}>
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
          {renderMobileDynamicMenus(menuItems)}          
        </List>
      </Box>
    </Drawer>
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
          {!isMobile && renderDesktopMenu()}

        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && renderMobileMenu()}

      {/* Popup  if user not login then so massage to access  */}
     <Dialog
  open={openPopup}
  onClose={() => setOpenPopup(false)}
  fullWidth
  maxWidth="xs" // options: "xs", "sm", "md", "lg", "xl"
  PaperProps={{
    sx: {
      background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
      borderRadius: 3,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      minHeight: "300px",   // increase height
      minWidth: "500px"     // increase width
    }
  }}
>
  <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
    Authentication Required
  </DialogTitle>

  <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
    <Button onClick={() => setOpenPopup(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={() => {
        setOpenPopup(false);
        navigate("/login");
      }}
    >
      Login
    </Button>
  </DialogActions>
</Dialog>

{/* Popup  if user login free trila activate then so massage to access   */}
      <Dialog
  open={trialPopupOpen}
  onClose={() => setTrialPopupOpen(false)}
  PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 420, background: "linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    },
  }}
>
  {/* Title Section */}
  <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: "bold", fontSize: "1.3rem",  color: "#2c3e50",
    }}
  >
    <CelebrationIcon color="primary" />
    Free Trial Active 🎉
  </DialogTitle>

  <Divider />

  {/* Content Section */}
  <DialogContent sx={{ mt: 2 }}>

    <Box mt={2} p={2}
      sx={{
        borderRadius: 2,
        backgroundColor: "#fff",
        border: "1px solid #e0e0e0",
      }}
    >
      <Typography variant="body2" sx={{ color: "#555" }}>
        Explore the features, enjoy the experience, and make
        the most of your trial access.
      </Typography>
    </Box>
  </DialogContent>
  
</Dialog>
    </>
  );
};

export default DefaultHeader;
