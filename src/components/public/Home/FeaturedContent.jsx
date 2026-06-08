import React, { useEffect, useState } from "react";
import {
   getLatestCircular,
} from '../../../services/circularService';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Button,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import newsbg from "../../../assets/images/news-bg.jpg";
import circularbg from "../../../assets/images/circular-bg.jpg";


export default function FeaturedContent() {
  const theme = useTheme();
  const [latestCircular, setLatestCircular] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  
const handleViewCircular = async () => {
  try {
    const response = await getLatestCircular(); 
    // Make sure your API returns something like { pdfUrl: "http://..." }
    if (response?.attachmentUrl) {
      const fullUrl = `${API_BASE_URL}${response.attachmentUrl}`;
      window.open(fullUrl, "_blank"); // opens in new tab
    } else {
      alert("No circular PDF found!");
    }
  } catch (err) {
    console.error("Error fetching latest circular:", err);
    alert("Failed to load circular.");
  }
};
        const featuredItems = [
  {
    title: "Sample Featured News Title",
    description: "A brief summary of the featured news article. Click to read more.",
    link: "/news/1",
    buttonText: "Read More",
    image:newsbg, // demo image
  },
{
      title: latestCircular?.title || "Important Circular",
      description: "Details about the most recently published circular or order.",
     link: latestCircular ? `${API_BASE_URL}${latestCircular.attachmentUrl}` : null, // PDF file
      buttonText: "View Details",
      image: circularbg
    },
];
  return (
    <Box sx={{ mb: 12, px: { xs: 2, md: 4 } }}>
      <Typography
        variant="h5"
        fontWeight={700}
        align="center"
        mb={6}
        sx={{ letterSpacing: 1, color: theme.palette.text.primary }}
      >
        Featured Content
      </Typography>

      <Grid container spacing={6} justifyContent="center">
        {featuredItems.map(({ title, description, link, buttonText, image }, i) => (
          <Grid item xs={12} md={6} key={title}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                width:500,
                height: 340,
                transition: "transform 0.35s ease, box-shadow 0.35s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardActionArea
                sx={{
                  height: "100%",
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  "&:hover .card-image": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                {/* Background image */}
                <Box
                  className="card-image"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform 0.5s ease",
                    zIndex: 0,
                  }}
                />

                {/* Subtle gradient overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgb(0 0 0 / 91%), rgba(0, 0, 0, 0.35))",
                    zIndex: 1,
                  }}
                />

                {/* Content */}
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    color: "#fff",
                    p: 4,
                    width: "100%",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 3, color: "rgba(255,255,255,0.85)" }}
                  >
                    {description}
                  </Typography>
                  <Button
  {...(buttonText === "View Details"
    ? {
        onClick: handleViewCircular, // Call API for latest circular
      }
    : {
        component: RouterLink,
        to: link, // Normal navigation
      })}
  variant="contained"
  endIcon={<ArrowForwardIcon />}
  sx={{
    borderRadius: 3,
    px: 3,
    py: 1,
    fontWeight: 600,
    textTransform: "none",
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  }}
>
  {buttonText}
</Button>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
