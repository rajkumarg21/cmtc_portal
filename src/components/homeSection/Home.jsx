import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress, // Added for loading indicator
} from "@mui/material";
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import mpMadhyamBuilding from "./../../assets/images/madhyam_pic2.jpg";
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const services = [
  {
    icon: "📄",
    title_hi: "रोजगार और निर्माण",
    desc_hi: "साप्ताहिक ‘रोजगार और निर्माण’ में मुख्यतः रोजगार संबंधित विज्ञापन, करियर और प्रतियोगी परीक्षाओं से संबंधित जानकारी प्रकाशित की जाती है। इसमें राज्य शासन, राज्य निगम के उपक्रम, भारत सरकार के उपक्रमों के विज्ञापनों का प्रकाशन किया जाता है।",
    btn_hi: "और जाने",
    title_en: "Rojgar Aur Nirman",
    desc_en: "The weekly ‘Rojgar Aur Nirman’ primarily publishes employment-related advertisements, career, and competitive exam information. It includes advertisements from the State Government, State Corporation undertakings, and Government of India undertakings.",
    btn_en: "Read More",
    link_to: "/rojgarAndNirman"
  },
  {
    icon: "🎬",
    title_hi: "फिल्म",
    desc_hi: "जनकल्याणकारी योजनाओं के प्रचार हेतु म.प्र. माध्यम में फिल्म शाखा कार्यरत है, जो वृत्तचित्र, टी.वी. स्पॉट्स एवं वीडियो प्रोडक्शन का निर्माण और प्रचारण करती है। अब तक कई राष्ट्रीय पुरस्कार प्राप्त फिल्में बनाई जा चुकी हैं।",
    btn_hi: "और जाने",
    title_en: "Film",
    desc_en: "The Film branch at M.P. Madhyam handles the publicity of public welfare schemes, producing and broadcasting documentaries, TV spots, and video productions. Several national award-winning films have been made to date.",
    btn_en: "Read More",
    link_to: "/filmSectionList"
  },
  {
    icon: "📁",
    title_hi: "परियोजना",
    desc_hi: "परियोजना शाखा द्वारा राज्य शासन के विभिन्न विभागों के लिये आउटडोर पब्लिसिटी, होर्डिंग, यूनिपोल, डिजिटल वॉल पेंटिंग, डिजिटल फोटो प्रिंटिंग आदि का कार्य किया जाता है।",
    btn_hi: "और जाने",
    title_en: "Project",
    desc_en: "The Project branch carries out work like outdoor publicity, hoardings, unipoles, digital wall painting, digital photo printing, etc., for various departments of the State Government.",
    btn_en: "Read More",
    link_to: "/projectSectionList"
  },
  {
    icon: "📢",
    title_hi: "विज्ञापन एजेंसी",
    desc_hi: "विज्ञापन शाखा द्वारा राज्य शासन के विभिन्न विभागों एवं संस्थाओं के विज्ञापन प्रकाशित किए जाते हैं। म.प्र. माध्यम राज्य शासन की एजेंसी के रूप में कार्य करती है।",
    btn_hi: "और जाने",
    title_en: "Advertising Agency",
    desc_en: "The Advertisement branch publishes advertisements for various departments and institutions of the State Government. M.P. Madhyam acts as an official agency for the State Government.",
    btn_en: "Read More",
    link_to: "/advertisementSectionList"
  },
  {
    icon: "🎤",
    title_hi: "इवेंट",
    desc_hi: "राज्य शासन के विभिन्न विभागों द्वारा आयोजित कार्यक्रमों का आयोजन एवं प्रबंधन इवेंट शाखा द्वारा किया जाता है।",
    btn_hi: "और जाने",
    title_en: "Event",
    desc_en: "The organization and management of events held by various departments of the State Government are handled by the Event branch.",
    btn_en: "Read More",
    link_to: "/eventSectionList"
  },
  {
    icon: "🖨️",
    title_hi: "मुद्रण",
    desc_hi: "मुद्रण शाखा द्वारा विभागीय पुस्तकें, मासिक पत्रिकाएं, फ्लेक्स, पोस्टर, ब्रोशर आदि का मुद्रण किया जाता है।",
    btn_hi: "और जाने",
    title_en: "Printing",
    desc_en: "The Printing branch handles the printing of departmental books, monthly magazines, flex, posters, brochures, etc.",
    btn_en: "Read More",
    link_to: "/printingSectionList"
  },
];

const HomePage = () => {
  const sliderRef = useRef(null);
  const [isInactive, setIsInactive] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const inactivityTimeout = 6000; // 6 seconds
  const autoplayInterval = 3000; // 3 seconds
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const lastActivityRef = useRef(Date.now()); // ✅ define it here
  const isInactiveRef = useRef(false);
  const { t } = useTranslation();


  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await getAllCarouselSlidesPublic();
        const data = response.data;
        setSlides(data || []);
      } catch (error) {
        console.error("Error fetching slides:", error);
        // Optionally, set slides to an empty array or default list on error
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Combine static and dynamic slides for rendering
  // The structure of dynamic slides is assumed to be { id, imageUrl }
  const allSlides = [
    { id: 'static-0', imageUrl: mpMadhyamBuilding, isStatic: true }, // Static first slide
    ...slides.map(s => ({ id: s.id, imageUrl: s.imageUrl, isStatic: false }))
  ];
  const getSlideImageUrl = (slide) => {
    // 1. If it's the static slide or already a full URL, return it directly.
    if (slide.isStatic || slide.imageUrl.startsWith('http')) {
      return slide.imageUrl;
    }
    // 2. If it's a dynamic relative path (e.g., /uploads/image.jpg), prefix it.
    // NOTE: This assumes VITE_BASE_URL is correctly defined and the image exists there.
    return `${import.meta.env.VITE_BASE_URL}${slide.imageUrl}`;
  };

  useEffect(() => {
    const resetTimer = () => {
      lastActivityRef.current = Date.now();

      if (isInactiveRef.current) {
        isInactiveRef.current = false;
        setIsInactive(false);
        sliderRef.current?.slickGoTo(0, true); // Force reset to first slide
        sliderRef.current?.slickPause(); // stop autoplay
      }
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > inactivityTimeout) {
        isInactiveRef.current = true;
        setIsInactive(true);
      }
    }, 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, []);


  // Inactivity and Autoplay Logic (kept the same, assuming it's working for you)
  useEffect(() => {
    const resetTimer = () => {
      setLastActivity(Date.now());
      if (isInactive) {
        setIsInactive(false);
        // Go back to first slide when user becomes active again
        sliderRef.current?.slickGoTo(0);
        // If autoplay is active on inactivity, pause it on activity
        sliderRef.current?.slickPause();
      }
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > inactivityTimeout) {
        setIsInactive(true);
      }
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [lastActivity, isInactive, inactivityTimeout]);

  // Control autoplay manually
  useEffect(() => {
    let sliderTimer;
    if (isInactive) {
      // Start autoplay only if there are slides to show
      if (allSlides.length > 1) {
        sliderTimer = setInterval(() => {
          sliderRef.current?.slickNext();
        }, autoplayInterval);
      }
    } else {
      clearInterval(sliderTimer);
    }
    return () => clearInterval(sliderTimer);
  }, [isInactive, autoplayInterval, allSlides.length]);


  const bannerSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false, // manual autoplay control
    pauseOnHover: false,
    lazyLoad: 'ondemand',
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Only render the slider if there's at least one slide (the static one)
  if (allSlides.length === 0) {
    // Handle the case where the static image isn't even showing (though it should be hardcoded)
    return <Typography variant="h5" sx={{ p: 4, textAlign: 'center' }}>No slides available.</Typography>;
  }

  return (
    <Box sx={{ overflowX: "hidden", position: "relative" }}>
      {/* Maroon Sub Navbar */}


      {/* Hero Section with Services Overlay */}
      <Box sx={{ position: "relative" }}>
        <Slider ref={sliderRef} {...bannerSettings}>
          {allSlides.map((slide, index) => (
            <Box key={slide.id} sx={{ position: "relative" }}>
              <img
                src={getSlideImageUrl(slide)}
                alt={`banner-${index}`}
                style={{
                  width: "100%",
                  height: "600px",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Only show services overlay on the first slide */}
              {index === 0 && (
                <Grid
                  container
                  spacing={3}
                  sx={{
                    position: "absolute",
                    top: "55%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "95%", md: "90%" },
                    maxHeight: { xs: "625px", sm: "none" }, // 500px on mobile, no limit on larger screens
                    overflowY: { xs: "auto", sm: "visible" }, // scrollable on mobile, default on bigger screens
                  }}
                >
                  {services.map((s, i) => (
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <Link to={s.link_to}>

                        <Card
                          sx={{
                            px: 1,
                            background: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                            borderRadius: "24px",
                            minHeight: "220px",
                            textAlign: "center",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                          }}
                        >
                          <CardContent>

                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                              {s.icon} {(isHindi && s.title_hi) ? s.title_hi : s.title_en}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
                            {(isHindi && s.desc_hi) ? s.desc_hi : s.desc_en}
                          </Typography>
                          <Button
                            component={Link}
                            to={s.link_to}
                            variant="contained"
                            sx={{
                              background: "#fff",
                              color: "#000",
                              borderRadius: "25px",
                              px: 3,
                              py: 0.5,
                              fontWeight: 600,
                              "&:hover": { background: "#e0e0e0" },
                            }}
                          >
                            {(isHindi && s.btn_hi) ? s.btn_hi : s.btn_en}                          </Button>
                          </CardContent>
                        </Card>
                      </Link>

                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ))}
        </Slider>
      </Box>
    </Box >
  );
};

export default HomePage;
