import React from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * A loading skeleton that mimics a data table.
 * @param {number} rows - Number of body rows to display (default 5)
 * @param {number} columns - Number of columns to display (default 5)
 */
const LsbTableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
      }}
    >
      {/* Header row with gradient background */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          px: 2,
          py: 1.5,
          background: 'linear-gradient(135deg, #1f4e79 0%, #2e75b6 100%)',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            variant="rectangular"
            sx={{
              flex: 1,
              height: 20,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </Box>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={`row-${rowIndex}`}
          sx={{
            display: 'flex',
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: rowIndex < rows - 1 ? '1px solid #f0f0f0' : 'none',
            opacity: rowIndex % 2 === 0 ? 1 : 0.7,
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="rectangular"
              sx={{
                flex: 1,
                height: 16,
                borderRadius: 1,
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default LsbTableSkeleton;
