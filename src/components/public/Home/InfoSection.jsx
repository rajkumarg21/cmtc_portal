import React from "react";
import { Grid, Paper, Typography, Button, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InfoIcon from "@mui/icons-material/Info";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import DescriptionIcon from "@mui/icons-material/Description";
import { Link as RouterLink } from "react-router-dom";

const cardStyles = [
  { icon: <AnnouncementIcon sx={{ fontSize: 40, mb: 1, color: "#ba2e00" }} /> },
  { icon: <DescriptionIcon sx={{ fontSize: 40, mb: 1, color: "#ba2e00" }} /> },
  { icon: <InfoIcon sx={{ fontSize: 40, mb: 1, color: "#ba2e00" }} /> },
];

export default function InfoSection() {
  const cards = [
    {
      title: "Latest Updates",
      description: "Stay informed with the most recent news and announcements.",
      linkText: "Read More",
      linkTo: "/news",
    },
    {
      title: "Important Circulars",
      description: "Access official circulars and government orders.",
      linkText: "Browse Circulars",
      linkTo: "/circulars",
    },
    {
      title: "About  CMTC",
      description: "Learn about our mission and services.",
      linkText: "Learn More",
      linkTo: "/pages/about-us",
    },
  ];

  return (
    <Box sx={{ mb: 8 }}>
      <Grid
        container
        spacing={4}
        sx={{ display: "flex", justifyContent: "center", pt: 4 }}
      >
        {cards.map(({ title, description, linkText, linkTo }, index) => (
          <Grid item xs={12} md={6} lg={4} key={title}>
            <Paper
              elevation={3}
              sx={{
                p: 5,
                borderRadius: 3,
                background: "#fff",
                color: "inherit",
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #ba2e00",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              {cardStyles[index].icon}

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ color: "#222" }}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                mb={4}
                sx={{ maxWidth: 300, color: "text.secondary" }}
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
                {linkText}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
