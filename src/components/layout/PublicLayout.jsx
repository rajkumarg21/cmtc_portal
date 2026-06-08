// src/layout/PublicLayout.jsx

import TopAccessibilityBar from "./../sections/TopAccessibilityBar";
import Headbar from "./../layout/Headbar";
import Navbar from "./../layout/Navbar";
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import DefaultHeader from "./DefaultHeader";
import { Outlet } from 'react-router-dom';
import ServicesHeader from "./ServicesHeader";
import LogoSlider from "./LogoSlider";

const PublicLayout = () => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden', // ✅ prevents horizontal scroll on mobile
      }}
    >
      {/* ✅ Mobile responsive styles */}
     

      {/* ✅ Sticky container for both headers */}
      <div
        className="sticky-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          width: '100%',
        }}
      >
        <Navbar />
      </div>

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '100vw',
        }}
      >
        <Outlet />
      </main>

      <LogoSlider />
      <Footer showFull={true} />
    </div>
  );
};

export default PublicLayout;
