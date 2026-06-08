import React, { useEffect, useState } from 'react'
import { getAllAuditQuestions } from '../../services/auditService';
import { useTranslation } from "react-i18next";
function AuditPage() {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState({internal: [],external: []});
    const [answers, setAnswers] = useState({});
    const [auditingType, setAuditingType] = useState("internal");

     useEffect(() => {
        if (questions[auditingType].length === 0) {
        fetchQuestions(auditingType);
         }
      }, [auditingType]);
    
      const fetchQuestions = async (type) => {
        try {
          const res = await getAllAuditQuestions(type);
          const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
              setQuestions((prev) => ({
        ...prev,
        [type]: data.length ? data : prev.internal, 
      }));
        } catch (error) {
          console.error("Failed to fetch questions", error);
        }
      };
    
      const handleChange = (questionId, field, value) => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            [field]: value,
          },
        }));
      };
  return (
    <>
    <div className="container mt-4">
      {/* grading search section*/}
     <div className="card shadow-sm border-0 rounded-4 p-4 search-card">
        <h4 className="fw-bold text-center mb-4 section-title">
          {auditingType === "internal"
            ? "सीएमटीसी तिमाही आंतरिक अंकेक्षण प्रपत्र"
            : "सीएमटीसी वार्षिक बाहरी अंकेक्षण प्रपत्र"}
          <br />
          <small className="fw-normal">
            {auditingType === "internal"
              ? "(सीएमटीसी के तिमाही आंतरिक की  निर्धारित प्रपत्र में अंकेक्षण दल के द्वारा की जानी है)"
              : "(सीएमटीसी के वार्षिक बाहरी ग्रेडिंग निर्धारित प्रपत्र में अंकेक्षण दल के द्वारा की जानी है)"}
          </small>
        </h4>

        <div className="row g-3">
          <div className="col-md-12 text-end">
            <div className="nav-item dropdown">
            <button
              className="btn btn-danger text-white dropdown-toggle fw-bold"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
            {auditingType.toUpperCase()}
            </button>

            <ul className="dropdown-menu">
              <li>
                <button
                  className={`dropdown-item ${auditingType === "internal" ? "active" : ""}`}
                  onClick={() => setAuditingType("internal")}
                >
                  Internal
                </button>
              </li>
               <li>
              <button
                className={`dropdown-item ${auditingType === "external" ? "active" : ""}`}
                onClick={() => setAuditingType("external")}
              >
                External
              </button>
            </li>
            </ul>
          </div>
          </div>
          {/* District */}
          <div className="col-md-4">
            <select className="form-select h-100">
              <option>{t("grading.district")}</option>
              <option>Bhopal</option>
              <option>Indore</option>
              <option>Jabalpur</option>
            </select>
          </div>

          {/* CMTC */}
          <div className="col-md-4">
            <select className="form-select h-100">
              <option>{t("grading.cmtcName")}</option>
              <option>Phanda</option>
              <option>Huzur</option>
              <option>Berasia</option>
            </select>
          </div>

           {/*Quarter */}
          <div className="col-md-4">
            <select className="form-select h-100">
              <option>{t("grading.quarterName")}</option>
              <option>Q1</option>
              <option>Q2</option>
              <option>Q3</option>
              <option>Q4</option>
            </select>
          </div>

          {/* Establishment Year */}
          <div className="col-md-4">
            <input
              type="number"
              className="form-control h-100"
              placeholder={t("grading.establishmentYear")}
            />
          </div>

          {/* CLF Name */}
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder={t("grading.clfName")}
            />
          </div>

          {/* Committee Name */}
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder={t("grading.committeeName")}
            />
          </div>

          {/* From Date */}
          <div className="col-md-4">
            <label className="form-label small">From Date</label>
            <input type="date" className="form-control" />
          </div>

          {/* To Date */}
          <div className="col-md-4">
            <label className="form-label small">To Date</label>
            <input type="date" className="form-control" />
          </div>

          {/* Seacrh */}
          <div className="col-md-4 d-flex align-items-end">
            <button type="button" className="btn btn-primary w-100">
             Search
            </button>
          </div>
        </div>
      </div>

      {/*grading form section*/}
      <div className="card shadow-sm border-0 rounded-4 p-4 search-card mt-4">
        {/*form */}
         <div className="table-responsive">
            <table className="table text-center m-0 table-bordered border-dark align-middle ">
               <thead className="table-primary border-dark text-center">
                  <tr>
                    <th style={{ width: "5%" }}>
                      {t("grading.serialNo")}
                    </th>

                    <th style={{ width: "30%" }}>
                      {t("grading.questions")}
                    </th>

                    <th style={{ width: "15%" }}>
                      {t("auditing.aRemark1")}
                    </th>

                    <th style={{ width: "15%" }}>
                      {t("auditing.aRemark2")}
                    </th>

                    <th style={{ width: "15%" }}>
                      {t("auditing.aRemark3")}
                    </th>
                  </tr>
                </thead>
              <tbody>
                {questions[auditingType]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((q, index) => (
                <tr  key={q.id} className="border-dark">
                  {/* Serial No */}
                  <th scope="row">{index + 1}</th>
                  {/* Question */}
                  <td>{q.questionTextHi}</td>
                  {/* Remark */}
                    <td>
                      <input
                        type="text"
                        className="form-control border-secondary rounded-0"
                        value={answers[q.id]?.remark || ""}
                        onChange={(e) =>
                          handleChange(q.id, "remark", e.target.value)
                        }
                      />
                    </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                 {/* Marks */}
                    <td>
                      <input
                        type="number"
                        max={q.maxScore}
                        className="form-control border-secondary rounded-0"
                        value={answers[q.id]?.marks || ""}
                        onChange={(e) =>
                          handleChange(q.id, "marks", e.target.value)
                        }
                      />
                    </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* members information table */}
         <div class="table-responsive mt-4">
          <h3 className="fs-4 fw-bold">Audit Team Members Information</h3>
            <table className="table text-center m-0 table-bordered border-dark">
              <thead  className="table-primary border-dark">
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Name</th>
                  <th scope="col">Designation</th>
                  <th scope="col">Signature</th>
                </tr>
              </thead>
              <tbody>
                {/*member info -1*/}
                <tr className="border-dark">
                  <th>DFM/In-Charge</th>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                </tr>

                 {/*member info -2*/}
                <tr className="border-dark">
                  <th>CLF Auditor</th>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                </tr>

                 {/*member info -3*/}
                <tr className="border-dark">
                  <th>CLF Accountant</th>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                </tr>

                 {/*member info -4*/}
                <tr className="border-dark">
                  <th>Block Member</th>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                  <td>
                    <input type="text" className="form-control border-secondary rounded-0"/>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
           <button
              type="button"
              className="btn btn-success w-100 mx-auto mt-2"
              data-bs-toggle="modal"
              data-bs-target="#AuditSubmitModal"
            >
            Submit
            </button>
      </div>
    </div>


    {/*  modal-table submit button */}
    <div className="modal fade" id="AuditSubmitModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
            <div className="modal-content">
                <div className="modal-header border-0">
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <p className="p-2"> 
                      <span className="fw-bold">नोट :-</span>जिलों में स्थापित प्रत्येक सीएमटीसी का तिमाही आंतरिक अंकेक्षण प्रपत्र क्मांक 02 में उल्लेखित सभी विषयों के आधार पर किया जाना है। उल्लेखित सभी विषयों पर विषय की गुणवत्ता और प्रगति के आधार पर अंक दिये जाने है। दिये गये अंकों के आधार पर संबंधित विषय को A,B,C,D ग्रेड भी दिया जाना है। अतः उक्त संबंध में अंकेक्षण दल सावधानी पूर्वक सभी बिन्दुओं को ठीक से समझ कर और उनकी प्रगति तथा गुणवत्ता की स्थिति का सही आकलन और विश्लेषण कर के अंक देने और दिये गये अंकों के आधार पर ग्रेडिंग करने का काम करेंगे। संवेदनशीलता, समझ, जानकारी और निष्पक्ष एवं पारदर्शी तरीके से तिमाही आंतरिक अंकेक्षण के निर्धारित विषयों की ग्रेडिंग का कार्य अंकेक्षण की निर्धारित अवधि में ही अनिवार्य रूप से किया जाना है। ग्रेडिंग प्रपत्र क्रमांक 03 जिले में जिला परियोजना प्रबंधक एवं मुख्य कार्यपालन अधिकारी, जिला पंचायत सह अतिरिक्त मिशन संचालक एवं राज्य कार्यालय को अंकेक्षण रिपोर्ट के साथ अनिवार्यतः प्रेषित किया जाना है।
                    </p>
                    <div className="form-check mt-2">
                      <input className="form-check-input  border border-secondary" type="checkbox" value="" id="checkDefault" />
                      <label className="form-check-label" for="checkDefault">
                       Check before proceeding
                      </label>
                    </div> 
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default AuditPage
