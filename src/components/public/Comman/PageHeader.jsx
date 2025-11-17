// PageHeader.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import mplogo from "../../../assets/images/mpmap.png";
const PageHeader = ({ title }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 180, md: 250 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4,
        color: '#fff',
        textAlign: 'center',
        backgroundImage: `url(${mplogo})`,
        backgroundPosition: 'center',
        backgroundRepeat:"no-repeat"
      }}
    >
      {/* Animated Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(270deg, #ff4b2bb8, rgba(255, 41, 3, 0.65), rgba(253, 0, 67, 0.6))`,
          backgroundSize: '600% 600%',
          animation: 'gradientAnimation 10s ease infinite',
        }}
      />
      
      {/* Title */}
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ position: 'relative', zIndex: 1, px: 2 }}
      >
        {title}
      </Typography>

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes gradientAnimation {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
        `}
      </style>
    </Box>
  );
};

export default PageHeader;
