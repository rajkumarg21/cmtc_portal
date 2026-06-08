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
import { getPublishedNewsArticles } from "../../services/newsService";
import PageHeader from "../../components/public/Common/PageHeader";

// Default fallback articles
const defaultNewsArticles = [
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

const NewsListPage = () => {
    const navigate = useNavigate();
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getPublishedNewsArticles();
        if (Array.isArray(data) && data.length > 0) {
          setNewsArticles(data);
        } else {
          setNewsArticles(defaultNewsArticles);
        }
      } catch (err) {
        setError("Failed to fetch news articles. Showing sample data.");
        console.error("Error fetching news:", err);
        setNewsArticles(defaultNewsArticles);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ background: "linear-gradient(180deg, #f0f7ff, #ffffff)" }}>
      <PageHeader title="Latest News & Updates" />

      <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {newsArticles.map((article) => (
            <Grid item xs={12} sm={6} md={4} size={4} key={article.id}>
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
                {/* <CardActionArea 
                  component={Link}
                  to={`/news/${article.id}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    height: "100%",
                  }}
                > */}

                 <CardActionArea
                  // onClick={() => navigate(`/news/${article.id}`)}
                  onClick={() => navigate(`/news/${article.id}`, { state: { article } })}
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
                      article.imageUrl
                        ? `${import.meta.env.VITE_BASE_URL}${article.imageUrl}`
                        : "https://placehold.co/600x300/E0E7FF/3B82F6?text=No+Image"
                    }
                    alt={article.titleEnglish}
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
                      sx={{ color: "#1e293b",display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden", }}
                    >
                      {article.titleEnglish || article.titleHindi}
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
                      {article.summaryEnglish || article.summaryHindi}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Chips */}
                    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        size="small"
                        label={new Date(article.publishedAt).toLocaleDateString("en-GB")}
                        color="primary"
                        variant="outlined"
                      />
                      {article.author && (
                        <Chip
                          size="small"
                          label={`By ${article.author}`}
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Read More */}
                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        // component={Link} 
                        // to={`/news/${article.id}`}
                        onClick={(e) => { 
                        e.stopPropagation(); // prevent CardActionArea double-handling (defensive)
                        navigate(`/news/${article.id}`, { state: { article } });
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
                        Read More →
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

export default NewsListPage;
