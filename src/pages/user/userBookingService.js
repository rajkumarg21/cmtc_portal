
// src/pages/user/userBookingService.js
import api from "../../services/apiService";

export async function getMyBookings() {
  const res = await api.get("/bookings/mybooking");
  return res.data;
}

export async function getBookingDetails(bookingId) {
  const res = await api.get(`/bookings/${bookingId}`);
  return res.data;
}

export async function cancelBooking(bookingId) {
  const res = await api.put(`/bookings/${bookingId}/cancel`);
  return res.data;
}

export async function requestCancellation(bookingId, data) {
  const res = await api.post(`/bookings/${bookingId}/request-cancellation`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}