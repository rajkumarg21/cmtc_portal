import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';

const LsbFooter = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#163a5c',
        borderTop: 'none',
      }}
    >
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
        &copy; {year} Loan Subsidy Portal | MP SRLM
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <MuiLink
          href="#"
          underline="hover"
          sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}
        >
          Help
        </MuiLink>
        <MuiLink
          href="#"
          underline="hover"
          sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}
        >
          Privacy
        </MuiLink>
      </Box>
    </Box>
  );
};

export default LsbFooter;
