import React from 'react'
import "./OrganizationStructure.css";
import { useTranslation } from "react-i18next";
function OrganizationStructure() {
  const { t} = useTranslation();
  return (
     <div className="container py-5">
      <div className="org-title mb-5">
         {t("Organization_structure.organisationStructure")}
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6 text-center">

          <div className="org-card ceo"> {t("Organization_structure.ceoMpSrlm")}</div>
          <div className="connector"></div>

          <div className="org-card blue"> {t("Organization_structure.stateCmtcInCharge")}</div>
          <div className="connector"></div>

          <div className="org-card red"> {t("Organization_structure.dpm")}</div>
          <div className="connector"></div>

          <div className="org-card blue"> {t("Organization_structure.districtCmtcIncharge")}</div>
          <div className="connector"></div>

          <div className="org-card blue"> {t("Organization_structure.blockCmtcIncharge")}</div>
          <div className="connector"></div>

          <div className="org-card green"> {t("Organization_structure.clf")}</div>
        </div>
      </div>

      {/* First Split Line */}
      <div className="row justify-content-center mt-4">
        <div className="col-md-8">
          <div className="horizontal-line"></div>
        </div>
      </div>

      <div className="row justify-content-center mt-0">
        <div className="col-md-4 text-center">
          <div className="small-connector"></div>
          <div className="org-card yellow">
            {t("Organization_structure.cmtcProcurementCommittee")}
          </div>
        </div>

        <div className="col-md-4 text-center">
          <div className="small-connector"></div>
          <div className="org-card yellow">
             {t("Organization_structure.cmtcManagementCommittee")}
          </div>
        </div>
      </div>

      <div className="row justify-content-center mt-0">
        <div className="col-md-4 text-center">
          <div className="small-connector"></div>
          <div className="org-card yellow"> {t("Organization_structure.cmtcAccountants")}</div>
        </div>

        <div className="col-md-4 text-center">
          <div className="small-connector"></div>
          <div className="org-card yellow"> {t("Organization_structure.cmtcManager")}</div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationStructure
