const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.txt'];

/**
 * Accepts common Markdown/plain-text files by extension or MIME type.
 * @param {{ name?: string, type?: string }} file
 */
export function isMarkdownFile(file) {
  const name = String(file?.name ?? '').toLowerCase();
  const type = String(file?.type ?? '').toLowerCase();
  if (MARKDOWN_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
  return type === 'text/markdown' || type === 'text/plain';
}

/** "notes.md" -> "notes.pdf" */
export function pdfNameFrom(fileName) {
  const base = String(fileName ?? '').trim().replace(/\.[^./\\]+$/, '');
  return `${slugify(base) || 'document'}.pdf`;
}

/** Lowercase, accent-free, dash-separated slug that is safe as a file name. */
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Text of the first level-1 heading, or an empty string. */
export function extractTitle(markdown) {
  const match = String(markdown ?? '').match(/^#[ \t]+(.+?)[ \t#]*$/m);
  return match ? match[1].trim() : '';
}

/**
 * Picks the PDF file name: from the opened file, else from the title, else a default.
 * @param {{ fileName?: string, markdown?: string }} input
 */
export function suggestPdfName({ fileName, markdown } = {}) {
  if (fileName) return pdfNameFrom(fileName);
  const title = extractTitle(markdown);
  return title ? `${slugify(title) || 'document'}.pdf` : 'document.pdf';
}

/** @param {File} file */
export async function readTextFile(file) {
  return file.text();
}
