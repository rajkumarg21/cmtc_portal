import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function NrlmWebsites() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #4e342e, #6d4c41)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          NRLM Websites & Other State SRLM Portals
        </Typography>
      </Box>

      {/* Description Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The NRLM and State SRLM websites provide comprehensive information
            about rural development initiatives, mission guidelines, SHG growth,
            best practices, digital tools, and program implementation frameworks
            across India. These portals serve as a knowledge gateway for citizens,
            stakeholders, and field teams to access important updates, resources,
            reports, and progress dashboards related to livelihood promotion under
            the National Rural Livelihoods Mission.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
