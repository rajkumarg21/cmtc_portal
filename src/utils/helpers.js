export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Utility to generate URL-friendly slugs from text
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')   // replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, '');    // remove leading/trailing dashes
};

// Regex for Hindi (Devanagari) characters
const devanagariRegex = /[\u0900-\u097F]/;

// Regex for English (Latin) characters
const latinRegex = /[A-Za-z]/;

export const getPlainText = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return (tempDiv.textContent || tempDiv.innerText || '').trim();
};

/**
 * Check if a string has sufficient Hindi content
 * Returns true if at least `threshold` % of characters are Hindi
 * threshold: number between 0 and 1 (default 0.75 for 75%)
 */
export const isMostlyHindi = (text = '', threshold = 0.75) => {
  if (!text) return false;

  const plainText = getPlainText(text);
  const chars = plainText.replace(/\s/g, '');
  if (!chars.length) return true;

  const hindiChars = chars.split('').filter(char => devanagariRegex.test(char));
  const hindiPercentage = hindiChars.length / chars.length;

  return hindiPercentage >= threshold;
};

/**
 * Check if a string is mostly English content
 * Returns true if at least `threshold` % of characters are English
 */
export const isMostlyEnglish = (text = '', threshold = 0.75) => {
  if (!text) return false;

  const plainText = getPlainText(text);
  const chars = plainText.replace(/\s/g, '');
  if (!chars.length) return true;

  const englishChars = chars.split('').filter(char => latinRegex.test(char));
  const englishPercentage = englishChars.length / chars.length;

  return englishPercentage >= threshold;
};

/*
 * Helper function: getByteSize
 *
 * Purpose: Calculates the approximate byte size of a given string using UTF-8 encoding.
 * This is crucial for accurately validating content size limits (e.g., 16MB limit)
 * for rich text, especially content containing multi-byte characters like Hindi,
 * where standard JavaScript string length is inaccurate.
 *
 * @param {string} str - The input string (typically HTML content from a Quill editor).
 * @returns {number} The size of the string in bytes. Returns 0 if the input is empty or not a string.
 */
export const getByteSize = (str) => {
  if (typeof str !== 'string' || str.length === 0) {
    return 0;
  }
  // TextEncoder converts the string into a sequence of UTF-8 bytes (Uint8Array).
  // The length of the resulting array is the size of the string in bytes.
  return new TextEncoder().encode(str).length;
};