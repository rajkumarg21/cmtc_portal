import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function ShgRegistration() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header Section */}
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
          New SHG Registration Portal
        </Typography>
      </Box>

      {/* Description */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The New SHG Registration Portal enables easy and streamlined enrollment
            of Self Help Groups across rural regions. The platform supports the
            submission of group details, verification workflows, and digital
            record updates, helping agencies maintain accurate information and
            track the growth and performance of SHGs for development initiatives.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
