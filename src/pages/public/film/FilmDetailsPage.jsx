import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  CircularProgress,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button, // Added Button for the fallback/error state
} from "@mui/material";
import { motion } from "framer-motion";

import {
  getLatestPublishedFilm,
} from "../../../services/filmService";
import { getFilmPageById } from "../../../services/filmService";
import PageHeader from "../../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

const placeholderFilm = {
  titleHindi: "कोई Livelihood Activities शीर्षक उपलब्ध नहीं",
  titleEnglish: "No Livelihood Activities Title Available",
  summaryHindi: "कोई सारांश उपलब्ध नहीं।",
  summaryEnglish: "No Livelihood Activities summary available.",
  publishedAt: new Date().toISOString(), // Using publishedAt
  author: "Unknown Director/Producer",
  imageUrl: null,
  videoUrl: null,
  contentHindi: "<p>कोई सामग्री उपलब्ध नहीं।</p>",
  contentEnglish: "<p>No Livelihood Activities content available. This detail page is missing body text.</p>",
};

const OTHER_FILMS_COUNT = 5; // number of sidebar items

const FilmDetailsPage = () => {
  const location = useLocation();
  const preloadedFilm = location.state?.article;
  const { id } = useParams();
  const [filmItem, setFilmItem] = useState(placeholderFilm);
  const [loading, setLoading] = useState(true);
  const [otherFilms, setOtherFilms] = useState([]);
  const [otherLoading, setOtherLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language === "hi";

  useEffect(() => {
    let mounted = true;
    const fetchFilm = async () => {
      setLoading(true);
      try {
        // If router passed item via state and it matches this id, use it to avoid network call
        if (preloadedFilm && String(preloadedFilm.id) === String(id)) {
          if (!mounted) return;
          setFilmItem({ ...placeholderFilm, ...preloadedFilm });
          setLoading(false);
          return;
        }

        // otherwise fetch from server
        const data = await getFilmPageById(id);
        if (!mounted) return;
        if (data) {
          setFilmItem({ ...placeholderFilm, ...data });
        } else {
          setFilmItem(placeholderFilm);
        }
      } catch (err) {
        console.error("Error fetching Livelihood Activities item:", err);
        if (mounted) setFilmItem(placeholderFilm);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFilm();
    return () => {
      mounted = false;
    };
  }, [id, preloadedFilm]);

  // Fetch latest other film items (exclude current id)
  useEffect(() => {
    let mounted = true;
    const fetchOther = async () => {
      setOtherLoading(true);
      try {
        const candidateCount = Math.max(
          OTHER_FILMS_COUNT + 2,
          OTHER_FILMS_COUNT
        );
        // Use the new service function
        const items = await getLatestPublishedFilm(candidateCount);

        if (!mounted) return;
        if (Array.isArray(items)) {
          const filtered = items.filter(
            (n) => String(n.id) !== String(id)
          );
          setOtherFilms(filtered.slice(0, OTHER_FILMS_COUNT));
        } else {
          setOtherFilms([]);
        }
      } catch (err) {
        console.error("Error fetching latest Livelihood Activities:", err);
        if (mounted) setOtherFilms([]);
      } finally {
        if (mounted) setOtherLoading(false);
      }
    };
    fetchOther();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }
  // Updated variable names to reflect filmItem
  const displayTitle = isHindi
    ? filmItem.titleHindi || filmItem.titleEnglish
    : filmItem.titleEnglish || filmItem.titleHindi;
  const displaySummary = isHindi
    ? filmItem.summaryHindi || filmItem.summaryEnglish
    : filmItem.summaryEnglish || filmItem.summaryHindi;
  const displayContent = isHindi
    ? filmItem.contentHindi || filmItem.contentEnglish
    : filmItem.contentEnglish || filmItem.contentHindi;

  // Error/Fallback state
  if (!filmItem || (!displayTitle && !displaySummary)) {
    return (
      <Box sx={{ p: 4 }}>
        <PageHeader title={t('sections.film_section')} />
        <Typography variant="h6" color="error" mt={4}>
          {isHindi ? "Livelihood Activities विवरण नहीं मिला।" : "Livelihood Activities details not found."}
        </Typography>
        {/* Assuming a route for listing Livelihood Activities exists */}
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/films')}>
          {isHindi ? "Livelihood Activities अनुभाग पर वापस जाएँ" : "Go back to Livelihood Activities Section"}
        </Button>
      </Box>
    );
  }


  return (
    <Box>
      <PageHeader title={t('sections.film_section')} />
      <Box sx={{ padding: 4 }}>
        <Grid
          container
          spacing={4}
          sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "flex-start" }}
        >
          {/* Main Content - 75% */}
          <Grid item xs={12} md={12} sx={{ flex: "0 0 75%", maxWidth: "75%" }}>
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {/* Hero */}
              <Box sx={{ position: "relative" }}>
                {filmItem.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="420"
                    controls
                    image={
                      filmItem.imageUrl
                        ? `${import.meta.env.VITE_BASE_URL || ""}${filmItem.imageUrl
                        }`
                        : "https://placehold.co/800x400/F0F7FF/60A5FA?text=Film+Detail" // Updated Placeholder
                    }
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    height="420"
                    image="https://placehold.co/800x400/F0F7FF/60A5FA?text=Film+Detail"
                  />
                )}

                {/* Overlay Title */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                    color: "#fff",
                    p: 3,
                  }}
                >
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >

                  </motion.div>
                </Box>
              </Box>

              <CardContent>
                {/* Synopsis */}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  {displayTitle}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {displaySummary}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    color: "text.primary",
                    "& p": { mb: 2, lineHeight: 1.8 },
                    "& img": { maxWidth: "100%", borderRadius: "10px" },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: displayContent,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar - 25% */}
          <Grid
            item
            xs={12}
            md={12}
            sx={{ flex: "0 0 25%", maxWidth: "25%", position: "sticky", top: 100, height: "calc(100vh - 120px)", overflowY: "auto" }}
          >
            <Typography variant="h6" gutterBottom
              sx={{ color: "#1976d2", textDecoration: "underline", fontWeight: "bold", cursor: "pointer" }}
            >
              {isHindi ? "अन्य महत्वपूर्ण Livelihood Activities" : "Other Important Livelihood Activities"}
            </Typography>

            {otherLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : otherFilms.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {isHindi ? "कोई अन्य Livelihood Activities उपलब्ध नहीं है।" : "No other Livelihood Activities services available."}
              </Typography>
            ) : (
              <List disablePadding>
                {otherFilms.map((item) => {
                  const title = isHindi
                    ? item.titleHindi || item.titleEnglish
                    : item.titleEnglish || item.titleHindi;
                  const thumb = item.imageUrl
                    ? `${import.meta.env.VITE_BASE_URL || ""}${item.imageUrl}`
                    : "https://placehold.co/120x80/F0F7FF/60A5FA"; // Placeholder for thumbnail

                  return (
                    <ListItemButton
                      key={item.id}
                      component={Link}
                      // Navigate to the film detail page path (assuming route is /filmDetails/:id)
                      to={{ pathname: `/film/${item.id}` }}
                      // Pass state to avoid re-fetching on the next page
                      state={{ article: item }} // Using 'article' for backward compatibility with preloadedArticle
                      sx={{ mb: 1, borderRadius: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={thumb}
                          alt={title}
                          sx={{ width: 80, height: 55, mr: 1 }}
                          onError={(e) => {
                            e.target.src = "https://placehold.co/120x80/F0F7FF/60A5FA";
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", }}
                          >
                            {title}
                          </Typography>
                        }
                        secondary={
                          item.publishedAt ? ( // Using publishedAt
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.publishedAt).toLocaleDateString("en-GB")}
                            </Typography>
                          ) : null
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FilmDetailsPage;