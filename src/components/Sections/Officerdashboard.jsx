import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import swal from "sweetalert";
import {
  getAllBooking,
  approveBooking,
  rejectBooking,
  districtApprove,
  districtReject,
  getBookingRemarks,
  cancelBooking
} from "../../pages/public/cmtc/DashboardService";
import { sanitizeText } from "../../utils/security";
import BookingModal from "../../pages/public/cmtc/BookingModal";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaFilter,
  FaSync,
  FaSearch,
  FaUserCircle
} from "react-icons/fa";
import { UI_TEXT } from "../../constants/uiText";
import {BOOKING_APPROVAL_STATUS, getStatusBadgeClass} from "../../utils/constants";
import { useTranslation } from "react-i18next";
import { TablePagination } from "@mui/material";
const PAGE_SIZES = [5, 10, 20, 50];

function Officerdashboard() {
  const { user } = useAuth();
  const { t} = useTranslation();
  // ✅ SINGLE SOURCE OF TRUTH (Backend Response Only)
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [latestRemark, setLatestRemark] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState("fromDate");
  const [sortDir, setSortDir] = useState("asc");
  // const [pageSize, setPageSize] = useState(20);
  // const [page, setPage] = useState(1);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    bookingRef: "",
    organizationName: "",
    centerName: "",
    status: "",
    userName: ""
  });

  // =====================================================
  // LOAD DASHBOARD DATA (FLAT ARRAY HANDLING)
  // =====================================================
  useEffect(() => {
    if (user && user.id && user.role) {
      loadDashboardData();
    }
  }, [user?.id, user?.role]);

  const loadDashboardData = () => {
    setLoading(true);
    setRefreshing(true);

    getAllBooking()
      .then(res => {
        // ✅ Your API returns a flat array directly
        const bookingData = res?.data || [];
        setBookings(bookingData);
      })
      .catch(err => {
        console.error("Dashboard load error", err);
        swal({
          text: "Failed to load dashboard data. Please try again.",
          icon: "error",
        });
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  // =====================================================
  // VIEW HANDLER
  // =====================================================
  const handleView = (booking) => {
    setSelectedBooking(booking);
    setLatestRemark([]);

    getBookingRemarks(booking.id)
      .then(res => {
        setLatestRemark(res.data || []);
      })
      .catch(() => setLatestRemark([]));
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setLatestRemark([]);
  };

  // =====================================================
  // ACTION HANDLERS
  // =====================================================
  const handleBlockApprove = (booking, remark) => {
    approveBooking(booking.id, user.id, remark).then(() => {
      swal({
        text: "Booking approved by Block Officer",
        icon: "success",
      });
      closeModal();
      loadDashboardData();
    });
  };

  const handleBlockReject = (booking, remark) => {
    rejectBooking(booking.id, user.id, remark).then(() => {
       swal({
        text: "Booking rejected by Block Officer",
        icon: "success",
      });
      closeModal();
      loadDashboardData();
    });
  };

  const handleDistrictApprove = (booking, remark) => {
    districtApprove(
      booking.id,
      user.id,
      remark
    )
      .then(() => {
         swal({
          text: "Booking approved by District Officer",
          icon: "success",
        });
        closeModal();
        loadDashboardData();
      })
      .catch(err => {
        console.error(err);
         swal({
          text: err?.response?.data?.message,
          icon: "error",
        });
      });
  };

  const handleDistrictReject = (booking, remark) => {
    districtReject(booking.id, remark).then(() => {
       swal({
          text: "Booking has been rejected",
          icon: "success",
        });
      closeModal();
      loadDashboardData();
    });
  };

  const handleCancelBooking = (bookingId, remark) => {
    if (!remark || remark.trim() === "") {
       swal({
          text: "Please provide a remark for cancellation",
          icon: "warning",
        });
      return;
    }

    cancelBooking(bookingId, remark, user.id)
      .then(() => {
         swal({
          text: "Booking has been cancelled successfully",
          icon: "success",
        });
        closeModal();
        loadDashboardData();
      })
      .catch(err => {
        console.error("Cancellation error:", err);
         swal({
          text: "Failed to cancel booking. Please try again: " + (err.response?.data?.message || err.message),
          icon: "error",
        });
      });
  };

  // =====================================================
  // DATA PIPELINE (NO BACKEND FILTERING)
  // =====================================================
  const allBookings = bookings;

  const filteredData = useMemo(() => {
    return allBookings.filter(b => {
      const bookingRefMatch = (b.bookingRef || "")
        .toLowerCase()
        .includes(filters.bookingRef.toLowerCase());

      const orgNameMatch = (b.organizationName || "")
        .toLowerCase()
        .includes(filters.organizationName.toLowerCase());

      const centerNameMatch = (b.centerName || "")
        .toLowerCase()
        .includes(filters.centerName.toLowerCase());

      const statusMatch = (b.status || "")
        .toLowerCase()
        .includes(filters.status.toLowerCase());

      const userNameMatch = (b.userName || "")
        .toLowerCase()
        .includes(filters.userName.toLowerCase());

      return (
        bookingRefMatch &&
        orgNameMatch &&
        centerNameMatch &&
        statusMatch &&
        userNameMatch
      );
    });
  }, [allBookings, filters]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const x = a[sortField] ?? "";
      const y = b[sortField] ?? "";

      if (x < y) return sortDir === "asc" ? -1 : 1;
      if (x > y) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDir]);

  // const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  // const paginatedData = useMemo(() => {
  //   const start = (page - 1) * pageSize;
  //   return sortedData.slice(start, start + pageSize);
  // }, [sortedData, page, pageSize]);

  const paginatedData = useMemo(() => {
      if (pageSize === sortedData.length) {   // add to all 
    return sortedData;
  }
  const start = page * pageSize;
  return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  // =====================================================
  // HELPERS
  // =====================================================
  const sort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ms-1" />;
    return sortDir === "asc" ? (
      <FaSortUp className="ms-1" />
    ) : (
      <FaSortDown className="ms-1" />
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    // setPage(1);
     setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      bookingRef: "",
      organizationName: "",
      centerName: "",
      status: "",
      userName: ""
    });
    // setPage(1);
    setPage(0);
  };

  // =====================================================
  // LOADING STATES
  // =====================================================
  if (!user || loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{UI_TEXT.LOADING}</span>
        </div>
        <p className="mt-2">{UI_TEXT.LOADING_USER_DATA}</p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="container-fluid py-2">
      <div  className="d-flex justify-content-between align-items-center mb-3 px-2 py-2 ">
        <h4  className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "18px" }}>
          <FaUserCircle className="text-primary"/>
          {t("admin.officerDashboard")}
           <span className="text-muted">-</span> 
          <span  className="text-capitalize text-dark fw-semibold">
            {sanitizeText(user?.role?.replaceAll("_", " "))}
          </span>
        </h4>

        <button
          className="btn btn-outline-primary d-flex align-items-center gap-2 px-3"
          onClick={loadDashboardData}
          disabled={refreshing}
           style={{ height: "38px" }}
        >
          <FaSync className={refreshing ? "fa-spin" : ""} />
           {t("admin.refresh")}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card mb-3 border-1 border-secondary">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control border-1 border-secondary"
                placeholder= {t("admin.searchBookingRef")}
                value={filters.bookingRef}
                onChange={e =>
                  handleFilterChange("bookingRef", e.target.value)
                }
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select border-1 border-secondary"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">{t("admin.allStatus")}</option>

                {Object.values(BOOKING_APPROVAL_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status
                      .replaceAll("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="col-md-3">
              <select
                className="form-select border-1 border-secondary"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZES.map(size => (
                  <option key={size} value={size}>
                    {size} / {t("admin.page")}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="col-md-3">
              <button className="btn btn-secondary w-100" onClick={clearFilters}>
                 {t("admin.clearFilters")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
     <div className="container-fluid px-4 mt-4">
      <div className="card shadow-sm border-0 rounded-4 ">
        {/* Header */}
        <div
          className="card-header text-white rounded-top-3"
          style={{
            background: "linear-gradient(90deg, #0F766E)"
          }}
        >
          <h5 className="mb-0 fw-semibold">
            {t("admin.bookingList")}
          </h5>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0 custom-table">
            <thead style={{fontSize:"14px",fontweight:600}}>
              <tr>
                <th onClick={() => sort("bookingRef")}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{t("admin.bookingRef")}</span>
                    <span className="ms-2">
                      {getSortIcon("bookingRef")}
                    </span>
                  </div>
                </th>
                <th>{t("admin.applicant")}</th>
                <th>{t("admin.center")}</th>
                <th onClick={() => sort("fromDate")}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{t("admin.fromDate")}</span>
                    <span className="ms-2">
                      {getSortIcon("fromDate")}
                    </span>
                  </div>
                </th>
                <th onClick={() => sort("toDate")}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{t("admin.toDate")}</span>
                    <span className="ms-2">
                      {getSortIcon("toDate")}
                    </span>
                  </div>
                </th>
                <th>{t("admin.status")}</th>
                <th className="text-center">{t("admin.action")}</th>
              </tr>
            </thead>

            <tbody style={{fontSize:"14px"}}>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No bookings found
                  </td>
                </tr>
              ) : (
                paginatedData.map((booking) => (
                  <tr key={booking.id}>
                    <td>{sanitizeText(booking.bookingRef)}</td>
                    <td>{sanitizeText(booking.applicantName)}</td>
                    <td>{sanitizeText(booking.centerName)}</td>
                    <td>{sanitizeText(booking.fromDate)}</td>
                    <td>{sanitizeText(booking.toDate)}</td>
                  <td>
                    <span
                      className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {sanitizeText(booking.status)}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-info text-white fw-bold text-sm btn-sm rounded-pill px-3 d-inline-flex align-items-center"
                      onClick={() => handleView(booking)}
                    >
                    <FaEye className="me-2" size={14} />
                    <span>{t("admin.view")}</span>
                    </button>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      <TablePagination
          component="div"
          count={sortedData.length}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={(event, newPage) => {
            setPage(newPage);
          }}
          onRowsPerPageChange={(event) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50,{ label: "All", value: -1 }]}
          sx={{
            borderTop: "1px solid #dee2e6",
            backgroundColor: "#fff",
          }}
      />
      </div>
    </div>
{selectedBooking && (
  <BookingModal
    booking={selectedBooking}
    latestRemark={latestRemark}
    onApprove={(remark) =>
      user.role === "BLOCK_OFFICER"
        ? handleBlockApprove(selectedBooking, remark)
        : handleDistrictApprove(selectedBooking, remark)
    }
    onReject={(remark) =>
      user.role === "BLOCK_OFFICER"
        ? handleBlockReject(selectedBooking, remark)
        : handleDistrictReject(selectedBooking, remark)
    }
    onCancel={(remark) => handleCancelBooking(selectedBooking.id, remark)} // ADD THIS PROP
    onClose={closeModal}
  />
)}
</div>
  );
}

export default Officerdashboard;