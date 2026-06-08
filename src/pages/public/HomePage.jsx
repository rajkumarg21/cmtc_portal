import React from "react";


import HeroSection from "../../components/public/Home/HeroSection";
import InfoSection from "../../components/public/Home/InfoSection";
import FeaturedContent from "../../components/public/Home/FeaturedContent";
import Marquee from "../../components/public/Home/Marquee";
import Marqoo from "../../components/sections/Marqoo";
import ServicesSection from "../../components/public/Home/ServicesSection";


const HomePage = () => {
  const newsItems = [
    "Breaking News 1",
    "Important Circular 2",
    "Update: RTI Submission 3",
    "New Gallery Added 4"
  ];
  return (
    <>
      {/*Hero Section */}
      {/* <Marquee items={newsItems} /> */}
      <Marqoo />
      <HeroSection />
      {/* <Carousel /> */}

      <InfoSection />
      <FeaturedContent />
      <ServicesSection />
     
    </>
  );
};

export default HomePage;
