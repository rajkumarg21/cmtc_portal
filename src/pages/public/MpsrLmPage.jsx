import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import api from "../../services/apiService";   // ← correct axios instance

const MpsrlmPage = () => {
  const [content, setContent] = useState({
    title: "",
    fullDescription: ""
  });

  useEffect(() => {
    api.get("/mpsrlm/content")
      .then((res) => {
        const d = res.data || {};
        setContent({
          title: d.title || "",
          fullDescription: d.fullDescription || "",
        });
      })
      .catch((err) => console.error("Error fetching MPSRLM content:", err));
  }, []);

  return (
    <Box sx={{ py: 6, backgroundColor: "#fff" }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        
        {/* Dynamic Title */}
        <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
          {content.title}
        </Typography>

        {/* Dynamic Full Description */}
        <Typography
          variant="body1"
          sx={{
            color: "#444",
            lineHeight: 1.8,
            mb: 4,
            fontSize: "1.05rem",
          }}
        >
          {content.fullDescription}
        </Typography>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#f44336",
            color: "#fff",
            borderRadius: "6px",
            px: 4,
            py: 1,
            fontWeight: 600,
            textTransform: "uppercase",
            "&:hover": { backgroundColor: "#d32f2f" },
          }}
          href="/"
        >
          Back to Home
        </Button>

      </Container>
    </Box>
  );
};

export default MpsrlmPage;
