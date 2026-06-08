// src/pages/user/UserDashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
} from "@mui/material";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { getMyBookings, getBookingDetails, cancelBooking, requestCancellation } from "./userBookingService";
import api from "../../services/apiService";
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
import { FaFilePdf } from "react-icons/fa";
import { BOOKING_APPROVAL_STATUS } from "../../utils/constants";
import { useTranslation } from "react-i18next";
import FileViewer from "../../components/common/FileViewerBookingModal";
const parseDate = (value) => (value ? new Date(value) : null);

const normalizeBooking = (b) => ({
  id: b.id,
  bookingRef: b.booking_ref ?? b.bookingRef,
  organizationName: b.organization_name ?? b.organizationName,
  invoiceNo: b.invoice_no ?? b.invoiceNo,  
  fromDate: b.from_date ?? b.fromDate,
  toDate: b.to_date ?? b.toDate,
  approvalLevel: b.approval_level ?? b.approvalLevel,
  paymentStatus: b.payment_status ?? b.paymentStatus,
  status: b.status,
  purpose: b.purpose,
  numberOfTrainees: b.number_of_trainees ?? b.numberOfTrainees,
  durationDescription: b.duration_description ?? b.durationDescription,
  approvalRemarks: b.approval_remarks ?? b.approvalRemarks,
  otherAmenitiesList: b.otherAmenitiesList ?? [],
  amount: b.amount,
  letterUrl: b.letterUrl,
  cancellationLetterUrl: b.cancellationLetterUrl,
  completionletterUrl: b.completionletterUrl,
  // Add cancellation related fields
  requiresCancellationApproval: b.requires_cancellation_approval ?? b.requiresCancellationApproval,
  cancellationStatus: b.cancellation_status ?? b.cancellationStatus,
  cancellationReason: b.cancellation_reason ?? b.cancellationReason,
  cancellationDocument: b.cancellation_document ?? b.cancellationDocument,

  // optional timestamps (used for sorting if present)
  updatedAt: b.updated_at ?? b.updatedAt,
  submittedAt: b.submitted_at ?? b.submittedAt,
  createdAt: b.created_at ?? b.createdAt,

  // ✅ ADDED: internal booking flag
    isInternal: b.is_internal ?? b.isInternal ?? false, 
});

const statusChipColor = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "BOOKED") return "success";
  if (s === "CANCELLED") return "default";
  if (s.includes("PENDING")) return "warning";
  if (s.includes("REJECT")) return "error";
  if (s.includes("APPROV")) return "success";
  return "info";
};

const formatDate = (value) => {
  const d = parseDate(value);
  if (!d || Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
const isCmtcBooked = (status) => {
  const s = (status || "").toUpperCase();
  return s === "BOOKED";   // change if backend uses different value
};
const isAwaitingAdvancePayment = (status) => {
  const s = (status || "").toUpperCase();
  return s === BOOKING_APPROVAL_STATUS.AWAITING_ADVANCE_PAYMENT;   // change if backend uses different value
};

export const getStatusIcon = (status) => {
  switch (status) {
    case BOOKING_APPROVAL_STATUS.PENDING_BLOCK_APPROVAL:
    case BOOKING_APPROVAL_STATUS.PENDING_DISTRICT_APPROVAL:
      return <Pending color="warning" />;

    case BOOKING_APPROVAL_STATUS.BLOCK_REJECTED:
    case BOOKING_APPROVAL_STATUS.DISTRICT_REJECTED:
      return <Cancel color="error" />;

    case BOOKING_APPROVAL_STATUS.DISTRICT_APPROVED:
      return <CheckCircle color="success" />;

    case BOOKING_APPROVAL_STATUS.CANCELLED_BY_USER:
    case BOOKING_APPROVAL_STATUS.EXPIRED:
      return <Cancel color="error" />;

    default:
      return <Info color="info" />;
  }
};

const UserDashboardPage = () => {
  const { userRole } = useAuth();
  const { t} = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedAmenities, setExpandedAmenities] = useState(false);

  // Cancellation modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationDocument, setCancellationDocument] = useState(null);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [requiresApproval, setRequiresApproval] = useState(false);

  // Confirmation modal for direct cancellation
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // ✅ track cancel loading per booking id
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  const isAllowed = useMemo(() => userRole === "GOV_DEPARTMENT", [userRole]);

  // Check if booking requires approval for cancellation
  const checkRequiresCancellationApproval = (status) => {
    const s = (status || "").toUpperCase();
    return s === "BOOKED" || s === "APPROVED" || s.includes("APPROV");
  };

  // ✅ helper: disable cancel when already cancelled (and while cancel API running)
  const isCancelled = (status) => (status || "").toUpperCase() === "CANCELLED";
  const hasPendingCancellation = (booking) => {
    const cancellationStatus = booking?.cancellationStatus || "";
    return cancellationStatus.toUpperCase() === "PENDING";
  };

  const isCancelDisabled = (booking) =>
    !booking?.id ||
    isCancelled(booking.status) ||
    cancelLoadingId === booking.id ||
    hasPendingCancellation(booking);

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyBookings();
      const normalized = (data || []).map(normalizeBooking);

      const sorted = [...normalized].sort((a, b) => {
        const da = new Date(a.updatedAt || a.submittedAt || a.createdAt || 0).getTime();
        const db = new Date(b.updatedAt || b.submittedAt || b.createdAt || 0).getTime();
        return db - da;
      });

      setBookings(sorted);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedBooking(null);
    setExpandedAmenities(false);
  };

  const openDetails = async (bookingId) => {
    setSelectedBooking(null);
    setDetailsLoading(true);
    setError("");
    setDetailsOpen(true);

    try {
      const details = await getBookingDetails(bookingId);
      setSelectedBooking(normalizeBooking(details));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load booking details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    if (!booking?.id) return;

    if (isCancelled(booking.status) || hasPendingCancellation(booking)) return;

    setBookingToCancel(booking);

    const type = getCancellationType(booking);

    if (type === "REQUEST") {
      setCancellationReason("");
      setCancellationDocument(null);
      setCancelModalOpen(true);
    } else if (type === "DIRECT") {
      setConfirmModalOpen(true);
    }
  };

  const performDirectCancellation = async () => {
    if (!bookingToCancel?.id) return;

    setCancelLoadingId(bookingToCancel.id);
    try {
      await cancelBooking(bookingToCancel.id);
      swal({
        text: "Booking cancelled successfully",
        icon: "success",
      });
      await loadBookings();

      // Refresh selected booking details
      if (selectedBooking?.id === bookingToCancel.id) {
        try {
          const details = await getBookingDetails(bookingToCancel.id);
          setSelectedBooking(normalizeBooking(details));
        } catch {
          setSelectedBooking(null);
        }
      }
    } catch (e) {
      swal({
        // title: "Error",
        text: e?.response?.data?.message || e?.message || "Failed to cancel booking.",
        // icon: "error",
      });

    } finally {
      setCancelLoadingId(null);
      setConfirmModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleSubmitCancellationRequest = async () => {
    if (!bookingToCancel?.id || !cancellationReason.trim()) {
      swal({
        text: "Please provide a reason for cancellation",
        icon: "warning",
      });

      return;
    }

    setCancellationLoading(true);

    try {
      const formData = new FormData();
      // ⚠️ Fix the key to match backend
      formData.append("reason", cancellationReason);

      if (cancellationDocument) {
        formData.append("file", cancellationDocument); // match backend param for file
      }else{
        swal({
          text: "Cancellation letter is required with reason to cancel",
          icon: "error",
        });
        return;
      }

      // Call the API to submit cancellation request
      const res = await api.post(`/bookings/${bookingToCancel.id}/request-cancellation`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      swal({
        text: "Cancellation request submitted successfully. Waiting for approval.",
        icon: "success",
      });

      setCancelModalOpen(false);
      setBookingToCancel(null);
      setCancellationReason("");
      setCancellationDocument(null);

      await loadBookings();

      if (selectedBooking?.id === bookingToCancel.id) {
        try {
          const details = await getBookingDetails(bookingToCancel.id);
          setSelectedBooking(normalizeBooking(details));
        } catch {
          setSelectedBooking(null);
        }
      }
    } catch (e) {
      swal({
        text: e?.response?.data?.message || e?.message || "Failed to submit cancellation request.",
        icon: "error",
      });

    } finally {
      setCancellationLoading(false);
    }
  };


  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
         swal({
          text: "File size should be less than 5MB",
          icon: "warning",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
          swal({
          text: "Please upload PDF, Word, or image files only",
          icon: "warning",
        });
        return;
      }

      setCancellationDocument(file);
    }
  };
const getCancelButtonText = (booking) => {
  const type = getCancellationType(booking.status);

  if (cancelLoadingId === booking.id) return "Cancelling...";
  if (isCancelled(booking.status)) return "Cancelled";
  if (hasPendingCancellation(booking)) return "Cancellation Pending";

  if (type === "REQUEST") return "Request Cancellation";
  if (type === "DIRECT") return "Cancel";

  return "";
};
  const getCancellationType = (booking) => {
    const s = (booking.status || "").toUpperCase();

    if (booking?.isInternal && booking?.status === BOOKING_APPROVAL_STATUS.BOOKED) {
      return "DIRECT";
    }
    if (s === BOOKING_APPROVAL_STATUS.PENDING_BLOCK_APPROVAL) {
      return "DIRECT";
    }

    if (s === BOOKING_APPROVAL_STATUS.PENDING_DISTRICT_APPROVAL) {
      return "REQUEST";
    }

    return "NONE";
  };
  // payment button function
  const handlePaymentClick = (bookingId) => {
    navigate(`/payment/${bookingId}`);
  };

  useEffect(() => {
     loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed]);

  const getPaymentStatusColor = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PAID") return "success";
    if (s === "PENDING") return "warning";
    if (s === "FAILED") return "error";
    return "default";
  };


// ✅ ADDED: Only allow cancellation request for pending block/district
const canRequestCancellation = (booking) => {
  return getCancellationType(booking) !== "NONE"
};

console.log("URL:", selectedBooking?.completionletterUrl);
console.log(
  "FULL URL:",
  import.meta.env.VITE_APP_BACKEND_URL + selectedBooking?.completionletterUrl
);


  return (
    <>
      {/* Simple Confirmation Modal for Direct Cancellation */}
      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel booking{" "}
            <strong>{bookingToCancel?.bookingRef || bookingToCancel?.id}</strong>?
          </Typography>
          {bookingToCancel?.status?.toUpperCase().includes("PENDING") && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This is a pending booking and will be cancelled immediately.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)} disabled={cancelLoadingId === bookingToCancel?.id}>
            No, Keep Booking
          </Button>
          <Button
            onClick={performDirectCancellation}
            variant="contained"
            color="error"
            disabled={cancelLoadingId === bookingToCancel?.id}
          >
            {cancelLoadingId === bookingToCancel?.id ? "Cancelling..." : "Yes, Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detailed Cancellation Request Modal for BOOKED/APPROVED */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>BOOKING Cancellation</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This booking requires approval for cancellation. Please provide a reason and upload supporting document.
          </Alert>

          <Typography variant="body2" sx={{ mb: 1 }}>
            Booking Reference: <strong>{bookingToCancel?.bookingRef || bookingToCancel?.id}</strong>
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Cancellation Reason *"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            required
            disabled={cancellationLoading}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload Supporting Document (Optional)
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleDocumentChange}
              disabled={cancellationLoading}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Accepted formats: PDF, Word, JPEG, PNG (Max 5MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelModalOpen(false)} disabled={cancellationLoading}>
            Cancel Request
          </Button>
          <Button
            onClick={handleSubmitCancellationRequest}
            variant="contained"
            color="primary"
            disabled={!cancellationReason.trim() || cancellationLoading}
          >
            {cancellationLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal - Enhanced */}
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarToday />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Booking Details
            </Typography>
          </Box>
          {selectedBooking && (
            <Chip
              label={selectedBooking.status}
              color={statusChipColor(selectedBooking.status)}
              sx={{ color: 'white', fontWeight: 600 }}
            />
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <LoadingSpinner />
            </Box>
          ) : !selectedBooking ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">
                No booking selected
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              {/* Header Card */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Business sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Organization
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                        {selectedBooking.organizationName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Booking Reference: {selectedBooking.bookingRef}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <People sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Trainees
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        {selectedBooking.numberOfTrainees}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBooking.durationDescription}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Dates & Time Section */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                    Booking Period
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="primary.contrastText">
                          START DATE
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                          {formatDate(selectedBooking.fromDate)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="secondary.contrastText">
                          END DATE
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                          {formatDate(selectedBooking.toDate)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Quick Info Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      height: '100%'
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <AccessTime sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Approval Level
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedBooking.approvalLevel || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      height: '100%'
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Payment sx={{ fontSize: 40, color: selectedBooking.paymentStatus === 'PAID' ? 'success.main' : 'warning.main', mb: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Payment Status
                      </Typography>
                      <Chip
                        label={selectedBooking.paymentStatus || "-"}
                        color={getPaymentStatusColor(selectedBooking.paymentStatus)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      height: '100%'
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Amount
                      </Typography>

                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                        ₹{selectedBooking.amount || "0"}
                      </Typography>
                    </CardContent>

                  </Card>
                </Grid>
              </Grid>

              {/* Purpose Section */}
              {selectedBooking.purpose && (
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Description sx={{ mr: 1, color: 'primary.main' }} />
                      Purpose of Booking
                    </Typography>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main'
                    }}>
                      <Typography variant="body1">
                        {selectedBooking.purpose}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Remarks Section */}
              {selectedBooking.approvalRemarks && (
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Note sx={{ mr: 1, color: 'info.main' }} />
                      Approval Remarks
                    </Typography>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'info.light',
                      borderRadius: 2,
                      borderLeft: '4px solid',
                      borderColor: 'info.main'
                    }}>
                      <Typography variant="body2" color="info.contrastText">
                        {selectedBooking.approvalRemarks}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* training completion letter */}
             
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: "#fafafa" 
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 1, 
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Note sx={{ mr: 1, color: 'success.main' }} />
                      Uploaded Letters
                    </Typography>

                    <Box sx={{ mt: 1 , width:"50%"}}>
                      {selectedBooking?.completionletterUrl && (
                       <FileViewer
                        fileUrl={selectedBooking.completionletterUrl}
                        label="Training Completion Letter"
                        downloadFileName="CompletionLetter.pdf"
                        icon={<FaFilePdf className="text-green-600" size={20} />}
                      />
                      )}

                      {selectedBooking?.letterUrl && (
                        <FileViewer
                          fileUrl={selectedBooking.letterUrl}
                          label="Uploaded Booking Letter"
                          downloadFileName={selectedBooking.letterUrl}
                        />
                      )}

                      {selectedBooking?.CancellationRequested && (
                        <FileViewer
                          fileUrl={selectedBooking.cancellationletterUrl}
                          label="Cancellation Letter"
                          downloadFileName="Cancellation.pdf"
                          icon={<FaFilePdf className="text-yellow-600" size={20} />}
                        />
                      )}
                    </Box>

                  </CardContent>
                </Card>
             

              
              {/* Cancellation Details */}
              {selectedBooking.cancellationStatus && (
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: selectedBooking.cancellationStatus === 'PENDING' ? 'warning.main' : 'error.main',
                    borderRadius: 2,
                    bgcolor: selectedBooking.cancellationStatus === 'PENDING' ? 'warning.light' : 'error.light'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Cancel sx={{ mr: 1 }} />
                      Cancellation Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedBooking.cancellationStatus}
                          color={selectedBooking.cancellationStatus === 'PENDING' ? 'warning' : 'error'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                      {selectedBooking.cancellationReason && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Reason
                          </Typography>
                          <Typography variant="body1">
                            {selectedBooking.cancellationReason}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Other Amenities Section */}
              {selectedBooking.otherAmenitiesList?.length > 0 && (
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
                        Additional Amenities ({selectedBooking.otherAmenitiesList.length})
                      </Typography>
                      <IconButton size="small">
                        {expandedAmenities ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    {expandedAmenities && (
                      <Grid container spacing={2}>
                        {selectedBooking.otherAmenitiesList.map((amenity, idx) => (
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
                                      Quantity
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                      {amenity.quantity}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} md={3}>
                                    <Typography variant="body2" color="text.secondary">
                                      Max Price
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                                      ₹{amenity.maxPrice || 0}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">
                                      Remarks
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
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button
            onClick={closeDetails}
            variant="outlined"
            startIcon={<EventBusy />}
          >
            Close
          </Button>
          {selectedBooking && canRequestCancellation(selectedBooking.status) && (
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={() => {
                closeDetails();
                handleCancelClick(selectedBooking);
              }}
              disabled={isCancelDisabled(selectedBooking)}
            >
              {getCancelButtonText(selectedBooking)}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Main Dashboard */}
      <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            background: "linear-gradient(to right, #ffffff, #fafafa)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t("userDashboard")}
          </Typography>

          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
             {t("userDashboardTitle2")}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {error && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: 2,
              }}
            >
              <Typography sx={{ color: "#B91C1C", fontWeight: 500 }}>
                {error}
              </Typography>
            </Paper>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : bookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <EventAvailable sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You haven't made any bookings yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              {bookings.map((b) => {
                const cancelled = isCancelled(b.status);
                const pendingCancellation = hasPendingCancellation(b);
                const cancelDisabled = isCancelDisabled(b);

                return (
                  <Paper
                    key={b.id}
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      transition: "0.2s",
                      "&:hover": {
                        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" />
                          Booking Ref: {b.bookingRef || b.id}
                        </Typography>

                        {pendingCancellation && (
                          <Chip
                            label="Cancellation Pending Approval"
                            color="warning"
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Business fontSize="small" />
                          {b.organizationName || "-"}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventAvailable fontSize="small" />
                          {formatDate(b.fromDate)} → {formatDate(b.toDate)}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={`Approval: ${b.approvalLevel ?? "-"}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={b.status || "UNKNOWN"}
                          color={statusChipColor(b.status)}
                          icon={getStatusIcon(b.status)}
                          sx={{ fontWeight: 600 }}
                        />

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Info />}
                          onClick={() => openDetails(b.id)}
                          disabled={detailsLoading}
                        >
                          Details
                        </Button>

                        {/*  MODIFIED: Show cancel only for pending block/district */}
                          {canRequestCancellation(b) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              startIcon={<Cancel />}
                              onClick={() => handleCancelClick(b)}
                              disabled={cancelDisabled}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        {/* Advance Payment Button */}
                        {isAwaitingAdvancePayment(b.status) &&
                          b.paymentStatus?.toUpperCase() !== "ADVANCE_PAID" &&
                          b.paymentStatus?.toUpperCase() !== "FULLY_PAID" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              startIcon={<Payment />}
                              onClick={() => handlePaymentClick(b.id)}
                            >
                              Pay Advance
                            </Button>
                        )}

                        {/* Remaining Payment Button */}
                        {isCmtcBooked(b.status) &&
                          b.paymentStatus?.toUpperCase() === "ADVANCE_PAID" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<Payment />}
                              onClick={() => handlePaymentClick(b.id)}
                            >
                              Pay Remaining
                            </Button>
                        )}
                        {/* Full Payment Button */}
                      {isCmtcBooked(b.status) &&
                        b.isInternal &&
                        b.paymentStatus &&
                        b.paymentStatus.toUpperCase() !== "FULLY_PAID" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Payment />}
                            onClick={() => handlePaymentClick(b.id)}
                          >
                            Pay Full Amount
                          </Button>
                      )}
                        {/*invoice Button */}
                        {/* {b.isInternal &&
                          b.paymentStatus?.toUpperCase() !== "FULLY_PAID" && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<Description />}
                              onClick={() => navigate(`/invoice/${b.id}`)}
                            >
                              View Invoices
                            </Button>
                          )} */}

                        {/*INVOICE Button */}
                        {(b.status?.toUpperCase() === "BOOKED" ||
                          b.status?.toUpperCase() === "TRAINING_COMPLETED") &&
                          (b.paymentStatus?.toUpperCase() === "ADVANCE_PAID" ||
                            b.paymentStatus?.toUpperCase() ===
                              "FULLY_PAID") && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<Description />}
                              onClick={() => navigate(`/invoice/${b.id}`)}
                            >
                              View Invoice
                            </Button>
                          )}
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default UserDashboardPage;