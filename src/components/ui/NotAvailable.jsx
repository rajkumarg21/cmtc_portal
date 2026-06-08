import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const NotAvailable = ({ message = "Content not available" }) => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="60vh"
        textAlign="center"
      >
        <Typography variant="h4" color="text.primary" gutterBottom>
          Oops!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Container>
  );
};

export default NotAvailable;
