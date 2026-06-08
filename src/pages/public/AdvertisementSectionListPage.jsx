import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
// Assuming the service function is now available at this path
import { getPublishedAdvertisements } from "../../services/advertisementSectionService";
import PageHeader from "../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

// Mock implementation for the Advertisement service function
// NOTE: In a real app, you would define this in a separate file like "../../services/advertisementService"
const mockGetPublishedAdvertisements = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Using a structure similar to the printing/news response
  const data = [
    {
      "id": 21,
      "titleHindi": "डिजिटल विज्ञापन पैकेज",
      "titleEnglish": "Digital Ad Campaign Package",
      "summaryHindi": "सोशल मीडिया और सर्च इंजन पर लक्षित विज्ञापन के लिए प्रीमियम पैकेज।",
      "summaryEnglish": "Premium package for targeted advertising on social media and search engines.",
      "imageUrl": "/uploads/digital_ad.png",
      "author": "AdPro Marketing",
      "publishDate": "2025-10-08T10:00:00", // Using publishDate for a time-sensitive service
      "status": "PUBLISHED",
      "isFeatured": true,
      "createdAt": "2025-10-01T10:00:00",
      "updatedAt": "2025-10-08T11:00:00"
    },
    {
      "id": 22,
      "titleHindi": "रेडियो और पॉडकास्ट प्रचार",
      "titleEnglish": "Radio and Podcast Promotion",
      "summaryHindi": "स्थानीय रेडियो स्टेशनों और लोकप्रिय पॉडकास्ट पर अपनी पहुंच बढ़ाएँ।",
      "summaryEnglish": "Expand your reach on local radio stations and popular podcasts.",
      "imageUrl": "/uploads/radio_ad.png",
      "author": "Broadcast Solutions",
      "publishDate": "2025-09-20T14:30:00",
      "status": "PUBLISHED",
      "isFeatured": false,
      "createdAt": "2025-09-15T15:00:00",
      "updatedAt": null
    },
    {
      "id": 23,
      "titleHindi": "आउटडोर बिलबोर्ड विज्ञापन",
      "titleEnglish": "Outdoor Billboard Advertising",
      "summaryHindi": "शहर के प्रमुख स्थानों पर उच्च-यातायात बिलबोर्ड विज्ञापन स्लॉट।",
      "summaryEnglish": "High-traffic billboard ad slots in prime city locations.",
      "imageUrl": null, // Testing fallback image
      "author": "StreetView Ads",
      "publishDate": "2025-10-01T11:00:00",
      "status": "PUBLISHED",
      "isFeatured": true,
      "createdAt": "2025-09-28T18:00:00",
      "updatedAt": "2025-10-05T09:00:00"
    },
  ];

  // Filter to only include "PUBLISHED" items
  return data.filter(item => item.status === "PUBLISHED");
};


// Default fallback advertisement services
const defaultAdvertisementServices = [
  {
    id: "201",
    titleEnglish: "Basic Web Banner Ad",
    summaryEnglish:
      "Display your brand on our high-traffic website with a standard banner.",
    publishDate: new Date(),
    author: "Webmaster",
    imageUrl: null,
  },
  {
    id: "202",
    titleEnglish: "Video Ad Production",
    summaryEnglish:
      "Full-service video creation and distribution for online platforms.",
    publishDate: new Date(),
    author: "Creative Team",
    imageUrl: null,
  },
  {
    id: "203",
    titleEnglish: "Print Magazine Ad",
    summaryEnglish:
      "A quarter-page advertisement slot in our monthly industry magazine.",
    publishDate: new Date(),
    author: "Magazine Editor",
    imageUrl: null,
  },
];

const ListAdvertisementServicePage = () => {
  const navigate = useNavigate();
  // Renamed state variables for clarity
  const [advertisementServices, setAdvertisementServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const { i18n } = useTranslation();
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const getLocalizedTitle = (film) => {
    return isHindi ? (film.titleHindi || film.titleEnglish) : (film.titleEnglish || film.titleHindi);
  };

  const getLocalizedSummary = (film) => {
    return isHindi ? (film.summaryHindi || film.summaryEnglish) : (film.summaryEnglish || film.summaryHindi);
  };

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        // Use the new service function name
        const data = await getPublishedAdvertisements();
        // const data = await mockGetPublishedAdvertisements(); // Use mock for testing

        // Check if data is an array and has content
        if (Array.isArray(data) && data.length > 0) {
          setAdvertisementServices(data);
        } else {
          setAdvertisementServices(defaultAdvertisementServices);
        }
      } catch (err) {
        // Updated error message
        setError("Failed to fetch advertisement services. Showing sample data.");
        console.error("Error fetching HSG PRODUCTS :", err);
        setAdvertisementServices(defaultAdvertisementServices);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvertisements();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ background: "linear-gradient(180deg, #f0f7ff, #ffffff)" }}>
     <PageHeader title={t('sections.advertisements')} />
      <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} justifyContent="center">
          {/* Iterating over advertisementServices */}
          {advertisementServices.map((service) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
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
                  // Updated routing link to /advertisementSectionDetails/:id
                  onClick={() => navigate(`/advertisementSectionDetails/${service.id}`, { state: { service } })}
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
                      service.imageUrl
                        ? `${import.meta.env.VITE_BASE_URL}${service.imageUrl}`
                        : "https://placehold.co/600x300/F0F7FF/60A5FA?text=Ad+Service" // Updated placeholder text color
                    }
                    alt={service.titleEnglish || service.titleHindi}
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
                      {/* Using titleEnglish/titleHindi */}
                      {getLocalizedTitle(service)}
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
                      {/* Using summaryEnglish/summaryHindi */}
                      {getLocalizedSummary(service)}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Chips - Updated label based on available service fields (using publishDate) */}
                    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {/* {service.publishDate && ( // Changed from printDate to publishDate
                        <Chip
                          size="small"
                          label={`Date: ${new Date(service.publishDate).toLocaleDateString("en-GB")}`}
                          color="primary"
                          variant="outlined"
                        />
                      )} */}
                      {/* {service.author && (
                        <Chip
                          size="small"
                          label={`By ${service.author}`}
                          color="secondary"
                          variant="outlined"
                        />
                      )} */}
                      {service.isFeatured && (
                        <Chip
                          size="small"
                          label="Featured"
                          color="error" // Highlight featured items
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* View Details Button */}
                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent CardActionArea double-handling (defensive)
                          // Updated routing link
                          navigate(`/advertisementSectionDetails/${service.id}`, { state: { service } });
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

export default ListAdvertisementServicePage;