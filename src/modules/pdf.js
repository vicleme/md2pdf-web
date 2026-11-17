import {
  PAGE_BACKGROUNDS,
  PAGE_DIMENSIONS_MM,
  buildPdfConfig,
  contentWidthMm,
  normalizeOptions,
  padHeightToPages,
} from './options.js';

/**
 * Builds a detached DOM node sized to the printable area of the chosen page.
 * @param {string} html sanitized HTML
 * @param {ReturnType<typeof normalizeOptions>} options
 * @param {Document} [doc]
 */
export function buildExportNode(html, options, doc = document) {
  const o = normalizeOptions(options);
  const node = doc.createElement('div');
  node.className = `document theme-${o.theme} mode-${o.colorMode}`;
  node.style.width = `${contentWidthMm(o)}mm`;
  node.style.fontSize = `${o.fontSizePt}pt`;
  if (o.colorMode === 'dark') {
    node.style.boxSizing = 'border-box';
    node.style.padding = `0 ${DARK_PAD_MM}mm`;
  }
  node.innerHTML = html;
  return node;
}

/** Inner horizontal padding of a dark export, so the margin bleed never touches text. */
const DARK_PAD_MM = 1;
/** How far the painted margins reach into the content, hiding antialiasing seams. */
const BLEED = { side: 0.8, top: 0.3, bottom: 0.5 };

/** "#0d1117" -> [13, 17, 23] */
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Makes the node as tall as a whole number of pages (needs layout, so it is
 * mounted off screen for a moment). Keeps the dark background down to the
 * bottom of the last page.
 */
function padToWholePages(node, options) {
  const stage = document.createElement('div');
  stage.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden;';
  stage.appendChild(node);
  document.body.appendChild(stage);
  const height = node.getBoundingClientRect().height;
  node.style.minHeight = `${padHeightToPages(height, options)}px`;
  stage.remove();
}

/**
 * The page margins are outside the captured content and come out white.
 * For a dark document, paint them with the page color on every page.
 */
function paintDarkMargins(pdf, options) {
  const o = normalizeOptions(options);
  const [w, h] = PAGE_DIMENSIONS_MM[o.pageSize];
  const pageW = o.orientation === 'landscape' ? h : w;
  const pageH = o.orientation === 'landscape' ? w : h;
  const m = o.marginMm;
  const [r, g, b] = hexToRgb(PAGE_BACKGROUNDS.dark);

  for (let page = 1; page <= pdf.getNumberOfPages(); page += 1) {
    pdf.setPage(page);
    pdf.setFillColor(r, g, b); // fill color is stored per page, so set it after setPage
    pdf.rect(0, 0, pageW, m + BLEED.top, 'F'); // top
    pdf.rect(0, pageH - m - BLEED.bottom, pageW, m + BLEED.bottom, 'F'); // bottom
    pdf.rect(0, 0, m + BLEED.side, pageH, 'F'); // left
    pdf.rect(pageW - m - BLEED.side, 0, m + BLEED.side, pageH, 'F'); // right
  }
}

/**
 * Renders the HTML to a PDF and triggers the download.
 * html2pdf.js is loaded on demand to keep the first page load light.
 */
export async function exportPdf(html, options, filename) {
  const o = normalizeOptions(options);
  const { default: html2pdf } = await import('html2pdf.js');
  const node = buildExportNode(html, o);
  const worker = html2pdf().set(buildPdfConfig(o, filename));

  if (o.colorMode === 'dark') {
    padToWholePages(node, o);
    await worker
      .from(node)
      .toPdf()
      .get('pdf')
      .then((pdf) => paintDarkMargins(pdf, o))
      .save();
    return;
  }

  await worker.from(node).save();
}
