// src/pages/cmtc/CmtcCenterDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCenterAmenities,
  getCenterDetails,
  normalizeAmenitiesSimple,
} from "../../../services/cmtcCenterService.js";
import { getPublicEventSummaries } from "../../../services/cmtcEventsService.js";
import "../../../customStyle.css";
import { useTranslation } from "react-i18next";

// ✅ PDF viewer (react-pdf)
// npm i react-pdf pdfjs-dist
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import defaultImage from "../../../assets/images/defaultImages.jpg"
import lib1 from "../../../assets/images/lib1.png"
import lib2 from "../../../assets/images/lib2.png"
import { getRoleLabel } from "../../../utils/userUtil.js";

import worker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjs.GlobalWorkerOptions.workerSrc = worker;


export default function CmtcCenterDetails() {
  const { centerId } = useParams();
  const navigate = useNavigate();

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  const [amenities, setAmenities] = useState([]);
  const [groupedAmenities, setGroupedAmenities] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedAmenities, setExpandedAmenities] = useState({});
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [cmtcEvents, setCmtcEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");


  // ✅ pricing view mode (Residential / NonResidential)
  const [pricingMode, setPricingMode] = useState("NonResidential");

  // ✅ backend status message handling
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");

  // ✅ gallery selected preview image (for main display)
  const [selectedGallerySrc, setSelectedGallerySrc] = useState("");

  const { t, i18n } = useTranslation();
const [activeTab, setActiveTab] = useState("photo");
  // ✅ backend base (for /files/**)
  const BACKEND_BASE = useMemo(() => {
    // prefer APP_BACKEND_URL, fallback to BASE_URL
    const b =
      import.meta.env.VITE_APP_BACKEND_URL ||
      import.meta.env.VITE_BASE_URL ||
      "";
    return b?.endsWith("/") ? b.slice(0, -1) : b;
  }, []);

  const absFileUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const p = path.startsWith("/") ? path : `/${path}`;
    return BACKEND_BASE ? `${BACKEND_BASE}${p}` : p;
  };

  useEffect(() => {
    if (!centerId) return;

    setLoading(true);
    setPageError("");
    setPageSuccess("");

    getCenterDetails(centerId)
      .then((res) => {
        setCenter(res.data);
        setPageSuccess(res?.data ? "" : "");
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load center details.";
        setPageError(msg);
        setCenter(null);
      })
      .finally(() => setLoading(false));
  }, [centerId]);

  // ✅ decide pricingMode from centerType (and allow toggle if Both)
  useEffect(() => {
    if (!center) return;

    const ct = (center.centerType || "").toString().trim().toLowerCase();

    if (ct === "residential") {
      setPricingMode("Residential");
    } else if (ct === "nonresidential") {
      setPricingMode("NonResidential");
    } else if (ct === "both") {
      setPricingMode("NonResidential");
    } else {
      setPricingMode("NonResidential");
    }
  }, [center]);

  useEffect(() => {
    if (!centerId) return;

    setLoadingEvents(true);
    setEventsError("");

    getPublicEventSummaries(centerId)
      .then((data) => {
        setCmtcEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ Failed to load CMTC events:", err);
        setEventsError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load events."
        );
        setCmtcEvents([]);
      })
      .finally(() => setLoadingEvents(false));
  }, [centerId, i18n.language]);


  useEffect(() => {
    if (!centerId || !center) return;

    setLoadingAmenities(true);

    getCenterAmenities(centerId)
      .then((rawAmenitiesData) => {
        const normalizedAmenities = normalizeAmenitiesSimple(rawAmenitiesData);
        if (normalizedAmenities.length > 0) {
          setAmenities(normalizedAmenities);

          const grouped = {};
          normalizedAmenities.forEach((item) => {
            const typeName = item.amenityTypeName || "Other Facilities";
            const colorCode = item.amenityTypeColor || "#95a5a6";

            if (!grouped[typeName]) {
              grouped[typeName] = {
                name: typeName,
                color: colorCode,
                amenities: [],
              };
            }

            grouped[typeName].amenities.push({
              id: item.id,
              quantity: item.quantity || 0,
              selected: item.selected || false,
              valueType: item.valueType,
              subAmenities: item.subAmenities || [],
              amenityName: item.amenityName || "Facility",
              amenityTypeName: typeName,
              amenityTypeColor: colorCode,
              defaultQuantity: item.defaultQuantity || 0,
            });
          });

          setGroupedAmenities(grouped);

          if (Object.keys(grouped).length > 0) {
            const firstType = Object.keys(grouped)[0];
            setExpandedSections({ [firstType]: true });
          }
        } else {
          setAmenities([]);
          setGroupedAmenities({});
        }
      })
      .catch((error) => {
        console.error("❌ Error loading amenities:", error);
        setAmenities([]);
        setGroupedAmenities({});
      })
      .finally(() => setLoadingAmenities(false));
  }, [centerId, center]);

  const toggleSection = (typeName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [typeName]: !prev[typeName],
    }));
  };

  const toggleAmenity = (amenityId) => {
    setExpandedAmenities((prev) => ({
      ...prev,
      [amenityId]: !prev[amenityId],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    Object.keys(groupedAmenities).forEach((type) => {
      allExpanded[type] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const centerTypeNormalized = useMemo(() => {
    const ct = (center?.centerType || "").toString().trim();
    return ct;
  }, [center]);

  const isBoth = useMemo(() => {
    return (centerTypeNormalized || "").toLowerCase() === "both";
  }, [centerTypeNormalized]);

  const showResidential = useMemo(
    () => pricingMode === "Residential",
    [pricingMode]
  );

  const capacityValue = useMemo(() => {
    if (!center) return 0;
    return showResidential
      ? center.residentialCapacity ?? 0
      : center.nonResidentialCapacity ?? 0;
  }, [center, showResidential]);

  const priceValue = useMemo(() => {
    if (!center) return 0;
    return showResidential ? center.resPrice ?? 0 : center.nonResPrice ?? 0;
  }, [center, showResidential]);

  const capacityLabel = showResidential
    ? t("centerDetails.residentialCapacity")
    : t("centerDetails.nonResidentialCapacity");

  const priceLabel = showResidential
    ? t("centerDetails.residentialPricePerTrainee")
    : t("centerDetails.nonResidentialPricePerTrainee");

  // ✅ brochure URL (supports multiple possible backend keys)
  const brochureUrl = useMemo(() => {
    if (!center) return "";

    const raw =
      center.brochureUrl ||
      center.brochureFileUrl ||
      center.brochurePath ||
      center.brochureFilePath ||
      center.brochureName ||
      center.brochureFileName ||
      "";

    if (!raw) return "";

    // already absolute
    if (/^https?:\/\//i.test(raw)) return raw;

    const base = import.meta.env.VITE_BASE_URL || "";
    if (!base) return raw;

    const cleanedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanedRaw = raw.startsWith("/") ? raw : `/${raw}`;
    return `${cleanedBase}${cleanedRaw}`;
  }, [center]);

  const shortText = (text, max = 90) =>
  text?.length > max ? text.slice(0, max) + "..." : text;

  // ✅ PDF viewer state (read-only viewer inside brochure box)
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);

  useEffect(() => {
    setPdfLoadError(false);
    setPdfNumPages(0);
    setPdfPageNumber(1);
  }, [brochureUrl]);

  const onPdfLoadSuccess = ({ numPages }) => {
    setPdfNumPages(numPages || 0);
    setPdfPageNumber(1);
    setPdfLoadError(false);
  };

  const onPdfLoadError = () => {
    setPdfLoadError(true);
  };

  const goPrevPdfPage = () => {
    setPdfPageNumber((p) => Math.max(1, p - 1));
  };

  const goNextPdfPage = () => {
    setPdfPageNumber((p) => {
      const last = pdfNumPages || 1;
      return Math.min(last, p + 1);
    });
  };

  // ✅ image src safe (main image)
  const mainImageSrc = useMemo(() => {
    const base = import.meta.env.VITE_BASE_URL || "";
    const img = center?.imageUrl || center?.imageName;
    // if (!img) return defaultImages;
    if (/^https?:\/\//i.test(img)) return img;
    return `${base}${img}`;
  }, [center]);

  const { galleryImages, libraryImages } = useMemo(() => {
    const list = Array.isArray(center?.images) ? center.images : [];

    const sorted = [...list].sort(
      (a, b) => (a?.priorityNo ?? 0) - (b?.priorityNo ?? 0)
    );

    const isLibrary = (key) =>
      typeof key === "string" && key.toUpperCase().startsWith("LIB");

    return {
      galleryImages: sorted.filter((img) => !isLibrary(img?.imageNameKey)),
      libraryImages: sorted.filter((img) => isLibrary(img?.imageNameKey)),
    };
  }, [center]);

  // ✅ set default selected gallery image when data loads
  useEffect(() => {
    if (!center) return;
    const firstGallery = galleryImages?.[0]?.filePath
      ? absFileUrl(galleryImages[0].filePath)
      : "";

    // if user hasn't selected anything yet, auto-select first gallery image
    if (!selectedGallerySrc) {
      setSelectedGallerySrc(firstGallery || mainImageSrc || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, galleryImages, mainImageSrc]);

  // ✅ dynamic video url
  const videoUrl = useMemo(() => {
    const fp = center?.video?.filePath;
    return fp ? absFileUrl(fp) : "";
  }, [center]);

  if (loading)
    return (
      <div className="text-center mt-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("centerDetails.loading")}</span>
        </div>
        <p className="mt-3">{t("centerDetails.loadingCenterDetails")}</p>
      </div>
    );

  if (pageError)
    return (
      <div className="text-center mt-5 py-5">
        <i className="bi bi-exclamation-triangle display-4 text-danger"></i>
        <p className="mt-3 text-danger">{pageError}</p>
        <button className="btn btn-outline-primary mt-2" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i>
          {t("centerDetails.backToCenters")}
        </button>
      </div>
    );

  if (!center)
    return (
      <div className="text-center mt-5 py-5">
        <i className="bi bi-exclamation-triangle display-4 text-danger"></i>
        <p className="mt-3 text-danger">{t("centerDetails.noCenterFound")}</p>
        <button className="btn btn-outline-primary mt-2" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i>
          {t("centerDetails.backToCenters")}
        </button>
      </div>
    );

  return (
    <div className="container my-4">
      {/* 🔹 HEADER */}
      <div className="card shadow-sm mb-3 border-0 rounded-3">
        <div className="card-body d-flex align-items-center justify-content-between">
          <div>
            <h5 className="fw-bold fs-4 mb-1">{center.centerName || center.name}</h5>
            <p className="text-muted mb-0">
              {center.address || center.fullAddress} <i className="bi bi-dot"></i>
              {center.blockName || center.block} <i className="bi bi-dot"></i>
              {center.districtNameEn || center.district} - {center.pincode}
            </p>
          </div>
          <div>
            <button
              className="btn btn-primary fw-bold px-4"
              onClick={() => navigate(`/cmtc-booking/${center.centerId || center.id}`)}
            >
              {t("centerDetails.bookNow")}
            </button>
          </div>
        </div>
      </div>

      {pageSuccess ? (
        <div className="alert alert-success d-flex align-items-center" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          <div>{pageSuccess}</div>
        </div>
      ) : null}

      {/* DEBUG BUTTON - Remove in production */}
      {/* <div className="mb-3">
        <button className="btn btn-sm btn-warning" onClick={debugData}>
          <i className="bi bi-bug"></i> Debug Data
        </button>
      </div> */}

      <div className="row g-3">
        {/* IMAGE + BROCHURE */}
        <div className="col-md-4 mt-3">
          <div className="card shadow-sm border-0 rounded-3 p-2">
            <img
              src={mainImageSrc}
              alt="Center Main"
              className="img-fluid rounded-3 mb-2"
              style={{ height: "240px", objectFit: "cover" }}
            // onError={(e) => (e.currentTarget.src = defaultImages)}
            />

            {/* <div
              className="d-flex gap-2 justify-content-center mt-2"
              style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "6px" }}
            >
              {(galleryImages?.length > 0 ? galleryImages : []).slice(0, 10).map((img, index) => {
                const thumbSrc = absFileUrl(img.filePath);
                const active = (selectedGallerySrc || "") === thumbSrc;

                return (
                  <img
                    key={img.id || index}
                    src={thumbSrc}
                    alt={img.imageNameKey || "Thumbnail"}
                    className={`rounded border ${active ? "border-primary" : ""}`}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      cursor: "pointer",
                      opacity: active ? 1 : 0.9,
                    }}
                    onClick={() => setSelectedGallerySrc(thumbSrc)}
                    // onError={(e) => (e.currentTarget.src = defaultImages)}
                    title={img.imageNameKey || ""}
                  />
                );
              })}
            </div> */}
          </div>

          {/* ✅ BROCHURE PDF VIEWER (ONLY ARROWS, NO MODAL) */}
          {brochureUrl ? (
            <div className="card shadow-sm border-0 rounded-3 mt-3">
              <div className="card-body p-2">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc3545"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "0 0 auto" }}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M7 15h3a2 2 0 0 0 0-4H7v8" />
                      <path d="M12 19v-8h3a2 2 0 0 1 0 4h-3" />
                      <path d="M17 19v-8h3" />
                    </svg>
                    {t("centerDetails.brochurePdf")}
                  </h6>

                  <div className="d-flex gap-2">
                    <a href={brochureUrl} target="_blank" rel="noreferrer" className="btn btn-outline-danger btn-sm">
                      {t("centerDetails.open")}
                    </a>
                    <a href={brochureUrl} download className="btn btn-danger btn-sm">
                      {t("centerDetails.download")}
                    </a>
                  </div>
                </div>

                {/* PDF box */}
                <div
                  className="border rounded-3"
                  style={{
                    background: "#fafafa",
                    height: "240px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* ✅ LEFT BIG ARROW */}
                  <button
                    type="button"
                    onClick={goPrevPdfPage}
                    disabled={pdfPageNumber <= 1 || pdfLoadError}
                    title="Previous page"
                    style={{
                      position: "absolute",
                      left: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: pdfPageNumber <= 1 || pdfLoadError ? "not-allowed" : "pointer",
                      opacity: pdfPageNumber <= 1 || pdfLoadError ? 0.35 : 1,
                    }}
                  >
                    <svg width="62" height="62" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14.5 6L8.5 12L14.5 18"
                        stroke="#6f2cff"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* ✅ RIGHT BIG ARROW */}
                  <button
                    type="button"
                    onClick={goNextPdfPage}
                    disabled={pdfLoadError || !pdfNumPages || pdfPageNumber >= pdfNumPages}
                    title="Next page"
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor:
                        pdfLoadError || !pdfNumPages || pdfPageNumber >= pdfNumPages
                          ? "not-allowed"
                          : "pointer",
                      opacity: pdfLoadError || !pdfNumPages || pdfPageNumber >= pdfNumPages ? 0.35 : 1,
                    }}
                  >
                    <svg width="62" height="62" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9.5 6L15.5 12L9.5 18"
                        stroke="#6f2cff"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Page count bottom */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 5,
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid #dee2e6",
                      borderRadius: "999px",
                      padding: "2px 10px",
                      fontSize: "12px",
                      color: "#6c757d",
                    }}
                  >
                    {pdfLoadError ? (
                      <span className="text-danger">PDF failed to load</span>
                    ) : pdfNumPages ? (
                      <>
                        Page <b>{pdfPageNumber}</b> / {pdfNumPages}
                      </>
                    ) : (
                       t("centerDetails.loading")
                    )}
                  </div>

                  {/* PDF render */}
                  <div className="d-flex align-items-center justify-content-center" style={{ height: "100%" }}>
                    {!pdfLoadError ? (
                      <Document
                        file={brochureUrl}
                        onLoadSuccess={onPdfLoadSuccess}
                        onLoadError={onPdfLoadError}
                        loading={
                          <div className="text-center py-4">
                            <div className="spinner-border text-danger" role="status" />
                            <div className="small text-muted mt-2">{t("centerDetails.loadingBrochure")}</div>
                          </div>
                        }
                        error={
                          <div className="text-center p-3">
                            <i className="bi bi-exclamation-triangle text-danger"></i>
                            <div className="small text-danger mt-2">{t("centerDetails.brochureErrorMsg1")}</div>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={pdfPageNumber}
                          width={320}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    ) : (
                      <div className="text-center p-3">
                        <i className="bi bi-file-earmark-pdf text-danger fs-1"></i>
                        <div className="small text-danger mt-2">{t("centerDetails.brochureErrorMsg2")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* INFO */}
        <div className="col-md-8">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-body">
              <h6 className="fw-bold mt-1">{t("centerDetails.centerDescription")}</h6>
              <p className="text-muted mb-0">{center.description || t("centerDetails.noDescription")}</p>

              <div className="mt-3 p-3 rounded bg-light border">
                <div className="row g-3">
                  <div className="col-md-4">
                    <small className="text-muted">{t("centerDetails.district")}</small>
                    <div className="fw-semibold">
                      {center.districtNameEn || center.district || t("centerDetails.na")}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <small className="text-muted">{t("centerDetails.block")}</small>
                    <div className="fw-semibold">
                      {center.blockName || center.block || t("centerDetails.na")}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <small className="text-muted">{t("centerDetails.pincode")}</small>
                    <div className="fw-semibold">{center.pincode || t("centerDetails.na")}</div>
                  </div>
                </div>
              </div>

              <hr />

              {/* ✅ CAPACITY & PRICING */}
              <div className="p-2">
                <div className="border rounded p-3 mt-3">


                  <div className="row text-center">
                    {/* ✅ Residential */}
                    <div className="col-md-6 border-end">
                      <div className="d-flex flex-column align-items-center gap-1">
                        <div className="fw-semibold">
                          {t("centerDetails.residentialTraining")}
                        </div>
                        <div className="fw-semibold">
                           {t("centerDetails.capacity")} : {center.residentialCapacity ?? 0}
                        </div>
                        <div className="fw-semibold">
                           {t("centerDetails.feeDetail")} : ₹ {center.resPrice ?? 0}
                        </div>
                      </div>
                    </div>

                    {/* ✅ Non-Residential */}
                    <div className="col-md-6">
                      <div className="d-flex flex-column align-items-center gap-1">
                         <div className="fw-semibold">
                           {t("centerDetails.nonresidentialTraining")}
                          </div>
                        <div className="fw-semibold">
                           {t("centerDetails.capacity")} : {center.nonResidentialCapacity ?? 0}
                        </div>
                        <div className="fw-semibold">
                           {t("centerDetails.feeDetail")} : ₹ {center.nonResPrice ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ✅ NEW SECTION: Booking Officers (Compact, fits in empty space) */}
              <div className="mt-3 p-2">
                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                  <i className="bi bi-person-lines-fill text-primary"></i>
                  {t("centerDetails.contactOfficers")}
                </h6>

                <div
                  className="border rounded-3 p-2 bg-light"
                 
                >
                  {center.officers && center.officers.length > 0 ? (
                    <div className="row g-2">
                      {center.officers.map((officer) => (
                        <div key={officer.id} className="col-md-6">
                          <div className="border rounded-3 p-2 bg-white h-100">
                            <div className="fw-bold text-truncate">
                              {officer.officerName || officer.fullName || "N/A"}
                            </div>

                            <div className="small text-muted text-truncate">
                              <i className="bi bi-person-badge me-1"></i>
                              {getRoleLabel(officer.officerDesignation)}
                            </div>

                            {officer?.originalDesignation && (
                             <div className="small text-muted text-truncate">
                              <i className="bi bi-person-badge me-1"></i>
                              {getRoleLabel(officer.originalDesignation)}
                            </div>
                            )}
                            
                            <div className="small">
                              <i className="bi bi-telephone-fill text-success me-1"></i>
                              {officer.officerMobile || officer.mobile || "N/A"}
                            </div>

                            <div className="small text-truncate">
                              <i className="bi bi-envelope-fill text-primary me-1"></i>
                              {officer.officerEmail || officer.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <small className="text-muted">{t("centerDetails.noOfficerDetails")}</small>
                    </div>
                  )}
                </div>
              </div>
              <hr />
            </div>
          </div>
        </div>

        {/* 🔹 FACILITIES SECTION */}
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-building me-2"></i>
                  {t("centerDetails.facilitiesTitle")}
                 
                </h5>

                {/* {Object.keys(groupedAmenities).length > 0 && (
                  <div className="btn-group">
                    <button className="btn btn-outline-primary btn-sm" onClick={expandAll}>
                      <i className="bi bi-arrows-expand me-1"></i>
                      {t("centerDetails.expandAll")}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={collapseAll}>
                      <i className="bi bi-arrows-collapse me-1"></i>
                      {t("centerDetails.collapseAll")}
                    </button>
                  </div>
                )} */}
              </div>

              {loadingAmenities ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t("centerDetails.loading")}</span>
                  </div>
                  <p className="mt-2">{t("centerDetails.loadingFacilities")}</p>
                </div>
              ) : Object.keys(groupedAmenities).length > 0 ? (
                <div className="accordion" id="facilitiesAccordion">
                  {Object.entries(groupedAmenities).map(([typeName, typeData]) => {
                    const isExpanded = expandedSections[typeName];

                    // ✅ IMPORTANT: "Other Amenities / अन्य सुविधाएं" should show only name, no count/status
                    const isOtherAmenitiesSection =
                      (typeName || "").toLowerCase().includes("other") ||
                      (typeName || "").includes("अन्य");

                    return (
                          <div className="accordion-body p-3">
                          {isOtherAmenitiesSection ? (
                            /* ✅ OTHER AMENITIES → BULLET LIST */
                            <>
                              <div className="flex-grow-1 fw-bold">{typeData.name}</div>
                            <ul
                          className="mb-0"
                          style={{
                            listStyleType: "disc",
                            paddingLeft: "1.5rem",
                          }}
                        >
                          {typeData.amenities.map((amenity, index) => (
                            <li
                              key={amenity.id || index}
                              style={{ display: "list-item" }}
                              className="mb-2"
                            >
                              {amenity.amenityName || "Unnamed Facility"}
                            </li>
                          ))}
                        </ul>

                            </>
                          ) : (
                            /* ✅ ALL OTHER AMENITIES → TABLE (UNCHANGED) */
                                
                            <div className="table-responsive">
                              {/* <div className="flex-grow-1 fw-bold pb-2">{typeData.name}</div> */}
                              <table className="table table-bordered align-middle">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: "40%" }}>{t("centerDetails.facilityName")}</th>
                                    <th style={{ width: "30%" }} className="text-center">
                                     {t("centerDetails.availability")}
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {typeData.amenities.map((amenity, amenityIndex) => {
                                    const subAmenities = amenity.subAmenities || [];
                                    const hasSubAmenities = subAmenities.length > 0;
                                    const amenityId = amenity.id || `${typeName}-${amenityIndex}`;
                                    const isAmenityExpanded = expandedAmenities[amenityId];
                                    const isBooleanType = amenity.valueType === "BOOLEAN";

                                    return (
                                      <React.Fragment key={amenityId}>
                                        <tr>
                                          <td>
                                            <div className="fw-semibold">
                                              {amenity.amenityName || "Unnamed Facility"}
                                            </div>

                                            {hasSubAmenities && (
                                              <button
                                                className="btn btn-link p-0 mt-1 text-decoration-none"
                                                onClick={() => toggleAmenity(amenityId)}
                                              >
                                                {isAmenityExpanded ? "▼" : "▶"} {t("centerDetails.subFacility")} (
                                                {subAmenities.length})
                                              </button>
                                            )}
                                          </td>

                                          <td className="text-center">
                                            {isBooleanType ? (
                                              <span
                                                className={`badge px-3 py-1 ${amenity.selected
                                                    ? "bg-success bg-opacity-10 text-success"
                                                    : "bg-danger bg-opacity-10 text-danger"
                                                  }`}
                                              >
                                                {amenity.selected ? "हाँ" : "नहीं"}
                                              </span>
                                            ) : (
                                              <span className="fw-semibold">
                                                {amenity.quantity ??
                                                  amenity.defaultQuantity ??
                                                  0}
                                              </span>
                                            )}
                                          </td>

                                        </tr>

                                        {hasSubAmenities &&
                                          isAmenityExpanded &&
                                          subAmenities.map((subItem, subIndex) => (
                                            <tr key={subItem.id || subIndex} className="table-secondary">
                                              <td colSpan="3" className="ps-4 small">
                                                <i className="bi bi-check-circle-fill text-success me-2" />
                                                {subItem.nameEn || subItem.name}
                                              </td>
                                            </tr>
                                          ))}
                                      </React.Fragment>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-5">
                            <i className="bi bi-building-x display-4 text-muted mb-3"></i>
                            <h6 className="text-muted">{t("centerDetails.noFacilitiesInfo")}</h6>
                            <p className="text-muted small">
                              {t("centerDetails.centerMayNotHaveFacilities")}
                              <br />
                              <button className="btn btn-link btn-sm p-0" onClick={() => window.location.reload()}>
                                {t("centerDetails.tryReload")}
                              </button>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="card border-2 rounded-3"
                      style={{ borderColor: "#5cb85c" }}
                    >
                      <div className="card-body">

                        {/* 🔹 TITLE */}
                        <h6 className="fw-bold mb-3">
                         {t("centerDetails.aajiveekaLibrary")}
                        </h6>
                        {/* 🔹 PHOTO SECTION */}
                        <div
                          className="border-0 rounded-3 p-3 mb-3"
                          style={{ borderColor: "#5cb85c" }}
                        >
                          <div className="row g-3 justify-content-center">
                            {libraryImages?.slice(0, 2).length > 0 ? (
                              libraryImages.slice(0, 2).map((img, index) => (
                                <div className="col-md-6" key={img.id || index}>
                                  <button
                                    className="btn w-100 p-2 fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
                                    style={{
                                      borderRadius: "12px",
                                    }}
                                  >
                                    <img
                                      src={absFileUrl(img.filePath)}
                                      alt={`फोटो ${index + 1}`}
                                      style={{
                                        height: "350px",
                                        width: "100%",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                        backgroundColor: "#fff",
                                      }}
                                    />
                                    <span>{t("centerDetails.images")} {index + 1}</span>
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="col-md-6 text-center">
                                <span className="text-muted">
                                 {t("centerDetails.libraryImageErrorMsg")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🔹 COUNT SECTION */}
                        {/* <div
                          className="border-2 rounded-3 p-3"
                          style={{ borderColor: "#5cb85c" }}
                        >
                          <div className="row g-3 text-center">
                            <div className="col-md-6 border-end">
                              <div className="fw-semibold mb-1">पुस्तक संख्या</div>
                              <div className="fs-5 fw-bold">12</div>
                            </div>

                            <div className="col-md-6">
                              <div className="fw-semibold mb-1">सदस्य संख्या</div>
                              <div className="fs-5 fw-bold">15</div>
                            </div>
                          </div>
                        </div> */}

                      </div>
                    </div>
                  </div>
                  {/* ✅ CMTC CENTER PHOTO GALLERY (NEW SECTION) */}
                <div className="col-12">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body">

              {/* 🔹 MAIN HEADING */}
              <div className="mb-4">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-collection-play me-2"></i>
                  {t("centerDetails.mediaGallery")}
                </h5>
                {/* {galleryImages?.length > 0 && (
                  // <small className="text-muted">
                  //   Click any image to preview on left.
                  // </small>
                )} */}
              </div>

              {/* ================= PHOTO GALLERY SECTION ================= */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-images me-2 text-primary"></i>
                  {t("centerDetails.CmtccenterphotoGallery")}
                </h6>

                {galleryImages && galleryImages.length > 0 ? (
                  <div className="row g-3">
                    {galleryImages.map((img) => {
                      const src = absFileUrl(img.filePath);
                      const isActive = (selectedGallerySrc || "") === src;

                      return (
                        <div key={img.id} className="col-6 col-md-4 col-lg-3">
                          <div
                            className={`border rounded-3 p-2 h-100 ${
                              isActive ? "border-primary" : ""
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedGallerySrc(src)}
                            title={img.imageNameKey || ""}
                          >
                            <img
                              src={src}
                              alt={img.imageNameKey || "CMTC Gallery"}
                              className="img-fluid rounded-3"
                              style={{
                                height: "150px",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <div className="mt-2 d-flex justify-content-between align-items-center">
                              <small
                                className="fw-semibold text-truncate"
                                style={{ maxWidth: "75%" }}
                              >
                                {(img.imageNameKey || "").replaceAll("_", " ")}
                              </small>
                              {/* <span className="badge bg-light text-dark">
                                #{img.priorityNo}
                              </span> */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-3 bg-light">
                    <i className="bi bi-image text-muted fs-1"></i>
                    <div className="text-muted mt-2">
                      {t("centerDetails.galleryImageErrorMsg")}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= CMTC EVENTS (BEFORE VIDEO) ================= */}
              {cmtcEvents && cmtcEvents.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    {t("centerDetails.cmtcPrograms")}
                  </h6>

                  <div className="row g-3">
                    {cmtcEvents.map((event) => (
                      <div key={event.id} className="col-md-4">
                        <div
                          className="card h-100 shadow-sm border-0 rounded-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/cmtc-events/${event.id}`)}
                        >
                          <img
                            src={
                              event.imageUrl
                                ? absFileUrl(event.imageUrl)
                                : defaultImage
                            }
                            alt={event.title}
                            className="card-img-top"
                            style={{
                              height: "140px",
                              objectFit: "cover",
                              borderTopLeftRadius: "12px",
                              borderTopRightRadius: "12px",
                            }}
                          />

                          <div className="card-body">
                            <h6 className="fw-bold text-truncate mb-1">
                              {event.title}
                            </h6>

                            <p className="text-muted small mb-0">
                              {shortText(event.summary, 90)}
                            </p>
                          </div>

                          <div className="card-footer bg-white border-0 text-end">
                            <span className="small text-primary fw-semibold">
                             {t("centerDetails.readMore")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* ================= VIDEO SECTION ================= */}
              <div>
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-play-circle me-2 text-primary"></i>
                  {t("centerDetails.videoTour")}
                </h6>

                {videoUrl ? (
                  <>
                  

                    <video
                      src={videoUrl}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "520px",
                        borderRadius: "12px",
                      }}
                      onError={(e) => {
                        e.currentTarget.controls = false;
                      }}
                    />

                    <div className="small text-muted mt-2">
                      Duration:{" "}
                      <b>{center?.video?.durationSeconds ?? "—"}</b> seconds
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 border rounded-3 bg-light">
                    <i className="bi bi-camera-video-off text-muted fs-1"></i>
                    <div className="text-muted mt-2">
                      {t("centerDetails.videoErrorMsg")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

        {/* ACTIONS */}
        <div className="col-md-12 mt-3">
          <button className="btn btn-outline-secondary fw-bold me-2" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1"></i>
            {t("centerDetails.back")}
          </button>
          <button
            className="btn btn-primary fw-bold"
            onClick={() => navigate(`/cmtc-booking/${center.centerId || center.id}`)}
          >
            <i className="bi bi-calendar-check me-1"></i>
            {t("centerDetails.bookNow")}
          </button>
        </div>
      </div>
    </div>
  );
}