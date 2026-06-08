import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function CaderRegistration() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #4e342e, #8d6e63)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          CADER REGISTRATION & ICRP FEEDING PORTAL
        </Typography>
      </Box>

      {/* Content */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The Cader Registration & ICRP Feeding Portal provides an organized 
            interface for recording essential cadre-related details, updating 
            member information, and managing structured data inputs for ICRP operations. 
            This section offers users a simple overview and access to basic guidelines 
            for smooth and accurate data entry.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
