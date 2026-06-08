import api from "./apiService"; // ya tumhare existing path se

export async function initiateUniPay({ bookingId, paymentStage }) {
  const res = await api.post("/payments/unipay/initiate", {
    bookingId: Number(bookingId),
    paymentStage, // "ADVANCE" | "REMAINING"
  });
  return res.data;
}
