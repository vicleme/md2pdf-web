/** Delays `fn` until `wait` ms have passed without a new call. */
export function debounce(fn, wait = 150) {
  let timer;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}

/** Counts words in a string, ignoring extra whitespace. */
export function countWords(text) {
  const trimmed = String(text ?? '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
