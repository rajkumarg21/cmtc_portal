import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function Pfms() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #00695c, #00897b)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          PFMS – Public Financial Management System
        </Typography>
      </Box>

      {/* Description Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The Public Financial Management System (PFMS) is a comprehensive
            platform developed by the Government of India for real-time tracking
            and monitoring of fund disbursement across various schemes. It ensures
            transparency, efficiency, and accountability in financial operations
            by integrating banking systems with government departments. PFMS
            enables secure online payments, direct beneficiary transfers, and
            accurate financial reporting, supporting smoother implementation of
            development programs at all levels.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
