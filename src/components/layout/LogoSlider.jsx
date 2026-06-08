import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IMAGE_URL } from "../../utils/constants";

const logos = [
  {
    link: "https://aajeevika.gov.in/",
    img: `${IMAGE_URL}/images/NRLM.jpg`,
    alt: "Aajeevika",
  },
  {
    link: "https://ddugky.info/",
    img: `${IMAGE_URL}/images/DDUGKY-Logo.jpg`,
    alt: "DDU-GKY",
  },
  {
    link: "http://cmhelpline.mp.gov.in/",
    img: `${IMAGE_URL}/images/cmhelpline1.png`,
    alt: "CM Helpline",
  },
  {
    link: "http://mpedistrict.gov.in/Public/index.aspx",
    img: `${IMAGE_URL}/images/lokseva.png`,
    alt: "Lokseva",
  },
  {
    link: "https://www.india.gov.in/",
    img: `${IMAGE_URL}/images/lokseva.png`,
    alt: "India Portal",
  },
  {
    link: "http://www.domain.gov.in/",
    img: `${IMAGE_URL}/images/investmp1.png`,
    alt: "Invest MP",
  },
  {
    link: "http://www.mpindustry.gov.in",
    img: `${IMAGE_URL}/images/mpdc1.jpg`,
    alt: "MPDC",
  },
  {
    link: "http://mpedistrict.gov.in/Public/index.aspx",
    img: `${IMAGE_URL}/images/lokseva1.jpg`,
    alt: "Lokseva",
  },
];

const LogoSlider = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 5 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 576, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="logo-slider-container">
      <Slider {...settings}>
        {logos.map((item, index) => (
          <div key={index} className="logo-box">
            <a href={item.link} target="_blank" rel="noreferrer">
              <img src={item.img} alt={item.alt} />
            </a>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default LogoSlider;
