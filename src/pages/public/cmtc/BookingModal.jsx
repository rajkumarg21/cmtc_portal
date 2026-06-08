import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { uploadCompletionLetter } from "./DashboardService";
import swal from "sweetalert";
import { useTranslation } from "react-i18next";
import {
  FaCalendarAlt,
  FaBuilding,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdBadge,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaComment,
  FaHistory,
  FaChevronRight,
  FaUserTie,
  FaFilePdf,
  FaExternalLinkAlt,
  FaDownload,
  FaExclamationTriangle, // Add this
  FaCheck, // Add this
  FaBan // Add this
} from "react-icons/fa";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Grid
} from "@mui/material";
import {
  CalendarToday,
  People,
  Business,
  Description,
  AccessTime,
  AttachMoney,
  CheckCircle,
  Cancel,
  Pending,
  EventAvailable,
  EventBusy,
  Payment,
  AccountBalance,
  Info,
  Note,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { BOOKING_APPROVAL_STATUS } from "../../../utils/constants";
import { sanitizeUrl } from "../../../utils/security";
import FileViewer from "../../../components/common/FileViewerBookingModal";

// confirm action alert
  const confirmAction = (text) => {
  return swal({
    title: "Are you sure?",
    text,
    icon: "warning",
    buttons: {
    cancel: "Cancel",
    confirm: {
        text: "Yes",
        value: true,
      },
    }
  });
};

function BookingModal({ booking, latestRemark, onApprove, onReject, onCancel, onClose}) {
  const { t} = useTranslation();
  const { user } = useAuth();
  const [remark, setRemark] = useState("");
  const [cancellationRemark, setCancellationRemark] = useState(""); // Add this
  const [loading, setLoading] = useState(false);
  const [expandedAmenities, setExpandedAmenities] = useState(false);
  
  //upload letter
  const [completionLetterUrl, setCompletionLetterUrl] = useState(null);
  const [file, setFile] = useState(null);

  const isUploadAllowed = () => {
  const bookingStatus = booking?.status;
  if (bookingStatus !== "BOOKED") return false;
  const toDateValue = booking?.toDate;
  if (!toDateValue) return false;
  let endDate;
  //  handle array format [yyyy, mm, dd]
  if (Array.isArray(toDateValue) && toDateValue.length >= 3) {
    const [y, m, d] = toDateValue;
    endDate = new Date(y, (m || 1) - 1, d || 1);
  } else {
    endDate = new Date(toDateValue);
  }

  if (isNaN(endDate.getTime())) return false;

  const today = new Date();
  
  //  remove time part (IMPORTANT FIX)
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return endDate <= today;
};
  if (!booking) return null;
   const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type !== "application/pdf") {
      swal({
        text: "Only PDF file allowed",
        icon: "warning",
      });
      return;
    }

    setFile(selectedFile);
  };
  const handleUpload = async () => {
    if (!file) {
      swal({
        text: "Please select a file",
        icon: "warning",
      });
      return;
    }

    try {
      setLoading(true);

    const formData = new FormData();
    formData.append("bookingId",booking?.id);
    formData.append("file", file);
    const response = await uploadCompletionLetter(formData);
    const complitionletterUrl = response?.data?.fileUrl;

    setCompletionLetterUrl(complitionletterUrl);
       swal({
        text: "File uploaded successfully ",
        icon: "success",
      });
      setFile(null);
    } catch (error) {
      console.error(error);
       swal({
        text: "Upload failed",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  // ✅ Check if cancellation requested
  const isCancellationRequested = booking?.status === "CANCELLATION_REQUESTED";
  
  // ✅ Build file base from API base
  const API_BASE = import.meta.env.VITE_BASE_URL || "";
  const FILE_BASE = API_BASE.replace(/\/api\/?$/, "");

  const getLetterUrl = () => {
    const p = booking?.letterUrl;
    console.log(p);
    // if (!p) return "";
    // if (/^https?:\/\//i.test(p)) return p;
    // return `${FILE_BASE}${p.startsWith("/") ? "" : "/"}${p}`;
    return  `${import.meta.env.VITE_BASE_URL}${booking?.letterUrl}`;
  };

  const rawLetterUrl = getLetterUrl();
  const safeUrl = `${import.meta.env.VITE_BASE_URL}${booking?.letterUrl}`;
const safeUrl1 = sanitizeUrl(rawLetterUrl);
  // Format dates (supports both "yyyy-mm-dd" and [yyyy,mm,dd])
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    let date;
    if (Array.isArray(dateValue) && dateValue.length >= 3) {
      const [y, m, d] = dateValue;
      date = new Date(y, (m || 1) - 1, d || 1);
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!booking.fromDate || !booking.toDate) return "N/A";

    const toDateObj = (v) => {
      if (Array.isArray(v) && v.length >= 3) {
        const [y, m, d] = v;
        return new Date(y, (m || 1) - 1, d || 1);
      }
      return new Date(v);
    };

    const start = toDateObj(booking.fromDate);
    const end = toDateObj(booking.toDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  // Status badge
  const getStatusBadge = () => {
    const status = booking.status || BOOKING_APPROVAL_STATUS.PENDING_BLOCK_APPROVAL;
    const badges = {
      PENDING: {
        text: t("booking_modal.pendingReview"),
        color: "bg-yellow-100 text-yellow-800 border border-yellow-300",
        icon: <FaClock className="me-2" />,
      },
      APPROVED: {
        text: t("booking_modal.approved"),
        color: "bg-green-100 text-green-800 border border-green-300",
        icon: <FaCheckCircle className="me-2" />,
      },
      REJECTED: {
        text: t("booking_modal.rejected"),
        color: "bg-red-100 text-red-800 border border-red-300",
        icon: <FaTimesCircle className="me-2" />,
      },
      BOOKED: {
        text: t("booking_modal.booked"),
        color: "bg-blue-100 text-blue-800 border border-blue-300",
        icon: <FaCheckCircle className="me-2" />,
      },
      CANCELLATION_REQUESTED: {
        text: t("booking_modal.cancellationRequested"),
        color: "bg-red-100 text-red-800 border border-red-300",
        icon: <FaExclamationTriangle className="me-2" />,
      },
      CANCELLED: {
        text: t("booking_modal.Cancelled"),
        color: "bg-gray-100 text-gray-800 border border-gray-300",
        icon: <FaTimesCircle className="me-2" />,
      },
    };

    const badge = badges[status] || badges.PENDING;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
      >
        {badge.icon}
        {badge.text}
      </span>
    );
  };



  // Handle approve
  const handleApprove = async () => {
    const result = await confirmAction(`Are you sure you want to approve booking ${booking.bookingRef}?`);
    if (!remark.trim()) {
       swal({
        text: "Please provide a remark before approving.",
        icon: "warning",
      });
      return;
    }
    if (result) {
      setLoading(true);
      try {
        await onApprove(remark);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle reject
  const handleReject = async () => {
     const result = await confirmAction(`Are you sure you want to reject booking ${booking.bookingRef}?`);
    if (!remark.trim()) {
      swal({
        text: "Please provide a reason for rejection.",
        icon: "warning",
      });
      return;
    }
    if (result) {
      setLoading(true);
      try {
        await onReject(remark);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
     const result = await confirmAction(`Are you sure you want to cancel booking ${booking.bookingRef}?`);
    if (!cancellationRemark.trim()) {
       swal({
        text: "Please provide a remark for cancellation.",
        icon: "warning",
      });
      return;
    }
    if (result) {
      setLoading(true);
      try {
        await onCancel(cancellationRemark);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
 <div
  className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 backdrop-blur-sm"
>
      <div className="flex min-h-full items-center justify-center p-4">
       <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">   {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <FaCalendarAlt className="me-3" />
                  {t("booking_modal.bookingDetails")}
                </h2>
                <p className="text-blue-100 mt-2">
                   {t("booking_modal.referenceNo")}: <strong>{booking.bookingRef}</strong>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge()}
                <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl font-light">
                  &times;
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
         <div className="p-6 overflow-y-auto flex-1">
            {/* CANCELLATION REQUEST ALERT */}
            {isCancellationRequested && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-600 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-red-800">{t("booking_modal.cancellationRequested")}</h4>
                    <p className="text-red-700 mt-1">
                    {t("booking_modal.cancelRequestMsg")}
                    </p>
                    
                    {/* Cancellation remark input */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("booking_modal.cancellationRemark")}<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        rows="3"
                        placeholder="Enter your remark for cancellation..."
                        value={cancellationRemark}
                        onChange={(e) => setCancellationRemark(e.target.value)}
                        disabled={loading}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {t("booking_modal.cancellationRemarkMsg")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-6">
                {/* User */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUserTie className="me-2 text-blue-600" />
                     {t("booking_modal.userInformation")}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaUser className="mt-1 me-3 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">{t("booking_modal.bookedBy")}</p>
                        <p className="font-medium text-gray-900">
                          {booking.applicantName || booking.user_name || "Unknown User"}
                        </p>
                      </div>
                    </div>

                    {booking.userEmail && (
                      <div className="flex items-start">
                        <FaEnvelope className="mt-1 me-3 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{booking.userEmail}</p>
                        </div>
                      </div>
                    )}

                    {booking.userPhone && (
                      <div className="flex items-start">
                        <FaPhone className="mt-1 me-3 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{booking.userPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Dates */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaCalendarAlt className="me-2 text-blue-600" />
                    {t("booking_modal.bookingDetails")}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t("booking_modal.fromDate")}</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.fromDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t("booking_modal.toDate")}</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.toDate)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{t("booking_modal.duration")}</p>
                      <p className="font-medium text-gray-900">{calculateDuration()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{t("booking_modal.participants")}</p>
                      <p className="font-medium text-gray-900">{booking.numberOfTrainees || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="space-y-6">
                {/* Org */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBuilding className="me-2 text-blue-600" />
                    {t("booking_modal.organizationDetails")}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">{t("booking_modal.organizationName")}</p>
                      <p className="font-medium text-gray-900">{booking.organizationName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">{t("booking_modal.cmtcCenter")}</p>
                      <p className="font-medium text-gray-900">{booking.centerName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">{t("booking_modal.district")}</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="me-2 text-red-500" />
                        {booking.districtName || "N/A"}
                      </p>
                    </div>

                    {booking.blockName && (
                      <div>
                        <p className="text-sm text-gray-600">{t("booking_modal.block")}</p>
                        <p className="font-medium text-gray-900">{booking.blockName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Amenities Section */}
                {booking.otherAmenitiesList?.length > 0 && (
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                          cursor: 'pointer'
                        }}
                        onClick={() => setExpandedAmenities(!expandedAmenities)}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                          <AccountBalance sx={{ mr: 1, color: 'success.main' }} />
                          {t("booking_modal.additionalAmenities")}({booking.otherAmenitiesList.length})
                        </Typography>
                        <IconButton size="small">
                          {expandedAmenities ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>

                      {expandedAmenities && (
                        <Grid container spacing={2}>
                          {booking.otherAmenitiesList.map((amenity, idx) => (
                            <Grid item xs={12} key={idx}>
                              <Card
                                variant="outlined"
                                sx={{
                                  borderRadius: 2,
                                  borderColor: 'success.light',
                                  bgcolor: 'success.light',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '4px',
                                    bgcolor: 'success.main'
                                  }
                                }}
                              >
                                <CardContent>
                                  <Grid container alignItems="center" spacing={2}>
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {amenity.name}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                      <Typography variant="body2" color="text.secondary">
                                        {t("booking_modal.quantity")}
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {amenity.quantity}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                      <Typography variant="body2" color="text.secondary">
                                         {t("booking_modal.maxPrice")}
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                                        ₹{amenity.maxPrice || 0}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                      <Typography variant="body2" color="text.secondary">
                                         {t("booking_modal.remarks")}
                                      </Typography>
                                      <Typography variant="body2">
                                        {amenity.remark || "-"}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Additional */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaIdBadge className="me-2 text-blue-600" />
                   {t("booking_modal.additionalInformation")}
                  </h3>

                  <div className="space-y-4">
                    {booking.letterUrl && (
                      <FileViewer
                        fileUrl={booking.letterUrl}
                        label= {t("booking_modal.uploadedBookingLetter")}
                        downloadFileName={booking.letterUrl}
                      />
                    )}
                    {isCancellationRequested && (
                      <FileViewer
                        fileUrl={booking.cancellationletterUrl}
                        label={t("booking_modal.cancellationLetter")}
                        downloadFileName="Cancellation.pdf"
                        icon={<FaFilePdf className="text-green-600" size={20} />}
                      />
                    )}
                    {(completionLetterUrl || booking?.completionletterUrl) && (
                      <FileViewer
                        fileUrl={completionLetterUrl || booking?.completionletterUrl}
                        label={t("booking_modal.trainingCompletionLetter")}
                        downloadFileName="CompletionLetter.pdf"
                        icon={<FaFilePdf className="text-green-600" size={20} />}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Approval History */}
            {Array.isArray(latestRemark) && latestRemark.length > 0 && (
              <div className="mt-8">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaHistory className="me-2 text-blue-600" />
                    {t("booking_modal.approvalHistory")}
                  </h3>

                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {latestRemark.map((r, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          r.action === BOOKING_APPROVAL_STATUS.PENDING_DISTRICT_APPROVAL
                            ? "border-l-green-500 bg-green-50"
                            : r.action === "REJECTED"
                            ? "border-l-red-500 bg-red-50"
                            : r.action === "CANCELLED"
                            ? "border-l-gray-500 bg-gray-50"
                            : "border-l-yellow-500 bg-yellow-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
                              <FaUserTie className="me-2 text-gray-600" />
                              <span className="font-semibold text-gray-800">{r.level || "Officer"}</span>
                              <FaChevronRight className="mx-2 text-gray-400" size={12} />
                              <span
                                className={`font-medium ${
                                  r.action === BOOKING_APPROVAL_STATUS.PENDING_DISTRICT_APPROVAL
                                    ? "text-green-700"
                                    : r.action === "REJECTED"
                                    ? "text-red-700"
                                    : r.action === "CANCELLED"
                                    ? "text-gray-700"
                                    : "text-yellow-700"
                                }`}
                              >
                                {r.action || "REVIEWED"}
                              </span>
                            </div>

                            {r.remarks && <p className="text-gray-700 mb-2">{r.remarks}</p>}
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">{r.time ? new Date(r.time).toLocaleString() : ""}</p>
                            {r.by && <p className="text-sm text-gray-600 mt-1">{t("booking_modal.by")}: {r.by}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Upload Completion Letter */}
            {!(completionLetterUrl || booking?.completionletterUrl) && (
            <div className="mt-8">
            <div className="bg-grey-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t("booking_modal.uploadCompletionLetter")}
              </h3>

              <div className="row g-3">
                {/* File Input */}
                <div className="col-md-8">
                  <input
                    type="file"
                    className="form-control"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={!isUploadAllowed() || booking?.paymentStatus !== "FULLY_PAID"}
                    //  disabled={!isUploadAllowed()}
                  />
                </div>

                {/* Upload Button */}
                <div className="col-md-4">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleUpload}
                    disabled={!isUploadAllowed() ||  booking?.paymentStatus !== "FULLY_PAID" || loading}
                  >
                    {loading ? "Uploading..." :  t("booking_modal.upload")}
                  </button>
                </div>
              </div>

              {/* Validation Message */}
              {/* {!isUploadAllowed() && ( */}
                {(!isUploadAllowed()|| booking?.paymentStatus !== "FULLY_PAID")&& (
                <div className="text-secondary mt-2">
                  {/* {t("booking_modal.UploadtrainingLetterRemark")} */}
                  {booking?.paymentStatus !== "FULLY_PAID"
                    ? "Upload allowed only after full payment."
                   : t("booking_modal.UploadtrainingLetterRemark")}
                </div>
              )}
            </div>
          </div>
            )}

            {/* Remark + Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {/* Regular remark (for approval/rejection) */}
              {!isCancellationRequested &&
              ["PENDING_BLOCK_APPROVAL", "PENDING_DISTRICT_APPROVAL"].includes(
                booking?.status
              ) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaComment className="me-2 text-gray-500" />
                   {t("booking_modal.yourRemark")}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    rows="3"
                    placeholder={t("booking_modal.enterRemark")}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  disabled={loading}
                >
                  {t("booking_modal.cancel")}
                </button>

                {/* CANCELLATION REQUESTED STATUS - SHOW CANCEL/DECLINE BUTTONS */}
                {isCancellationRequested && (
                  <>
                    <button
                      onClick={handleCancelBooking}
                      disabled={loading || !cancellationRemark.trim()}
                      className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
                    >
                      <FaCheck className="me-2" />
                      {loading ? "Processing..." : t("booking_modal.approveCancellation")}
                    </button>
                    <button
                      onClick={() => {
                        // You might want to implement a separate handler for declining cancellation
                        // For now, we'll use onReject
                        if (swal("Decline cancellation request?", { buttons: true }) ){
                          onReject("Cancellation request declined: " + (cancellationRemark || "No remark provided"));
                        }
                      }}
                      disabled={loading || !cancellationRemark.trim()}
                      className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
                    >
                      <FaBan className="me-2" />
                      {loading ? "Processing..." : t("booking_modal.declineCancellation")}
                    </button>
                  </>
                )}

                {/* REGULAR APPROVAL/REJECTION FOR PENDING BOOKINGS */}
                {!isCancellationRequested && booking.status === BOOKING_APPROVAL_STATUS.PENDING_BLOCK_APPROVAL && user.role === "BLOCK_OFFICER" && (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={loading || !remark.trim()}
                      className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : t("booking_modal.reject")}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={loading || !remark.trim()}
                      className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : t("booking_modal.approve")}
                    </button>
                  </>
                )}

                {/* DISTRICT OFFICER ACTIONS */}
                {!isCancellationRequested && booking.status === BOOKING_APPROVAL_STATUS.PENDING_DISTRICT_APPROVAL && user.role === "DISTRICT_OFFICER" && (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={loading || !remark.trim()}
                      className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : t("booking_modal.reject")}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={loading || !remark.trim()}
                      className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : t("booking_modal.finalApprove")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;