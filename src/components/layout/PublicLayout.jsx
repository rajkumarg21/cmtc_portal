// src/layout/PublicLayout.jsx

// import Footer from './Footer';      // Assumes you have a Footer component
import TopAccessibilityBar from "./../homeSection/TopAccessibilityBar";
//import Header2 from "./../layout/Header2";
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import DefaultHeader from "./DefaultHeader";
import { Outlet } from 'react-router-dom';
import ServicesHeader from "./ServicesHeader";
const PublicLayout = () => {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* Top Navigation */}

      {/* <DefaultHeader /> */}
      <TopAccessibilityBar />

      {/* ✅ Sticky container for both headers */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#fff", // prevents transparency during scroll
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <DefaultHeader />
        {/* <Header2 /> */}
        {/* <DefaultHeader /> */}
        <ServicesHeader />
      </div>


      {/* 
      <HeroSection />
      <ContentSection key={i18n.language}/>
      <ServicesSection />*/}
      <main style={{
        flex: 1,
      }}>
        <Outlet />

      </main>

      <Footer showFull={true}/>

    </div>
  );
};

export default PublicLayout;
