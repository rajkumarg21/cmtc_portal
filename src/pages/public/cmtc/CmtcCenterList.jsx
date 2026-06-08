import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAllDistricts,
  getBlocksByDistrict,
  getCentersByDistrict,
  getCentersByBlock,
  getAllPublicCenters
} from "../../../services/cmtcCenterService.js";
import defaultImages from "./../../../assets/images/defaultImages.jpg";
import "./../../../customStyle.css";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../../components/ui/LoadingSpinner.jsx";

export default function CmtcCenterList() {
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [centerLoading, setCenterLoading] = useState(false);

  const { districtName } = useParams();
  const navigate = useNavigate();
  const { t, i18n} = useTranslation();

  // ✅ PAGINATION STATE
  const cardsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Load all districts
  useEffect(() => {
    const fetchInitialData = async () => {
      setCenterLoading(true);

      try {
        const districtRes = await getAllDistricts();
        setDistricts(districtRes.data);

        // ✅ Only load all centers if NO district in URL
        if (!districtName) {
          const centersRes = await getAllPublicCenters();
          setCenters(centersRes);
        }
      } finally {
        setCenterLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ✅ Auto-select district from URL
  useEffect(() => {
    if (districts.length && districtName) {
      const matched = districts.find(
        (d) => d.districtNameEn.toLowerCase() === districtName.toLowerCase()
      );
      if (matched) setSelectedDistrict(matched.districtId);
    }
  }, [districts, districtName]);

  // ✅ Load blocks + centers on district change
  useEffect(() => {
    if (selectedDistrict) {
      getBlocksByDistrict(selectedDistrict).then((res) => {
        setBlocks(res.data);
      });

      // ADDED: Loader while loading district centers
      setCenterLoading(true);
      getCentersByDistrict(selectedDistrict)
        .then((res) => {
          setCenters(res.data);
          setCurrentPage(1);
        })
        .finally(() => {
          setCenterLoading(false); 
        });

      setSelectedBlock("");
    }
  }, [selectedDistrict]);

  // ✅ Load block-wise centers
  useEffect(() => {
    if (selectedBlock) {
     // ADDED: Loader while loading block centers
    setCenterLoading(true);
    getCentersByBlock(selectedBlock)
      .then((res) => {
        setCenters(res.data);
        setCurrentPage(1);
      })
      .finally(() => {
        setCenterLoading(false); 
      });
    }
  }, [selectedBlock]);

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(centers.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentCards = centers.slice(startIndex, startIndex + cardsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if(centerLoading){
    return <LoadingSpinner/>
  }

 return (
  <>
    {/* 🔍 SEARCH SECTION */}
    <div className="container mt-4">
      <div className="card shadow-sm border-0 rounded-4 p-4 search-card">
        <h4 className="fw-bold text-center mb-3 section-title">
          {t("centerList.searchTitle")}
        </h4>

        <div className="row g-3 justify-content-center">
          {/* DISTRICT */}
          <div className="col-md-4">
            <select
              className="form-select form-select-lg"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">{t("centerList.selectDistrict")}</option>
              {districts.map((d) => (
                <option key={d.districtId} value={d.districtId}>
                  {i18n.resolvedLanguage === "hi"
                    ? d.districtNameHi || d.districtNameEn
                    : d.districtNameEn || d.districtNameHi
                  }
                   </option>
              ))}
            </select>
          </div>

          {/* BLOCK */}
          <div className="col-md-4">
            <select
              className="form-select form-select-lg"
              disabled={!selectedDistrict}
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
            >
              <option value="">{t("centerList.selectBlock")}</option>
              {blocks.map((b) => (
                <option key={b.blockId} value={b.blockId}>
                  {
                    i18n.resolvedLanguage === "hi"
                      ? b.blockNameHi || b.blockNameEn
                      : b.blockNameEn || b.blockNameHi
                  }
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>

                {/* 🏢 CENTER CARDS */}
                  <div className="container my-4 p-6" >
                    <div className="row g-4">
                      {currentCards.map((card, index) => (
                        <div className="col-md-4" key={index}>
                          <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden center-card">

                            {/* IMAGE */}
                          <div className="center-image-wrapper">
                <img
                  src={
                    card.imageUrl
                      ? `${import.meta.env.VITE_BASE_URL}${card.imageUrl}`
                      : defaultImages
                  }
                  className="center-image"
                  alt="center"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultImages;
                  }}
                />
              </div>

              {/* HEADER */}
              <div className="card-body">
                <h5 className="fw-bold mb-1 text-primary">
                  {card.name}
                </h5>
                <p className="mb-1 text-muted small">
                  <strong>
                    {i18n.resolvedLanguage === "hi"
                      ? card.districtNameHi || card.districtNameEn
                      : card.districtNameEn || card.districtNameHi}
                  </strong>
                  {" • "}
                  {i18n.resolvedLanguage === "hi"
                      ? card.blockNameHi || card.blockNameEn
                      : card.blockNameEn || card.blockNameHi}
                </p>

                <div className="d-flex justify-content-end">
                 <button
                  className="btn btn-teal rounded-pill px-4 fw-semibold"
                  onClick={() => navigate(`/center-details/${card.id || card.centerId}`)}
                >
                  {t("centerList.viewDetails")}
                </button>

                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📄 PAGINATION */}
      {centers.length > cardsPerPage && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pagination-teal">
          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            {t("pagination.previous")}
          </button>

          <span className="fw-semibold">
            {t("pagination.page")} {currentPage} / {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
             {t("pagination.next")} 
          </button>
        </div>
      )}

      {/* 🚫 EMPTY STATE */}
      {centers.length === 0 && (
        <div className="text-center mt-5">
          <p className="fs-5 text-muted">
           {t("centerList.noCentersFound")}
          </p>
        </div>
      )}
    </div>
  </>
);

}
