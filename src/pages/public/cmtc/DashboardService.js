import api from "../../../services/apiService";

// 🔹 Officer dashboard bookings
export const getBookingsForOfficer = (params) => {
  return api.get("/public/bookings/officer-dashboard", { params });
};

// 🔹 Reject booking
export const rejectBooking = (bookingId, officerUserId, reason) => {
  return api.post(`/public/bookings/${bookingId}/reject`, {
    reason
  }, {
    params: { officerUserId }
  });
};

export const districtReject = (bookingId, remarks) => {
  return api.post(
    `/public/admin/bookings/${bookingId}/district-reject`,
    { remarks }   // 👈 request body
  );
};

// 🔹 Get latest approval remark for a booking
export const getLatestRemark = (bookingId) => {
  return api.get(`/public/bookings/${bookingId}/latest-remark`);
};

// 🔹 Get full remark conversation
export const getBookingRemarks = (bookingId) => {
  return api.get(`/public/bookings/${bookingId}/remarks`);
};

export const approveBooking = (bookingId, officerUserId, remarks) => {
  return api.post(
    `/public/bookings/${bookingId}/approve`,
    { remarks },   // ✅ send remarks
    {
      params: { officerUserId }
    }
  );
};

export const districtApprove = (bookingId, officerUserId, remarks) => {
  return api.post(
    `/public/admin/bookings/${bookingId}/district-approve`,
    { remarks },
    {
      params: { officerUserId }
    }
  );
};

// ✅ NEW: Cancel booking (for CANCELLATION_REQUESTED status)
export const cancelBooking = (bookingId, remark, officerUserId) => {
  return api.post(
    `/public/bookings/${bookingId}/cancel`,
    { remark },
    {
      params: { officerUserId } // Add this
    }
  );
};

// ✅ NEW: Get booking cancellation requests
export const getCancellationRequests = (params) => {
  return api.get("/public/bookings/cancellation-requests", { params });
};

// ✅ NEW: Update booking status to cancelled
export const updateBookingStatus = (bookingId, status, remark) => {
  return api.put(
    `/public/bookings/${bookingId}/status`,
    { status, remark }
  );
};

// ✅ NEW: Get booking details for officer view
export const getBookingDetailsForOfficer = (bookingId) => {
  return api.get(`/public/bookings/${bookingId}/details`);
};

// ✅ NEW: Submit cancellation decision
export const submitCancellationDecision = (bookingId, decision, remark) => {
  return api.post(
    `/public/bookings/${bookingId}/cancellation-decision`,
    { decision, remark }
  );
};

export const getAllBooking = () => {
  return api.get('/analytics/admin/booking');
}

//  Upload Completion Letter API
export const uploadCompletionLetter = (formData) => {
  return api.post(
    `/admin/upload-completion-letter`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};