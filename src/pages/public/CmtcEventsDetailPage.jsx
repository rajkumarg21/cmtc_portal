import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  getPublicEventById,
} from "../../services/cmtcEventsService";

const placeholderEvent = {
  titleHindi: "कोई CMTC कार्यक्रम शीर्षक उपलब्ध नहीं",
  titleEnglish: "No CMTC Event Title Available",
  summaryHindi: "कोई सारांश उपलब्ध नहीं।",
  summaryEnglish: "No CMTC event summary available.",
  contentHindi: "<p>कोई सामग्री उपलब्ध नहीं।</p>",
  contentEnglish: "<p>No CMTC event content available.</p>",
  imageUrl: null,
  publishedAt: new Date().toISOString(),
};

const CmtcEventDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const preloadedEvent = location.state?.article;

  const { i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  const [eventItem, setEventItem] = useState(placeholderEvent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        if (preloadedEvent && String(preloadedEvent.id) === String(id)) {
          if (!mounted) return;
          setEventItem({ ...placeholderEvent, ...preloadedEvent });
          setLoading(false);
          return;
        }

        const data = await getPublicEventById(id);
        if (!mounted) return;
        setEventItem(data ? { ...placeholderEvent, ...data } : placeholderEvent);
      } catch (err) {
        console.error("Error fetching CMTC Event:", err);
        if (mounted) setEventItem(placeholderEvent);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEvent();
    return () => (mounted = false);
  }, [id, preloadedEvent,isHindi]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ p: 4 }}>
        <Grid
          container
          spacing={4}
          sx={{ flexWrap: "nowrap", alignItems: "flex-start" }}
        >
          {/* MAIN CONTENT */}
          <Grid
            item
            sx={{
              flex: "0 0 100%",
              maxWidth: "80%",
              mx: "auto",            // ✅ center the card
            }}
          >
            <Card elevation={6} sx={{ borderRadius: 3 }}>
              {/* Hero */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center", 
                  pt: 2,
                }}
              >
                <CardMedia
                  component="img"
                  image={
                    eventItem.imageUrl
                      ? `${import.meta.env.VITE_BASE_URL || ""}${eventItem.imageUrl}`
                      : "https://placehold.co/800x400/F0F7FF/60A5FA?text=CMTC+Event"
                  }
                  sx={{
                    height: 260,             
                    maxWidth: 420,
                    borderRadius: 2,
                    objectFit: "cover",
                  }}
                />
              </Box>

              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {eventItem.title}
                </Typography>

                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  {eventItem.summary}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    "& p": { mb: 2, lineHeight: 1.8 },
                    "& img": { maxWidth: "100%", borderRadius: 2 },
                  }}
                  dangerouslySetInnerHTML={{ __html: eventItem.content }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CmtcEventDetailsPage;
