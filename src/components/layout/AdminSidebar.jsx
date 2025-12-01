import React, { useState } from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  IconButton,
  Typography,
  Tooltip,
  Collapse,
  Box,
  Drawer,
  List,
  useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import MailIcon from '@mui/icons-material/Mail';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PagesIcon from '@mui/icons-material/Pages';
import SettingIcon from '@mui/icons-material/Settings';
import ArticleIcon from '@mui/icons-material/Article';
import BookIcon from '@mui/icons-material/Book';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PersonIcon from '@mui/icons-material/Person';
import ExpandLess from '@mui/icons-material/ExpandLess';
import CampaignIcon from '@mui/icons-material/Campaign';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
//import mplogo from "../../assets/images/logo.png";
//import logo from "./../../assets/mp-madhyam.svg";
//
//import logo2 from "./../../assets/mp-madhyam-short.svg";
import madhyamshortlogo from "../../assets/img/madhyamshortlogo.svg"
import { useTranslation } from 'react-i18next';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { useTheme } from '@mui/material/styles';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import YouTubeIcon from "@mui/icons-material/YouTube";

const drawerWidth = 240;
const collapsedWidth = 72;

const NavItem = ({ label, icon, path, children, collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  // Check if the parent is active by checking if any child's path matches
  const isChildActive = children?.some(child => location.pathname.startsWith(child.path));
  const isActive = location.pathname.startsWith(path) || isChildActive;
  React.useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  const handleClick = () => {
    if (children) {
      setOpen(!open);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <Tooltip title={collapsed ? label : ''} placement="right">
        <ListItemButton
          selected={isActive}
          onClick={handleClick}
          sx={{
            mx: 1,
            borderRadius: 2,
            mb: 0.5,
            fontSize: "14px",
            transition: 'all 0.2s',
            ...(isActive && {
              backgroundColor: 'rgba(142, 141, 141, 0.95)',
              color: '#000',
              fontWeight: "600",
              '& .MuiListItemIcon-root': { color: '#000' },
            }),
            '&:hover': {
              backgroundColor: isActive ? 'rgba(234, 105, 6, 0.84)' : 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
          {!collapsed && <ListItemText primary={label} />}
          {!collapsed && children && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </Tooltip>

      {/* Render children if available */}
      {children && (
        <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((child) => {
              const childActive = location.pathname.startsWith(child.path);

              return (
                <Tooltip title={collapsed ? child.label : ''} placement="right" key={child.label}>
                  <ListItemButton
                    selected={childActive}
                    onClick={() => navigate(child.path)}
                    sx={{
                      pl: 6,
                      mx: 1,
                      borderRadius: 2,
                      mb: 0.5,
                      fontSize: "14px",
                      transition: 'all 0.2s',
                      ...(childActive && {
                        backgroundColor: 'rgba(142, 141, 141, 0.95)',
                        color: '#000',
                        fontWeight: "600",
                        '& .MuiListItemIcon-root': { color: '#000' },
                      }),
                      '&:hover': {
                        backgroundColor: childActive ? 'rgba(234, 105, 6, 0.84)' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{child.icon}</ListItemIcon>
                    {!collapsed && <ListItemText primary={child.label} />}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Collapse>
      )}
    </>
  );
};


const SidebarSection = ({ title, items, collapsed }) => (
  <>
    {!collapsed && (
      <Typography
        variant="overline"
        sx={{
          pl: 3,
          pt: 4,
          pb: 0.5,
          fontWeight: 'bold',
          color: '#000',
          letterSpacing: 1,
          fontSize: "14px",
        }}
      >
        {title}
      </Typography>
    )}
    <List disablePadding>
      {items.map((item) => (
        <NavItem key={item.label} {...item} children={item.children} collapsed={collapsed} />
      ))}
    </List>
    <Divider sx={{ mx: 2, my: 1, borderStyle: 'dashed' }} />
  </>
);

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { userRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const collapsed = !isOpen;


  // Use translation keys for labels and icons
  const adminLinks = [
    { label: t('sidebar.dashboard'), icon: <DashboardIcon />, path: '/admin/dashboard' },
    { label: t('sidebar.users'), icon: <GroupIcon />, path: '/admin/users' },
    { label: t('sidebar.departments'), icon: <GroupIcon />, path: '/admin/departments' },
    { label: t('sidebar.important-links'), icon: <GroupIcon />, path: '/admin/important-links' },
    { label: t('sidebar.subscriptions'), icon: <MailIcon />, path: '/admin/subscriptions' },
    { label: t('sidebar.contact_messages'), icon: <MailIcon />, path: '/admin/contact-messages' },
    { label: t('sidebar.feedback'), icon: <FeedbackIcon />, path: '/admin/feedback' },




  ];

  const cmsLinks = [
    { label: t('sidebar.cms_dashboard'), icon: <DashboardIcon />, path: '/cms/dashboard' },
    { label: t('sidebar.marquee'), icon: <CampaignIcon />, path: '/cms/marquee' },
   { label: t('sidebar.news_articles'), icon: <ArticleIcon />, path: '/cms/news' },
   { label: t('sidebar.circulars_orders'), icon: <ArticleIcon />, path: '/cms/circulars' },
     { label: t('sidebar.tender'), icon: <ArticleIcon />, path: '/cms/tenders' },
    { label: t('sidebar.pages'), icon: <PagesIcon />, path: '/cms/pages' },
    { label: t('sidebar.gallery'), icon: <PhotoLibraryIcon />, path: '/cms/gallery' },
    { label: t('sidebar.books_authors'), icon: <PersonIcon />, path: '/cms/authors' },
    { label: t('sidebar.books'), icon: <BookIcon />, path: '/cms/books' },
    { label: t('sidebar.subscription_setting'), icon: <SettingIcon />, path: '/cms/subscription/setting' },
    { label: t('sidebar.carousel'), icon: <SettingIcon />, path: '/cms/carousel' },
    // ⭐ ADD THIS NEW MENU ITEM ⭐  
    { label: "YouTube Videos", icon: <YouTubeIcon color="error" />, path: '/cms/youtube' },
    { label: "srlm content", icon: <BookIcon />, path: '/cms/managempsrlm' },
    {
  label: "Manage Leaders",
  icon: <img src="https://img.icons8.com/color/24/administrator-male.png" style={{ width: 20 }} />,
  path: "/cms/leaders"
},

  ];

  const madhyamServices = [
    { label: t('sidebar.advertisement_sections'), icon: <CampaignIcon />, path: '/cms/advertisement-section' },
    { label: t('sidebar.printing-Section'), icon: <LocalPrintshopIcon />, path: '/cms/printing-section' },
    { label: t('sidebar.film'), icon: <PagesIcon />, path: '/cms/films' },
    { label: t('sidebar.project'), icon: <PagesIcon />, path: '/cms/projects' },
    { label: t('sidebar.event'), icon: <PagesIcon />, path: '/cms/events' },

  ];

  const rojgarNirmanLinks = [
    { label: t('sidebar.rojgar_aur_nirman'), icon: <PersonIcon />, path: '/cms/rojgarAurNirman' },
    { label: t('sidebar.samyiki'), icon: <BookIcon />, path: '/cms/samyiki' },
    { label: t('sidebar.rojgar_nirman_page'), icon: <PagesIcon />, path: '/cms/rojgarnirmanpage' },
    { label: t('sidebar.advertisement'), icon: <SettingIcon />, path: '/cms/advertisement' },
    { label: t('sidebar.rojgar-marquee'), icon: <CampaignIcon />, path: '/cms/rojgar-nirman-marquee' },
  ];

  const manageMasterData = [
    {
      label: "Manage Master Data",
      icon: <BookIcon />,
      path: '/admin/manage-master-data', // Make this a dummy parent path (not blank)
      children: [
        {
          label: t('sidebar.rti_documents'),
          icon: <BookIcon />,
          path: '/admin/rti-documents',
        },
        {
          label: t('sidebar.gradation_list'),
          icon: <FeaturedPlayListIcon />,
          path: '/admin/gradation-list',
        },
        {
          label: t('sidebar.employees_property'),
          icon: <PeopleAltIcon />,
          path: '/admin/employees-property',
        },
        {
          label: t('sidebar.category_master'),
          icon: <BookIcon />,
          path: '/admin/category-master',
        },
      ],
    }];


  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          height: '100%',
          // 🌈 Background gradient + blur effect
          background: '#F3F4F6 ',
          color: '#374151',
          borderRight: 'none',
          backdropFilter: 'blur(6px)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Logo / Brand */}
      <Toolbar
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: collapsed ? 'column' : 'row', // ✅ column when collapsed, row when open
          px: 0,
          py: 1.5,
          mx: 0,
          mt: { xs: 8, md: 1 },
          transition: "all 0.3s",
          cursor: "pointer",
          position: "relative", // for mobile toggle
        }}
        onClick={() => navigate("/")}
      >
        {/* Logo */}
    <Toolbar
  sx={{
    justifyContent: "center",
    alignItems: "center",
    px: 0,
    py: 1.5,
    mt: { xs: 8, md: 1 },
    transition: "all 0.3s",
  }}
>
  {/* No logo */} 
</Toolbar>


        {/* Mobile Toggle Button */}
        {isMobile && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              mt: 4,
              transform: 'translateY(-50%)',
              color: '#000',
            }}
            aria-label="close admin sidebar"
          >
            <MenuOpenIcon />
          </IconButton>
        )}
      </Toolbar>

      <Box sx={{
        overflowY: 'auto',
        flexGrow: 1,
        py: 4,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent', // removes the background track
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)', // subtle thumb
          borderRadius: '10px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.5)', // darker on hover
          },
        },
        scrollbarWidth: 'thin', // Firefox
        scrollbarColor: 'rgba(0,0,0,0.3) transparent', // thumb only, no track
      }}
      >
        {userRole === 'PORTAL_ADMIN' && (
          <SidebarSection title="Admin Panel" items={adminLinks} collapsed={collapsed} />
        )}
        {(userRole === 'PORTAL_ADMIN' || userRole === 'EDITOR' || userRole === 'PUBLISHER') && (
          <SidebarSection title="CMS Management" items={cmsLinks} collapsed={collapsed} />
        )}
        {(userRole === 'PORTAL_ADMIN' || userRole === 'EDITOR' || userRole === 'PUBLISHER') && (
          <>
            <SidebarSection title="Madhyam Services" items={madhyamServices} collapsed={collapsed} />
            <SidebarSection title="Rojgar Nirman" items={rojgarNirmanLinks} collapsed={collapsed} />
          </>
        )}
        {(userRole === 'PORTAL_ADMIN' || userRole === 'EDITOR' || userRole === 'PUBLISHER') && (
          <SidebarSection title="" items={manageMasterData} collapsed={collapsed} />
        )}
      </Box>
    </Drawer>

  );
};

export default AdminSidebar;
