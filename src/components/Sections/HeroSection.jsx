import React from 'react';
import { Box, Card, CardContent, Button, Typography } from '@mui/material';

const HeroSection = ({ pageName }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        height: 250,
        background: 'linear-gradient(135deg, #7c2d12, #ea580c)',
      }}
    >
      {/* Dark Overlay */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* Floating Card */}
      <Card
        sx={{
          position: 'relative',
          zIndex: 1,
          top: 50,
          left: 40,
          width: { xs: '90vw', md: '50vw' },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: 6,
          px: 4,
          py: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 10,
            transform: 'scale(1.01)',
          },
        }}
      >
        <CardContent>
          {/* Small Gradient Button */}
          <Button
            size="small"
            sx={{
              background: 'linear-gradient(to right, #f97316, #fb923c)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              mb: 2,
              borderRadius: '10px',
              textTransform: 'none',
              px: 2,
            }}
          >
            Welcome to
          </Button>

          {/* Title */}
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{
              color: '#7c2d12',
              fontSize: { xs: '1.5rem', md: '2rem' },
              lineHeight: 1.3,
            }}
          >
            Madhya Pradesh CMTC
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{ color: '#4b5563', fontSize: '0.95rem', mt: 1 }}
          >
            Empowering communication and transparency through innovative public outreach and media engagement.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HeroSection;
