import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function Iprp() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #1e88e5, #42a5f5)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          IPRP (Integrated Participatory Rural Planning)
        </Typography>
      </Box>

      {/* Description Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ lineHeight: 1.7, fontSize: "1.05rem", color: "#444" }}>
            The IPRP system serves as a structured platform for enabling rural 
            communities to actively participate in planning and decision-making 
            processes. This portal allows users to access simplified guidelines, 
            essential information, and resources that assist in preparing and 
            managing integrated rural development plans effectively.
          </Typography>
        </CardContent>
      </Card>

    </Container>
  );
}
