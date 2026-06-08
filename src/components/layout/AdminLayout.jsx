import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import Footer from "./Footer";

const HEADER_HEIGHT = 65;
const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 0;

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const sidebarWidth = isSidebarOpen
    ? SIDEBAR_EXPANDED
    : SIDEBAR_COLLAPSED;

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#f5f7fa",
      }}
    >
      {/* ================= Header ================= */}
      <Box
        sx={{
          height: HEADER_HEIGHT,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          bgcolor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <AdminHeader
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </Box>

      {/* ================= Sidebar ================= */}
      <Box
        sx={{
          width: sidebarWidth,
          position: "fixed",
          top: HEADER_HEIGHT,
          left: 0,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          bgcolor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          transition: "width 0.25s ease",
          overflow: "hidden",
          zIndex: 1200,
        }}
      >
        <AdminSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </Box>

      {/* ================= Main Content ================= */}
      <Box
        sx={{
          ml: `${sidebarWidth}px`,
          pt: `${HEADER_HEIGHT}px`,
          height: "100% ",
          transition: "margin-left 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            position:"relative"
          }}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default AdminLayout;
