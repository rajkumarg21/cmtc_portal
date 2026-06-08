import { sanitizeText } from "../utils/security";

export const WEEK_DAYS = Object.freeze(
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day =>
    sanitizeText(day)
  )
);