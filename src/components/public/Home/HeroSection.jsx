import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getAllCarouselSlidesPublic } from "../../../services/carouselService";

// Custom arrow components
const NextArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      right: 20,
      transform: "translateY(-50%)",
      zIndex: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
      color: "#fff",
      "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
    }}
  >
    <ArrowForwardIosIcon />
  </IconButton>
);

const PrevArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      left: 20,
      transform: "translateY(-50%)",
      zIndex: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
      color: "#fff",
      "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
    }}
  >
    <ArrowBackIosNewIcon />
  </IconButton>
);

export default function HeroSection() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    fade: true,
    nextArrow: <NextArrow />, // use custom
    prevArrow: <PrevArrow />, // use custom
  };

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await getAllCarouselSlidesPublic();
        const data = response.data;
        setSlides(data || []);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      {slides.length > 0 ? (
        <Slider {...settings}>
          {slides.map((slide, i) => (
            <Box
              key={i}
              sx={{
                height: "70vh",
                backgroundImage: `url("${import.meta.env.VITE_BASE_URL}${slide.imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >{slide.title && <>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  zIndex: 1,
                }}
              />
              <Box
                sx={{
                  position: "relative",
                  zIndex: 3,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    width: "700px",
                    height: "700px",
                    borderRadius: "50%",
                    background: "rgba(22,35,64,0.65)",
                    zIndex: 2,
                  }}
                />

                <Container
                  sx={{
                    position: "relative",
                    zIndex: 3,
                    textAlign: "center",
                    color: "#fff",
                    maxWidth: "700px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mb: 2,
                      opacity: 0.9,
                    }}
                  >
                    <SupportAgentIcon sx={{ fontSize: 18 }} />
                    <Typography variant="overline" sx={{ fontWeight: 500 }}>
                      {slide.title || "Welcome to CMTC CMS"}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: 500,
                      mx: "auto",
                      opacity: 0.85,
                      mb: 4,
                    }}
                  >
                    {slide.description ||
                      "Your central hub for information from Madhya Pradesh."}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      mt: 3,
                    }}
                  >
                    <Button
                      component={Link}
                      to={slide.link || "/news"}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        borderRadius: "50px",
                        px: 4,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        background: "linear-gradient(90deg, #ff4b2b, #ff416c)",
                        "&:hover": {
                          background: "linear-gradient(90deg, #ff6b4b, #ff638c)",
                        },
                      }}
                    >
                      {slide.buttonText || "Explore"}
                    </Button>
                  </Box>
                </Container>
              </Box>
            </>
              }
            </Box>
          ))}
        </Slider>
      ) : (
        <Typography align="center" sx={{ mt: 5, color: "gray" }}>
          No slides available
        </Typography>
      )}
    </Box>
  );
}
