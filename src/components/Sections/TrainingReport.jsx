import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sanitizeText } from "../../utils/security";
function TrainingReport() { 
      const { t } = useTranslation();
      const handleDownloadPdf = () => {
      console.log("Download PDF");
    };

    const handleDownloadExcel = () => {
      console.log("Download Excel");
    };
  return (
    <>
     <div className="container mt-4">
      {/* grading search section*/}
     <div className="card shadow-sm border-0 rounded-4 p-4 search-card">
        <h4 className="fw-bold text-center mb-4 section-title"> {sanitizeText(t("Training_report.trainingReportTitle"))}</h4>
        <div className="d-flex justify-content-center align-items-center">
          <div className="d-flex flex-column flex-md-row gap-2">
          <div className="d-flex gap-2">
            {/* Add New Report */}
            <Link to="/training_data" className="btn btn-success">
            + {sanitizeText(t("Training_report.addNewReport"))}
            </Link>

            {/* Download PDF */}
            <button type="button" className="btn btn-outline-danger" onClick={handleDownloadPdf}>
              {sanitizeText(t("Training_report.downloadPdf"))}
            </button>

            {/* Download Excel */}
            <button type="button" className="btn btn-outline-success" onClick={handleDownloadExcel}>
              {sanitizeText(t("Training_report.downloadExcel"))}
            </button>
          </div>
        </div>
      </div>
      </div>

        {/*data table */}
         <div className="card shadow-sm border-0 rounded-4 p-3 mt-4 search-card">
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle text-center text-nowrap m-0">
            <thead className="table-primary border-dark">
              <tr>
                <th>{sanitizeText(t("Training_report.serialNo"))}</th>
                <th>{sanitizeText(t("Training_report.district"))}</th>
                <th>{sanitizeText(t("Training_report.block"))}</th>
                <th>{sanitizeText(t("Training_report.clfName"))}</th>
                <th>{sanitizeText(t("Training_report.cmtcName"))}</th>
                <th>{sanitizeText(t("Training_report.institutionName"))}</th>
                <th>{sanitizeText(t("Training_report.verticalName"))}</th>
                <th>{sanitizeText(t("Training_report.residentialType"))}</th>
                <th>{sanitizeText(t("Training_report.noOfDays"))}</th>
                <th>{sanitizeText(t("Training_report.dateRange"))}</th>
                <th>{sanitizeText(t("Training_report.totalParticipants"))}</th>
                <th>{sanitizeText(t("Training_report.trainingName"))}</th>
                <th>{sanitizeText(t("Training_report.typeOfPeople"))}</th>
                <th>{sanitizeText(t("Training_report.designationOfTraining"))}</th>
                <th>{sanitizeText(t("Training_report.typeOfTraining"))}</th>
                <th>{sanitizeText(t("Training_report.trainerMobile"))}</th>
                <th>{sanitizeText(t("Training_report.paidOrNot"))}</th>
                <th>{sanitizeText(t("Training_report.dateOfPay"))}</th>
                <th>{sanitizeText(t("Training_report.paidAmount"))}</th>
                <th>{sanitizeText(t("Training_report.amountToBePaid"))}</th>
                <th>{sanitizeText(t("Training_report.participantCategory"))}</th>
                <th>{sanitizeText(t("Training_report.action"))}</th>
              </tr>
            </thead>
            <tbody className="border-dark">
              <tr>
                <td>{sanitizeText("1")}</td>
                <td>{sanitizeText("Bhopal")}</td>
                <td>{sanitizeText("Phanda")}</td>
                <td>{sanitizeText("Shakti CLF")}</td>
                <td>{sanitizeText("CMTC Bhopal")}</td>
                <td>{sanitizeText("BSNL - MPSEDC")}</td>
                <td>{sanitizeText("IT")}</td>
                <td>{sanitizeText("Residential")}</td>
                <td>{sanitizeText("5")}</td>
                <td>{sanitizeText("01 Jan 2026 – 05 Jan 2026")}</td>
                <td>{sanitizeText("30")}</td>
                <td>{sanitizeText("IT Services Discussion")}</td>
                <td>{sanitizeText("SHG Members")}</td>
                <td>{sanitizeText("Software engineer")}</td>
                <td>{sanitizeText("Skill Training")}</td>
                <td>{sanitizeText("8596873215")}</td>
                <td>
                  <span className="badge bg-success">Yes</span>
                </td>
                <td>{sanitizeText("06 Jan 2026")}</td>
                <td>{sanitizeText("₹50,000")}</td>
                <td>{sanitizeText("₹50,000")}</td>
                <td>{sanitizeText("Women SHG")}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-link text-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#ViewReportModal"
                  >
                   {sanitizeText(t("Training_report.view"))}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  )
}

export default TrainingReport
