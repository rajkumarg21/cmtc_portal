import React from "react";
import { Link } from "react-router-dom";
import { Grid, Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';
import FeedbackIcon from '@mui/icons-material/Feedback';
import EmailIcon from '@mui/icons-material/Email';

const services = [
  {
    title: "RTI Application",
    description: "Submit your Right to Information requests.",
    icon: <ArticleIcon sx={{ fontSize: 40, color: "#fff" }} />,
    link: "/rti/submit",
    bg: "linear-gradient(135deg, #2196f3, #21cbf3)"
  },
  {
    title: "Track RTI Status",
    description: "Check the status of your submitted RTI.",
    icon: <SearchIcon sx={{ fontSize: 40, color: "#fff" }} />,
    link: "/rti/track",
    bg: "linear-gradient(135deg, #4caf50, #81c784)"
  },
  {
    title: "Provide Feedback",
    description: "Share your valuable suggestions.",
    icon: <FeedbackIcon sx={{ fontSize: 40, color: "#fff" }} />,
    link: "/feedback",
    bg: "linear-gradient(135deg, #9c27b0, #ba68c8)"
  },
  {
    title: "Contact Us",
    description: "Get in touch with the CMTC team.",
    icon: <EmailIcon sx={{ fontSize: 40, color: "#fff" }} />,
    link: "/contact",
    bg: "linear-gradient(135deg, #ff9800, #ffb74d)"
  },
];

export default function ServicesSection() {
  return (
    <Box component="section" sx={{ py: 12, px: 2, backgroundColor: "#f5f5f5" }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 8 }}
      >
        Our Services
      </Typography>

      <Grid container spacing={6} justifyContent="center">
        {services.map((service, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={3}>
            <Card
              component={Link}
              to={service.link}
              sx={{
                borderRadius: 3,
                overflow: "visible",
                boxShadow: 2,
                textDecoration: "none",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: 6,
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              <CardActionArea sx={{ p: 4, textAlign: "center", position: "relative" }}>
                {/* Icon Circle */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: service.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    boxShadow: 3,
                  }}
                >
                  {service.icon}
                </Box>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 1, color: "#333" }}
                >
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
