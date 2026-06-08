import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function BcSakhiCbo() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      
      {/* Header Box */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #00695c, #26a69a)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          MODEL CLF DATA ENTRY
        </Typography>
      </Box>

      {/* Content */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The MODEL CLF Data Entry section contains structured inputs related to 
            Community Level Federation activities, membership details and operational records.
            This page serves as a brief overview where the important guidelines and 
            instructions for data entry can be accessed and referred to by users.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
