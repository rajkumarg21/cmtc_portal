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
import { getPublishedPrintings } from "../../services/printingService";
import PageHeader from "../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

// Mock implementation for the new service function
// NOTE: In a real app, you would define this in a separate file like "../../services/printingService"
const mockGetPublishedPrintings = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Using the structure from the sample response
  const data = [
    {
      "id": 1,
      "titleHindi": "छपाई सेवा नवाचार और गति",
      "titleEnglish": "Printing Service: Innovation and Speed",
      "summaryHindi": "डिजिटल और ऑफसेट प्रिंटिंग की व्यापक रेंज, उच्च गुणवत्ता वाले परिणाम सुनिश्चित करती है।",
      "summaryEnglish": "A comprehensive range of digital and offset printing, ensuring high-quality results.",
      "imageUrl": "/uploads/printing_press.png",
      "author": "Tech Print Inc.",
      "printDate": "2025-10-01T09:00:00",
      "status": "PUBLISHED",
      "isFeatured": true,
      "createdAt": "2025-09-28T10:00:00",
      "updatedAt": "2025-10-07T11:00:00"
    },
    {
      "id": 2,
      "titleHindi": "पर्यावरण-अनुकूल छपाई समाधान",
      "titleEnglish": "Eco-Friendly Printing Solutions",
      "summaryHindi": "पुनर्नवीनीकरण सामग्री और टिकाऊ प्रक्रियाओं का उपयोग करके पर्यावरण के अनुकूल प्रिंटिंग।",
      "summaryEnglish": "Environmentally conscious printing using recycled materials and sustainable processes.",
      "imageUrl": "/uploads/eco_print.png",
      "author": "Green Ink Co.",
      "printDate": "2025-09-15T14:30:00",
      "status": "PUBLISHED",
      "isFeatured": false,
      "createdAt": "2025-09-10T15:00:00",
      "updatedAt": null
    },
    {
      "id": 3,
      "titleHindi": "त्वरित बिज़नेस कार्ड छपाई",
      "titleEnglish": "Express Business Card Printing",
      "summaryHindi": "एक दिन में बिज़नेस कार्ड प्राप्त करें। बेहतरीन डिज़ाइन और उच्च गुणवत्ता।",
      "summaryEnglish": "Get your business cards in one day. Excellent design and high quality.",
      "imageUrl": null, // Using null for testing fallback image
      "author": "Quick Print Services",
      "printDate": "2025-10-05T11:00:00",
      "status": "PUBLISHED",
      "isFeatured": true,
      "createdAt": "2025-10-03T18:00:00",
      "updatedAt": "2025-10-08T09:00:00"
    },
  ];

  // Filter to only include "PUBLISHED" items, as suggested by the original service name
  return data.filter(item => item.status === "PUBLISHED");
};


// Default fallback printing services
const defaultPrintingServices = [
  {
    id: "101",
    titleEnglish: "Standard Document Printing",
    summaryEnglish:
      "High-speed black & white and color printing for all document types.",
    printDate: new Date(),
    author: "Service Desk 1",
    imageUrl: null,
  },
  {
    id: "102",
    titleEnglish: "Large Format Poster Service",
    summaryEnglish:
      "A0 to A3 poster printing on various paper stocks for presentations and events.",
    printDate: new Date(),
    author: "Design Studio",
    imageUrl: null,
  },
  {
    id: "103",
    titleEnglish: "Custom T-Shirt Printing",
    summaryEnglish:
      "Personalized apparel printing using screen printing and direct-to-garment techniques.",
    printDate: new Date(),
    author: "Apparel Print Co.",
    imageUrl: null,
  },
];

const ListPrintingServicePage = () => {
  const navigate = useNavigate();
  // Renamed state variables for clarity
  const [printingServices, setPrintingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t,i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  const getLocalizedTitle = (film) => {
    return isHindi ? (film.titleHindi || film.titleEnglish) : (film.titleEnglish || film.titleHindi);
  };

  const getLocalizedSummary = (film) => {
    return isHindi ? (film.summaryHindi || film.summaryEnglish) : (film.summaryEnglish || film.summaryHindi);
  };


  useEffect(() => {
    const fetchPrintings = async () => {
      try {
        // Use the new service function name
        const data = await getPublishedPrintings();
        // const data = await mockGetPublishedPrintings(); // Using mock for standalone

        // Check if data is an array and has content
        if (Array.isArray(data) && data.length > 0) {
          setPrintingServices(data);
        } else {
          setPrintingServices(defaultPrintingServices);
        }
      } catch (err) {
        // Updated error message
        setError("Failed to fetch printing services. Showing sample data.");
        console.error("Error fetching printings:", err);
        setPrintingServices(defaultPrintingServices);
      } finally {
        setLoading(false);
      }
    };
    fetchPrintings();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ background: "linear-gradient(180deg, #f0f7ff, #ffffff)" }}>
      {/* Updated PageHeader title */}
     <PageHeader title={t('sections.prints')} />

      <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} justifyContent="center">
          {/* Iterating over printingServices */}
          {printingServices.map((service) => (
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
                  // Updated routing link to /printing-service/:id
                  onClick={() => navigate(`/printingSectionDetails/${service.id}`, { state: { service } })}
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
                        : "https://placehold.co/600x300/E0E7FF/3B82F6?text=Printing+Service" // Updated placeholder text
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

                    {/* Chips - Updated label based on available service fields */}
                    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {/* {service.printDate && ( // Changed from publishedAt to printDate
                        <Chip
                          size="small"
                          label={`Date: ${new Date(service.printDate).toLocaleDateString("en-GB")}`}
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
                          navigate(`/printingSectionDetails/${service.id}`, { state: { service } });
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

export default ListPrintingServicePage;