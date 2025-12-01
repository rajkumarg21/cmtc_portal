import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MailIcon from "@mui/icons-material/Mail";
import FeedbackIcon from "@mui/icons-material/Feedback";
import ArticleIcon from "@mui/icons-material/Article";
import api from "../../services/apiService";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        //const response = await api.get("/analytics/admin/dashboard-stats");
       // setStats(response.data);
      } catch (err) {
        setError(
          "Failed to fetch dashboard statistics. Please check backend API and user permissions."
        );
        console.error("Error fetching Admin dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={12}>
        <CircularProgress size={50} />
      </Box>
    );

  if (error)
    return (
      <Typography variant="h6" color="error" align="center" sx={{ py: 8 }}>
        {error}
      </Typography>
    );

  const statCards = [
    {
      title: "Users",
      icon: <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      bgColor: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
      values: [
        { label: "Total Users", value: stats?.totalUsers || 0, color: "primary" },
      ],
    },
    {
      title: "Contact Messages",
      icon: <MailIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      bgColor: "linear-gradient(135deg, #f3e5f5, #e1bee7)",
      values: [
        { label: "Total Messages", value: stats?.totalContactMessages || 0, color: "primary" },
        { label: "Unread", value: stats?.unreadContactMessages || 0, color: "warning" },
      ],
    },
    {
      title: "Feedback",
      icon: <FeedbackIcon sx={{ fontSize: 40, color: "success.main" }} />,
      bgColor: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
      values: [
        { label: "Total Feedback", value: stats?.totalFeedback || 0, color: "primary" },
        { label: "Unreviewed", value: stats?.unreviewedFeedback || 0, color: "warning" },
      ],
    },
    {
      title: "Content Overview",
      icon: <ArticleIcon sx={{ fontSize: 40, color: "info.main" }} />,
      bgColor: "linear-gradient(135deg, #e1f5fe, #b3e5fc)",
      values: [
        { label: "Published News", value: stats?.publishedNewsArticles || 0, color: "success" },
        { label: "Circulars", value: stats?.publishedCirculars || 0, color: "success" },
        { label: "Static Pages", value: stats?.publishedStaticPages || 0, color: "success" },
      ],
    },
  ];

  return (
    <Box
      p={4}
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f9f9f9, #f1f8ff)",
        py: 6,
      }}
    >
      <Box sx={{ padding: "10px 10px" }}>
        {/* Header */}
        <Typography
          variant="h6"
          fontWeight={700}
          align="left"
          gutterBottom
          sx={{ color: "grey.800" }}
        >
          Admin Dashboard
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={4}>
          {statCards.map((card, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                sx={{
                  width: "100%",
                  height: 200,
                  borderRadius: 4,
                  boxShadow: 4,
                  background: card.bgColor,
                  transition: "all 0.3s ease",
                  flex: 1, // ensures equal height in row
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {card.icon}
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {card.title}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box flex={1}>
                    {card.values.map((item, idx) => (
                      <Typography
                        key={idx}
                        variant="body1"
                        sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
                      >
                        {item.label}:{" "}
                        <Typography
                          component="span"
                          variant="body1"
                          fontWeight={700}
                          color={`${item.color}.main`}
                        >
                          {item.value}
                        </Typography>
                      </Typography>
                    ))}
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

export default AdminDashboardPage;
