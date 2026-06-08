import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function VidyutSakhi() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header Box */}
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
          Vidyut Sakhi
        </Typography>
      </Box>

      {/* Content Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The Vidyut Sakhi initiative empowers women by involving them in 
            household-level electricity management and awareness activities. 
            Through proper training and guidance, SHG women act as facilitators 
            to ensure efficient power usage, bill management, and support for 
            rural electrification services.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
