import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Drawer,
  Toolbar,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

/* ===== Icons ===== */
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import MailIcon from "@mui/icons-material/Mail";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PersonIcon from "@mui/icons-material/Person";
import BookIcon from "@mui/icons-material/Book";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PolicyIcon from "@mui/icons-material/Policy";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkIcon from "@mui/icons-material/Work";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { LSB_ROLES, USER_ROLES } from "../../utils/constants";

/* ================= Layout ================= */
const drawerWidth = 250;
const collapsedWidth = 0;

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { userRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const collapsed = !isOpen;
  const itemRefs = useRef({});
  /* ===== Permissions ===== */
  const canManageUsers = [
    USER_ROLES.PORTAL_ADMIN,
    USER_ROLES.ZONAL_HEAD,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.BLOCK_OFFICER,
    USER_ROLES.CMTC_MANAGER,
  ].includes(userRole);

  /* ===== Visibility ===== */
  const shouldShowSidebar = [
    USER_ROLES.PORTAL_ADMIN,
    USER_ROLES.EDITOR,
    USER_ROLES.PUBLISHER,
    USER_ROLES.ZONAL_HEAD,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.BLOCK_OFFICER,
    USER_ROLES.CMTC_MANAGER,
    USER_ROLES.MISSION_STAFF,
    USER_ROLES.AUDIT_ACCOUNTANT,
    USER_ROLES.AUDITOR,
    USER_ROLES.CMTC_ADMINISTRATOR,
    USER_ROLES.CMTC_ACCOUNTANT,

    ...LSB_ROLES,

  ].includes(userRole);

  if (!shouldShowSidebar) return null;

  /* ================= Links (ALL ROUTES SAME AS YOUR CODE) ================= */
  const adminLinks = [
    { label: t("sidebar.dashboard"), icon: <DashboardIcon />, path: "/admin/admin_dashboard" },
   
    { label: t("sidebar.users"), icon: <GroupIcon />, path: "/admin/users" },
    { label: t("sidebar.contact_messages"), icon: <MailIcon />, path: "/admin/contact-messages" },

  ];

  const zonalHeadLinks = [
    ...(canManageUsers ? [{ label: t("sidebar.users"), icon: <GroupIcon />, path: "/admin/users" }] : []),
  ];

  const districtPanelLinks = [
    ...(canManageUsers
      ? [
        { label: t("sidebar.users"), icon: <GroupIcon />, path: "/admin/users" },
        { label: t("sidebar.Booking Approval"), icon: <GroupIcon />, path: "/admin/officer_dashboard" },
        { label: t("sidebar.my_booking"), icon: <MailIcon />, path: "/officer/my-bookings" },
        { label: t("sidebar.grading"), icon: <GroupIcon />, path: "/officer/grading-page" },
        { label: t("sidebar.audit"), icon: <GroupIcon />, path: "/officer/audit-page" },
        { label: t("sidebar.internal_booking"), icon: <MailIcon />, path: "admin/center-list" }

        ]
      : []),
  ];

  const blockPanelLinks = [
    ...(canManageUsers
      ? [
        { label: t("sidebar.users"), icon: <GroupIcon />, path: "/admin/users" },
        { label: t("sidebar.Booking Approval"), icon: <GroupIcon />, path: "/admin/officer_dashboard" },
        { label: t("sidebar.my_booking"), icon: <MailIcon />, path: "/officer/my-bookings" },
        { label: t("sidebar.grading"), icon: <GroupIcon />, path: "/officer/grading-page" },
        { label: t("sidebar.audit"), icon: <GroupIcon />, path: "/officer/audit-page" },
        { label: t("sidebar.cmtc_events"), icon: <EventAvailableIcon />, path: "/admin/cmtc-events" },
        { label: t("sidebar.financial_form"), icon: <MailIcon />, path: "/officer/financial-form" },
        { label: t("sidebar.internal_booking"), icon: <MailIcon />, path: "admin/center-list" },
          // { label: t("sidebar.departments"), icon: <ApartmentIcon />, path: "/cms/departments" },
        { label: t("sidebar.cmtc_centers"), icon: <BusinessIcon />, path: "/cms/cmtc-centers" },
          // { label: t("sidebar.cmtc_officer"), icon: <PersonIcon />, path: "/cms/cmtc-officer" },
          // ✅ NEW
        { label: t("sidebar.CmtcGallery"), icon: <PhotoLibraryIcon />, path: "/cms/cmtc-gallery" },
        { label: t("sidebar.cmtc_amenity"), icon: <CategoryIcon />, path: "/cms/cmtc-amenity" },
          // { label: t("sidebar.cmtc_booking"), icon: <EventAvailableIcon />, path: "/cms/cmtc-bookingManagement" },
          // { label: t("sidebar.cmtc_events"), icon: <EventAvailableIcon />, path: "/admin/cmtc-events" },
        ]
      : []),
  ];

  const centerPanelLinks = [
    ...(canManageUsers ? [{ label: t("sidebar.users"), icon: <GroupIcon />, path: "/admin/users" }] : []),
    {label: t("sidebar.dashboard"), icon: <DashboardIcon />, path: "/center/dashboard"},
  ];

  const cmsLinks = [
    { label: t("sidebar.news_articles"), icon: <NewspaperIcon />, path: "/cms/news" },
    { label: t("sidebar.circulars_orders"), icon: <DescriptionIcon />, path: "/cms/circulars" },
    { label: t("sidebar.tender"), icon: <GavelIcon />, path: "/cms/tenders" },
    { label: t("sidebar.gallery"), icon: <PhotoLibraryIcon />, path: "/cms/gallery" },
    { label: t("sidebar.books_authors"), icon: <PersonIcon />, path: "/cms/authors" },
    { label: t("sidebar.books"), icon: <BookIcon />, path: "/cms/books" },
    { label: t("sidebar.carousel"), icon: <PhotoLibraryIcon />, path: "/cms/carousel" },
    { label: t("sidebar.youTubeVideos"), icon: <YouTubeIcon color="error" />, path: "/cms/youtube" },
    { label: t("sidebar.srlmContent"), icon: <BookIcon />, path: "/cms/managempsrlm" },
    { label: t("sidebar.manageLeaders"),icon: <PersonIcon />, path: "/cms/leaders",},
  ];

  const CMTCServices = [
    // { label: t("sidebar.departments"), icon: <ApartmentIcon />, path: "/cms/departments" },
    { label: t("sidebar.cmtc_centers"), icon: <BusinessIcon />, path: "/cms/cmtc-centers" },
    // { label: t("sidebar.cmtc_officer"), icon: <PersonIcon />, path: "/cms/cmtc-officer" },
    // ✅ NEW
    { label: t("sidebar.CmtcGallery"), icon: <PhotoLibraryIcon />, path: "/cms/cmtc-gallery" },
    { label: t("sidebar.cmtc_amenity"), icon: <CategoryIcon />, path: "/cms/cmtc-amenity" },
    // { label: t("sidebar.cmtc_booking"), icon: <EventAvailableIcon />, path: "/cms/cmtc-bookingManagement" },
    { label: t("sidebar.cmtc_events"), icon: <EventAvailableIcon />, path: "/admin/cmtc-events" },

  ];

  const manageServicesData = [
    {
      label: "Manage Service Data",
      icon: <BookIcon />,
      path: "/admin/manage-master-data",
      children: [
        { label: t("sidebar.advertisement_sections"), icon: <Inventory2Icon />, path: "/admin/advertisement-Section" },
        { label: t("sidebar.film"), icon: <WorkIcon />, path: "/admin/films" },
        { label: t("sidebar.project"), icon: <GavelIcon />, path: "/admin/projects" },
        { label: t("sidebar.event"), icon: <EmojiEventsIcon />, path: "/admin/events" },
        { label: t("sidebar.printing-Section"), icon: <PolicyIcon />, path: "/admin/printing-Section" },
        { label: t("sidebar.Annual-plan"), icon: <EventNoteIcon />, path: "/admin/action-plan" },
      ],
    },
  ];

  const manageMasterData = [
    {
      label: "Manage Master Data",
      icon: <BookIcon />,
      path: "/admin/manage-master-data",
      children: [
        { label: t("sidebar.departments"), icon: <ApartmentIcon />, path: "/cms/departments" },
        { label: t("sidebar.rti_documents"), icon: <BookIcon />, path: "/admin/rti-documents" },
        { label: t("sidebar.category_master"), icon: <BookIcon />, path: "/admin/category-master" },
      ],
    },
  ];
  const manageMisReport = [
    {
      label: t("sidebar.MIS_Revenue"),
      icon: <MailIcon />,
      path: "/admin/mis_report",
    },
    {
      label: t("sidebar.MIS_Internal"),
      icon: <MailIcon />,
      path: "/admin/mis_internal_booking",
    },
    {
      label: t("sidebar.MIS_Bookings"),
      icon: <MailIcon />,
      path: "/admin/mis_all_booking",
    },
  ];

  const lsbLinks = [
    // ✅ Only NODAL CHECKER
    ...(userRole === USER_ROLES.LSB_NODAL_CHECKER
      ? [
          {
            label: "User Management",
            icon: <GroupIcon />,
            path: "/lsb/user-management",
          },
        ]
      : []),

    // ✅ Only BANK MAKER
    ...(userRole === USER_ROLES.LSB_BANK_MAKER
      ? [
          {
            label: "Request Loan Subsidy",
            icon: <DescriptionIcon />,
            path: "/lsb/request-new-loan-subsidy",
          },
        ]
      : []),

    // ✅ Visible to ALL
    {
      label: "Loan Requests",
      icon: <DescriptionIcon />,
      path: "/lsb/loan-requests",
    },
  ];
  /* ================== Premium styles ================== */
  const brand = useMemo(() => {
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary?.main || "#7c3aed";
    const text = theme.palette.mode === "dark" ? "#e5e7eb" : "#111827";
    return { primary, secondary, text };
  }, [theme]);

  const paperSx = {
    width: collapsed ? collapsedWidth : drawerWidth,
    boxSizing: "border-box",
    borderRight: "none",
    overflow: "hidden",
    background: "#0f296b",   
    backdropFilter: "none",  
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 40px rgba(0,0,0,0.45)"
        : "0 12px 40px rgba(17,24,39,0.14)",
    transition: theme.transitions.create("width", { duration: 240 }),
  };

  const scrollSx = {
    overflowY: "auto",
    flexGrow: 1,
    pb: 2,
    px: collapsed ? 0.75 : 1.25,
    "&::-webkit-scrollbar": { width: "7px" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(
        brand.text,
        theme.palette.mode === "dark" ? 0.22 : 0.18,
      ),
      borderRadius: "10px",
      "&:hover": {
        backgroundColor: alpha(
          brand.text,
          theme.palette.mode === "dark" ? 0.32 : 0.26,
        ),
      },
    },
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(brand.text, 0.22)} transparent`,
  };

  /* ================= Section header (NEW - global standard look) ================= */
  const SectionHeader = ({ title }) => {
    if (!title) return <Box sx={{ height: 10 }} />; // for empty titles in your last 2 sections

    return (
      <Box sx={{ px: collapsed ? 1.1 : 1.6, pt: 2.2, pb: 1.2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              letterSpacing: 1.3,
              textTransform: "uppercase",
              fontSize: 12,
              color:"#E7E4F4",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>

          {/* thin line for premium look */}
          <Box
            sx={{
              height: 1,
              flex: 1,
              background: `linear-gradient(90deg, ${alpha(brand.text, 0.18)} 0%, ${alpha(brand.text, 0.04)} 100%)`,
              borderRadius: 999,
            }}
          />
        </Box>
      </Box>
    );
  };

  /* ================= Nav item ================= */
  const SidebarItem = ({ label, icon, path, children }) => {
    const isChildActive = children?.some((c) =>
      location.pathname.startsWith(c.path),
    );
    const isActive = location.pathname.startsWith(path) || isChildActive;

    const [open, setOpen] = useState(false);
    useEffect(() => {
      if (isChildActive) setOpen(true);
    }, [isChildActive]);

    const handleClick = () => {
      if (children) setOpen((o) => !o);
      else navigate(path);
    };

    const baseBtnSx = {
      mx: collapsed ? 0.75 : 0.6,
      mb: 0.65,
      borderRadius: 2.5,
      py: 1.05,
      px: collapsed ? 0.8 : 1.2,
      minHeight: 46,
      position: "relative",
      transition: "all .18s ease",
      color: alpha(brand.text, 0.92),
      "& .MuiListItemIcon-root": {
        minWidth: 32,
        color: "#fff !important",   
        "& svg": {
          fontSize: "16px",   
        },
        transition: "all .18s ease",
      },
      "&:hover": {
        backgroundColor: "#ffffff2c",
        transform: "translateY(-1px)",
        "& .MuiListItemIcon-root": { color: "#fff" },
      },
    };

    const activeSx = isActive
      ? {
          backgroundColor: "#ffffff2c !important",
          backgroundImage: "none", 
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 10px 24px ${alpha("#000", 0.32)}`
              : `0 10px 22px ${alpha("#111827", 0.12)}`,
            color: "#FFD700 !important", 
            fontWeight: 600,
            "& .MuiListItemIcon-root": {
          color: "#FFD700", 
            minWidth: 32,
        },
          // "&:before": {
          //   content: '""',
          //   position: "absolute",
          //   left: 8,
          //   top: 10,
          //   bottom: 10,
          //   width: 4,
          //   borderRadius: 999,
          //   background: `linear-gradient(180deg, ${brand.primary} 0%, ${brand.secondary} 100%)`,
          // },
        }
      : {};

    return (
      <>
        <Tooltip title={collapsed ? label : ""} placement="right" arrow>
          <ListItemButton
            selected={isActive}
            onClick={handleClick}
            sx={{ ...baseBtnSx, ...activeSx }}
            ref={(el) => {
              if (isActive && el) {
                itemRefs.current[path] = el;
              }
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  sx: {
                    fontSize: "12px",   
                    fontWeight: isActive ? 700 : 600,
                     color: "#fff"
                  },
                }}
              />
            )}

            {!collapsed && children && (
              <Box sx={{ color: "#fff"}}>
                {open ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>
        </Tooltip>

        {children && (
          <Collapse in={open && !collapsed} timeout={220} unmountOnExit>
            <Box
              sx={{
                mx: 0.6,
                mb: 0.6,
                borderRadius: 2.5,
                background: alpha(
                  brand.text,
                  theme.palette.mode === "dark" ? 0.06 : 0.04,
                ),
              }}
            >
              <List disablePadding sx={{ py: 0.75 }}>
                {children.map((child) => {
                  const childActive = location.pathname.startsWith(child.path);
                  return (
                    <Tooltip
                      title={collapsed ? child.label : ""}
                      placement="right"
                      arrow
                      key={child.label}
                    >
                      <ListItemButton
                        ref={(el) => {
                          if (isActive && el) {
                            itemRefs.current[path] = el;
                          }
                        }}
                        selected={childActive}
                        onClick={() => navigate(child.path)}
                        sx={{
                          mx: 1,
                          my: 0.4,
                          borderRadius: 2,
                          py: 0.9,
                          pl: 2,
                          pr: 1.2,
                          transition: "all .18s ease",
                          color: alpha(brand.text, 0.86),
                          "& .MuiListItemIcon-root": {
                            minWidth: 38,
                            color:"#ffff",
                          },
                          "&:hover": {
                            backgroundColor: "#ffffff2c",
                            "& .MuiListItemIcon-root": {
                              color: brand.secondary,
                            },
                          },
                          ...(childActive && {
                            backgroundColor: "#ffffff2c !important",
                            boxShadow:
                              theme.palette.mode === "dark"
                                ? `0 8px 18px ${alpha("#000", 0.25)}`
                                : `0 8px 18px ${alpha("#111827", 0.1)}`,
                            "& .MuiListItemIcon-root": {
                              color: brand.secondary,
                            },
                          }),
                        }}
                      >
                        <ListItemIcon
                         sx={{
                          minWidth: 32,
                          color: "#fff", // icon white
                          "& svg": {
                            fontSize: "16px",
                            fill: "#fff", //important
                          },
                        }}
                        >{child.icon}</ListItemIcon>
                        {!collapsed && (
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              sx: {
                                fontWeight: childActive ? 700 : 600,
                                color: "#fff",
                                fontSize: "12px",
                              },
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          </Collapse>
        )}
      </>
    );
  };
  useEffect(() => {
    const activeEl = itemRefs.current[location.pathname];
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [location.pathname, isOpen]);
  const SidebarSection = ({ title, items }) => (
    <Box sx={{ pb: 1.2 }}>
      <SectionHeader title={title} />
      <List disablePadding>
        {items.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </List>
      <Divider
        sx={{
          mx: collapsed ? 1 : 1.5,
          my: 1,
          borderStyle: "dashed",
          borderColor: alpha(brand.text, 0.18),
        }}
      />
    </Box>
  );

  /* ================= Header (MODIFIED: removed name + role badge) ================= */
  const BrandHeader = () => {
    return (
      <Toolbar
        sx={{
          px: collapsed ? 0.75 : 1.5,
          pt: isMobile ? 1.2 : 1.2,
          pb: 1.2,
          minHeight: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={() => navigate("/")}
      >
        {/* Simple premium icon tile (no ADMIN / Control Center / PORTAL ADMIN) */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${alpha(brand.primary, 0.35)} 0%, ${alpha(brand.secondary, 0.28)} 100%)`
                : `linear-gradient(135deg, ${alpha(brand.primary, 0.18)} 0%, ${alpha(brand.secondary, 0.12)} 100%)`,
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 14px 30px ${alpha("#000", 0.35)}`
                : `0 14px 30px ${alpha("#111827", 0.12)}`,
            border: `1px solid ${alpha(brand.text, theme.palette.mode === "dark" ? 0.1 : 0.1)}`,
          }}
        >
          <MenuOpenIcon sx={{ opacity: 0.9 }} />
        </Box>

        {/* Mobile Toggle Button (still works) */}
        {isMobile && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar?.();
            }}
            sx={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: alpha(brand.text, 0.9),
              bgcolor: alpha(brand.text, 0.06),
              border: `1px solid ${alpha(brand.text, 0.1)}`,
              "&:hover": { bgcolor: alpha(brand.text, 0.1) },
            }}
            aria-label="toggle admin sidebar"
          >
            <MenuOpenIcon />
          </IconButton>
        )}
      </Toolbar>
    );
  };

  /* ================= Render ================= */
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          ...paperSx,
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          overflow: "hidden", // prevents pushing content
        },
      }}
    >
      <BrandHeader />

      <Box sx={scrollSx}>
        {/* ===== Role panels ===== */}
        {userRole === USER_ROLES.PORTAL_ADMIN && (
          <SidebarSection title="Admin Panel" items={adminLinks} />
        )}

        {userRole === USER_ROLES.ZONAL_HEAD && (
          <SidebarSection title="Zonal Panel" items={zonalHeadLinks} />
        )}

        {userRole === USER_ROLES.DISTRICT_OFFICER && (
          <SidebarSection title="District Panel" items={districtPanelLinks} />
        )}

        {userRole === USER_ROLES.BLOCK_OFFICER && (
          <SidebarSection title="Block Panel" items={blockPanelLinks} />
        )}

        {userRole === USER_ROLES.CMTC_MANAGER && (
          <SidebarSection title="Center Panel" items={centerPanelLinks} />
        )}

        {(userRole === USER_ROLES.PORTAL_ADMIN ||
          userRole === USER_ROLES.EDITOR ||
          userRole === USER_ROLES.PUBLISHER ||
          userRole === USER_ROLES.DISTRICT_OFFICER) && (
          <SidebarSection title="CMTC Services" items={CMTCServices} />
        )}

        {(userRole === USER_ROLES.PORTAL_ADMIN ||
          userRole === USER_ROLES.EDITOR ||
          userRole === USER_ROLES.PUBLISHER) && (
          <SidebarSection title="MIS Reports" items={manageMisReport} />
        )}

        {(userRole === USER_ROLES.PORTAL_ADMIN ||
          userRole === USER_ROLES.EDITOR ||
          userRole === USER_ROLES.PUBLISHER) && <SidebarSection title="CMS Management" items={cmsLinks} />}

        {[USER_ROLES.MISSION_STAFF, USER_ROLES.AUDIT_ACCOUNTANT, USER_ROLES.AUDITOR].includes(userRole) && (
          <SidebarSection title="Audit Panel" items={[
              { label: "Audit", icon: <GroupIcon />, path: "/officer/audit-page" },
            ]}
          />
        )}

        {(userRole === USER_ROLES.PORTAL_ADMIN ||
          userRole === USER_ROLES.EDITOR ||
          userRole === USER_ROLES.PUBLISHER) && <SidebarSection title="Manage Service Data" items={manageServicesData} />}

        {(userRole === USER_ROLES.PORTAL_ADMIN ||
          userRole === USER_ROLES.EDITOR ||
          userRole === USER_ROLES.PUBLISHER) && <SidebarSection title="Manage Master Data" items={manageMasterData} />}

        { LSB_ROLES.includes(userRole) && (
            <SidebarSection title="LSB Panel" items={lsbLinks} />
        )}

        <Box sx={{ height: 14 }} />
      </Box>

      {/* subtle footer (optional) */}
      <Box
        sx={{
          px: collapsed ? 1 : 1.5,
          py: 1.2,
          borderTop: `1px solid ${alpha(brand.text, 0.1)}`,
          bgcolor: alpha("#fff", theme.palette.mode === "dark" ? 0.03 : 0.55),
        }}
      >
        {!collapsed && (
          <Typography sx={{ fontSize: 12, color: alpha(brand.text, 0.62), fontWeight: 600 }}>
            © {new Date().getFullYear()} Admin Console
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
