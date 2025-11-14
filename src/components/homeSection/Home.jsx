
/* ==========================
   FULL UPDATED HomePage.jsx
   WITH DEFAULT FIRST SLIDE
   ========================== */

import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardContent
} from "@mui/material";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { getAllCarouselSlidesPublic } from "../../services/carouselService";
import { Link, useNavigate } from "react-router-dom";

/* ==========================
   STATIC SERVICE BUTTONS
   ========================== */
const serviceList = [
  { title: "SHG Products", color: "#00695c", path: "/advertisementSectionList" },
  { title: "Livelihood Activities", color: "#f57c00", path: "/filmSectionList" },
  { title: "Act and Rules", color: "#00695c", path: "/projectSectionList" },
  { title: "Success Stories", color: "#f57c00", path: "/eventSectionList" },
  { title: "Policies", color: "#00695c", path: "/printingSectionList" },
  { title: "Annual Action Plan", color: "#f57c00", path: "/advertisementSectionList" },
];

/* ==========================
   STATIC NEWS ITEMS
   ========================== */
const newsItems = [
  "📄 List of MCLF [Advertisements]",
  "📄 MCLF Selection Criteria [Advertisements]",
  "📄 Requirement of resources in cluster association [Advertisements]",
  "📄 SHG Product Promotion Initiatives",
  "📄 Rural Development Updates",
];

/* ==========================
   STATIC IMPORTANT LINKS
   ========================== */
const importantLinks = [
  "MODEL CLF DATA ENTRY",
  "VIDYUT SAKHI",
  "PFMS",
  "IPRP",
  "CADER REGISTRATION & ICRP FEEDING PORTAL",
  "BC SAKHI AND CBO",
  "1-NEW SHG REGISTRATION ,2-BANK SAKHI PORTAL,3-DRY RASHON PORTAL",
  "RURAL SOFT",
  "NRLM MIS PORTAL",
  "DAY-NRLM WEBSITE & OTHER STATE SRLM WEBSITES",
];

/* ========================================================
   MAIN COMPONENT
   ======================================================== */
const Home = () => {
  const sliderRef = useRef(null);
  const [slides, setSlides] = useState([]);
  const [leaderSlides, setLeaderSlides] = useState([]);  // ⭐ NEW STATE
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ==========================
     FETCH SLIDES + ADD DEFAULT FIRST SLIDE
     ========================== */
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await getAllCarouselSlidesPublic();
        const backendSlides = res.data || [];   // ⭐ DO NOT SLICE

        // ⭐ Default first slide (public folder)
        const defaultSlide = {
          imageUrl: "/images/srlm_main.png",
        };

        // ⭐ Slider = static first + ALL backend slides
        // setSlides([defaultSlide, ...backendSlides]);
        setSlides([defaultSlide]);   // ⭐ ONLY default slide will show


        // ⭐ Leaders = FIRST TWO backend slides ONLY
        setLeaderSlides(backendSlides.slice(0, 2));
      } catch (err) {
        setSlides([{ imageUrl: "/images/srlm_main.png" }]);
        setLeaderSlides([]);
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, []);

  /* Auto-start autoplay after load */
  useEffect(() => {
    if (slides.length && sliderRef.current) {
      setTimeout(() => sliderRef.current.slickPlay(), 1000);
    }
  }, [slides]);

  /* Slide URL formatter */
  const getSlideImageUrl = (slide) => {
  if (!slide?.imageUrl) return "";
  if (slide.imageUrl.startsWith("http")) return slide.imageUrl;
  if (slide.imageUrl.startsWith("/")) return slide.imageUrl;
  return `${import.meta.env.VITE_BASE_URL}${slide.imageUrl}`;
};

  /* ==========================
     SLIDER CONFIG
     ========================== */
  const bannerSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    cssEase: "ease-in-out",
    pauseOnHover: false,
    arrows: false,
  };

  /* ==========================
     LOADING UI
     ========================== */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ==========================
     EMPTY SLIDER UI
     ========================== */
  if (!slides.length) {
    return (
      <Typography variant="h5" sx={{ textAlign: "center", mt: 5 }}>
        No slides available.
      </Typography>
    );
  }

  /* ========================================================
     PAGE UI
     ======================================================== */
  return (
    <Box sx={{ backgroundColor: "#fff", overflow: "hidden" }}>

      {/* ==================== SLIDER (Height reduced to 300px) ==================== */}
      <Box>
        <Slider ref={sliderRef} {...bannerSettings}>
          {slides.map((s, i) => (
            <img
              key={i}
              src={getSlideImageUrl(s)}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
              }}
            />
          ))}
        </Slider>
      </Box>

      {/* ==================== INTRO TEXT ==================== */}
      <Container maxWidth="md" sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#e57300" }}>
          Madhya Pradesh State Rural Livelihoods Mission - MPSRLM
        </Typography>

        <Typography sx={{ mt: 2, mb: 4, fontSize: "1.1rem" }}>
          The mandate of MoRD, GoI is rural poverty alleviation…
        </Typography>

        <Button variant="contained" to="/mpsrlm" component={Link} sx={{ backgroundColor: "#f44336" }}>
          Read More
        </Button>
      </Container>

      {/* ======================================================
         SECTION 1: LEADERS + SERVICES + NEWS
         ====================================================== */}
      <Container maxWidth="xl" sx={{ display: "flex", gap: 4, flexWrap: "wrap", py: 5 }}>

        {/* ⭐ UPDATED LEADERS SECTION */}
        <Box sx={{ flex: 1, display: "flex", gap: 3 }}>
          {leaderSlides.map((img, i) => (
            <Card key={i} sx={{ width: 260, boxShadow: 4 }}>
              <img
                src={getSlideImageUrl(img)}
                style={{ width: "100%", height: "240px", objectFit: "cover" }}
              />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography fontWeight={700}>
                  {i === 0 ? "Shri Narendra Modi" : "Dr. Mohan Yadav"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {i === 0
                    ? "Hon’ble Prime Minister of India"
                    : "Hon’ble Chief Minister of MP"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* SERVICES */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {serviceList.map((srv, i) => (
            <Button
              key={i}
              fullWidth
              onClick={() => navigate(srv.path)}
              sx={{
                backgroundColor: srv.color,
                color: "white",
                fontWeight: 600,
              }}
            >
              {srv.title}
            </Button>
          ))}
        </Box>

        {/* NEWS */}
        <Box sx={{ flex: 1, border: "1px solid #00695c", borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ backgroundColor: "#00695c", color: "#fff", p: 1 }}>
            News
          </Box>

          <Box sx={{ height: "320px", overflow: "hidden", position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                animation: "scrollInside 15s linear infinite",
                p: 2,
              }}
            >
              {newsItems.map((n, i) => (
                <Typography key={i} sx={{ mb: 1 }}>
                  {n}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box sx={{ textAlign: "right", p: 1 }}>
            <Button size="small" component={Link} to="/news">
              View All
            </Button>
          </Box>
        </Box>

        <style>
          {`
            @keyframes scrollInside {
              0% { top: 100%; }
              100% { top: -100%; }
            }
          `}
        </style>

      </Container>

      {/* ======================================================
         SECTION 2: TENDERS + MAP + IMPORTANT LINKS
         ====================================================== */}
      <Container maxWidth="xl" sx={{ display: "flex", gap: 4, py: 5, flexWrap: "wrap" }}>

        {/* TENDERS */}
        <Box sx={{ flex: 1, border: "1px solid #00897b", borderRadius: 2 }}>
          <Box sx={{ backgroundColor: "#00897b", color: "#fff", p: 1 }}>Tenders</Box>
          <Box sx={{ p: 2 }}>
            📄 Regarding taking commercial/institutional space on rent…
          </Box>
        </Box>

        {/* MAP */}
        <Box sx={{ flex: 1, border: "1px solid #00897b", borderRadius: 2 }}>
          <Box sx={{ backgroundColor: "#00897b", color: "#fff", p: 1 }}>
            District Selection
          </Box>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2e/Madhya_Pradesh_map.png"
              style={{ width: "100%", height: 290, objectFit: "contain" }}
            />
          </Box>
        </Box>

        {/* IMPORTANT LINKS */}
        <Box sx={{ flex: 1, border: "1px solid #00897b", borderRadius: 2 }}>
          <Box sx={{ backgroundColor: "#00897b", color: "#fff", p: 1 }}>
            Important Links
          </Box>

          <Box>
            {importantLinks.map((lnk, i) => (
              <Button
                key={i}
                fullWidth
                sx={{
                  backgroundColor: i % 2 === 0 ? "#00695c" : "#f57c00",
                  color: "#fff",
                  fontWeight: 600,
                  justifyContent: "flex-start",
                  mt: 0.5
                }}
              >
                {lnk}
              </Button>
            ))}
          </Box>
        </Box>

      </Container>

      {/* =================== YOUTUBE + PROGRAMS + NEWSLETTER SECTION =================== */}
      <Container
        maxWidth="xl"
        sx={{
          py: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: 4,
          flexWrap: "wrap",
        }}
      >

        {/* ===== Left: YouTube ===== */}
        <Box
          sx={{
            flex: 1,
            border: "2px solid #d32f2f",
            borderRadius: "4px",
            minWidth: "300px",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              px: 2,
              py: 1,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <img src="https://img.icons8.com/color/20/youtube-play.png" />
            Youtube
          </Box>

          <Box
            sx={{
              p: 2,
              textAlign: "center",
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "#eee",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "4px",
              }}
            >
              <img
                src="https://icons.iconarchive.com/icons/google/noto-emoji-objects/256/62998-broken-image-icon.png"
                alt="Not Found"
                width="60"
              />
            </Box>
          </Box>
        </Box>

        {/* ===== Middle: MP-SRLM Programs ===== */}
        <Box
          sx={{
            flex: 1,
            border: "2px solid #f57c00",
            borderRadius: "4px",
            minWidth: "300px",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#f57c00",
              color: "#fff",
              px: 2,
              py: 1,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <img src="https://img.icons8.com/ios-filled/20/news.png" />
            MP- SRLM Programs
          </Box>

          <Box sx={{ p: 2, flex: 1 }}>
            {[
              "SOCIAL MOBILIZATION",
              "FINANCIAL INCLUSION",
              "LIVELIHOODS PROMOTION",
              "TRAINING AND CAPACITY BUILDING",
              "RSETI",
            ].map((item, index) => (
              <Typography
                key={index}
                sx={{
                  p: 1,
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ color: "green", fontWeight: "bold" }}>✔</span>
                {item}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* ===== Right: Newsletter ===== */}
        <Box
          sx={{
            flex: 1,
            border: "2px solid #00897b",
            borderRadius: "4px",
            minWidth: "300px",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#00897b",
              color: "#fff",
              px: 2,
              py: 1,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <img src="https://img.icons8.com/ios-filled/20/news.png" />
            NewsLetter
          </Box>

          <Box sx={{ p: 2, flex: 1 }}>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#555",
                fontSize: "0.95rem",
              }}
            >
              <img src="https://img.icons8.com/office/20/news.png" />
              News Letter will be available soon.
            </Typography>
          </Box>

          <Box
            sx={{
              borderTop: "1px solid #00897b",
              textAlign: "center",
              p: 1,
              backgroundColor: "#f8f8f8",
            }}
          >
            <Button size="small" sx={{ color: "#f57c00" }}>
              View All
            </Button>
          </Box>
        </Box>
      </Container>

      {/* CSS for News Scroll */}
      <style>
        {`
        @keyframes scrollUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        `}
      </style>

    </Box>
  );
};

export default Home;



