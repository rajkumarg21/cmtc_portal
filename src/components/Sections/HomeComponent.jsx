import {useState,useEffect } from 'react';
// import HeroSection from '../sections/HeroSection';
// import ContentSection from '../sections/ContentSection';
// import ServicesSection from '../sections/ServicesSection';
// import Carousel from '../sections/Carousel';
// import Marqoo from '../sections/Marqoo';
import {Box} from "@mui/material";
import HeroSection from "../../components/public/Home/HeroSection";
import InfoSection from "../../components/public/Home/InfoSection";
import FeaturedContent from "../../components/public/Home/FeaturedContent";
import ServicesSection from "../../components/public/Home/ServicesSection";
import Marqoo from './Marqoo';
import {getAllPublishedMarqueeItems } from "../../services/marqueeItemService";

const HomeComponent = () => {
  const [marqueeItems, setMarqueeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const newsItems = [
    "Breaking News 1",
    "Important Circular 2",
    "Update: RTI Submission 3",
    "New Gallery Added 4"
  ];
  const fetchMarqueeItems = async () => {

    
    setLoading(true);
    setError('');
    try {
      const response = await getAllPublishedMarqueeItems(); 
      setMarqueeItems(response.data);
    } catch (err) {
      setError('Failed to fetch marquee items: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching marquee items:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchMarqueeItems(); }, []);

  return (
    <>
      <Box>
        {/* <Marquee items={newsItems} /> */}
        <Marqoo marqueeItems={marqueeItems}/>
        <HeroSection />
        {/* <Carousel /> */}

        <InfoSection />
        <FeaturedContent />
        <ServicesSection />
      </Box>
    </>
  );
};

export default HomeComponent;
