import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress
} from "@mui/material";
import { Carousel } from "react-bootstrap";
import { ROUTES } from "../../constants/routes";
import {
  getAllDistricts,
  getCentersByDistrict,
  getMonthlyCalendar, getBlocksByDistrict, getCentersByBlock
} from "../../services/cmtcCenterService";
import "./cmtcStyle.css";
import defaultImages from "../../assets/images/defaultImages.jpg";
import { useTranslation } from "react-i18next";
import GeoMap from "../map/GeoMap";
import MpMap from "../map/MpMap";
import { getBackendFileUrl } from "../../utils/urlUtils";
import mpDistricts from "../../assets/map/mp-district.json";
import { HERO_IMAGES } from "../../constants/images";
import api from "../../services/apiService";
import { isValidId, isValidDate,sanitizeText } from "../../utils/security";
import { WEEK_DAYS } from "../../constants/calendarConstants";
import {BOOKING_STATUS} from "../../constants/statusConstants";
import { HOMEPAGE_VIDEO_URL } from "../../utils/constants";
import swal from "sweetalert";
const getMonthDays = (year, month) => {
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

function CmtcPage() {
 const Homepage_features = [
  {
    title: "समय पर कार्यक्रम आयोजन",
    text: "जब आवश्यकता हो, तब कार्यक्रम समय पर आयोजित किये जा सकते हैं।"
  },
  {
    title: "स्वतंत्र प्रशिक्षण केन्द्र",
    text: "अपना प्रशिक्षण केन्द्र होने से किसी की अनुमति या सहमति का इंतजार नहीं करना पड़ता।"
  },
  {
    title: "अधिकतम प्रतिभागिता",
    text: "यात्रा संबंधी जोखिम कम होने से अधिक प्रतिभागियों की भागीदारी संभव।"
  },
  {
    title: "परिवारों की सहज सहमति",
    text: "सुरक्षित और नजदीकी व्यवस्था होने से परिवारों की सहमति आसानी से मिलती है।"
  },
  {
    title: "समय की बचत",
    text: "आवागमन में लगने वाले अतिरिक्त समय की बचत।"
  },
  {
    title: "अतिरिक्त आय के अवसर",
    text: "बचे समय में घर एवं पारंपरिक आजीविका कार्य कर अतिरिक्त आय अर्जित करने की सुविधा।"
  },
  {
    title: "कम लागत में कार्यक्रम",
    text: "कम लागत पर कार्यक्रम संभव — सरकार एवं प्रतिभागियों दोनों के लिए बचत।"
  },
  {
    title: "आर्थिक एवं सामाजिक सशक्तिकरण",
    text: "एक सशक्त, सार्थक एवं उपयोगी सामुदायिक केन्द्र।"
  },
  {
    title: "समुदाय नेतृत्व विकास",
    text: "संचालन एवं प्रबंधन के अवसर से समुदाय प्रतिनिधियों का क्षमतावर्धन।"
  },
  {
    title: "प्रशिक्षकों का विकास",
    text: "समुदाय प्रशिक्षकों को दूसरों को सिखाने और स्वयं की क्षमता बढ़ाने का अवसर।"
  },
  {
    title: "स्थानीय रोजगार अवसर",
    text: "भोजन निर्माण, गाइड, चौकीदार, इलेक्ट्रिशियन, प्लंबर आदि सेवाओं के अवसर।"
  },
  {
    title: "दीर्घकालिक संचालन",
    text: "भविष्य में निरंतर संचालन की मजबूत संभावनाएँ।"
  }
];
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [centerType, setCenterType] = useState("");
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const handleOpenCalendar = () => setOpenCalendarModal(true);
  const handleCloseCalendar = () => setOpenCalendarModal(false);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [calendarData, setCalendarData] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isHindi = i18n.language === "hi"


  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [confirmPopup, setConfirmPopup] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState("");
  const navigate = useNavigate();
  const [allCenters, setAllCenters] = useState([]);

  useEffect(() => {

    api
      .get(`${import.meta.env.VITE_API_BASE_URL}/public/centers`)
      .then((res) => {
        console.log(res.data);
        setAllCenters(res.data);
      })
      .catch((err) => {

        console.error("Error loading centers", err);

      });

  }, []);

  const getMonthYearLabel = (date) =>
    date.toLocaleString("default", { month: "long", year: "numeric" });

  const getWeekDates = (baseDate) => {
    const start = new Date(baseDate);
    start.setDate(start.getDate() - start.getDay()); // Sunday

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const formatDate = (date) => date.toISOString().split("T")[0];

  const weekDates = selectedWeekStart
    ? getWeekDates(selectedWeekStart)
    : getWeekDates(new Date());

  useEffect(() => {
    getAllDistricts().then((res) => {
      setDistricts(res.data);
    });

  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      getBlocksByDistrict(selectedDistrict).then((res) => {
        setBlocks(res.data);
        setSelectedBlock("");
        // setCenterType("");
      });
    }
  }, [selectedDistrict]);
  useEffect(() => {
    if (selectedBlock) {
      getCentersByBlock(selectedBlock).then((res) => {
        setCenters(res.data);
        setSelectedCenter("");
        setCenterType("");
      });
    }
  }, [selectedBlock]);
  useEffect(() => {
    if (selectedCenter) {
      const matched = centers.find(c => c.centerId === Number(selectedCenter));
      if (matched) {
        setCenterType(matched.centerType);
      }
    }
  }, [selectedCenter, centers]);

  const handleSearchAvailability = async () => {
    if (!selectedDistrict || !selectedCenter || !selectedMonth) {
      swal({
        text: "Please select district, center and month",
        icon: "warning",
      });
      return;
    }

    try {
      setLoadingAvailability(true);

      const data = await getMonthlyCalendar(selectedCenter, selectedMonth);

      if (!Array.isArray(data.data)) {
        console.error("Calendar API returned invalid data:", data);
        swal({
          text: "Invalid calendar data",
          icon: "error",
        });
        return;
      }

      setCalendarData(data.data);
      setOpenCalendarModal(true);

    } catch (error) {
      console.error(error);
      swal({
          text: "Failed to load booking calendar",
          icon: "error",
        });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const Counter = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 20);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 20);
      return () => clearInterval(timer);
    }, [end, duration]);

    return <h1 className="textCount fs-1 fw-bold">{count}+</h1>;
  };

  // const [carouselCenters, setCarouselCenters] = useState([]);

  // 👉 You can hardcode a districtId for homepage carousel
  // OR make this dynamic later
  const DISTRICT_ID = 9; // example: Bhopal district id

  // useEffect(() => {
  //   // 🔹 Fetch centers using existing API
  //   getCentersByDistrict(DISTRICT_ID).then((res) => {

  //     // 🔹 Limit centers shown in carousel (optional)
  //     setCarouselCenters(res.data.slice(0, 3));
  //   });
  // }, []);

  return (
    <>
      {/*====================Author - Sumit soni ==========================*/}
      {/*section-1 : Hero Section*/}
      {/*===============================================*/}
      <Carousel fade indicators interval={4000}>

        {/* Slide 1 */}
        <Carousel.Item>
          <div
            className="homepage_sec1 d-flex align-items-center justify-content-center text-center"
            style={{
              backgroundImage: `url(${HERO_IMAGES.hero1})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "380px"
            }}
          >
            <div className="container">
              <h1 className="text-white fw-bold hero-title">
                <span className="fs-2 fs-md-1">
                  {sanitizeText(t("hero.titleLine1"))} {sanitizeText(t("hero.titleLine2"))}
                </span>
                <span className="bg-white text-dark p-2 rounded-5 opacity-75 fs-5 fs-md-4 d-inline-block ms-2">
                  {sanitizeText(t("hero.shortTitle"))}
                </span>
              </h1>

              <p className="hero_text3 text-white fw-bold mt-3 fs-6 fs-md-5">
                {sanitizeText(t("hero.description"))}
              </p>

              <Link
                className="sectbtn btn rounded-5 mt-3 border-white border-2 ripple-btn fs-6 fs-md-5"
                to="/district"
              >
                <span className="p-2 px-3">{sanitizeText(t("hero.viewAllCenters"))}</span>
                <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>
          </div>
        </Carousel.Item>

        {/* Slide 2 */}
        <Carousel.Item>
          <div
            className="homepage_sec1 d-flex align-items-center justify-content-center text-center"
            style={{
              backgroundImage: `url(${HERO_IMAGES.hero2})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "380px"
            }}
          >
           <div className="container">
              <h1 className="text-white fw-bold hero-title">
                <span className="fs-2 fs-md-1">
                  {sanitizeText(t("hero.titleLine1"))} {sanitizeText(t("hero.titleLine2"))}
                </span>
                <span className="bg-white text-dark p-2 rounded-5 opacity-75 fs-5 fs-md-4 d-inline-block ms-2">
                  {sanitizeText(t("hero.shortTitle"))}
                </span>
              </h1>

              <p className="hero_text3 text-white fw-bold mt-3 fs-6 fs-md-5">
                {sanitizeText(t("hero.description"))}
              </p>

              <Link
                className="sectbtn btn rounded-5 mt-3 border-white border-2 ripple-btn fs-6 fs-md-5"
                to="/district"
              >
                <span className="p-2 px-3">{sanitizeText(t("hero.viewAllCenters"))}</span>
                <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>
          </div>
        </Carousel.Item>

        {/* Slide 3 */}
        <Carousel.Item>
          <div
            className="homepage_sec1 d-flex align-items-center justify-content-center text-center"
            style={{
              backgroundImage: `url(${HERO_IMAGES.hero3})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "380px"
            }}
          >
            <div className="container">
              <h1 className="text-white fw-bold hero-title">
                <span className="fs-2 fs-md-1">
                  {sanitizeText(t("hero.titleLine1"))} {sanitizeText(t("hero.titleLine2"))}
                </span>
                <span className="bg-white text-dark p-2 rounded-5 opacity-75 fs-5 fs-md-4 d-inline-block ms-2">
                  {sanitizeText(t("hero.shortTitle"))}
                </span>
              </h1>

              <p className="hero_text3 text-white fw-bold mt-3 fs-6 fs-md-5">
                {sanitizeText(t("hero.description"))}
              </p>

              <Link
                className="sectbtn btn rounded-5 mt-3 border-white border-2 ripple-btn fs-6 fs-md-5"
                to="/district"
              >
                <span className="p-2 px-3">{sanitizeText(t("hero.viewAllCenters"))}</span>
                <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>
          </div>
        </Carousel.Item>


      </Carousel>

      {/*===============================================*/}
      {/*Quick search box*/}
      {/*===============================================*/}
      <div className="search-bar 
                d-flex flex-column flex-md-row 
                align-items-stretch align-items-md-center 
                gap-2 
                px-3 px-md-4 
                w-75 w-md-100 
                py-3 py-md-2 
                mx-auto 
                position-relative
                overflow-visible">
        <div className="search-item flex-fill">
          <select
            className="form-select shadow-none border-light"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">{sanitizeText(t("search.district"))}</option>
            {districts.map((d) => (
              <option key={(d.districtId)} value={(d.districtId)}>
                {sanitizeText(isHindi ? (d.districtNameHi || d.districtNameEn) : (d.districtNameEn || d.districtNameHi))}
              </option>
            ))}
          </select>
        </div>

        <div className="search-item flex-fill">
          <select
            className="form-select shadow-none border-light"
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
          >
            <option value="">{sanitizeText(t("search.block"))}</option>
            {blocks.map((b) => (
              <option key={sanitizeText(b.blockId)} value={b.blockId}>
                {sanitizeText(isHindi ? (b.blockNameHi || b.blockNameEn) : (b.blockNameEn || b.blockNameHi))}

              </option>
            ))}
          </select>
        </div>

        <div className="search-item flex-fill">
          <select
            className="form-select shadow-none border-light"
            value={selectedCenter}
            disabled={!selectedDistrict}
            onChange={(e) => setSelectedCenter(sanitizeText(e.target.value))}
          >
            <option value="">{sanitizeText(t("search.center"))}</option>
            {centers.map((c) => (
              <option key={sanitizeText(c.centerId)} value={c.centerId}>
                {sanitizeText(c.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="search-item flex-fill">
          <input
            type="date"
            className="form-control border-light"
            value={selectedMonth}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = "date";
            }}
            onChange={(e) => setSelectedMonth(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <button
          className="btn btn-dark fw-bold rounded-5 mt-2 mt-md-0 flex-shrink-0"
          onClick={handleSearchAvailability}
          disabled={loadingAvailability}
        >
          {loadingAvailability ? sanitizeText(t("search.checking")) : sanitizeText(t("CheckAvailability"))}
        </button>
      </div>


      {/* ✅ BIG POPUP CALENDAR MODAL */}
      {/* ===========================
        📌 CALENDAR POPUP MODAL
        =========================== */}
      {openCalendarModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content rounded-4">

              {/* Header */}
              <div className="modal-header">
                <h4 className="modal-title fw-bold">
                  {sanitizeText(t("calendar.title"))} – {selectedMonth}
                </h4>
                <button className="btn-close" onClick={handleCloseCalendar}></button>
              </div>

              {/* Body */}
              <div className="modal-body" style={{
                maxHeight: "70vh",
                overflowY: "auto",
              }}>

                {selectedMonth && (() => {
                  const [year, month] = selectedMonth.split("-").map(Number);

                  const firstDay = new Date(year, month - 1, 1);
                  const lastDay = new Date(year, month, 0);
                  const startDayIndex = firstDay.getDay();
                  const totalDays = lastDay.getDate();

                  const statusMap = {};
                  (Array.isArray(calendarData) ? calendarData : []).forEach(d => {
                    statusMap[d.date] = d.status;
                  });
                  const calendarCells = [];

                  // Empty cells before month starts
                  for (let i = 0; i < startDayIndex; i++) {
                    calendarCells.push(null);
                  }

                  // Actual dates
                  for (let i = 1; i <= totalDays; i++) {
                    const fullDate = new Date(year, month - 1, i);
                    const formatted = fullDate.toISOString().split("T")[0];
                    const today = new Date().toISOString().split("T")[0];
                    let status = statusMap[formatted] || "AVAILABLE";

                    // ⛔ Disable past dates
                    if (formatted < today) {
                      status = "CLOSED";
                    }

                    calendarCells.push({ date: i, status, fullDate: formatted });

                  }

                  return (
                    <>
                      {/* Week Names */}
                      <div className="row row-cols-7 text-center fw-bold mb-2">
                         {WEEK_DAYS.map((day, index) => (
                        <div key={index} className="col">
                          {day}
                        </div>
                      ))}
                      </div>

                      {/* Calendar Grid */}
                      <div className="row row-cols-7 g-3">
                        {calendarCells.map((cell, index) => {

                          if (!cell) return <div key={index} className="col"></div>;

                          const bgColor =
                            cell.status === "AVAILABLE" ? "#2ecc71" :
                              cell.status === "RESERVED" ? "#f7c97f" :
                                cell.status === "BOOKED" ? "#e74c3c" :
                                  cell.status === "CLOSED" ? "#dcdcdc" : // ⬅ Grey for past dates
                                    "#bdc3c7";


                          return (
                            <div key={index} className="col">
                              <div
                                className="p-3 text-center rounded fw-bold"
                                onClick={() => {
                                  if (cell.status === "AVAILABLE" && cell.status !== "CLOSED") {
                                    setSelectedBookingDate(cell.fullDate);
                                    //navigate( `/cmtc-booking/${selectedCenter}`)
                                    // setConfirmPopup(true);
                                  }

                                }}
                                style={{
                                  backgroundColor: bgColor,
                                  minHeight: "90px",
                                  cursor: cell.status === "AVAILABLE" ? "pointer" : "not-allowed",
                                  color: cell.status === "BOOKED" ? "white" : "black",
                                  opacity: cell.status === "BOOKED" ? 0.7 : 1
                                }}
                              >
                                <div>{cell.date}</div>
                                <small>{cell.status}</small>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-center mt-4">
                        <button
                          className="btn btn-success rounded-5 px-5 fw-bold"
                          onClick={() => {
                            handleCloseCalendar(); // optional
                            if (isValidId(selectedCenter)) {

                              navigate(`/center-details/${selectedCenter}`);

                            }
                            else {

                              navigate("/");

                            }
                          }}
                        >
                          {sanitizeText(t("calendar.moveToBooking"))}
                        </button>
                      </div>
                      {/* Legend */}
                     <div className="mt-4 d-flex gap-4 fw-bold justify-content-center">
                      {BOOKING_STATUS.map((status, index) => (
                        <span key={index} style={{ color: status.color }}>
                          {status.icon} {status.label}
                        </span>
                      ))}
                    </div>
                    </>
                  );
                })()}

              </div>
            </div>
          </div>
        </div>
      )}


      {/* ===========================
         📌 CONFIRM BOOKING MODAL
         =========================== */}
      {confirmPopup && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content rounded-3 p-3">

              <div className="modal-header border-0">
                <h5 className="modal-title">{sanitizeText(t("booking.confirmTitle"))}</h5>
                <button className="btn-close" onClick={() => setConfirmPopup(false)}></button>
              </div>

              <div className="modal-body text-center">
                <p>{sanitizeText(t("booking.confirmQuestion"))}</p>
                <h6 className="fw-bold text-primary">{sanitizeText(selectedBookingDate)}</h6>
              </div>

              <div className="modal-footer border-0 d-flex justify-content-around">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmPopup(false)}
                >
                  {sanitizeText(t("booking.close"))}
                </button>

                <button
                  className="btn btn-success"
                  onClick={() => {

                    if (
                      isValidId(selectedCenter)
                      &&
                      isValidDate(selectedBookingDate)
                    ) {

                      navigate(
                        `${ROUTES.BOOKING}/${selectedCenter}?date=${selectedBookingDate}`
                      );

                    }
                    else {

                      navigate(ROUTES.HOME);

                    }

                  }}
                >
                  {sanitizeText(t("booking.bookNow"))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/*===============================================*/}
      {/*Counter-section*/}
      {/*===============================================*/}
      {/* <div className="container-fluid">
        <div className="row g-4 text-center mt-3 mb-3">
          <div className='col-4 '>
            <Counter end={32} />
            <p className="text-secondary">{sanitizeText(t("counter.districtCmtcs")}</p>
          </div>
          <div className='col-4 '>
            <Counter end={18000} />
            <p className="text-secondary">{sanitizeText(t("counter.participantsTrained")}</p>
          </div>
          <div className='col-4 '>
            <Counter end={2200} />
            <p className="text-secondary">{sanitizeText(t("counter.trainingsCompleted")}</p>
          </div>
        </div>
      </div> */}
      <div className="container-fluid mt-3 mb-3" style={{ background: "#b1b1b11a"}}>
        <div className="py-1 ">
          <strong className="me-3 text-danger"> {sanitizeText(t("LatestUpdates"))}: 📢</strong>
          <marquee behavior="scroll" direction="left" scrollamount="6"
           style={{ color: "#4E378A", fontWeight: "600" }}
            onMouseOver={(e) => e.currentTarget.stop()}
            onMouseOut={(e) => e.currentTarget.start()}
          >
            {sanitizeText(t("sent1"))} &nbsp;&nbsp;&nbsp;
            {sanitizeText(t("sent2"))} &nbsp;&nbsp;&nbsp;
            {sanitizeText(t("sent3"))} &nbsp;&nbsp;&nbsp;
            {sanitizeText(t("sent4"))} &nbsp;&nbsp;&nbsp;
          </marquee>
        </div>
       
      </div>
      {/*===============================================*/}
      {/*section-2*/}
      {/*===============================================*/}
      {/* <div className="container-fluid mt-4">
        
        <div className="text-center">
          <h2 className="fs-2 fw-bold">{sanitizeText(t("centers.sectionTitle")}</h2>
          <p className="text-secondary">{sanitizeText(t("centers.sectionSubtitle")}</p>
        </div>
      </div> */}

      {/*carousel*/}
      {/* <div className="container my-5">
 

  <div className="row g-4" style={{paddingLeft:"30px",paddingRight:"40px"}}>
 <div className="d-flex justify-content-between align-items-center mb-4">
    <h2 className="fw-bold text-white">FEATURED CENTERS</h2>

    <Link to="/district/all" className="btn px-4 rounded-0" style={{background: "#0f766e",color:"#ffffff"}}>
      VIEW ALL
    </Link>
  </div>
    {carouselCenters.map((center) => (
      <div key={center.centerId} className="col-lg-4 col-md-6">

        <div className="featured-card">

       
          <div className="featured-img">
            <img
              src={
                center.imageName
                  ? `${import.meta.env.VITE_BASE_URL}${center.imageName}`
                  : defaultImages
              }
              alt={center.name}
            />
          </div>

          <div className="featured-body">

            <h6 className="fw-bold mb-1">
              {center.name}
            </h6>
<p>{center.address}</p>
            <div className="d-flex align-items-center gap-2 text-muted small mb-2">
              <i className="bi bi-clock-fill text-warning"></i>
              {center.trainingHalls} Halls | Residential Capacity : {center.residentialCapacity}
            </div>

           
            <div className="mb-2 text-warning">
              ★★★★☆
            </div>

            <div className="price-box">
              <small>FROM</small>
              <span>₹ {center.resPrice || "—"}</span>
            </div>

          
          </div>

          <Link
            to={`/district/${center.districtNameEn.toLowerCase()}`}
            className="featured-btn"
          >
            <i className="bi bi-cart-fill me-2"></i> BOOK NOW
          </Link>

        </div>

      </div>
    ))}

  </div>
</div> */}
  {/*===============================================*/}
      {/* section-2 : objectives */}
      {/*===============================================*/}
      <section className="section container-fluid p-4">
        <div className="features-header-card mb-3">
          <h2 className="section-title">
            {sanitizeText(t("cmtcObjective"))}
          </h2>
        </div>
         <p className="section-description text-center fw-bold p-0">
             {sanitizeText(t("objectiveDisc1"))}
          </p>
           <p className="section-description text-center mt-1">
           {sanitizeText(t("objectiveDisc2"))}
          </p>
      </section>
      {/*===============================================*/}
      {/* section-3 : list of facilities */}
      {/*===============================================*/}

      <section className="section container-fluid p-4">
        <div className="features-header-card">
          <h2 className="section-title">
            {sanitizeText(t("features.title"))}
          </h2>

          <p className="section-subtitle text-white">
            {sanitizeText(t("features.subtitle"))}
          </p>
        </div>

        <div className="features-grid">
          {t("Homepage_features.items", { returnObjects: true }).map((Homepage_features, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">✔</div>
              <div className="feature-title">
                {sanitizeText(Homepage_features.title)}
              </div>
              <div className="feature-text">
                 {sanitizeText(Homepage_features.text)}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/*===============================================*/}
      {/*section-4 : Achievements*/}
      {/*===============================================*/}
      <section className="section container-fluid p-4">
        <div className="features-header-card">
          <h2 className="section-title">
            {sanitizeText(t("CmtcSuccess"))}
          </h2>
        </div>
        {/* उपलब्धियाँ */}
        <section className="my-0">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <div className="row g-4 text-center justify-content-center">
                  <div className="col-md-4">
                    <div className="card border-0 shadow p-4 h-100 stats-card">
                      <h2 className="fw-bold display-5 text-primary mb-2">52</h2>
                      <p className="mb-0 text-muted fw-semibold">
                        {sanitizeText(t("Cardtitle1"))}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow p-4 h-100 stats-card">
                      <h2 className="fw-bold display-5 text-success mb-2">85</h2>
                      <p className="mb-0 text-muted fw-semibold">
                         {sanitizeText(t("Cardtitle2"))}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow p-4 h-100 stats-card">
                      <h2 className="fw-bold display-5 text-danger mb-2">44125+</h2>
                      <p className="mb-0 text-muted fw-semibold">
                        {sanitizeText(t("Cardtitle3"))}(2025-26)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p>
                  {sanitizeText(t("Achievements1"))}
                </p>
                <p>
                 {sanitizeText(t("Achievements2"))}
                </p>
                <p>
                  {sanitizeText(t("Achievements3"))}
                </p>
                </div>
              </div>
            </div>
        </section>
       
      </section>
      {/*===============================================*/}
      {/*section-4 : Video display*/}
      {/*===============================================*/}
      <section className="section container-fluid p-4">
        <div className="features-header-card">
          <h2 className="video-section-title">
           { t("video_title")}
          </h2>
        </div>
        <div class="video-section">
          <video autoplay muted loop playsinline controls>
              <source src={HOMEPAGE_VIDEO_URL} type="video/mp4"/>
          </video> 
        </div>
      </section>


      {/*===============================================*/}
      {/*section-4 : MAP*/}
      {/*===============================================*/}
      
       <section className="section container-fluid p-4">
        <Box sx={{ flex: 1, border: "3px solid rgba(255, 157, 46, 1)", borderRadius: 2, my: 4 }}>
        <GeoMap
          title={sanitizeText(t("DistrictsMP"))}
          data={mpDistricts}
          height={{ xs: "500px", md: "700px" }}
          featureIdKey="dist_cd"
          featureNameKey="dist_nm_e"
          defaultColor="#BBDEFB"
          hoverColor="#64B5F6"
          strokeColor="#0D47A1"
          onFeatureClick={(district_name) => navigate(`/district/${district_name}`)}
          centers={allCenters}
        />
      </Box>
       </section>
      
    </>
  );
}
export default CmtcPage;