import { buildPdfConfig, contentWidthMm, normalizeOptions } from './options.js';

/**
 * Builds a detached DOM node sized to the printable area of the chosen page.
 * @param {string} html sanitized HTML
 * @param {ReturnType<typeof normalizeOptions>} options
 * @param {Document} [doc]
 */
export function buildExportNode(html, options, doc = document) {
  const o = normalizeOptions(options);
  const node = doc.createElement('div');
  node.className = `document theme-${o.theme}`;
  node.style.width = `${contentWidthMm(o)}mm`;
  node.style.fontSize = `${o.fontSizePt}pt`;
  node.innerHTML = html;
  return node;
}

/**
 * Renders the HTML to a PDF and triggers the download.
 * html2pdf.js is loaded on demand to keep the first page load light.
 */
export async function exportPdf(html, options, filename) {
  const { default: html2pdf } = await import('html2pdf.js');
  const node = buildExportNode(html, options);
  await html2pdf().set(buildPdfConfig(options, filename)).from(node).save();
}
