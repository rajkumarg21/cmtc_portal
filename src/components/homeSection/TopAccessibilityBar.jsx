import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Link,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "./../../assets/mp-madhyam.svg";

const TopAccessibilityBar = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const { isAuthenticated, hasRole, logout, user } = useAuth();

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("appLanguage", lng);
    handleClose();
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 4, md: 6 },
        py: 0.5,
        borderBottom: "1px solid #ddd",
        flexWrap: "wrap",
      }}
    >
      {/* Left Section: Logo */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="Logo" style={{ height: "28px", width: "auto" }} />
      </Box>

      {/* Mobile Menu Icon */}
      <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
        <IconButton onClick={toggleMobileMenu} color="inherit" size="small">
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Right Section (Desktop) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* Language Selector */}
        <Link
          underline="none"
          onClick={handleOpen}
          sx={{
            color: "#000",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          <LanguageIcon fontSize="small" />
          <Typography variant="body2">
            {i18n.language === "hi" ? "Language" : "भाषा"}
          </Typography>
        </Link>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={() => handleLanguageChange("en")}>
            🇬🇧 English
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange("hi")}>
            🇮🇳 हिन्दी
          </MenuItem>
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: "#999" }} />

        {/* 🔐 Authenticated vs Login */}
        {isAuthenticated ? (
          <>
            <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0 }}>
              <Avatar
                alt={user?.username || "User"}
                sx={{
                  bgcolor: "#3B82F6",
                  width: 32,
                  height: 32,
                  fontSize: "0.875rem",
                }}
              >
                {user?.username?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
            >
              <MenuItem
                component={RouterLink}
                to="/profile/edit"
                onClick={() => setProfileAnchor(null)}
              >
                Edit Profile
              </MenuItem>

              {hasRole(["NORMAL_VISITOR"]) && (
                <MenuItem
                  component={RouterLink}
                  to="/MySubscriptionPlans"
                  onClick={() => setProfileAnchor(null)}
                >
                  My Plans
                </MenuItem>
              )}

              {hasRole(["PORTAL_ADMIN", "EDITOR", "PUBLISHER"]) && (
                <MenuItem
                  component={RouterLink}
                  to="/cms/dashboard"
                  onClick={() => setProfileAnchor(null)}
                >
                  CMS Dashboard
                </MenuItem>
              )}

              {hasRole(["PORTAL_ADMIN"]) && (
                <MenuItem
                  component={RouterLink}
                  to="/admin/dashboard"
                  onClick={() => setProfileAnchor(null)}
                >
                  Admin Dashboard
                </MenuItem>
              )}

              <Divider />

              <MenuItem
                onClick={() => {
                  logout();
                  setProfileAnchor(null);
                }}
                sx={{ color: "red" }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Link
            to="/login"
            component={RouterLink}
            underline="none"
            sx={{
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.875rem",
            }}
          >
            <LoginIcon fontSize="small" />
            <Typography variant="body2">{t("login")}</Typography>
          </Link>
        )}
      </Box>

      {/* 📱 Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            mt: 1,
            borderTop: "1px solid #ddd",
            pt: 1,
            gap: 1,
          }}
        >
          <Link
            underline="none"
            onClick={handleOpen}
            sx={{
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            <LanguageIcon fontSize="small" />
            <Typography variant="body2">
              {i18n.language === "hi" ? "Language" : "भाषा"}
            </Typography>
          </Link>

          <Divider sx={{ my: 0.5, bgcolor: "#ccc" }} />

          {isAuthenticated ? (
            <>
              <MenuItem component={RouterLink} to="/profile/edit">
                Edit Profile
              </MenuItem>
              {hasRole(["NORMAL_VISITOR"]) && (
                <MenuItem component={RouterLink} to="/MySubscriptionPlans">
                  My Plans
                </MenuItem>
              )}
              {hasRole(["PORTAL_ADMIN", "EDITOR", "PUBLISHER"]) && (
                <MenuItem component={RouterLink} to="/cms/dashboard">
                  CMS Dashboard
                </MenuItem>
              )}
              {hasRole(["PORTAL_ADMIN"]) && (
                <MenuItem component={RouterLink} to="/admin/dashboard">
                  Admin Dashboard
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                sx={{ color: "red" }}
              >
                Logout
              </MenuItem>
            </>
          ) : (
            <Link
              href="/login"
              underline="none"
              sx={{
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.875rem",
              }}
            >
              <LoginIcon fontSize="small" />
              <Typography variant="body2">{t("login")}</Typography>
            </Link>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TopAccessibilityBar;
