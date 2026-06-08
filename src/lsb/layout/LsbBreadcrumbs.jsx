import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

/**
 * Maps URL path segments to human-readable labels.
 */
const segmentLabels = {
  lsb: 'LSB',
  dashboard: 'Dashboard',
  'loan-requests': 'Loan Requests',
  'loan-management': 'Loan Management',
  'user-management': 'User Management',
  'request-new-loan-subsidy': 'Request Loan Subsidy',
  auth: 'Authentication',
  login: 'Login',
};

/**
 * Converts a path segment to a readable label.
 * Uses the segmentLabels map first, then falls back to title-casing.
 */
function getLabel(segment) {
  if (segmentLabels[segment]) return segmentLabels[segment];
  // Fallback: convert kebab-case to Title Case
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const LsbBreadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname
    .split('/')
    .filter((seg) => seg !== '');

  // Don't render breadcrumbs if we're at root or only /lsb
  if (pathSegments.length <= 1) return null;

  // Build breadcrumb items (skip the first "lsb" segment for the home icon)
  const lsbIndex = pathSegments.indexOf('lsb');
  const relevantSegments = lsbIndex >= 0 ? pathSegments.slice(lsbIndex + 1) : pathSegments;

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
        sx={{
          '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
          '& .MuiBreadcrumbs-li': { whiteSpace: 'nowrap' },
        }}
      >
        {/* Home link */}
        <Link
          component={RouterLink}
          to="/lsb/loan-requests"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            '&:hover': { color: '#1f4e79' },
          }}
        >
          <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Home
        </Link>

        {/* Intermediate segments as links */}
        {relevantSegments.slice(0, -1).map((segment, index) => {
          const path = '/lsb/' + relevantSegments.slice(0, index + 1).join('/');
          return (
            <Link
              key={path}
              component={RouterLink}
              to={path}
              underline="hover"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8125rem',
                '&:hover': { color: '#1f4e79' },
              }}
            >
              {getLabel(segment)}
            </Link>
          );
        })}

        {/* Current page (last segment, not a link) */}
        <Typography
          sx={{
            color: '#1f4e79',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          {getLabel(relevantSegments[relevantSegments.length - 1])}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default LsbBreadcrumbs;
