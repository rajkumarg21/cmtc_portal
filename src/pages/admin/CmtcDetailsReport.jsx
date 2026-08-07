import React, { useEffect, useState } from "react";
import { getCmtcReports, getCmtcDetailsMonthlyReport } from "../../services/reportService";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function CmtcDetailsReport() {

    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);

    const [loading, setLoading] = useState(false);

    const [financialYearId, setFinancialYearId] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [monthlyReportData, setMonthlyReportData] = useState([]);
    // ================= Fetch Report =================
    const fetchReports = async () => {

        try {

            setLoading(true);

            const data = await getCmtcReports(financialYearId);

            setReports(data);
            setFilteredReports(data);

        } catch (err) {

            console.error("Report Error:", err);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // ================= Apply Filter =================
    const applyFilters = async () => {
        fetchReports();
    };

    // ================= Excel Download =================
    const downloadExcel = () => {

        const exportData = filteredReports.map((item, index) => ({

            S_No: index + 1,
            CMTC_Name: item.nameOfCmtc,
            District: item.district,
            Block: item.blockName,

            Residential_Participants: item.totalResidentialParticipants,
            Non_Residential_Participants: item.totalNonResidentialParticipants,

            Food_Preparation: item.totalFoodPreparation,
            Material_Purchase: item.totalMaterialPurchase,
            Services: item.totalServices,

            Trainers_Payment: item.totalTrainersPayment,

            Net_Savings: item.totalNetSavings,

            CLF_Bank_Balance: item.totalClfBankBalance,

            CMTC_Sub_Account_Balance:
                item.totalCmtcSubAccountBalance,

            Received_Amount: item.totalReceivedAmount,

            Expense_Till_2026: item.totalExpenseTill2026,

            Remaining_Amount: item.totalRemainingAmount,

            Total_Expense: item.totalExpense,

            Total_Programs: item.totalPrograms,

            Total_Beneficiaries: item.totalBeneficiaries,

        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "CMTC Report"
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, "CMTC_Report.xlsx");
    };

    // ================= PDF Download =================
    const downloadPDF = () => {

        const doc = new jsPDF("landscape");

        const columns = [
            "S.No",
            "CMTC",
            "District",
            "Block",
            "Residential",
            "Non Residential",
            "Received",
            "Expense",
            "Remaining",
            "Programs",
            "Beneficiaries",
        ];

        const rows = filteredReports.map((item, index) => [

            index + 1,
            item.nameOfCmtc,
            item.district,
            item.blockName,

            item.totalResidentialParticipants,

            item.totalNonResidentialParticipants,

            item.totalReceivedAmount,

            item.totalExpense,

            item.totalRemainingAmount,

            item.totalPrograms,

            item.totalBeneficiaries,

        ]);

        doc.text("CMTC Financial Report", 14, 15);

        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: 20,
            styles: {
                fontSize: 7,
            },
        });

        doc.save("CMTC_Report.pdf");
    };

    // ================= Monthly Report =================
    const handleMonthlyReport = async (cmtcCentersId) => {

        try {

            const response =
                await getCmtcDetailsMonthlyReport(cmtcCentersId);

            console.log("Monthly Report:", response);

            setMonthlyReportData(response);

            setShowModal(true);

        } catch (error) {

            console.error("Monthly Report Error:", error);

        }
    };
    return (

        <div className="container my-4">

            {/* Header */}
            <h3 className="text-center fw-bold mb-4">
                CMTC Financial Report
            </h3>

            {/* Filters */}
            <div className="card p-3 shadow-sm mb-4">

                <div className="row g-3 align-items-end">

                    <div className="col-md-4">

                        <label className="form-label">
                            Financial Year
                        </label>

                        <select
                            className="form-select"
                            value={financialYearId || ""}
                            onChange={(e) =>
                                setFinancialYearId(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null
                                )
                            }
                        >

                            <option value="">
                                All Financial Years
                            </option>

                            <option value={1}>
                                2025-26
                            </option>

                            <option value={2}>
                                2026-27
                            </option>

                            <option value={3}>
                                2027-28
                            </option>

                            <option value={4}>
                                2028-29
                            </option>

                        </select>

                    </div>

                    <div className="col-md-8 d-flex gap-2">

                        <button
                            className="btn btn-primary"
                            onClick={applyFilters}
                        >
                            Generate Report
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={downloadExcel}
                        >
                            Excel
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={downloadPDF}
                        >
                            PDF
                        </button>

                    </div>

                </div>

            </div>

            {/* Table */}
            <div className="card shadow border-0">

                <div className="table-responsive">

                    <table className="table table-bordered table-hover">

                        <thead className="table-dark">

                            <tr>

                                <th>S.No</th>

                                <th>CMTC ID</th>

                                {/* <th>Financial Year</th> */}

                                <th>CMTC Name</th>

                                <th>District</th>

                                <th>Block</th>

                                <th>Total Residential Participants</th>

                                <th>Total Non Residential Participants</th>

                                <th>Total Food Preparation</th>

                                <th>Total Material Purchase</th>

                                <th>Total Services</th>

                                <th>Total Trainers Payment</th>

                                <th>Total Net Savings</th>

                                <th>Total CLF Bank Balance</th>

                                <th>Total CMTC Sub Account Balance</th>

                                <th>Total Received Amount</th>

                                <th>Total Expense Till 2026</th>

                                <th>Total Remaining Amount</th>

                                <th>Total Manager Amount</th>

                                <th>Total Accountant Amount</th>

                                <th>Total Total Expense</th>

                                <th>Total Working Days</th>

                                <th>Total Programs</th>

                                <th>Total Beneficiaries</th>

                                <th>Total Working Days 2025-26</th>

                                <th>Total Programs 2025-26</th>

                                <th>Total Beneficiaries 2025-26</th>

                                <th>Monthly Report</th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td colSpan="27" className="text-center">
                                        Loading...
                                    </td>
                                </tr>

                            ) : filteredReports.length === 0 ? (

                                <tr>
                                    <td colSpan="28" className="text-center">
                                        No Data Found
                                    </td>
                                </tr>

                            ) : (

                                filteredReports.map((row, index) => (

                                    <tr key={index}>

                                        <td>{index + 1}</td>

                                        <td>{row.cmtcCentersId}</td>

                                        {/* <td>{row.financialYearId}</td> */}

                                        <td>{row.nameOfCmtc}</td>

                                        <td>{row.district}</td>

                                        <td>{row.blockName}</td>

                                        <td>{row.totalResidentialParticipants}</td>

                                        <td>{row.totalNonResidentialParticipants}</td>

                                        <td>₹{row.totalFoodPreparation}</td>

                                        <td>₹{row.totalMaterialPurchase}</td>

                                        <td>₹{row.totalServices}</td>

                                        <td>₹{row.totalTrainersPayment}</td>

                                        <td>₹{row.totalNetSavings}</td>

                                        <td>₹{row.totalClfBankBalance}</td>

                                        <td>₹{row.totalCmtcSubAccountBalance}</td>

                                        <td>₹{row.totalReceivedAmount}</td>

                                        <td>₹{row.totalExpenseTill2026}</td>

                                        <td>₹{row.totalRemainingAmount}</td>

                                        <td>₹{row.totalManagerAmount}</td>

                                        <td>₹{row.totalAccountantAmount}</td>

                                        <td>₹{row.totalExpense}</td>

                                        <td>{row.totalWorkingDays}</td>

                                        <td>{row.totalPrograms}</td>

                                        <td>{row.totalBeneficiaries}</td>

                                        <td>{row.totalWorkingDays202526}</td>

                                        <td>{row.totalPrograms202526}</td>

                                        <td>{row.totalBeneficiaries202526}</td>

                                        <td>

                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() =>
                                                    handleMonthlyReport(row.cmtcCentersId)
                                                }
                                            >
                                                Details
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>
            {/* ================= Monthly Report Modal ================= */}

            {showModal && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >

                    <div className="modal-dialog modal-xl modal-dialog-scrollable">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Monthly Report Details
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>

                            </div>

                            <div className="modal-body">

                                <div className="table-responsive">

                                    <table className="table table-bordered table-hover">

                                        <thead className="table-dark">

                                            <tr>

                                                <th>cmtcCentersId</th>

                                                <th>financial-Year</th>

                                                <th>Month</th>

                                                <th>entryDate</th>

                                                <th>nameOfDistrict</th>

                                                <th>nameOfBlock</th>

                                                <th>nameOfCmtc</th>

                                                <th>nameOfClfOperatingCmtc</th>

                                                <th>dateOfCmtcEstablishment</th>

                                                <th>numberOfResidentialTrainingParticipants</th>

                                                <th>numberOfNonResidentialTrainingParticipants</th>

                                                <th>paymentAmountForFoodPreparation</th>

                                                <th>paymentAmountForMaterialPurchase</th>

                                                <th>paymentAmountForServices</th>

                                                <th>paymentAmountToCommunityTrainers</th>

                                                <th>totalNetSavingsAmount</th>

                                                <th>availableAmountInClfBankAccount</th>

                                                <th>availableAmountInCmtcSubAccount</th>

                                                <th>fdAmountAndDate</th>

                                                <th>totalAmountReceivedForCmtcEstablishment</th>

                                                <th>totalExpenseAmountTill31March2026</th>

                                                <th>totalRemainingAmountTill31March2026</th>

                                                <th>amountGivenToCmtcManager</th>

                                                <th>amountGivenToCmtcAccountant</th>

                                                <th>typeOfAccountantPayment</th>

                                                <th>accountantPaymentAmount</th>

                                                <th>typeOfManagerPayment</th>

                                                <th>managerPaymentAmount</th>

                                                <th>typeOfGuardOrWatchmanPayment</th>

                                                <th>guardOrWatchmanPaymentAmount</th>

                                                <th>totalExpenseAmountByCmtc</th>

                                                <th>totalWorkingDays</th>

                                                <th>totalNumberOfPrograms</th>

                                                <th>totalNumberOfBeneficiaries</th>

                                                <th>totalWorkingDaysIn202526</th>

                                                <th>totalNumberOfProgramsIn202526</th>

                                                <th>totalNumberOfBeneficiariesIn202526</th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {monthlyReportData.length === 0 ? (

                                                <tr>

                                                    <td colSpan="37" className="text-center">
                                                        No Data Found
                                                    </td>

                                                </tr>

                                            ) : (

                                                monthlyReportData.map((item, index) => (

                                                    <tr key={index}>

                                                        <td>{item.cmtcCentersId}</td>

                                                        <td>{item.financialYear}</td>

                                                        <td>{item.monthNameEn}</td>

                                                        <td>{item.entryDate}</td>

                                                        <td>{item.nameOfDistrict}</td>

                                                        <td>{item.nameOfBlock}</td>

                                                        <td>{item.nameOfCmtc}</td>

                                                        <td>{item.nameOfClfOperatingCmtc}</td>

                                                        <td>{item.dateOfCmtcEstablishment}</td>

                                                        <td>{item.numberOfResidentialTrainingParticipants}</td>

                                                        <td>{item.numberOfNonResidentialTrainingParticipants}</td>

                                                        <td>{item.paymentAmountForFoodPreparation}</td>

                                                        <td>{item.paymentAmountForMaterialPurchase}</td>

                                                        <td>{item.paymentAmountForServices}</td>

                                                        <td>{item.paymentAmountToCommunityTrainers}</td>

                                                        <td>{item.totalNetSavingsAmount}</td>

                                                        <td>{item.availableAmountInClfBankAccount}</td>

                                                        <td>{item.availableAmountInCmtcSubAccount}</td>

                                                        <td>{item.fdAmountAndDate}</td>

                                                        <td>{item.totalAmountReceivedForCmtcEstablishment}</td>

                                                        <td>{item.totalExpenseAmountTill31March2026}</td>

                                                        <td>{item.totalRemainingAmountTill31March2026}</td>

                                                        <td>{item.amountGivenToCmtcManager}</td>

                                                        <td>{item.amountGivenToCmtcAccountant}</td>

                                                        <td>{item.typeOfAccountantPayment}</td>

                                                        <td>{item.accountantPaymentAmount}</td>

                                                        <td>{item.typeOfManagerPayment}</td>

                                                        <td>{item.managerPaymentAmount}</td>

                                                        <td>{item.typeOfGuardOrWatchmanPayment}</td>

                                                        <td>{item.guardOrWatchmanPaymentAmount}</td>

                                                        <td>{item.totalExpenseAmountByCmtc}</td>

                                                        <td>{item.totalWorkingDays}</td>

                                                        <td>{item.totalNumberOfPrograms}</td>

                                                        <td>{item.totalNumberOfBeneficiaries}</td>

                                                        <td>{item.totalWorkingDaysIn202526}</td>

                                                        <td>{item.totalNumberOfProgramsIn202526}</td>

                                                        <td>{item.totalNumberOfBeneficiariesIn202526}</td>

                                                    </tr>

                                                ))

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>
                            <div className="modal-footer">

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default CmtcDetailsReport;