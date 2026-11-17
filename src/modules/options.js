/** Page sizes in millimetres, portrait orientation: [width, height]. */
export const PAGE_DIMENSIONS_MM = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
};

export const ORIENTATIONS = ['portrait', 'landscape'];
export const THEMES = ['clean', 'academic'];

export const LIMITS = {
  marginMm: { min: 5, max: 40 },
  fontSizePt: { min: 8, max: 18 },
};

export const DEFAULT_OPTIONS = Object.freeze({
  pageSize: 'a4',
  orientation: 'portrait',
  marginMm: 15,
  fontSizePt: 11,
  theme: 'clean',
});

function clampInt(value, { min, max }, fallback) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Turns any partial or invalid input into a complete, safe options object.
 * @param {Partial<typeof DEFAULT_OPTIONS>} [input]
 */
export function normalizeOptions(input = {}) {
  const src = input ?? {};
  return {
    pageSize: src.pageSize in PAGE_DIMENSIONS_MM ? src.pageSize : DEFAULT_OPTIONS.pageSize,
    orientation: ORIENTATIONS.includes(src.orientation) ? src.orientation : DEFAULT_OPTIONS.orientation,
    marginMm: clampInt(src.marginMm, LIMITS.marginMm, DEFAULT_OPTIONS.marginMm),
    fontSizePt: clampInt(src.fontSizePt, LIMITS.fontSizePt, DEFAULT_OPTIONS.fontSizePt),
    theme: THEMES.includes(src.theme) ? src.theme : DEFAULT_OPTIONS.theme,
  };
}

/** Width available for content, in millimetres, after margins. */
export function contentWidthMm(options) {
  const o = normalizeOptions(options);
  const [w, h] = PAGE_DIMENSIONS_MM[o.pageSize];
  const pageWidth = o.orientation === 'landscape' ? h : w;
  return Math.round((pageWidth - 2 * o.marginMm) * 100) / 100;
}

/** Configuration object consumed by html2pdf.js. */
export function buildPdfConfig(options, filename = 'document.pdf') {
  const o = normalizeOptions(options);
  return {
    margin: o.marginMm,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: o.pageSize, orientation: o.orientation },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: ['h1', 'h2', 'h3', 'pre', 'blockquote', 'table', 'img', 'tr'],
    },
  };
}

/** CSS for the browser print dialog, so "Print / Save as PDF" matches the options. */
export function buildPageCss(options) {
  const o = normalizeOptions(options);
  const size = o.pageSize === 'a4' ? 'A4' : o.pageSize;
  return `@page { size: ${size} ${o.orientation}; margin: ${o.marginMm}mm; }`;
}
