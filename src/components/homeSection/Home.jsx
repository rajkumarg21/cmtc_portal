
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
  CardContent,List, ListItem, ListItemIcon, ListItemText 
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getFileSize } from "../../utils/fileUtils";
import { getPublishedTenders } from "../../services/tenderService";
import { getPublishedNewsArticles } from "../../services/newsService";
import { getAllCarouselSlidesPublic } from "../../services/carouselService";
import {getPublishedCirculars} from "../../services/circularService";
// Local fallback image from repo assets (ensures default slide exists)
//import srlmMain from "../../assets/images/mpmadhyamPics.png";
import { Link, useNavigate } from "react-router-dom";
import { getYoutubePublic } from "../../services/youtubeService";
import { getImportantLinks } from "../../services/importantLinkService.js";
import defaultBanner from "../../assets/images/DefaultBanner.png"
import { getPublicPhoto } from "../../services/photoService.js";
import GeoMap from "../map/GeoMap";
//import MpMap from "../map/MpMap";
import { getBackendFileUrl } from "../../utils/urlUtils";
import mpDistricts from "../../assets/map/mp-district.json";
//import L from "leaflet";


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


const Home = () => {
  const sliderRef = useRef(null);
  const [slides, setSlides] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [sizes, setSizes] = useState({});
  const [newsList, setNewsList] = useState([]);
  const [newsLetter,setNewsLetter] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [importantLinks, setImportantLinks] = useState([]);
  


useEffect(() => {
  (async () => {
    try {
      const data = await getPublicPhoto();  // NEW service
      const list = Array.isArray(data) ? data : data?.data || [];
      setPhotos(list.slice(0, 2));         // take first 2
    } catch (e) {
      console.error("Photo load error", e);
      setPhotos([]);
    }
  })();
}, []);


  /* ==========================
     FETCH SLIDES + ADD DEFAULT FIRST SLIDE
     ========================== */

useEffect(() => {
  (async () => {
    try {
      const data = await getPublishedNewsArticles();
      setNewsList(data);
    } catch (e) {
      console.error("Error loading news:", e);
      setNewsList([]);
    }
  })();
}, []);

 useEffect(() => {
  (async () => {
    try {
      const data = await getPublishedCirculars();
      setNewsLetter(data);
    } catch (e) {
      console.error("Error loading news:", e);
      setNewsLetter([]);
    }
  })();
}, []);

 useEffect(() => {
  const loadSlides = async () => {
    try {
      const res = await getAllCarouselSlidesPublic();

      const backendSlides =
        res.data?.data ||
        res.data?.content ||
        res.data ||
        [];

      setSlides(backendSlides);

    } catch (err) {
      console.error("Slider load error:", err);
      setSlides([]);
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

  useEffect(() => {
    (async () => {
      const data = await getPublishedTenders();
      setTenders(data);

     // fetch file size for each attachment
      const sizeMap = {};
      for (const t of data) {
        if (t.attachmentUrl) {
          sizeMap[t.id] = await getFileSize(t.attachmentUrl);
        }
      }
      setSizes(sizeMap);
    })();
  }, []);

  useEffect(() => {
  getYoutubePublic()
    .then((res) => {
      console.log("YT DATA:", res.data);
      setYoutubeVideos(res.data);
    })
    .catch((err) => {
      console.error("YouTube load error:", err);
      setYoutubeVideos([]);
    });
}, []);

useEffect(() => {
  (async () => {
    try {
       const data= await getImportantLinks();
      setImportantLinks(data);
    } catch (e) {
      console.error("Error loading news:", e);
      setImportantLinks([]);
    }
  })();
}, []);


  /* Slide URL formatter — FIXED */
const getSlideImageUrl = (slide) => {
  if (!slide?.imageUrl) return "";

  const url = slide.imageUrl.trim();

  // If already absolute
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // ALWAYS prefix backend base URL
  return `${import.meta.env.VITE_BASE_URL}${url}`;
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
  // if (!slides.length) {
  //   return (
  //     <Typography variant="h5" sx={{ textAlign: "center", mt: 5 }}>
  //       No slides available.
  //     </Typography>
  //   );
  // }

  /* ========================================================
     PAGE UI
     ======================================================== */
  return (
    <Box sx={{ backgroundColor: "#fff", overflow: "hidden" }}>

      {/* ==================== SLIDER WITH FALLBACK ==================== */}
              <Box className="home-slider-wrapper">
                {slides.length > 0 ? (
                  <Slider ref={sliderRef} {...bannerSettings}>
                    {slides.map((s, i) => (
                      <img
                        key={i}
                        src={getSlideImageUrl(s)}
                        className="home-slider-image"
                      />
                    ))}
                  </Slider>
                ) : (
                  <img
                    src={defaultBanner}
                    className="home-slider-image"
                    style={{ objectFit: "cover" }}
                    alt="Default Banner"
                  />
                )}
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

          {/* ⭐ LEADERS SECTION (FROM PUBLIC API) */}
              <Box sx={{ flex: 1, display: "flex", gap: 3 }}>
                 {photos.map((p) => (
                    <Card key={p.id} sx={{ width: 260, boxShadow: 4 }}>
                      
                      <img
                          src={`${import.meta.env.VITE_BASE_URL.replace(/\/$/, "")}${p.imageUrl}`}
                          alt={p.name}
                          style={{
                            width: "100%",
                            height: "240px",
                            objectFit: "cover",
                          }}
                      />
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography fontWeight={700}>{p.name}</Typography>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          {p.designation}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

        {/* SERVICES */}
              <Box
                sx={{
                  flex: 1,
                  border: "1px solid #00897b",   // 🔥 Add border
                  borderRadius: 2,               // 🔥 Rounded corners
                  p: 2,                          // 🔥 Padding inside the card
                  backgroundColor: "#fff",       // Optional: same as other cards
                  display: "flex",
                  flexDirection: "column",
                  gap: 1
                }}
              >
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
              {newsList.map((item) => (
  <Typography key={item.id} sx={{ mb: 1, fontSize: "0.95rem" }}>
    📄 {item.titleEnglish}
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
      <Box sx={{ backgroundColor: "#00897b", color: "#fff", p: 1 }}>
        Tenders
      </Box>
      {/* <Box sx={{ p: 2 }}>
        <List>
          {tenders.map((tender) => (
            <ListItem
              key={tender.id}
              button
              component="a"
              href={getBackendFileUrl(tender.attachmentUrl)}
              target="_blank"
            >
              <ListItemIcon>
                <PictureAsPdfIcon sx={{ color: "#d32f2f" }} />
              </ListItemIcon>
              <ListItemText
                primary={tender.titleEnglish}
                secondary={`File size: ${sizes[tender.id] || "Loading..."}`}
              />
            </ListItem>
          ))}
        </List>
      </Box> */}

      <Box
  sx={{
    p: 2,
    height: 250,
    overflow: "hidden",
    position: "relative",
  }}
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
>
  <Box
    sx={{
      position: "absolute",
      width: "100%",
      animation: isPaused ? "none" : "scrollTenderUp 12s linear infinite",
    }}
  >
    <List>
      {tenders.map((tender) => (
        <ListItem
          key={tender.id}
          button
          component="a"
          href={getBackendFileUrl(tender.attachmentUrl)}
          target="_blank"
          sx={{ cursor: "pointer" }}
        >
          <ListItemIcon>
            <PictureAsPdfIcon sx={{ color: "#d32f2f" }} />
          </ListItemIcon>

          <ListItemText
            primary={tender.titleEnglish}
            secondary={`File size: ${sizes[tender.id] || "Loading..."}`}
          />
        </ListItem>
      ))}
    </List>
  </Box>

  <style>
    {`
      @keyframes scrollTenderUp {
        0% { top: 100%; }
        100% { top: -100%; }
      }
    `}
  </style>
</Box>
    </Box>

   {/* MAP */}

<Box sx={{ flex: 1, border: "1px solid #00897b", borderRadius: 2 }}>
  <Box sx={{ backgroundColor: "#00897b", color: "#fff", p: 1 }}>
    District Selection
  </Box>

  {/* Replace IMG with GeoMap */}
  <Box sx={{ p: 2 }}>
    <GeoMap
      title="Districts of Madhya Pradesh"
      data={mpDistricts}
      height="390px"
      featureIdKey="dist_cd"
      featureNameKey="dist_nm_e"
      defaultColor="#BBDEFB"
      hoverColor="#64B5F6"
      strokeColor="#0D47A1"
      onFeatureClick={(district_name) => navigate(`/district/${district_name}`)}
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
                key={lnk.id}
                fullWidth
                component="a"
                href={lnk.url}
                target="_blank"
                rel="noopener noreferrer"
               
                sx={{
                  backgroundColor: i % 2 === 0 ? "#00695c" : "#f57c00",
                  color: "#fff",
                  fontWeight: 600,
                  justifyContent: "flex-start",
                  mt: 0.5
                }}
              >
                {lnk.title}
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
        {/* ======================= YOUTUBE SLIDER SECTION ======================= */}
            <Box
              sx={{
                flex: 1,
                border: "2px solid #d32f2f",
                borderRadius: "4px",
                minWidth: "300px",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Header */}
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

              {/* Slider Container */}
              <Box sx={{ p: 2, overflow: "hidden", position: "relative" }}>
                {youtubeVideos.length === 0 ? (
                  <Typography sx={{ textAlign: "center", py: 4, color: "#777" }}>
                    No videos available.
                  </Typography>
                ) : (
                  <Box className="yt-slider-track">
                    {youtubeVideos.map((v) => (
                      <a
                        key={v.id}
                        href={v.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="yt-card"
                      >
                        <img src={v.thumbnailUrl} alt={v.title} />
                        <Typography
                          sx={{
                            textAlign: "center",
                            mt: 1,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#444",
                          }}
                        >
                          {v.title}
                        </Typography>
                      </a>
                    ))}
                  </Box>
                )}
              </Box>

              {/* INLINE CSS */}
              <style>
                {`
                  .yt-slider-track {
                    display: flex;
                    gap: 20px;
                    animation: ytScroll 18s linear infinite;
                    width: max-content;
                  }

                  .yt-card {
                    min-width: 220px;
                    text-decoration: none;
                    color: #000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                  }

                  .yt-card img {
                    width: 220px;
                    height: 130px;
                    border-radius: 6px;
                    object-fit: cover;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                  }

                  .yt-slider-track:hover {
                    animation-play-state: paused;
                  }

                  @keyframes ytScroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                  }
                `}
              </style>
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

        {/* ===== Right: Newsletter (Dynamic) ===== */}
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
  {/* Header */}
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

<Box
  sx={{
    p: 2,
    flex: 1,
    height: 250,
    overflow: "hidden",
    position: "relative",
  }}
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
>
  {newsLetter.length === 0 ? (
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
      No newsletters available.
    </Typography>
  ) : (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        animation: isPaused ? "none" : "scrollUp 12s linear infinite",
      }}
    >
      {newsLetter.map((item) => (
        <Box
          key={item.id}
          sx={{
            mb: 2,
            pb: 1,
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
        
              onClick={() => {
                    const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
                    let filePath = item.attachmentUrl;
                    if (!filePath) {
                      alert("Attachment not found");
                      return;
                    }
                    // remove any leading slashes
                    filePath = filePath.replace(/^\/+/, "");
                    // if filepath already contains "files/", do NOT add extra "files"
                    if (filePath.startsWith("files/")) {
                      // correct final URL
                      window.open(`${backendBaseUrl}/${filePath}`, "_blank");
                    } else {
                      // normal path
                      window.open(`${backendBaseUrl}/files/${filePath}`, "_blank");
                    }
                  }}
         >
          <Typography sx={{ fontWeight: 600, color: "#333" }}>
            {item.titleEnglish}
          </Typography>
        </Box>
      ))}
    </Box>
  )}

  <style>
    {`
      @keyframes scrollUp {
        0% { top: 100%; }
        100% { top: -100%; }
      }
    `}
  </style>
</Box>





  {/* Footer */}
  <Box
    sx={{
      borderTop: "1px solid #00897b",
      textAlign: "center",
      p: 1,
      backgroundColor: "#f8f8f8",
    }}
  >
    <Button
      size="small"
      sx={{ color: "#f57c00" }}
      component={Link}
      to="/circulars"
    >
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

      <style>
          {`
            .home-slider-wrapper {
              width: 100%;
              height: 400px !important;
              overflow: hidden;
            }

            /* DO NOT set height on slick-slide or slick-track */

            .home-slider-image {
              width: 100% !important;
              height: 400px !important;
              object-fit: cover !important;
            }
          `}
</style>



    </Box>
  );
};

export default Home;
