/** Page sizes in millimetres, portrait orientation: [width, height]. */
export const PAGE_DIMENSIONS_MM = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
};

export const ORIENTATIONS = ['portrait', 'landscape'];
export const THEMES = ['clean', 'academic'];
/** Colors of the document itself (preview, PDF and print), independent of the app theme. */
export const COLOR_MODES = ['light', 'dark'];

/** Background of the page for each document color mode. */
export const PAGE_BACKGROUNDS = { light: '#ffffff', dark: '#0d1117' };

const PX_PER_MM = 96 / 25.4;

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
  colorMode: 'light',
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
    colorMode: COLOR_MODES.includes(src.colorMode) ? src.colorMode : DEFAULT_OPTIONS.colorMode,
  };
}

/** Height available for content on each page, in millimetres, after margins. */
export function contentHeightMm(options) {
  const o = normalizeOptions(options);
  const [w, h] = PAGE_DIMENSIONS_MM[o.pageSize];
  const pageHeight = o.orientation === 'landscape' ? w : h;
  return Math.round((pageHeight - 2 * o.marginMm) * 100) / 100;
}

/**
 * Rounds a content height (px) up to a whole number of pages, minus 1px so
 * rounding errors never create an extra blank page. Used so a dark document
 * fills every page down to the bottom instead of ending in a white strip.
 */
export function padHeightToPages(heightPx, options) {
  const pagePx = contentHeightMm(options) * PX_PER_MM;
  const pages = Math.max(1, Math.ceil((Number(heightPx) || 0) / pagePx));
  return Math.floor(pages * pagePx) - 1;
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

/**
 * Extra print CSS so a dark document also paints the page margins and keeps
 * its colors in the browser dialog. "print-color-adjust: exact" stops browsers
 * from dropping backgrounds and lightening text to save ink, and the @page
 * background paints the margin area, which the root background does not reach.
 */
export function buildPrintColorCss(options) {
  const o = normalizeOptions(options);
  const bg = PAGE_BACKGROUNDS[o.colorMode];
  return [
    '@media print {',
    `  @page { background: ${bg}; }`,
    `  html, body { background: ${bg} !important; }`,
    '  *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }',
    '}',
  ].join('\n');
}
