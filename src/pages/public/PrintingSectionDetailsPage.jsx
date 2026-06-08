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
} from "@mui/material";
// Assuming the service functions are available at this path
import {
  getPublishedPrintingById,
  getLatestPublishedPrintings, // New service function for the sidebar
} from "../../services/printingService"; 
import PageHeader from "../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

// Mock for getLatestPublishedPrintings (Remove this once the real service is implemented)
const mockGetLatestPublishedPrintings = async (count) => {
    // Simulated data based on the structure provided in the original prompt
    await new Promise(resolve => setTimeout(resolve, 300));
    const items = [
        { id: 10, titleHindi: "नई सेवा १", titleEnglish: "New Service 1", summaryEnglish: "Summary 1", imageUrl: "/uploads/print1.png", printDate: "2025-10-06T00:00:00" },
        { id: 11, titleHindi: "नई सेवा २", titleEnglish: "New Service 2", summaryEnglish: "Summary 2", imageUrl: "/uploads/print2.png", printDate: "2025-10-05T00:00:00" },
        { id: 12, titleHindi: "नई सेवा ३", titleEnglish: "New Service 3", summaryEnglish: "Summary 3", imageUrl: "/uploads/print3.png", printDate: "2025-10-04T00:00:00" },
        { id: 13, titleHindi: "नई सेवा ४", titleEnglish: "New Service 4", summaryEnglish: "Summary 4", imageUrl: null, printDate: "2025-10-03T00:00:00" },
        { id: 14, titleHindi: "नई सेवा ५", titleEnglish: "New Service 5", summaryEnglish: "Summary 5", imageUrl: "/uploads/print5.png", printDate: "2025-10-02T00:00:00" },
        { id: 15, titleHindi: "नई सेवा ६", titleEnglish: "New Service 6", summaryEnglish: "Summary 6", imageUrl: "/uploads/print6.png", printDate: "2025-10-01T00:00:00" },
    ].filter(item => item.id !== 1); // Exclude a mock ID 1 for testing
    return items.slice(0, count);
};


const placeholderPrinting = {
  titleHindi: "कोई शीर्षक उपलब्ध नहीं",
  titleEnglish: "No Service Title Available",
  summaryHindi: "कोई सारांश उपलब्ध नहीं।",
  summaryEnglish: "No service summary available.",
  printDate: new Date().toISOString(),
  author: "Unknown",
  imageUrl: null,
  contentHindi: "<p>कोई सामग्री उपलब्ध नहीं।</p>",
  contentEnglish: "<p>No service content available. This printing detail is missing body text.</p>",
};

const OTHER_PRINTING_COUNT = 5; // number of sidebar items

const PrintingSectionDetailsPage = () => {
  const location = useLocation();
  // Renamed from preloadedArticle to preloadedPrinting
  const preloadedPrinting = location.state?.service; 
  const { id } = useParams();
  // Renamed from article to printingItem
  const [printingItem, setPrintingItem] = useState(placeholderPrinting); 
  const [loading, setLoading] = useState(true);
  // Renamed from otherNews to otherPrintings
  const [otherPrintings, setOtherPrintings] = useState([]);
  const [otherLoading, setOtherLoading] = useState(true);
  const {t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHindi = i18n.language === "hi";

  // Fetch main printing item when id changes (uses router state if available)
  useEffect(() => {
    let mounted = true;
    const fetchPrinting = async () => {
      setLoading(true);
      try {
        // If router passed item via state and it matches this id, use it to avoid network call
        if (preloadedPrinting && String(preloadedPrinting.id) === String(id)) {
          if (!mounted) return;
          setPrintingItem({ ...placeholderPrinting, ...preloadedPrinting });
          setLoading(false);
          return;
        }

        // otherwise fetch from server
        const data = await getPublishedPrintingById(id);
        if (!mounted) return;
        if (data) {
          setPrintingItem({ ...placeholderPrinting, ...data });
        } else {
          setPrintingItem(placeholderPrinting);
        }
      } catch (err) {
        console.error("Error fetching printing item:", err);
        if (mounted) setPrintingItem(placeholderPrinting);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPrinting();
    return () => {
      mounted = false;
    };
  }, [id, preloadedPrinting]);

  // Fetch latest other printing items (exclude current id)
  useEffect(() => {
    let mounted = true;
    const fetchOther = async () => {
      setOtherLoading(true);
      try {
        const candidateCount = Math.max(
          OTHER_PRINTING_COUNT + 2,
          OTHER_PRINTING_COUNT
        );
        // Use the new service function
        const items = await getLatestPublishedPrintings(candidateCount); 
        // const items = await mockGetLatestPublishedPrintings(candidateCount); // Use mock for testing
        
        if (!mounted) return;
        if (Array.isArray(items)) {
          const filtered = items.filter(
            (n) => String(n.id) !== String(id)
          );
          setOtherPrintings(filtered.slice(0, OTHER_PRINTING_COUNT));
        } else {
          setOtherPrintings([]);
        }
      } catch (err) {
        console.error("Error fetching latest printings:", err);
        if (mounted) setOtherPrintings([]);
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

  // Updated variable names to reflect printingItem
  const displayTitle = isHindi
    ? printingItem.titleHindi || printingItem.titleEnglish
    : printingItem.titleEnglish || printingItem.titleHindi;
  const displaySummary = isHindi
    ? printingItem.summaryHindi || printingItem.summaryEnglish
    : printingItem.summaryEnglish || printingItem.summaryHindi;
  const displayContent = isHindi
    ? printingItem.contentHindi || printingItem.contentEnglish
    : printingItem.contentEnglish || printingItem.contentHindi;

  if (!printingItem || (!displayTitle && !displaySummary)) {
    return (
        <Box sx={{ p: 4 }}>
            <PageHeader title="Service Detail" />
            <Typography variant="h6" color="error" mt={4}>
                {isHindi ? "नीतियाँ सेवा विवरण नहीं मिला।" : "Printing service details not found."}
            </Typography>
            <Button variant="outlined" sx={{mt: 2}} onClick={() => navigate('/printings')}>
                {isHindi ? "नीतियाँ सेवाओं पर वापस जाएँ" : "Go back to Printing Services"}
            </Button>
        </Box>
    );
  }

  return (
    <Box>
      <PageHeader title={t('sections.printing_Section')} />
      <Box sx={{ padding: 4 }}>
        <Grid
          container
          spacing={4}
          sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "flex-start" }}
        >
          {/* Main Content - 75% */}
          <Grid item xs={12} md={12} sx={{ flex: "0 0 75%", maxWidth: "75%" }}>
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
                    printingItem.imageUrl
                      ? `${import.meta.env.VITE_BASE_URL || ""}${
                          printingItem.imageUrl
                        }`
                      : "https://placehold.co/800x400/FFDDC1/E94E77?text=Printing+Detail" // Updated Placeholder
                  }
                  alt={displayTitle}
                  sx={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/800x400/FFDDC1/E94E77?text=Printing+Detail";
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
                  {printingItem.printDate && (
                    <Typography variant="body2">
                      📅 {new Date(printingItem.printDate).toLocaleDateString("en-GB")}
                    </Typography>
                  )}
                  {printingItem.author && (
                    <Typography variant="body2">✍️ {printingItem.author}</Typography>
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
              {isHindi ? "अन्य महत्वपूर्ण सेवाएँ" : "Other Important Services"}
            </Typography>
            
            {otherLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : otherPrintings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {isHindi ? "कोई अन्य सेवा उपलब्ध नहीं है।" : "No other printing services available."}
              </Typography>
            ) : (
              <List disablePadding>
                {otherPrintings.map((item) => {
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
                      to={{ pathname: `/printingSectionDetails/${item.id}` }} 
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

export default PrintingSectionDetailsPage;