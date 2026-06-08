import React, { useEffect, useState } from 'react'
import {getAdminBookingAnalytics ,getDashboardStats} from "../../services/bookingService";
import {
  getAllDistricts,
  getBlocksByDistrict,
} from "../../services/cmtcCenterService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./MisStyle.css";
import { useTranslation } from "react-i18next";
function MisAllBookings() {
    const { t} = useTranslation();
    const [stats, setStats] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);   
    const [loading, setLoading] = useState(true);
    const [allBookings, setAllBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedBlock, setSelectedBlock] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [status, setStatus] = useState("");

// ================= fetch admin dashboard stats =================
  const transformStats = (data) => {
    return {
      totalBooking: data.totalBooking,
      totalPending:
        (data.pendingDistrictApproval || 0) +
        (data.pendingBlockApproval || 0),
      totalCancel: data.cancelledBooking || 0,
      totalConfirm: data.booked || 0,
      totalRejected:
        (data.blockRejected || 0) +
        (data.districtRejected || 0),
    };
  };
// ================= fetch admin dashboard stats data =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardStats();
        const formatted = transformStats(res.data);
        setStats(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  // ================= fetch all booking data =================
         useEffect(() => {
         fetchBookings();
         }, []);
 
         const fetchBookings = async () => {
         try {
             const data = await getAdminBookingAnalytics();
             setAllBookings(data);
             setFilteredBookings(data);
         } catch (err) {
             console.error("Booking Error:", err);
         }
         };
        // ================= Grouped data =================
        // const STATUS_GROUPS = {
        // PENDING: ["PENDING_BLOCK_APPROVAL", "PENDING_DISTRICT_APPROVAL"],
        // REJECTED: ["BLOCK_REJECTED", "DISTRICT_REJECTED"],
        // BOOKED: ["BOOKED"],
        // CANCELLED: ["CANCELLED"],
        // TRAINING_COMPLETED: ["TRAINING_COMPLETED"],
        // };

// =================Apply filter data =================
    const applyFilters = () => {
        let data = [...allBookings];

       
        if (status) {
        data = data.filter(
          (b) => b.status?.toUpperCase() === status
        );
      }
        if (selectedDistrict) {
            data = data.filter(
            (b) => b.districtId === Number(selectedDistrict)
            );
        }

        if (selectedBlock) {
            data = data.filter(
            (b) => b.blockId === Number(selectedBlock)
            );
        }

        if (fromDate) {
            data = data.filter(
            (b) => new Date(b.fromDate) >= new Date(fromDate)
            );
        }

        if (toDate) {
            data = data.filter(
            (b) => new Date(b.toDate) <= new Date(toDate)
            );
        }

        setFilteredBookings(data);
        };
// ================= fetch all district =================
    useEffect(() => {
      getAllDistricts()
        .then((res) => setDistricts(res.data))
        .catch(() => setDistricts([]));
    }, []);

// ================= fetch block selected by district =================
    useEffect(() => {
      if (selectedDistrict) {
        getBlocksByDistrict(selectedDistrict)
          .then((res) => setBlocks(res.data))
          .catch(() => setBlocks([]));
      } else {
        setBlocks([]);
      }
    }, [selectedDistrict]);

    // ================= Excel =================
        const downloadExcel = () => {
        const exportData = filteredBookings.map((item, index) => ({
          S_No: index + 1,
          CMTC_Name: item.centerName,
          District: item.districtName,
          Block: item.blockName,
          Department: item.departmentName,
          Officer: item.officerName,
          From_Date: item.fromDate,
          To_Date:item.toDate,
          Status: item.status,
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
    
        XLSX.utils.book_append_sheet(workbook, worksheet, "MIS Report");
    
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
    
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    
        saveAs(blob, "MIS_Report.xlsx");
      };
    // ================= PDF =================
        const downloadPDF = () => {
        const doc = new jsPDF("landscape");
    
        const columns = [
          "S.No",
          "CMTC Name",
          "District",
          "Block",
          "Department",
          "Officer",
          "From Date",
          "To Date",
          "Status",
        ];
    
        const rows = filteredBookings.map((item, index) => [
          index + 1,
          item.centerName,
          item.districtName,
          item.blockName,
          item.departmentName,
          item.officerName,
          item.fromDate,
          item.toDate,
          item.status,
        ]);
    
        doc.text("CMTC MIS Report", 14, 15);
    
        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 20,
          styles: { fontSize: 8 },
        });
    
        doc.save("MIS_Report.pdf");
      };
  return (
    <>
     <div className="container my-4">
        <h4 className="text-center fw-bold mb-4">
          {t("sidebar.allbooking_page_heading")}
        </h4>

      {stats && (
        <div className="row g-3 mb-4">
        {/*Total Booking */}
        <div className="col-md-2 col-sm-6">
          <div className="stat-card stat-purple">
            <div>
              <small className="text-white">{t("admin.totalBookings")}</small>
              <h2 className="fw-bold text-white">{stats.totalBooking}</h2>
            </div>
           
          </div>
        </div>


        {/*Total Confirmed */}
        <div className="col-md-2 col-sm-6">
          <div className="stat-card stat-green">
            <div>
              <small className="text-white">{t("admin.confirmedBookings")}</small>
              <h2 className="fw-bold text-white">
              {stats.totalConfirm}
              </h2>
            </div>
          </div>
        </div>


        {/* Total Pending*/}
        <div className="col-md-2 col-sm-6">
          <div className="stat-card stat-blue">
            <div>
              <small className="text-white">{t("admin.pendingBookings")}</small>
               <h2 className="fw-bold text-white">{stats.totalPending}</h2>
            </div>
           
          </div>
        </div>

        {/* Total Cancelled */}
        <div className="col-md-2 col-sm-6">
          <div className="stat-card stat-orange">
            <div>
              <small className="text-white">{t("admin.cancelledBookings")}</small>
              <h2 className="fw-bold text-white">
               {stats.totalCancel}
              </h2>
            </div>
           
          </div>
        </div>

        {/* Total Rejected */}
        <div className="col-md-2 col-sm-6">
          <div className="stat-card stat-red">
            <div>
              <small className="text-white">{t("admin.rejectedBookings")}</small>
              <h3 className="fw-bold text-white">
                {stats.totalRejected}
              </h3>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Filters */}
      <div className="card p-3 mb-4 border-0 shadow-sm">
        <div className="row g-3 align-items-end">

          <div className="col-md-2">
            <label className="form-label">{t("admin.statusFilter")}</label>
           <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="BOOKED">Booked</option>
              <option value="PENDING_BLOCK_APPROVAL">Pending by block</option>
              <option value="PENDING_DISTRICT_APPROVAL">Pending by district</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="BLOCK_REJECTED">Rejected by block</option>
              <option value="DISTRICT_REJECTED">Rejected by district</option>
              <option value="TRAINING_COMPLETED">Training Completed</option>
            </select> 
          </div>

          <div className="col-md-3">
            <label className="form-label">{t("admin.district")}</label>
           <select
              className="form-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.districtId} value={d.districtId}>
                  {d.districtNameEn}
                </option>
              ))}
            </select>
            </div>

          <div className="col-md-3">
            <label className="form-label">{t("admin.block")}</label>
            <select
              className="form-select"
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">All Blocks</option>
              {blocks.map((b) => (
                <option key={b.blockId} value={b.blockId}>
                  {b.blockNameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">{t("admin.fromDate")}</label>
            <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
          </div>

          <div className="col-md-2">
            <label className="form-label">{t("admin.toDate")}</label>
            <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
          </div>

          {/* Buttons */}
          <div className="col-md-12 d-flex justify-content-center gap-2 mt-3">
            <button className="btn btn-primary btn-sm"  onClick={applyFilters}>
              {t("admin.generateReport")}
            </button>
            <button className="btn btn-success btn-sm" onClick={downloadExcel}>{t("admin.excel")}</button>
            <button className="btn btn-danger btn-sm" onClick={downloadPDF}>{t("admin.pdf")}</button>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead className="custom-header table-light">
              <tr>
                <th>{t("admin.sNo")}</th>
                <th>{t("booking.cmtcName")}</th>
                <th>{t("admin.district")}</th>
                <th>{t("admin.block")}</th>
                <th>{t("admin.applicant_name")}</th>
                <th>{t("admin.fromDate")}</th>
                <th>{t("admin.toDate")}</th>
                <th>{t("admin.status")}</th>
              </tr>
            </thead>

              <tbody className="custom-data">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Data Found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((row, index) => (
                  <tr key={row.id || index}>
                    <td>{index + 1}</td>
                    <td>{row.centerName || "-"}</td>
                    <td>{row.districtName || "-"}</td>
                    <td>{row.blockName || "-"}</td>

                    {/* Check correct field names */}
                    <td>{row.officerName || row.applicantName || "-"}</td>

                     <td>{row.fromDate || "-"}</td>
                      <td>{row.toDate || "-"}</td>

                    <td>
                      <span
                        className={`badge ${
                          row.status === "BOOKED"
                            ? "bg-success"
                            : row.status?.includes("PENDING")
                            ? "bg-warning text-dark"
                            : row.status?.includes("REJECT")
                            ? "bg-danger"
                            : row.status?.includes("TRAINING_COMPLETED")
                            ? "bg-info"
                            : "bg-secondary"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
           
          </table>
        </div>
      </div>
    </div>
    </>
  )
}

export default MisAllBookings
