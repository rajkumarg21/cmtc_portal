import React, { useEffect, useState } from 'react'
import { getAllGradingQuestions, submitGrading } from '../../services/gradingService';
import { useTranslation } from "react-i18next";
import {
  getAllDistricts,
  getBlocksByDistrict,
  getCentersByDistrict,
  getCentersByBlock,
  getAllPublicCenters
} from "../../services/cmtcCenterService.js";
import { isValidId, isValidDate,sanitizeText } from "../../utils/security";

function GradingPage() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState({ internal: [], external: [] });
  const [answers, setAnswers] = useState({});
  const [gradingType, setGradingType] = useState("internal");

  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedCenters, setSelectedCenters] = useState("");
  const [establishmentYear, setestablishmentYear] = useState("");
  const [centerLoading, setCenterLoading] = useState(false);

  useEffect(() => {
    if (questions[gradingType].length === 0) {
      fetchQuestions(gradingType);
    }
  }, [gradingType]);

  const fetchQuestions = async (type) => {
    try {
      const res = await getAllGradingQuestions(type);
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


  const handleSubmit = async () => {
    try {

      const payload = {
        cycleId: 1, // ya selected cycle id
        centerId: selectedCenters,
        assessmentType:
          gradingType === "internal"
            ? "internal_grading"
            : "external_grading",

        graderOfficerId: 4, // login se lo
        graderUserId: 117,   // login se lo
        remarks: "Submitted from UI",

        questionMarks: questions[gradingType].map((q) => ({
          questionId: q.id,
          obtainedMarks: Number(answers[q.id]?.marks || 0),
          maxMarks: q.maxScore
        }))
      };

      await submitGrading(payload);

      alert("Submitted Successfully!");

    } catch (error) {
      console.error(error);
      alert("Submission Failed");
    }
  };




  // ✅ Load all districts
  useEffect(() => {
    getAllDistricts().then((res) => {
      setDistricts(res.data);
    });
    setCenterLoading(true);
    // getAllPublicCenters().then((data) => {
    //   setCenters(data);
    // }).finally(setCenterLoading(false))
    getAllPublicCenters()
      .then((data) => {
        setCenters(data);
      })
      .catch((err) => {
        console.error("Center load failed", err);
        setCenters([]);
      })
      .finally(() => {
        setCenterLoading(false);
      });
  }, []);


  // ✅ ADDED: Load blocks + centers when district changes
  useEffect(() => {
    if (selectedDistrict) {
      getBlocksByDistrict(selectedDistrict).then((res) => {
        setBlocks(res.data); // load blocks
      });

      getCentersByDistrict(selectedDistrict).then((res) => {
        setCenters(res.data); // filter centers by district
      });

      setSelectedBlock(""); // reset block
    }
  }, [selectedDistrict]);
  // ✅ ADDED: Load centers when block changes
  useEffect(() => {
    if (selectedBlock) {
      getCentersByBlock(selectedBlock).then((res) => {
        setCenters(res.data); // filter centers by block
        setestablishmentYear(res.data[0].establishmentYear);
      });
    }
  }, [selectedBlock]);

  useEffect(() => {
  if (selectedCenters) {
    const selectedCenterObj = centers.find(
      (c) => c.centerId === Number(selectedCenters)
    );

    if (selectedCenterObj) {
      setestablishmentYear(selectedCenterObj.establishmentYear);
    }
  } else {
    setestablishmentYear("");
  }
}, [selectedCenters, centers]);

  return (

    <>

      <div className="container mt-4">
        {/* grading search section*/}
        <div className="card shadow-sm border-0 rounded-4 p-4 search-card">
          <h4 className="fw-bold text-center mb-4 section-title">
            {gradingType === "internal"
              ? "सीएमटीसी अर्धवार्षिक आंतरिक ग्रेडिंग प्रपत्र"
              : "सीएमटीसी वार्षिक बाहरी ग्रेडिंग प्रपत्र"}
            <br />
            <small className="fw-normal">
              {gradingType === "internal"
                ? "(सीएमटीसी के अर्धवार्षिक आंतरिक की ग्रेडिंग निर्धारित प्रपत्र में ग्रेडिंग दल के द्वारा की जानी है)"
                : "(सीएमटीसी के वार्षिक बाहरी ग्रेडिंग निर्धारित प्रपत्र में ग्रेडिंग दल के द्वारा की जानी है)"}
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
                  {gradingType.toUpperCase()}
                </button>

                <ul className="dropdown-menu">
                  <li>
                    <button
                      className={`dropdown-item ${gradingType === "internal" ? "active" : ""}`}
                      onClick={() => setGradingType("internal")}
                    >
                      Internal
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item ${gradingType === "external" ? "active" : ""}`}
                      onClick={() => setGradingType("external")}
                    >
                      External
                    </button>
                  </li>
                </ul>
              </div>
            </div>


            <div className="row g-3">

              {/* District */}
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.districtNameEn}
                    </option>
                  ))}

                </select>
              </div>

              {/* ADDED: Block Dropdown */}
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                >
                  <option value="">Select Block</option>
                  {blocks.map((b) => (
                    <option key={b.blockId} value={b.blockId}>
                      {b.blockNameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center */}
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedCenters}
                  onChange={(e) => setSelectedCenters(e.target.value)}
                >

                  <option value="">Select Center</option>
                  {centers.map((c) => (
                    <option key={c.centerId} value={c.centerId}>
                      {c.name}
                    </option>
                  ))}

                </select>
              </div>

              {/* Establishment Year */}
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control"
                  value={establishmentYear}
                  onChange={(e) => setestablishmentYear(e.target.value)}
                  placeholder={sanitizeText(t("grading.establishmentYear"))}
                />
              </div>

            </div>



            {/* CLF Name */}
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder={sanitizeText(t("grading.clfName"))}
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

            {/* Search */}
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
            <table className="table text-center m-0 table-bordered border-dark align-middle">
              <thead className="table-primary border-dark text-center">
                <tr>
                  <th style={{ width: "5%" }}>{sanitizeText(t("grading.serialNo"))}</th>
                  <th style={{ width: "30%" }}>{sanitizeText(t("grading.questions"))}</th>
                  <th style={{ width: "15%" }}>{sanitizeText(t("grading.remark"))}</th>
                  <th style={{ width: "5%" }}>{sanitizeText(t("grading.point"))}</th>
                  <th style={{ width: "15%" }}>{sanitizeText(t("grading.marks"))}</th>
                </tr>
              </thead>
              <tbody>
                {questions[gradingType]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((q, index) => (
                    <tr key={q.id} className="border-dark">
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

                      {/* Max Points */}
                      <td>{q.maxScore}</td>

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
          {gradingType !== "internal" &&
            <div className="table-responsive mt-4">
              <h3 className="fs-4 fw-bold">Team Members Information</h3>
              <table className="table text-center m-0 table-bordered border-dark">
                <thead className="table-primary border-dark">
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
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                  </tr>

                  {/*member info -2*/}
                  <tr className="border-dark">
                    <th>CLF Auditor</th>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                  </tr>

                  {/*member info -3*/}
                  <tr className="border-dark">
                    <th>CLF Accountant</th>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                  </tr>

                  {/*member info -4*/}
                  <tr className="border-dark">
                    <th>Block Member</th>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                    <td>
                      <input type="text" className="form-control border-secondary rounded-0" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
          {/* grading system table*/}
          <div className="table-responsive mt-4">
            <h3 className="fs-4 fw-bold">Grading System</h3>
            <table className="table table-bordered border-dark text-center m-0">
              <thead className="table-primary border-dark">
                <tr>
                  <th scope="col">Serial no.</th>
                  <th scope="col">Marks</th>
                  <th scope="col">Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>1</th>
                  <td>91 से 100</td>
                  <td>A+</td>
                </tr>
                <tr>
                  <th>2</th>
                  <td>90 से 70</td>
                  <td>A</td>
                </tr>
                <tr>
                  <th>3</th>
                  <td>69 से 60</td>
                  <td>B</td>
                </tr>
                <tr>
                  <th>4</th>
                  <td>59 से 50</td>
                  <td>C</td>
                </tr>
                <tr>
                  <th>5</th>
                  <td>49 से कम</td>
                  <td>D</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn btn-success w-100 mt-2"
            onClick={handleSubmit}
          >
            Submit
          </button>

        </div>
      </div>


      {/*  modal-table submit button
    <div className="modal fade" id="GradingSubmitModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
            <div className="modal-content">
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
    </div> */}


    </>
  )
}

export default GradingPage