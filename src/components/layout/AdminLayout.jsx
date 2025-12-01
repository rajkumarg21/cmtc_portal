import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Grid, Box } from '@mui/material';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import Footer from './Footer';
/**Testing **/

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);


  const sidebarWidth = isSidebarOpen ? 256 : 64; // px

  return (
     <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Grid item sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <AdminHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      </Grid>

      {/* Sidebar + Main Content */}
      <Grid item container sx={{ flex: 1, pt: '64px' }}>
        {/* Sidebar */}
        <Grid
          item
          sx={{
            position: 'fixed',
            top: '64px',
            left: 0,
            height: 'calc(100vh - 64px)',
            bgcolor: 'white',
            borderRight: '1px solid #e0e0e0',
            width: sidebarWidth,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            zIndex: 1100
          }}
        >
          <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
        </Grid>

        {/* Main Content + Footer */}
        <Grid
          item
          sx={{
            ml: `${sidebarWidth}px`,
            transition: 'margin-left 0.3s ease',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          {/* Main content */}
        <main style={{
        flex: 1,
      }}>
            <Outlet />
          </main>

       
            <Footer />
   
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminLayout;
