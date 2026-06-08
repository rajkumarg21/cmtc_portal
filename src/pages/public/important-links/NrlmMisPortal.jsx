import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function NrlmMisPortal() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #00897b, #26a69a)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          NRLM MIS Portal
        </Typography>
      </Box>

      {/* Description Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The NRLM MIS Portal provides a centralized digital platform designed 
            to monitor, evaluate, and manage key project activities under the 
            National Rural Livelihoods Mission. It enables real-time tracking of 
            SHG progress, fund utilization, training status, livelihood initiatives, 
            and performance indicators, ensuring transparency and efficient program 
            implementation across all states.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
