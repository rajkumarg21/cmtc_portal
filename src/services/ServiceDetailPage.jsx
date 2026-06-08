// src/pages/public/services/ServiceDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";

const ServiceDetailPage = () => {
  const { serviceSlug, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/services/${serviceSlug}/${id}`
        );
        setItem(response.data);
      } catch (error) {
        console.error("Error fetching service detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [serviceSlug, id]);

  if (loading)
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (!item)
    return (
      <Typography textAlign="center" sx={{ mt: 6 }}>
        Item not found.
      </Typography>
    );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#e57300", mb: 2 }}>
        {item.title || item.name}
      </Typography>
      <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#444" }}>
        {item.description}
      </Typography>
    </Container>
  );
};

export default ServiceDetailPage;
