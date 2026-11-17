const KEY = 'md2pdf-web:settings:v1';

/** Reads saved settings. Never throws (private mode or blocked storage). */
export function loadSettings(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Saves settings. Silently ignores storage failures. */
export function saveSettings(settings, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable, settings just will not persist */
  }
}
