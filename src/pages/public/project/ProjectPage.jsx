import React, { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";

export default function ProjectPage() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const featuredItems = [
    {
      title: "Sample Featured Act and Rules Section ",
      description: "A brief summary of the featured Livelihood Activities. Click to read more.",
      buttonText: "Read More",
      image: newsbg,
      linkTo: "/project",
    },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh", // Full screen height
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: { xs: 2, md: 6 },
        py: 10,
        backgroundImage: `url(${newsbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Animated Heading */}
        <Typography
          variant="h3"
          align="center"
          fontWeight={900}
          sx={{
            mb: 6,
            textTransform: "uppercase",
            letterSpacing: 3,
            animation: "fadeInDown 1.5s ease",
            position: "relative",
            display: "inline-block",
            "&::after": {
              content: '""',
              display: "block",
              width: "60%",
              height: "4px",
              margin: "8px auto 0",
              background: theme.palette.primary.main,
              borderRadius: "2px",
              animation: "expand 1.5s ease forwards",
            },
          }}
        >
          Act and Rules Section
        </Typography>

        <Grid container spacing={6} justifyContent="center">
          {featuredItems.map(({ title, description, buttonText,linkTo }, i) => (
            <Grid item xs={12} md={6} key={title}>
              <Card
                elevation={5}
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  height: 340,
                  backdropFilter: "blur(8px)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  transition: "transform 0.35s ease, box-shadow 0.35s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  },
                }}
              >
                <CardActionArea
                  sx={{
                    height: "100%",
                    position: "relative",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <Box sx={{ position: "relative", zIndex: 2, p: 4, width: "100%" }}>
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
                component={RouterLink}
                to={linkTo}
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#ba2e00",
                  color: "#ba2e00",
                  "&:hover": {
                    backgroundColor: "#ba2e00",
                    color: "#fff",
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

    
    </Box>
  );
}
