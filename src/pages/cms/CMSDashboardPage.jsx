import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";
import {
  Description as NewsIcon,
  Campaign as CircularsIcon,
  Article as PagesIcon,
  PhotoLibrary as GalleryIcon,
  MenuBook as BooksIcon,
  Group as SubscriberIcon,
  Movie as MovieIcon,
  Campaign as AdsIcon,
  Event as EventIcon,
  Work as ProjectIcon,
  Print as PrintIcon,
  Movie,
} from "@mui/icons-material";
import api from "../../services/apiService";


const CMSDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/analytics/admin/dashboard-stats");
        setStats(response.data);
      } catch (err) {
        setError("Failed to fetch dashboard statistics. Please check backend API and permissions.");
        console.error("Error fetching CMS dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );

  // Card configuration with light colors
  const statCards = [
    {
      title: "Livelihood Activities Articles",
      total: stats?.totalFilmServiceArticles || 0,
      published: stats?.publishedFilmServiceArticles || 0,
      pending: stats?.pendingFilmServiceArticles || 0,
      icon: <MovieIcon sx={{ fontSize: 40, color: "#FF5722" }} />,  // Custom color for Film icon
      bg: "#FFF3E0", // Light Orange background
    },
    {
      title: "HSG PRODUCTS Articles",
      total: stats?.totalAdvertisementServiceArticles || 0,
      published: stats?.publishedAdvertisementServiceArticles || 0,
      pending: stats?.pendingAdvertisementServiceArticles || 0,
      icon: <AdsIcon sx={{ fontSize: 40, color: "#388E3C" }} />,  // Darker Green for Ads
      bg: "#C8E6C9", // Light Green background
    },
    {
      title: "Success Stories Articles",
      total: stats?.totalEventsServiceArticle || 0,
      published: stats?.publishedEventsServiceArticle || 0,
      pending: stats?.pendingEventsServiceArticle || 0,
      icon: <EventIcon sx={{ fontSize: 40, color: "#1976d2" }} />,  // Blue color for Event icon
      bg: "#BBDEFB", // Light Blue background
    },
    {
      title: "Act and Rules Articles",
      total: stats?.totalProjectsServiceArticles || 0,
      published: stats?.publishedProjectsServiceArticles || 0,
      pending: stats?.pendingProjectsServiceArticles || 0,
      icon: <ProjectIcon sx={{ fontSize: 40, color: "#9C27B0" }} />,  // Purple color for Projects
      bg: "#F3E5F5", // Light Purple background
    },
    {
      title: "Policies Articles",
      total: stats?.totalPrintingServiceArticles || 0,
      published: stats?.publishedPrintingServiceArticles || 0,
      pending: stats?.pendingPrintingServiceArticles || 0,
      icon: <PrintIcon sx={{ fontSize: 40, color: "#FF9800" }} />,  // Orange color for Printing
      bg: "#FFF8E1", // Light Yellow background
    },
    {
      title: "News Articles",
      total: stats?.totalNewsArticles || 0,
      published: stats?.publishedNewsArticles || 0,
      pending: (stats?.totalNewsArticles || 0) - (stats?.publishedNewsArticles || 0),
      icon: <NewsIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      bg: "#E3F2FD", // Light Blue background (keeping original)
    },
    {
      title: "Circulars",
      total: stats?.totalCirculars || 0,
      published: stats?.publishedCirculars || 0,
      pending: (stats?.totalCirculars || 0) - (stats?.publishedCirculars || 0),
      icon: <CircularsIcon sx={{ fontSize: 40, color: "#8E24AA" }} />,  // Purple color for Circulars
      bg: "#F3E5F5", // Light Purple background
    },
    {
      title: "Static Pages",
      total: stats?.totalStaticPages || 0,
      published: stats?.publishedStaticPages || 0,
      icon: <PagesIcon sx={{ fontSize: 40, color: "#2e7d32" }} />,
      bg: "#C8E6C9", // Light Green background
    },
    {
      title: "Gallery Items",
      total: stats?.totalGalleryItems || 0,
      icon: <GalleryIcon sx={{ fontSize: 40, color: "#D32F2F" }} />,  // Red color for Gallery
      bg: "#FFEBEE", // Light Red background
    },
    {
      title: "Publication",
      total: stats?.totalBooks || 0,
      extra: `Authors: ${stats?.totalAuthors || 0}`,
      icon: <BooksIcon sx={{ fontSize: 40, color: "#0288D1" }} />,  // Blue color for Books
      bg: "#E1F5FE", // Light Blue background
    },
    {
      title: "Subscribers",
      total: stats?.totalSubscribed || 0,
      icon: <SubscriberIcon sx={{ fontSize: 40, color: "#00838f" }} />,
      bg: "#E0F7FA", // Light Teal background
    }
  ]


  return (
    <Box p={4} sx={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f9f9f9, #f1f8ff)",
      py: 6,
    }}>
      <Box sx={{ padding: "10px 10px" }}>
        <Typography
          variant="h6"
          fontWeight={700}
          align="left"
          gutterBottom
          sx={{
            color: "grey.800",
          }}
        >
          CMS Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {statCards.map((card, idx) => (
            <Grid item size={{ xs: 12, sm: 4, md: 3 }} key={idx}>
              <Card
                sx={{
                  width: "100%",
                  height: 200,
                  borderRadius: 3,
                  boxShadow: 2,
                  background: card.bg,
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 5 },
                }}            >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {card.icon}
                    <Typography variant="p" fontWeight={600} color="text.primary">
                      {card.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Box flex={1}>
                    <Typography sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }} variant="body1" color="text.primary">
                      Total: <strong>{card.total}</strong>
                    </Typography>

                    {card.published !== undefined && (
                      <Typography sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }} variant="body1" color="text.primary">
                        Published: <strong>{card.published}</strong>
                      </Typography>
                    )}

                    {card.pending !== undefined && (
                      <Typography sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }} variant="body1" color="text.primary">
                        Pending: <strong>{card.pending}</strong>
                      </Typography>
                    )}

                    {card.extra && (
                      <Typography sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }} variant="body2" color="text.secondary">
                        {card.extra}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CMSDashboardPage;
