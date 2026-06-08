export const isSafeRoute = (url) => {

  if (!url || typeof url !== "string") return false;

  try {

    // Decode encoded characters
    const decoded = decodeURIComponent(url);

    // Must start with single /
    if (!decoded.startsWith("/")) return false;

    // Block protocol-relative URLs
    if (decoded.startsWith("//")) return false;

    // Block javascript protocol
    if (decoded.toLowerCase().startsWith("/javascript:")) return false;

    // Block path traversal
    if (decoded.includes("..")) return false;

    // Block backslashes
    if (decoded.includes("\\")) return false;

    return true;

  } catch {

    return false;

  }

};

export const isSafeUrl = (url) => {

  if (!url || typeof url !== "string")
    return false;

  try {

    const decoded = decodeURIComponent(url);

    // Block javascript
    if (decoded.toLowerCase().startsWith("javascript:"))
      return false;

    // Block data URL
    if (decoded.toLowerCase().startsWith("data:"))
      return false;

    // Block protocol-relative
    if (decoded.startsWith("//"))
      return false;

    // Allow only same origin

    const parsed = new URL(decoded, window.location.origin);

    if (parsed.origin !== window.location.origin)
      return false;

    return true;

  } catch {

    return false;

  }

};
export const sanitizeRoute = (url) => {

  if (!url || typeof url !== "string")
    return null;

  try {

    const decoded = decodeURIComponent(url).trim();

    if (!decoded.startsWith("/"))
      return null;

    if (decoded.startsWith("//"))
      return null;

    if (decoded.includes(".."))
      return null;

    if (decoded.includes("\\"))
      return null;

    if (decoded.toLowerCase().includes("javascript:"))
      return null;

    return decoded;

  } catch {

    return null;

  }

};



export const sanitizeUrl = (url) => {

  if (!url || typeof url !== "string")
    return null;

  try {

    const decoded = decodeURIComponent(url).trim();

    if (
      decoded.toLowerCase().startsWith("javascript:") ||
      decoded.toLowerCase().startsWith("data:") ||
      decoded.startsWith("//")
    )
      return null;


    const parsed = new URL(decoded, window.location.origin);


    if (parsed.origin !== window.location.origin)
      return null;


    return parsed.href;


  } catch {

    return null;

  }

};
export const validatePassword = (password) => {

if (!password) return false;

if (password.length < 6) return false;

if (password.length > 14) return false;

return true;

};
export const isValidId = (value) => {

return /^[0-9]+$/.test(value);

};

export const isValidDate = (value) => {

return /^\d{4}-\d{2}-\d{2}$/.test(value);

};
export const sanitizeText = (value) => {

if (typeof value !== "string") return "";

return value
.replace(/[<>]/g, "")
.replace(/javascript:/gi, "")
.trim();

};
export const validateStatus = (value) => {

  const allowed = [
    "",
    "PENDING_BLOCK_APPROVAL",
    "BOOKED",
    "APPROVED"
  ];

  return allowed.includes(value) ? value : "";


};
export const sanitizeObject = (obj) => {

  if (!obj) return {};

  const clean = {};

  Object.keys(obj).forEach(key => {

    const value = obj[key];

    if (typeof value === "string") {
      clean[key] = sanitizeText(value);
    } else {
      clean[key] = value;
    }

  });

  return clean;
};