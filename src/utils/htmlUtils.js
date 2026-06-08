// utils/sanitizeHtml.js
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * @param {string} dirty - The potentially unsafe HTML string.
 * @param {DOMPurify.Config} [config] - Optional DOMPurify configuration.
 * @returns {string} - Safe HTML string.
 */
export function sanitizeHtml(dirty, config = {}) {
  return DOMPurify.sanitize(dirty, config);
}
