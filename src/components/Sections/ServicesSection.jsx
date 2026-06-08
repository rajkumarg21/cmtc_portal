import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Icons
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import MovieIcon from "@mui/icons-material/Movie";
import PublicIcon from "@mui/icons-material/Public";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Track RTI
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"; // Gallery
import ArticleIcon from "@mui/icons-material/Article"; 
import GavelIcon from "@mui/icons-material/Gavel"; // RTI

const ServicesSection = () => {
  const { t, i18n } = useTranslation();

  const serviceIcons = [

    {
      label: t("services.filmProduction"),
      icon: <MovieIcon fontSize="large" />,
      color: "#ede7f6",
      link: "",
    },
    {
      label: t("services.circularsOrders"),
      icon: <ArticleIcon fontSize="large" />,
      color: "#fff3e0",
      link: "/circulars",
    },
    {
      label: t("services.feedback"),
      icon: <PublicIcon fontSize="large" />,
      color: "#fce4ec",
      link: "/feedback",
    },
    {
      label: t("services.rti"),
      icon: <GavelIcon fontSize="large" />,
      color: "#f3e5f5",
      link: "/rti/submit",
    },
    {
      label: t("services.trackRti"),
      icon: <VisibilityIcon fontSize="large" />,
      color: "#f3e5f5",
      link: "/rti/track",
    },
    {
      label: t("services.gallery"),
      icon: <PhotoLibraryIcon fontSize="large" />,
      color: "#e1f5fe",
      link: "/gallery",
    },{
      label: t("services.contact"),
      icon: <PhotoLibraryIcon fontSize="large" />,
      color: "#e1f5fe",
      link: "/contact",
    },
  ];

  return (
    <Box>
      {/* Title */}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          color: "#2c3e50",
          textTransform: "uppercase",
          letterSpacing: 2,
          borderBottom: "3px solid #3498db",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pb: 1,
          pt: 1,
        }}
      >
        {t("services.title")}
      </Typography>

      {/* Services Grid */}
      <Grid
        container
        spacing={3}
        alignItems="center"
        justifyContent="space-evenly"
        sx={{
          flex: 1,
          mt: { xs: 4, md: 0 },
          backgroundColor: "#ffffff",
          p: 2,
        }}
      >
        {serviceIcons.map((item, idx) => (
          <Grid
            item
            xs="auto"
            key={idx}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Link
              to={item.link}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: item.color,
                  borderRadius: "50%",
                  width: 110,
                  height: 110,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                {item.icon}
                <Typography variant="caption" fontWeight={600} mt={1}>
                  {item.label}
                </Typography>
              </Box>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServicesSection;
