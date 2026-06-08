import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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
} from "@mui/material";
import { motion } from "framer-motion";
import {
  getLatestPublishedEvent, getEventById
} from "../../../services/eventService";
import PageHeader from "../../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

const placeholderEvent = {
  titleHindi: "कोई शीर्षक उपलब्ध नहीं",
  titleEnglish: "No title available",
  summaryHindi: "कोई सारांश उपलब्ध नहीं।",
  summaryEnglish: "No summary available.",
  publishedAt: new Date().toISOString(),
  author: "Unknown",
  newsDate: null,
  imageUrl: null,
  videoUrl: null,
  contentHindi: "<p>कोई सामग्री उपलब्ध नहीं।</p>",
  contentEnglish: "<p>No content available.</p>",
};

const OTHER_NEWS_COUNT = 5;

const ActionPlanDetailsPage = () => {
  const location = useLocation();
  const preloadedEvent = location.state?.event;
  const { id } = useParams();
  const [event, setEvent] = useState(placeholderEvent);
  const [loading, setLoading] = useState(true);
  const [otherNews, setOtherNews] = useState([]);
  const [otherLoading, setOtherLoading] = useState(true);
  const { t,i18n } = useTranslation();

  useEffect(() => {
    let mounted = true;
    const fetchEvent = async () => {
      setLoading(true);
      try {
        if (preloadedEvent && String(preloadedEvent.id) === String(id)) {
          if (!mounted) return;
          setEvent({ ...placeholderEvent, ...preloadedEvent });
          setLoading(false);
          return;
        }
        const data = await getEventById(id);
        if (!mounted) return;
        if (data) {
          setEvent({ ...placeholderEvent, ...data });
        } else {
          setEvent(placeholderEvent);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        if (mounted) setEvent(placeholderEvent);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvent();
    return () => {
      mounted = false;
    };
  }, [id, preloadedEvent]);

  useEffect(() => {
    let mounted = true;
    const fetchOther = async () => {
      setOtherLoading(true);
      try {
        const candidateCount = Math.max(OTHER_NEWS_COUNT + 2, OTHER_NEWS_COUNT);
        const items = await getLatestPublishedEvent(candidateCount);
        if (!mounted) return;
        if (Array.isArray(items)) {
          const filtered = items.filter((n) => String(n.id) !== String(id));
          setOtherNews(filtered.slice(0, OTHER_NEWS_COUNT));
        } else {
          setOtherNews([]);
        }
      } catch (err) {
        console.error("Error fetching latest:", err);
        if (mounted) setOtherNews([]);
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

  const isHindi = i18n.language === "hi";
  const displayTitle = isHindi
    ? event.titleHindi || event.titleEnglish
    : event.titleEnglish || event.titleHindi;
  const displaySummary = isHindi
    ? event.summaryHindi || event.summaryEnglish
    : event.summaryEnglish || event.summaryHindi;
  const displayContent = isHindi
    ? event.contentHindi || event.contentEnglish
    : event.contentEnglish || event.contentHindi;

  return (
    <Box>
      <PageHeader title={t('sections.event_section')} />

      <Box sx={{ padding: 4 }}>
        <Grid container spacing={4} sx={{ flexWrap: "nowrap" }}>
          {/* Main Content */}
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
                {event.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="420"
                    controls
                    src={`${import.meta.env.VITE_BASE_URL || ""}${event.imageUrl}`}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    height="420"
                    image="https://placehold.co/800x400/FFDDC1/E94E77?text=Event+Detail"
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
                    // textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {displayTitle}
                </Typography>
                {/* <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "#d32f2f",
                    borderBottom: "2px solid #d32f2f",
                    display: "inline-block",
                  }}
                >
                   Synopsis 
                </Typography> */}
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {displaySummary}
                </Typography>

                {/* Meta Info */}
                {/* <Box display="flex" gap={3} mb={2} color="text.secondary">
                  <Typography variant="body2">
                    📅 {new Date(event.publishedAt).toLocaleDateString("en-GB")}
                  </Typography>
                  {event.author && (
                    <Typography variant="body2">✍️ {event.author}</Typography>
                  )}
                  {event.newsDate && (
                    <Typography variant="body2">
                      📰 {new Date(event.newsDate).toLocaleDateString("en-GB")}
                    </Typography>
                  )}
                </Box> */}

                <Divider sx={{ my: 2 }} />

                {/* Full Story */}
                {/* <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "#1976d2",
                    borderBottom: "2px solid #1976d2",
                    display: "inline-block",
                  }}
                >
                   Full Story 
                </Typography> */}
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

          {/* Sidebar */}
          <Grid
            item
            xs={12}
            md={12}
            sx={{ flex: "0 0 25%", maxWidth: "25%", position: "sticky", top: 100, height: "calc(100vh - 120px)", overflowY: "auto" }}
          >
            <Typography variant="h6" gutterBottom
              sx={{ color: "#1976d2", textDecoration: "underline", fontWeight: "bold", cursor: "pointer" }}
            >
              {isHindi ? "अन्य महत्वपूर्ण सेवाएँ" : "Other Important Services"}
            </Typography>

            {otherLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : otherNews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {isHindi ? "कोई अन्य सेवा उपलब्ध नहीं है।" : "No other printing services available."}
              </Typography>
            ) : (
              <List disablePadding>
                {otherNews.map((item) => {
                  const title = isHindi
                    ? item.titleHindi || item.titleEnglish
                    : item.titleEnglish || item.titleHindi;
                  const thumb = item.imageUrl
                    ? `${import.meta.env.VITE_BASE_URL || ""}${item.imageUrl}`
                    : "https://placehold.co/120x80/FFDDC1/E94E77"; // Placeholder for thumbnail

                  return (
                    <ListItemButton
                      key={item.id}
                      component={Link}
                      // Navigate to the new detail page path
                      to={{ pathname: `/event/${item.id}` }}
                      // Pass state to avoid re-fetching on the next page
                      state={{ service: item }}
                      sx={{ mb: 1, borderRadius: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={thumb}
                          alt={title}
                          sx={{ width: 80, height: 55, mr: 1 }}
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
                          item.printDate ? (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.printDate).toLocaleDateString("en-GB")}
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

export default ActionPlanDetailsPage;
