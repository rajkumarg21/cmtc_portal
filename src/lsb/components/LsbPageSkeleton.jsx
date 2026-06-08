import React from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * A full-page loading skeleton with a title bar and content area.
 */
const LsbPageSkeleton = () => {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Title block */}
      <Box sx={{ mb: 3 }}>
        <Skeleton
          variant="rectangular"
          width="35%"
          height={32}
          sx={{ borderRadius: 1, mb: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width="20%"
          height={16}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      {/* Content area */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        sx={{ borderRadius: 2 }}
      />
    </Box>
  );
};

export default LsbPageSkeleton;
