import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { getAllPublishedEvent } from "../../../services/eventService";
import PageHeader from "../../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

// Default fallback Success Stories
const defaultEvents = [
  {
    id: "1",
    titleEnglish: "Sample Headline: AI Revolutionizes Tech Industry",
    summaryEnglish:
      "Artificial intelligence is reshaping industries worldwide with groundbreaking innovations.",
    publishedAt: new Date(),
    author: "Jane Doe",
    imageUrl: null,
  },
  {
    id: "2",
    titleEnglish: "Global Markets Rally Amid Economic Optimism",
    summaryEnglish:
      "Stock markets surged today as investors reacted positively to economic growth forecasts.",
    publishedAt: new Date(),
    author: "John Smith",
    imageUrl: null,
  },
  {
    id: "3",
    titleEnglish: "Breakthrough in Renewable Energy Technology",
    summaryEnglish:
      "A new solar panel design promises to increase efficiency by 40%, experts say.",
    publishedAt: new Date(),
    author: "Tech Reporter",
    imageUrl: null,
  },
];

const ActionPlanListPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  const getLocalizedTitle = (film) => {
    return isHindi ? (film.titleHindi || film.titleEnglish) : (film.titleEnglish || film.titleHindi);
  };

  const getLocalizedSummary = (film) => {
    return isHindi ? (film.summaryHindi || film.summaryEnglish) : (film.summaryEnglish || film.summaryHindi);
  };


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllPublishedEvent();
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(defaultEvents);
        }
      } catch (err) {
        setError("Failed to fetch Success Stories. Showing sample data.");
        console.error("Error fetching Success Stories:", err);
        setEvents(defaultEvents);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ background: "linear-gradient(180deg, #f0f7ff, #ffffff)" }}>
      <PageHeader title={t('sections.anualActionPlan')} />

      <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} justifyContent="center">
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} size={4} key={event.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  backdropFilter: "blur(10px)",
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.02)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                  },
                }}
              >

                <CardActionArea
                  onClick={() => navigate(`/event/${event.id}`, { state: { event } })}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    height: "100%",
                    cursor: "pointer"
                  }}
                  role="button"
                >
                  {/* Top Image */}
                  <CardMedia
                    component="img"
                    image={
                      event.imageUrl
                        ? `${import.meta.env.VITE_BASE_URL}${event.imageUrl}`
                        : "https://placehold.co/600x300/E0E7FF/3B82F6?text=No+Image"
                    }
                    alt={event.titleEnglish}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderRadius: "16px 16px 0 0",
                    }}
                  />

                  {/* Content */}
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        color: "#1e293b", display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {getLocalizedTitle(event)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 2,
                      }}
                    >
                      {getLocalizedSummary(event)}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Read More */}
                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        // component={Link} 
                        // to={`/news/${article.id}`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent CardActionArea double-handling (defensive)
                          navigate(`/event/${event.id}`, { state: { event } });
                        }}
                        sx={{
                          borderRadius: "20px",
                          textTransform: "none",
                          fontWeight: 600,
                          background: "linear-gradient(90deg, #2196f3, #21cbf3)",
                          boxShadow: "0 4px 12px rgba(33,150,243,0.4)",
                          "&:hover": {
                            background: "linear-gradient(90deg, #1976d2, #0d8ddb)",
                          },
                        }}
                      >
                        {isHindi ? "और पढ़ें → " : "Read More → "}
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ActionPlanListPage;
