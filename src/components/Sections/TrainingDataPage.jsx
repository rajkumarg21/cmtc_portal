import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { isValidId, isValidDate,sanitizeText } from "../../utils/security";
function TrainingDataPage() {
   const [paid, setPaid] = useState(""); 
    const { t } = useTranslation();
  return (
   <>
   <div className="container mt-4">
  <div className="card shadow-sm border-0 rounded-4 p-4 search-card w-75 mx-auto">
    <h4 className="fw-bold text-center mb-4 section-title">
    {sanitizeText(t("Training_report.trainingReportTitle"))}
    </h4>

    <div className="row g-3">

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.district"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.block"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.clfName"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.cmtcName"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.institutionName"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.verticalName"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.residentialType"))}</label>
         <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.noOfDays"))}</label>
        <input type="number" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.designationOfTraining"))}</label>
        <input type="number" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-6">
        <label className="fw-bold">{sanitizeText(t("Training_report.dateRange"))} - {sanitizeText(t("Training_report.fromDate"))}</label>
        <input type="date" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-6">
        <label className="fw-bold">{sanitizeText(t("Training_report.toDate"))}</label>
        <input type="date" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.totalParticipants"))}</label>
        <input type="number" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.trainingName"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-4">
        <label className="fw-bold">{sanitizeText(t("Training_report.typeOfTraining"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-6">
        <label className="fw-bold">{sanitizeText(t("Training_report.typeOfPeople"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-6">
        <label className="fw-bold">{sanitizeText(t("Training_report.trainerMobile"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-12">
        <label className="fw-bold">{sanitizeText(t("Training_report.paidOrNot"))}</label><br />
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="paidStatus"
            value="Yes"
            onChange={(e) => setPaid(e.target.value)}
          />
          <label className="form-check-label"> {sanitizeText(t("Training_report.yes"))}</label>
        </div>

        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="paidStatus"
            value="No"
            onChange={(e) => setPaid(e.target.value)}
          />
          <label className="form-check-label">  {sanitizeText(t("Training_report.no"))}</label>
        </div>
      </div>

      {paid === "Yes" && (
        <>
          <div className="col-md-6">
            <label className="fw-bold">{sanitizeText(t("Training_report.dateOfPay"))}</label>
            <input type="date" className="form-control border-secondary rounded-2" />
          </div>

          <div className="col-md-6">
            <label className="fw-bold">{sanitizeText(t("Training_report.paidAmount"))}</label>
            <input type="number" className="form-control border-secondary rounded-2" />
          </div>
        </>
      )}

      <div className="col-md-6">
        <label className="fw-bold">{sanitizeText(t("Training_report.amountToBePaid"))}</label>
        <input type="number" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-6">
        <label className="fw-bold">{sanitizeText(t("Training_report.participantCategory"))}</label>
        <input type="text" className="form-control border-secondary rounded-2" />
      </div>

      <div className="col-md-12">
        <button type="button" className="btn btn-success w-100 mt-2">
           {sanitizeText(t("Training_report.submit"))}
        </button>
      </div>

    </div>
  </div>
</div>

    </>
  )
}

export default TrainingDataPage
