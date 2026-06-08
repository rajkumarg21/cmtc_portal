import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  CircularProgress
} from "@mui/material";
import { getFileSize } from "../../utils/fileUtils";
import { getPublishedTenders } from "../../services/tenderService";
import { getPublishedNewsArticles } from "../../services/newsService";
import { getAllCarouselSlidesPublic } from "../../services/carouselService";
import {getPublishedCirculars} from "../../services/circularService";
import { Link, useNavigate } from "react-router-dom";
import { getYoutubePublic } from "../../services/youtubeService";
import { getImportantLinks } from "../../services/importantLinkService.js";
import defaultBanner from "../../assets/images/defaultBanner.png";
import { getPublicPhoto } from "../../services/photoService.js";
import GeoMap from "../map/GeoMap";
import MpMap from "../map/MpMap";
import { getBackendFileUrl } from "../../utils/urlUtils";
import mpDistricts from "../../assets/map/mp-district.json";
import L from "leaflet";

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
   
  {/*const importantLinks = [
  { title: "MODEL CLF DATA ENTRY", path: "/important/model-clf-data-entry" },
  { title: "VIDYUT SAKHI", path: "/important/vidyut-sakhi" },
  { title: "PFMS", path: "/important/pfms" },
  { title: "IPRP", path: "/important/iprp" },
  { title: "CADER REGISTRATION & ICRP FEEDING PORTAL", path: "/important/cader-registration" },
  { title: "BC SAKHI AND CBO", path: "/important/bc-sakhi-cbo" },
  { title: "NEW SHG REGISTRATION ,2-BANK SAKHI PORTAL,3-DRY RASHON PORTAL", path: "/important/shg-registration" },
  { title: "RURAL SOFT", path: "/important/rural-soft" },
  { title: "NRLM MIS PORTAL", path: "/important/nrlm-mis" },
  { title: "DAY-NRLM WEBSITE & OTHER STATE SRLM WEBSITES", path: "/important/nrlm-websites" },
]; */} 

/* ========================================================
   MAIN COMPONENT
   ======================================================== */
const Home2 = () => {
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
  


   /* ==========================
        FETCH Leaders 
     ========================== */
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

  const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    // youtu.be/VIDEO_ID
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/watch?v=VIDEO_ID
    const videoId = new URL(url).searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  } catch (e) {
    console.error("Invalid YouTube URL:", url);
    return "";
  }
};


  /* ========================================================
     PAGE UI
     ======================================================== */
 
  return (  
<div className="container-fluid p-0">
      {/*section-1 :  carousel image */}
        {slides.length > 0 ? (
        <div id="carouselExample" className="carousel slide w-100"  data-bs-ride="carousel" data-bs-interval="2000">
            <div className="carousel-inner">
                {slides.map((s, i) => (
                <div key={i} className={`carousel-item ${i === 0 ? "active" : ""}`}>
                    <img src={getSlideImageUrl(s)} className="d-block w-100 object-cover"  alt={`Slide ${i + 1}`} style={{height:"450px" , objectFit:"cover"}}/>
                </div>
                ))}
            </div>

            <button className="carousel-control-prev bg-white rounded-circle shadow d-flex align-items-center justify-content-center my-auto mx-4" type="button" data-bs-target="#carouselExample" data-bs-slide="prev"  style={{ width: "40px", height: "40px",opacity: 1}}>
            <span className="carousel-control-prev-icon text-dark" aria-hidden="true" style={{ filter: "invert(1)" }}></span>
            <span className="visually-hidden">Previous</span>
            </button>

            <button className="carousel-control-next bg-white rounded-circle shadow d-flex align-items-center justify-content-center my-auto mx-4" type="button" data-bs-target="#carouselExample" data-bs-slide="next" style={{ width: "40px", height: "40px" ,opacity: 1 }}>
            <span className="carousel-control-next-icon"  style={{ filter: "invert(1)" }}></span>
            <span className="visually-hidden">Next</span>
            </button>
            </div>
            ) : (
                <img
                src={defaultBanner}
                className="d-block w-100"
                alt="Default Banner"
                style={{ height: "450px", objectFit: "cover" }}
                />
            )}


     {/*section-2 :  Heading , ministers image */}
        <div className="Section2 row g-4 mt-5 p-2 ">
            <div className="col-md-12 text-center mb-4">
                {/* Heading */}
                  <strong className="card-text fs-4">Madhya Pradesh State Rural Livelihoods Mission <br/>MPSRLM</strong>
                  <p>The mandate of MoRD, GoI is rural poverty alleviation…</p>
                  <Link className="btn btn-outline-danger mt-2" to="/mpsrlm">Read more</Link>
            </div>

            {/* Leaders image*/}
            {photos.map((p) => (
            <div className="col-md-3">
                 {/* Leaders image*/}
                  <div key={p.id} className="card rounded-0 border-2 border-dark">
                  <img style={{height:250 ,objectPosition:"top"}} src={`${import.meta.env.VITE_BASE_URL.replace(/\/$/, "")}${p.imageUrl}`} 
                  className="card-img-top object-cover rounded-0" 
                  alt={p.name}/>
                  <div className="card-body text-center bg-dark text-white shadow p-1">
                    <strong className="leader-text fw-bold">{p.name}<br/></strong>
                    {p.designation}
                  </div>
                  </div>   
            </div>
             ))}

          
            <div className="col-md-6 p-1">
                 {/* NEWS section */}
                <div className="card rounded-0  border-3 border-warning" >
                    <div className="card-header fs-5 fw-bold text-center bg-warning text-white rounded-0 border-0">
                        <strong className="d-flex gap-2 align-item-center">
                        <img src={`${VITE_IMAGE_BASE_URL}/images/News.png`} className="img-thumbnail object-contain p-0 bg-transparent border-0" alt="Image" style={{height:"30px" , objectFit:"cover"}}/> 
                        News
                        </strong>
                    </div>
                    <div className="card-body">
                    <marquee className="marq" direction="up" loop="" style={{height:150}}
                      onMouseOver={(e) => e.currentTarget.stop()}
                      onMouseOut={(e) => e.currentTarget.start()}
                    >
                       <ul className="list-group list-group-flush text-center fw-bolder">
					              {newsList.map((item) => (
                             <li  key={item.id} className="list-group-item">
                               <Link className="text-decoration-none text-dark" to={`/news/${item.id}`}
                                onClick={(e) => e.currentTarget.closest("marquee").stop()} 
                               >{item.titleEnglish}</Link>
                            </li>
                         ))}
                        </ul>
                        </marquee>
                    </div>
                    <div className="card-footer text-center border-0  rounded-0" style={{backgroundColor:"#e9e9e9ff"}}>
                      <Link className="text-decoration-none fw-bold text-primary" to="/news">
                        View All
                      </Link>
                    </div>
                </div>
            </div>

             {/* services Links*/}
            <div className="col-md-12 px-5">
                <div className="newsSection row g-4 mt-4 mb-4">
                     <div className="col-md-12 text-center">
                      <strong className="card-text fs-4">Services</strong>
                    </div>
                    {serviceList.map((srv, i) => (
                              <div className="col-md-4">
                                  <button
                        className="btn w-100 services_link border-0 text-white fw-bold"
                        onClick={() => navigate(srv.path)}
                      >
                      {srv.title}
                      </button>
                      </div>
                  ))}
                </div>
            </div>
        </div>


      {/*section-3 : video , programm and newsletter */}
        <div className="section4 row g-3 mt-5 p-2">
           {/*section-3 :  videos */}
            <div className="col-md-4">
                <div className="card rounded-0 border-3  border-danger" >
                    <div className="card-header fs-5 fw-bold text-center bg-danger text-white rounded-0">
                    <strong className="d-flex gap-2 align-item-center"><img src={`${VITE_IMAGE_BASE_URL}/images/youtube.png`} className="img-thumbnail object-contain p-0 bg-transparent border-0" alt="Image" style={{height:"30px" , objectFit:"cover"}}/>YouTube</strong>
                    </div>
                    <div className="card-body" style={{height:193}}>
                        {youtubeVideos.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          No videos available.
                        </div>
                        ) : (
                        <div className="row g-2">
                          {youtubeVideos.map((v) => (
                          <div className="col-6 col-md-4" key={v.id}>
                              <div className="card h-100">
                                {/* Video iframe */}
                                <div className="ratio ratio-16x9">
                             <iframe
                                  src={getYoutubeEmbedUrl(v.youtubeUrl)}
                                  title={v.title}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>

                                </div>

                                {/* Title */}
                                <div className="card-body p-2">
                                  <div
                                    className="text-center fw-semibold"
                                    style={{ fontSize: "0.85rem", color: "#444" }}
                                  >
                                    {v.title}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        )}
					        </div>  
                </div>
          </div>

            {/*section-3 :  SRLM programm */}
            <div className="col-md-4">
              <div className="card rounded-0 border-0" id="programCard">
                <div className="card-header fs-5 fw-bold text-center text-white rounded-0 border-0">
                <strong>MP-SRLM Programm</strong>
                </div>
              <div className="card-body" style={{height:198}}>
              <ul className="list-group">
                {[
                "Social Mobilization",
                "Financial Inclusion",
                "Livelihood Promotion",
                "Training And Capacity Building",
                "RSETI",
              ].map((item, index) => (
                <li  key={index} className="d-flex align-items-center bg-transparent py-1">
                  <img src={`${VITE_IMAGE_BASE_URL}/images/rightSymbol.png`} className="img-thumbnail object-contain p-0 bg-transparent border-0" alt="Image" style={{height:"20px" , objectFit:"cover"}}/>
                  <p className=" mx-1 text-decoration-none text-white">{item}</p>
                  </li>
                  ))}
                </ul>
                </div>
                </div>
            </div>

            {/*section-3 :  News letter */}
            <div className="col-md-4">
                <div className="card rounded-0 border-3" 
                 style={{ border: "3px solid rgb(15, 164, 102)" }}>
                    <div className="card-header fs-5 fw-bold text-center text-white rounded-0"
                    style={{background: "radial-gradient(759px at 14% 22.3%, rgb(10, 64, 88) 0%, rgb(15, 164, 102) 90%)"}}>
                    <strong className="d-flex gap-2 align-item-center">
                    <img src={`${VITE_IMAGE_BASE_URL}/images/letter.png`} className="img-thumbnail object-contain p-0 bg-transparent border-0" alt="Image" style={{height:"30px" , objectFit:"cover"}}/>
                    News Letters
                    </strong>
                    </div>
                    <div className="card-body" style={{height:150}}>
                       <ul className="list-group list-group-flush">
                        {newsLetter.map((item) => (
                        <li
                          key={item.id}
                          className="list-group-item"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                          const backendBaseUrl =
                            import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

                          let filePath = item.attachmentUrl;
                          if (!filePath) {
                            alert("Attachment not found");
                            return;
                          }

                          // remove leading slashes
                          filePath = filePath.replace(/^\/+/, "");

                          // open correct URL
                          const finalUrl = filePath.startsWith("files/")
                            ? `${backendBaseUrl}/${filePath}`
                            : `${backendBaseUrl}/files/${filePath}`;

                          window.open(finalUrl, "_blank");
                          }}
                        >
                          <a
                          className="text-decoration-none text-dark fw-semibold d-block"
                          role="button"
                          >
                          {item.titleEnglish}
                          </a>
                        </li>
                        ))}
                      </ul>
                    </div>
                    <div className="card-footer text-center border-0  rounded-0" style={{backgroundColor:"#e9e9e9ff"}}>
                      <Link className="text-decoration-none fw-bold text-primary" to="/circulars">
                        View All
                      </Link>
                    </div>
                </div>
            </div>
      </div>  


       {/*section-4 :  Tenders , Map  */}
        <div className="section3 row g-4 mt-5 p-2">
          {/*section-4 : Map */}
            <div className="col-md-5">
            <Box sx={{ flex: 1, border: "3px solid rgba(255, 157, 46, 1)", borderRadius: 0}} >
            <Box sx={{ p: 0 }}>
              <GeoMap
                title="Districts of Madhya Pradesh"
                data={mpDistricts}
                height="400px"
                featureIdKey="dist_cd"
                featureNameKey="dist_nm_e"
                defaultColor="#BBDEFB"
                hoverColor="#64B5F6"
                strokeColor="#0D47A1"
                onFeatureClick={(district_name) => navigate(`/district/${district_name}`)}
              />
            </Box>
            </Box>
            </div>
            
            {/*section-4 :  Tenders */}
            <div className="col-md-7">
                <div className="card rounded-0 border-3  border-primary">
                    <div className="card-header fs-5 fw-bold text-center bg-primary text-white rounded-0">
                        <strong>Tenders</strong>
                    </div>
                    <div className="card-body">
                      <marquee
                        className="marq"
                        direction="up"
                        onMouseOver={(e) => e.currentTarget.stop()}
                        onMouseOut={(e) => e.currentTarget.start()}
                         style={{height:190}}
                      >
                       <ul className="list-group list-group-flush text-center">
                            {tenders.map((tender) => (
                              <li key={tender.id} className="list-group-item">
                                <a
                                  href={getBackendFileUrl(tender.attachmentUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-decoration-none text-dark"
                                  onClick={(e) => e.currentTarget.closest("marquee")?.stop()}
                                >
                                  {tender.titleEnglish}
                                </a>
                                <br />
                                <small className="text-muted">
                                  File size: {sizes[tender.id] || "Loading..."}
                                </small>
                              </li>
                            ))}
                      </ul>

                      </marquee>
                    </div>
                </div>
            </div>
        </div>  
</div> 
    
  );
};

export default Home2;
