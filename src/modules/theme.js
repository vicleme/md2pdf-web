export const APPEARANCES = ['system', 'light', 'dark'];
export const DEFAULT_APPEARANCE = 'system';

/** Returns a valid appearance preference, falling back to "system". */
export function normalizeAppearance(value) {
  return APPEARANCES.includes(value) ? value : DEFAULT_APPEARANCE;
}

/**
 * Applies the interface appearance to the page.
 * "system" removes the attribute so the CSS follows prefers-color-scheme.
 * @param {string} value
 * @param {HTMLElement} [root]
 */
export function applyAppearance(value, root = globalThis.document?.documentElement) {
  const appearance = normalizeAppearance(value);
  if (!root) return appearance;
  if (appearance === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', appearance);
  return appearance;
}
