export const STATUS_OPTIONS = Object.freeze([
  { value: "", label: "All Status" },
  { value: "PENDING_BLOCK_APPROVAL", label: "Pending" },
  { value: "BOOKED", label: "Booked" },
  { value: "APPROVED", label: "Approved" }
]);
import { sanitizeText } from "../utils/security";

export const BOOKING_STATUS = Object.freeze([
  {
    label: sanitizeText("AVAILABLE"),
    color: "#2e7d32",
    icon: "🟩",
  },
  {
    label: sanitizeText("RESERVED"),
    color: "#ef6c00",
    icon: "🟧",
  },
  {
    label: sanitizeText("BOOKED"),
    color: "#e74c3c",
    icon: "🟥",
  },
]);