import api from "./apiService.js";

/* =========================================================
   ADMIN – TRAINING CALENDAR MANAGEMENT
   ========================================================= */

const ADMIN_CALENDAR_API = "admin/training-calendar";

/* ---------------------------------------------------------
   CREATE / UPDATE SINGLE CALENDAR DATE
   --------------------------------------------------------- */

export const createCalendarEntry = async ({
  centerId,
  date,
  capacityAvailable = 0,
  bookingStatus = "AVAILABLE",
}) => {
  return api.post(ADMIN_CALENDAR_API, {
    centerId,
    date,
    capacityAvailable,
    bookingStatus,
    isReserved: bookingStatus === "RESERVED",
  });
};


export const updateCalendarEntry = async (
  calendarId,
  {
    capacityAvailable,
    bookingStatus,
  }
) => {
  return api.put(`${ADMIN_CALENDAR_API}/${calendarId}`, {
    capacityAvailable,
    bookingStatus,
    isReserved: bookingStatus === "RESERVED",
  });
};
/* ---------------------------------------------------------
   BULK CREATE / UPDATE CALENDAR DATES (DATE RANGE)
   --------------------------------------------------------- */

export const bulkCreateCalendarEntries = async ({
  centerId,
  fromDate,
  toDate,
  capacityAvailable = 0,
  bookingStatus = "AVAILABLE",
}) => {
  return api.post(`${ADMIN_CALENDAR_API}/bulk`, {
    centerId,
    fromDate,
    toDate,
    capacityAvailable,
    bookingStatus,
    isReserved: bookingStatus === "RESERVED",
  });
};


/**
 * Get All Invoices By BookingId
 */
export const getAllInvoicesByBookingId = async (bookingId) => {
  const response = await api.get(
    `/invoices/booking/${bookingId}/all`
  );
  return response.data;
};
/**
 * booking data
 */
export const getAdminBookingAnalytics = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/analytics/admin/booking",
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  return response.data;
};

// Dashboard Stats API
export const getDashboardStats = () => {
  return api.get("/analytics/admin/dashboard-stats");
};

// get mis report booking count
export const getMISCounts = async () => {
  try {
    const response = await api.get("admin/mis/count");
    return response.data;
  } catch (error) {
    console.error("MIS API Error:", error);
    throw error;
  }
};
// get mis internal bookings
export const getMISInternalBookings = async () => {
  try {
    const response = await api.get("admin/mis/internalbookings");
    return response.data;
  } catch (error) {
    console.error("MIS API Error:", error);
    throw error;
  }
};
// get mis internal booking count
export const getMISInternalBookingCount = async () => {
  try {
    const response = await api.get("admin/mis/internal-booking-stats");
    return response.data;
  } catch (error) {
    console.error("MIS API Error:", error);
    throw error;
  }
};