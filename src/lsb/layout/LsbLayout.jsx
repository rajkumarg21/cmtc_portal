import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import lsbTheme from '../theme/lsbTheme';
import LsbHeader from './LsbHeader';
import LsbSidebar from './LsbSidebar';
import LsbFooter from './LsbFooter';
import LsbBreadcrumbs from './LsbBreadcrumbs';
import LsbBottomNav from './LsbBottomNav';
import '../theme/lsbToastStyles.css';

const HEADER_HEIGHT = 64;
const SIDEBAR_EXPANDED = 270;
const SIDEBAR_COLLAPSED = 72;

const LsbLayout = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // On mobile: sidebar is overlay (0 margin), on desktop: pushes content
  const sidebarWidth = isMobile
    ? 0
    : isSidebarOpen
      ? SIDEBAR_EXPANDED
      : SIDEBAR_COLLAPSED;

  return (
    <ThemeProvider theme={lsbTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: isMobile ? (isSidebarOpen ? SIDEBAR_EXPANDED : 0) : (isSidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED),
            flexShrink: 0,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: 1200,
            // Mobile overlay
            ...(isMobile && {
              boxShadow: isSidebarOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
            }),
          }}
        >
          <LsbSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </Box>

        {/* Mobile backdrop */}
        {isMobile && isSidebarOpen && (
          <Box
            onClick={toggleSidebar}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              zIndex: 1199,
              transition: 'opacity 0.3s',
            }}
          />
        )}

        {/* Main area (header + content + footer) */}
        <Box
          sx={{
            ml: `${sidebarWidth}px`,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              height: HEADER_HEIGHT,
              position: 'sticky',
              top: 0,
              zIndex: 1100,
            }}
          >
            <LsbHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          </Box>

          {/* Page Content */}
          <Box
            component="main"
            sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2, md: 3 },
              pb: { xs: '72px', md: 3 },
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            <LsbBreadcrumbs />
            <Outlet />
          </Box>

          {/* Footer */}
          <LsbFooter />

          {/* Mobile Bottom Navigation */}
          <LsbBottomNav />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LsbLayout;
