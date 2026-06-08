// src/pages/public/services/ServiceListPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import axios from "axios";

const ServiceListPage = () => {
  const { serviceSlug } = useParams();
  const [serviceItems, setServiceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceTitle, setServiceTitle] = useState("");

  useEffect(() => {
    const fetchServiceItems = async () => {
      try {
        // ✅ Example API endpoint (adjust as per your backend)
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/services/${serviceSlug}`
        );

        if (response.data && Array.isArray(response.data)) {
          setServiceItems(response.data);
        } else {
          setServiceItems([]);
        }

        // Capitalize the service name for display
        const title = serviceSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setServiceTitle(title);
      } catch (error) {
        console.error("Error fetching service items:", error);
        setServiceItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceItems();
  }, [serviceSlug]);

  if (loading) {
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
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#e57300",
          mb: 3,
          textTransform: "capitalize",
        }}
      >
        {serviceTitle}
      </Typography>

      {serviceItems.length === 0 ? (
        <Typography
          variant="body1"
          sx={{ textAlign: "center", color: "#999", mt: 4 }}
        >
          No items found for this service.
        </Typography>
      ) : (
        serviceItems.map((item) => (
          <Paper
            key={item.id}
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              "&:hover": { backgroundColor: "#fafafa" },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {item.title || item.name}
            </Typography>
            {item.description && (
              <Typography variant="body2" sx={{ color: "#555" }}>
                {item.description.length > 200
                  ? item.description.slice(0, 200) + "..."
                  : item.description}
              </Typography>
            )}
            <Divider sx={{ my: 1 }} />
            <Button
              component={Link}
              to={`/services/${serviceSlug}/${item.id}`}
              size="small"
              sx={{ color: "#1976d2", fontWeight: 600 }}
            >
              Read More
            </Button>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default ServiceListPage;
