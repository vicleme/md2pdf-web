import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML produced from Markdown so scripts, inline handlers and
 * other active content never reach the preview or the exported PDF.
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
