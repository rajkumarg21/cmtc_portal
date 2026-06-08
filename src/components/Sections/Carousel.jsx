import React from 'react';
import Slider from 'react-slick';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
  { src: '/files/download6.jpg', title: 'Stunning Landscape' },
  { src: '/files/download3.jpeg', title: 'Stunning Landscape' },
  { src: '/files/download2.jpeg', title: 'Stunning Landscape' },
  { src: '/files/download4.jpeg', title: 'Stunning Landscape' },
  { src: '/files/download5.jpeg', title: 'Mountain View' },
];


// Custom Arrow Components
const NextArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      top: '50%',
      right: 10,
      zIndex: 2,
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0,0,0,0.4)',
      color: 'white',
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
    }}
  >
    <ArrowForwardIos />
  </IconButton>
);

const PrevArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      top: '50%',
      left: 10,
      zIndex: 2,
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0,0,0,0.4)',
      color: 'white',
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
    }}
  >
    <ArrowBackIos />
  </IconButton>
);

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    lazyLoad: 'ondemand',
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        }
      }
    ]
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5, position: 'relative' }}>
      <Slider {...settings}>
        {images.map((item, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            {/* Image with hover zoom effect */}
            <Box
              component="img"
              src={`${import.meta.env.VITE_BASE_URL}${item.src}`}
              alt={item.title}
              loading="lazy"
              sx={{
                width: '100%',
                height: { xs: 250, sm: 400 },
                borderRadius: 2,
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.03)'
                }
              }}
            />
            {/* Overlay Title */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                p: 2,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}
            >
              <Typography variant="h6">{item.title}</Typography>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default Carousel;
