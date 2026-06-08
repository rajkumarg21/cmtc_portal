import React, { useEffect, useState } from "react";
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
// Assuming the service functions are available at this path
import {
  getPublishedAdvertisementById,
  getLatestPublishedAdvertisements, // New service function for the sidebar
} from "../../services/advertisementSectionService"; 
import PageHeader from "../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

// Mock for getLatestPublishedAdvertisements (Remove this once the real service is implemented)
const mockGetLatestPublishedAdvertisements = async (count) => {
    // Simulated data based on the structure provided in the original prompt
    await new Promise(resolve => setTimeout(resolve, 300));
    const items = [
        // Using 'publishDate' field as per the advertisement list page
        { id: 24, titleHindi: "डिजिटल ऑफर १", titleEnglish: "Digital Offer 1", summaryEnglish: "Summary A", imageUrl: "/uploads/ad1.png", publishDate: "2025-10-07T00:00:00" },
        { id: 25, titleHindi: "डिजिटल ऑफर २", titleEnglish: "Digital Offer 2", summaryEnglish: "Summary B", imageUrl: "/uploads/ad2.png", publishDate: "2025-10-06T00:00:00" },
        { id: 26, titleHindi: "प्रिंट मीडिया ३", titleEnglish: "Print Media 3", summaryEnglish: "Summary C", imageUrl: "/uploads/ad3.png", publishDate: "2025-10-05T00:00:00" },
        { id: 27, titleHindi: "सोशल मीडिया ४", titleEnglish: "Social Media 4", summaryEnglish: "Summary D", imageUrl: null, publishDate: "2025-10-04T00:00:00" },
        { id: 28, titleHindi: "टीवी विज्ञापन ५", titleEnglish: "TV Commercial 5", summaryEnglish: "Summary E", imageUrl: "/uploads/ad5.png", publishDate: "2025-10-03T00:00:00" },
        { id: 29, titleHindi: "रेडियो स्पॉट ६", titleEnglish: "Radio Spot 6", summaryEnglish: "Summary F", imageUrl: "/uploads/ad6.png", publishDate: "2025-10-02T00:00:00" },
    ].filter(item => item.id !== 21); // Exclude a mock ID 21 for testing
    return items.slice(0, count);
};


const placeholderAdvertisement = {
  titleHindi: "कोई विज्ञापन शीर्षक उपलब्ध नहीं",
  titleEnglish: "No Advertisement Title Available",
  summaryHindi: "कोई सारांश उपलब्ध नहीं।",
  summaryEnglish: "No advertisement summary available.",
  publishDate: new Date().toISOString(), // Use publishDate
  author: "Unknown Agency",
  imageUrl: null,
  contentHindi: "<p>कोई सामग्री उपलब्ध नहीं।</p>",
  contentEnglish: "<p>No advertisement content available. This detail page is missing body text.</p>",
};

const OTHER_ADVERTISEMENT_COUNT = 5; // number of sidebar items

const AdvertisementSectionDetailsPage = () => {
  const location = useLocation();
  // Renamed for Advertisement context
  const preloadedAdvertisement = location.state?.service; 
  const { id } = useParams();
  // Renamed for Advertisement context
  const [advertisementItem, setAdvertisementItem] = useState(placeholderAdvertisement); 
  const [loading, setLoading] = useState(true);
  // Renamed for Advertisement context
  const [otherAdvertisements, setOtherAdvertisements] = useState([]);
  const [otherLoading, setOtherLoading] = useState(true);
  const {t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language === "hi";

  // Fetch main advertisement item when id changes (uses router state if available)
  useEffect(() => {
    let mounted = true;
    const fetchAdvertisement = async () => {
      setLoading(true);
      try {
        // If router passed item via state and it matches this id, use it to avoid network call
        if (preloadedAdvertisement && String(preloadedAdvertisement.id) === String(id)) {
          if (!mounted) return;
          setAdvertisementItem({ ...placeholderAdvertisement, ...preloadedAdvertisement });
          setLoading(false);
          return;
        }

        // otherwise fetch from server
        const data = await getPublishedAdvertisementById(id);
        if (!mounted) return;
        if (data) {
          setAdvertisementItem({ ...placeholderAdvertisement, ...data });
        } else {
          setAdvertisementItem(placeholderAdvertisement);
        }
      } catch (err) {
        console.error("Error fetching advertisement item:", err);
        if (mounted) setAdvertisementItem(placeholderAdvertisement);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAdvertisement();
    return () => {
      mounted = false;
    };
  }, [id, preloadedAdvertisement]);

  // Fetch latest other advertisement items (exclude current id)
  useEffect(() => {
    let mounted = true;
    const fetchOther = async () => {
      setOtherLoading(true);
      try {
        const candidateCount = Math.max(
          OTHER_ADVERTISEMENT_COUNT + 2,
          OTHER_ADVERTISEMENT_COUNT
        );
        // Use the new service function
        const items = await getLatestPublishedAdvertisements(candidateCount); 
        // const items = await mockGetLatestPublishedAdvertisements(candidateCount); // Use mock for testing
        
        if (!mounted) return;
        if (Array.isArray(items)) {
          const filtered = items.filter(
            (n) => String(n.id) !== String(id)
          );
          setOtherAdvertisements(filtered.slice(0, OTHER_ADVERTISEMENT_COUNT));
        } else {
          setOtherAdvertisements([]);
        }
      } catch (err) {
        console.error("Error fetching latest advertisements:", err);
        if (mounted) setOtherAdvertisements([]);
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

  // Updated variable names to reflect advertisementItem
  const displayTitle = isHindi
    ? advertisementItem.titleHindi || advertisementItem.titleEnglish
    : advertisementItem.titleEnglish || advertisementItem.titleHindi;
  const displaySummary = isHindi
    ? advertisementItem.summaryHindi || advertisementItem.summaryEnglish
    : advertisementItem.summaryEnglish || advertisementItem.summaryHindi;
  const displayContent = isHindi
    ? advertisementItem.contentHindi || advertisementItem.contentEnglish
    : advertisementItem.contentEnglish || advertisementItem.contentHindi;

  if (!advertisementItem || (!displayTitle && !displaySummary)) {
    return (
        <Box sx={{ p: 4 }}>
            <PageHeader title="Service Detail" />
            <Typography variant="h6" color="error" mt={4}>
                {isHindi ? "HSG PRODUCTS विवरण नहीं मिला।" : "HSG PRODUCTS service details not found."}
            </Typography>
            {/* Assuming a route for listing advertisements exists */}
            <Button variant="outlined" sx={{mt: 2}} onClick={() => navigate('/advertisements')}> 
                {isHindi ? "HSG PRODUCTS पर वापस जाएँ" : "Go back to HSG PRODUCTS Services"}
            </Button>
        </Box>
    );
  }

  return (
    <Box>
           <PageHeader title={t('sections.advertisement_section')} />
      <Box sx={{ padding: 4 }}>
        <Grid
          container
          spacing={4}
          sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "flex-start" }}
        >
          {/* Main Content - 75% */}
          <Grid item xs={12} md={12} size={12} sx={{ flex: "0 0 75%", maxWidth: "75%" }}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {/* Hero Image */}
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="350"
                  image={
                    advertisementItem.imageUrl
                      ? `${import.meta.env.VITE_BASE_URL || ""}${
                          advertisementItem.imageUrl
                        }`
                      : "https://placehold.co/800x400/F0F7FF/60A5FA?text=Advertisement+Detail" // Updated Placeholder
                  }
                  alt={displayTitle}
                  sx={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/800x400/F0F7FF/60A5FA?text=Advertisement+Detail";
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    color: "#fff",
                    p: 2,
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {displayTitle}
                  </Typography>
                </Box>
              </Box>

              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontStyle: "italic" }}
                >
                  {displaySummary}
                </Typography>
                {/* <Box display="flex" gap={2} mb={2} color="text.secondary">
                  {advertisementItem.publishDate && ( 
                    <Typography variant="body2">
                      📅 {new Date(advertisementItem.publishDate).toLocaleDateString("en-GB")}
                    </Typography>
                  )}
                  {advertisementItem.author && (
                    <Typography variant="body2">✍️ {advertisementItem.author}</Typography>
                  )}
                </Box> */}
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    color: "text.primary",
                    "& p": { mb: 2, lineHeight: 1.7 },
                    "& img": { maxWidth: "100%", borderRadius: "8px" },
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
              {isHindi ? "अन्य महत्वपूर्ण विज्ञापन" : "Other Important HSG PRODUCTS"}
            </Typography>
            
            {otherLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : otherAdvertisements.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {isHindi ? "कोई अन्य विज्ञापन सेवा उपलब्ध नहीं है।" : "No other HSG PRODUCTS services available."}
              </Typography>
            ) : (
              <List disablePadding>
                {otherAdvertisements.map((item) => {
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
                      // Navigate to the advertisement detail page path
                      to={{ pathname: `/advertisementSectionDetails/${item.id}` }} 
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
                          item.publishDate ? ( // Using publishDate
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.publishDate).toLocaleDateString("en-GB")}
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

export default AdvertisementSectionDetailsPage;