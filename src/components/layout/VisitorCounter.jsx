import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    // Simulate visit count stored in sessionStorage (for demo)
    const storedVisits = sessionStorage.getItem('visitCount');
    const updatedCount = storedVisits ? parseInt(storedVisits) + 1 : 1;

    sessionStorage.setItem('visitCount', updatedCount);
    setVisitorCount(updatedCount);
  }, []);

  return (
    <Box textAlign="center" my={4}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Visited by
      </Typography>
      <Typography variant="h4" component="div">
        <Odometer value={visitorCount} format="(,ddd)" duration={1500} />
      </Typography>
    
    </Box>
  );
};

export default VisitorCounter;
