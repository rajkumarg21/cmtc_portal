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
import { getPublishedFilmPages } from "../../../services/filmService";
import PageHeader from "../../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

const FilmListPage = () => {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t,i18n } = useTranslation();
  const isHindi = i18n.language === "hi";


  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const data = await getPublishedFilmPages();
        setFilms(data);
      } catch (err) {
        setError("Failed to fetch Livelihood Activities. Showing sample data.");
        console.error("Error fetching Livelihood Activities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilms();
  }, []);

  const getLocalizedTitle = (film) => {
    return isHindi ? (film.titleHindi || film.titleEnglish) : (film.titleEnglish || film.titleHindi);
  };

  const getLocalizedSummary = (film) => {
    return isHindi ? (film.summaryHindi || film.summaryEnglish) : (film.summaryEnglish || film.summaryHindi);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ background: "linear-gradient(180deg, #f0f7ff, #ffffff)" }}>
     <PageHeader title={t('sections.films')} />

      <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} justifyContent="center">
          {films.map((film) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={film.id}>
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
                  onClick={() => navigate(`/film/${film.id}`, { state: { film } })}
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
                      film.imageUrl
                        ? `${import.meta.env.VITE_BASE_URL}${film.imageUrl}`
                        : "https://placehold.co/600x300/E0E7FF/3B82F6?text=No+Image"
                    }
                    alt={film.titleEnglish}
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
                      {getLocalizedTitle(film)}
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
                      {getLocalizedSummary(film)}
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
                          navigate(`/film/${film.id}`, { state: { film } });
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

export default FilmListPage;
