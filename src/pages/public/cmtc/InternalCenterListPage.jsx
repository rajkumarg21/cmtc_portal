import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCentersByDistrict,
  getCentersByBlock,
  getAllPublicCenters,
} from "../../../services/cmtcCenterService";

import useLocationHierarchy from "../../../hooks/useLocationData.js";

import defaultImages from "./../../../assets/images/defaultImages.jpg";
import "./../../../customStyle.css";

import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../../components/ui/LoadingSpinner.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";

export default function InternalCmtcCenterList() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const {
    districts,
    blocks,
    selectedDistrict,
    selectedBlock,
    setSelectedDistrict,
    setSelectedBlock,
    fetchDistricts,
    loadingDistricts,
    loadingBlocks,
  } = useLocationHierarchy({
    isHindi: i18n.resolvedLanguage === "hi",
  });

  const [centers, setCenters] = useState([]);
  const [centerLoading, setCenterLoading] = useState(false);

  const cardsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const isDistrictLocked = !!user?.districtId;
  const isBlockLocked = !!user?.blockId;

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      setCenterLoading(true);

      await fetchDistricts();

      // If user has district restriction
      if (user?.districtId) {
        setSelectedDistrict(String(user.districtId));
      }

      // If user has block restriction
      if (user?.blockId) {
        setSelectedBlock(String(user.blockId));
      }

      // If no restriction load all centers
      if (!user?.districtId) {
        const res = await getAllPublicCenters();
        setCenters(res);
      }

      setCenterLoading(false);
    };

    init();
  }, []);

  // -----------------------------
  // DISTRICT CHANGE
  // -----------------------------
  useEffect(() => {
    if (!selectedDistrict) return;

    const load = async () => {
      setCenterLoading(true);

      const res = await getCentersByDistrict(selectedDistrict);

      setCenters(res.data);
      setCurrentPage(1);

      setCenterLoading(false);
    };

    if (!isDistrictLocked) {
      load();
    }
  }, [selectedDistrict]);

  // -----------------------------
  // BLOCK CHANGE
  // -----------------------------
  useEffect(() => {
    if (!selectedBlock) return;

    const load = async () => {
      setCenterLoading(true);

      const res = await getCentersByBlock(selectedBlock);

      setCenters(res.data);
      setCurrentPage(1);

      setCenterLoading(false);
    };

    load();
    
  }, [selectedBlock]);

  // -----------------------------
  // PAGINATION
  // -----------------------------
  const totalPages = Math.ceil(centers.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentCards = centers.slice(startIndex, startIndex + cardsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (centerLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* SEARCH */}
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
                disabled={loadingDistricts || isDistrictLocked}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="">{t("centerList.selectDistrict")}</option>

                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BLOCK */}
            <div className="col-md-4">
              <select
                className="form-select form-select-lg"
                value={selectedBlock}
                disabled={!selectedDistrict || loadingBlocks || isBlockLocked}
                onChange={(e) => setSelectedBlock(e.target.value)}
              >
                <option value="">{t("centerList.selectBlock")}</option>

                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER CARDS */}
      <div className="container my-4 p-6">
        <div className="row g-4">
          {currentCards.map((card, index) => (
            <div className="col-md-4" key={index}>
              <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden center-card">

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

                <div className="card-body">
                  <h5 className="fw-bold mb-1 text-primary">
                    {card.name}
                  </h5>

                  <p className="mb-1 text-muted small">
                    <strong>{card.districtNameEn}</strong> • {card.blockName}
                  </p>

                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-teal rounded-pill px-4 fw-semibold"
                      onClick={() =>
                        navigate(`/center-details/${card.centerId}`)
                      }
                    >
                      {t("centerList.viewDetails")}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
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