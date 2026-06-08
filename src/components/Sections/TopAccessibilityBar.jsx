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
  TextField,
  InputAdornment
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import LoginIcon from "@mui/icons-material/Login";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TopAccessibilityBar = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        width: "100%",
        background: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 0.3,
        fontSize: "0.78rem",
        borderBottom: "2px solid #222",
      }}
    >
      {/* 🕒 DATE + TIME */}
      <Typography sx={{ whiteSpace: "nowrap" }}>
        {new Date().toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })}
      </Typography>

      {/* Navigation Links */}
      <Box sx={{ display: "flex", alignItems: "center", mx: "auto", gap: 2 }}>
        {["Home", "Screen Reader Access", "Skip to Main Content", "Sitemap"].map(
          (item, idx) => (
            <Link
              key={idx}
              component={RouterLink}
              to="/"
              underline="none"
              sx={{
                color: "#fff",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {item}
            </Link>
          )
        )}

        {/* 🔠 Font Size Buttons */}
        <Box sx={{ display: "flex", gap: 0.2 }}>
          {["A-", "A", "A+"].map((size, idx) => (
            <Box
              key={idx}
              sx={{
                border: "1px solid #888",
                px: 0.7,
                py: 0.1,
                cursor: "pointer",
                borderRadius: 0.5,
                "&:hover": { background: "#444" },
              }}
            >
              {size}
            </Box>
          ))}
        </Box>
      </Box>

      {/* 🌐 Language Pill */}
      <Box
        onClick={handleOpen}
        sx={{
          background: "#fff3e0",
          color: "#bf360c",
          px: 1,
          py: 0.1,
          borderRadius: "4px",
          fontSize: "0.75rem",
          cursor: "pointer",
          mx: 1,
        }}
      >
        हिंदी संस्करण
      </Box>

      {/* Language Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleLanguageChange("en")}>English</MenuItem>
        <MenuItem onClick={() => handleLanguageChange("hi")}>हिन्दी</MenuItem>
      </Menu>

      {/* 🔍 Search */}
      <TextField
        size="small"
        placeholder="Search here ..."
        sx={{
          background: "#fff",
          borderRadius: "4px",
          width: 170,
          "& .MuiInputBase-input": {
            fontSize: "0.75rem",
            padding: "3px 6px",
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ fontSize: 16 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* 🔐 Authentication */}
      {isAuthenticated ? (
        <IconButton sx={{ ml: 1, p: 0 }} onClick={(e) => setProfileAnchor(e.currentTarget)}>
          <Avatar sx={{ width: 26, height: 26, fontSize: "0.75rem" }}>
            {user?.username?.[0]?.toUpperCase() || "U"}
          </Avatar>
        </IconButton>
      ) : (
        <Link
          to="/login"
          component={RouterLink}
          underline="none"
          sx={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.75rem",
            ml: 1,
          }}
        >
          <LoginIcon sx={{ fontSize: 16 }} />
          Login
        </Link>
      )}
    </Box>
  );
};

export default TopAccessibilityBar;
