import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function RuralSoft() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #4a148c, #7b1fa2)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          RuralSoft Portal
        </Typography>
      </Box>

      {/* Description Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The RuralSoft Portal is a management and monitoring platform designed 
            to streamline data entry, program tracking, and reporting for rural 
            development initiatives. It helps field teams and administrative units 
            efficiently record activities, monitor progress, and generate accurate 
            dashboards, ensuring effective planning and implementation across 
            various development programs in rural areas.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
