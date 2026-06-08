import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Reusable page header component for LSB pages.
 * @param {string} title - Page title (required)
 * @param {string} subtitle - Optional subtitle text
 * @param {React.ReactNode} actions - Optional action buttons rendered on the right
 */
const LsbPageHeader = ({ title, subtitle, actions }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 2 },
        pb: 2,
        mb: 3,
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      {/* Title and subtitle */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#1f4e79',
            fontSize: { xs: '1.25rem', md: '1.5rem' },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Action buttons */}
      {actions && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default LsbPageHeader;
