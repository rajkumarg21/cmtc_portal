import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAdminBookingAnalytics } from "../../services/bookingService";
import {
  getAllDistricts,
  getBlocksByDistrict,
} from "../../services/cmtcCenterService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";
export default function TotalBookings() {
  const { type } = useParams();
  const { t} = useTranslation();
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const STATUS_GROUPS = {
    pending: ["PENDING_BLOCK_APPROVAL", "PENDING_DISTRICT_APPROVAL"],
    rejected: ["BLOCK_REJECTED", "DISTRICT_REJECTED"],
    booked: ["BOOKED"],
     cancelled: ["CANCELLED"],
  };

  // ================= LOAD BOOKINGS =================
  useEffect(() => {
    fetchBookings();
  }, [type]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getAdminBookingAnalytics();

      let filtered = data;

      if (STATUS_GROUPS[type]) {
        filtered = data.filter((item) =>
          STATUS_GROUPS[type].includes(item.status?.toUpperCase())
        );
      }

      setAllBookings(filtered);
      setFilteredBookings(filtered);
    } catch (err) {
      setError("Failed to load booking data.");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DISTRICTS =================
  useEffect(() => {
    getAllDistricts()
      .then((res) => setDistricts(res.data))
      .catch(() => setDistricts([]));
  }, []);

  // ================= LOAD BLOCKS =================
  useEffect(() => {
    if (selectedDistrict) {
      getBlocksByDistrict(selectedDistrict)
        .then((res) => setBlocks(res.data))
        .catch(() => setBlocks([]));

      setSelectedBlock("");
    } else {
      setBlocks([]);
    }
  }, [selectedDistrict]);

  // ================= APPLY FILTER =================
  const applyFilters = () => {
    let data = [...allBookings];

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

  // ================= RESET =================
  const resetFilters = () => {
    setSelectedDistrict("");
    setSelectedBlock("");
    setFromDate("");
    setToDate("");
    setFilteredBookings(allBookings);
  };

  // ================= EXCEL =================
  const downloadExcel = () => {
    const exportData = filteredBookings.map((item, index) => ({
      Sr_No: index + 1,
      Booking_Ref: item.bookingRef,
      Applicant: item.applicantName,
      District: item.districtName,
      Block: item.blockName,
      Center: item.centerName,
      From_Date: item.fromDate,
      To_Date: item.toDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Bookings.xlsx");
  };

  // ================= PDF =================
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");

    const columns = [
      "Sr No",
      "Booking Ref",
      "Applicant",
      "District",
      "Block",
      "Center",
      "From",
      "To",
    ];

    const rows = filteredBookings.map((item, index) => [
      index + 1,
      item.bookingRef,
      item.applicantName,
      item.districtName,
      item.blockName,
      item.centerName,
      item.fromDate,
      item.toDate,
    ]);

    doc.text("Booking Report", 14, 15);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("Bookings.pdf");
  };

  const getTitle = () => {
    switch (type) {
      case "pending":
        return t("admin.pendingBookings");
      case "booked":
        return  t("admin.confirmedBookings");
      case "rejected":
        return t("admin.rejectedBookings");
      case "cancelled":
        return  t("admin.cancelledBookings");
      default:
        return t("admin.totalBookings");
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error) return <div className="text-danger mt-4">{error}</div>;

  return (
    <div className="container-fluid mt-4">

      {/* FILTER CARD */}
      <div className="card shadow-sm border-0 rounded-3 mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">

            <div className="col-md-3">
              <label className="form-label fw-semibold">{t("admin.district")}</label>
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

            <div className="col-md-3">
              <label className="form-label fw-semibold">{t("admin.block")}</label>
              <select
                className="form-select"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                disabled={!selectedDistrict}
              >
                <option value="">Select Block</option>
                {blocks.map((b) => (
                  <option key={b.blockId} value={b.blockId}>
                    {b.blockNameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">{t("admin.fromDate")}</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">{t("admin.toDate")}</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="col-md-1">
              <button className="btn btn-primary w-100 text-sm" onClick={applyFilters}>
                {t("admin.filter")}
              </button>
            </div>

            <div className="col-md-1">
              <button className="btn btn-secondary w-100 text-sm" onClick={resetFilters}>
                {t("admin.reset")}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-header d-flex justify-content-between align-items-center fw-bold">
          <span>
            {getTitle()} ({filteredBookings.length})
          </span>

          <div className="d-flex gap-2">
            <button className="btn btn-danger btn-sm" onClick={downloadPDF}>
              {t("admin.pdf")} 
            </button>
            <button className="btn btn-success btn-sm" onClick={downloadExcel}>
              {t("admin.excel")} 
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle mb-0">
              <thead className="table-light" style={{fontSize:"14px"}}>
                <tr>
                  <th> {t("admin.sNo")} </th>
                  <th> {t("admin.bookingRef")}</th>
                  <th>{t("admin.applicant")}</th>
                  <th>{t("admin.Bdistrict")}</th>
                  <th>{t("admin.Bblock")}</th>
                  <th>{t("admin.center")}</th>
                  <th>{t("admin.from")}</th>
                  <th>{t("admin.to")}</th>
                </tr>
              </thead>
              <tbody style={{fontSize:"14px"}}>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.bookingRef}</td>
                      <td>{row.applicantName}</td>
                      <td>{row.districtName}</td>
                      <td>{row.blockName}</td>
                      <td>{row.centerName}</td>
                      <td>{row.fromDate}</td>
                      <td>{row.toDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}