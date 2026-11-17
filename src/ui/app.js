import { parseMarkdown } from '../modules/markdown.js';
import { sanitizeHtml } from '../modules/sanitize.js';
import { buildPageCss, buildPrintColorCss, normalizeOptions } from '../modules/options.js';
import { isMarkdownFile, readTextFile, suggestPdfName } from '../modules/files.js';
import { exportPdf } from '../modules/pdf.js';
import { LOCALES, detectLocale, isSupportedLocale, t } from '../modules/i18n.js';
import { loadSettings, saveSettings } from '../modules/storage.js';
import { applyAppearance, normalizeAppearance } from '../modules/theme.js';
import { countWords, debounce } from '../modules/utils.js';
import sampleEn from '../samples/sample.en.md?raw';
import samplePt from '../samples/sample.pt-BR.md?raw';

const SAMPLES = { en: sampleEn, 'pt-BR': samplePt };

const $ = (selector) => document.querySelector(selector);

export function initApp() {
  const els = {
    locale: $('#locale'),
    appearance: $('#appearance'),
    darkHint: $('#dark-hint'),
    printColors: $('#print-colors'),
    optColors: $('#opt-colors'),
    editor: $('#editor'),
    preview: $('#preview'),
    dropzone: $('#dropzone'),
    fileInput: $('#file-input'),
    btnOpen: $('#btn-open'),
    btnSample: $('#btn-sample'),
    btnClear: $('#btn-clear'),
    btnDownload: $('#btn-download'),
    btnPrint: $('#btn-print'),
    status: $('#status'),
    stats: $('#stats'),
    printStyle: $('#print-page'),
    optPageSize: $('#opt-page-size'),
    optOrientation: $('#opt-orientation'),
    optMargin: $('#opt-margin'),
    optFontSize: $('#opt-font-size'),
    optTheme: $('#opt-theme'),
  };

  const saved = loadSettings();
  const state = {
    locale: isSupportedLocale(saved.locale) ? saved.locale : detectLocale(),
    appearance: normalizeAppearance(saved.appearance),
    options: normalizeOptions(saved.options),
    fileName: '',
  };

  const persist = () => saveSettings({ locale: state.locale, appearance: state.appearance, options: state.options });

  // ---------- i18n ----------
  els.locale.innerHTML = LOCALES.map((l) => `<option value="${l.code}">${l.label}</option>`).join('');

  function applyTranslations() {
    document.documentElement.lang = state.locale;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(state.locale, el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(state.locale, el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(state.locale, el.dataset.i18nTitle);
    });
    els.locale.value = state.locale;
    document.title = `${t(state.locale, 'appTitle')} | ${t(state.locale, 'editorLabel')} → PDF`;
    updateStats();
  }

  // ---------- status ----------
  let statusTimer;
  function setStatus(key, kind = '', vars = {}) {
    clearTimeout(statusTimer);
    els.status.textContent = key ? t(state.locale, key, vars) : '';
    els.status.dataset.kind = kind;
    if (key && kind !== 'busy') {
      statusTimer = setTimeout(() => setStatus(''), 4000);
    }
  }

  function updateStats() {
    const text = els.editor.value;
    els.stats.textContent = text.trim()
      ? t(state.locale, 'stats', { words: countWords(text), chars: text.length })
      : '';
  }

  // ---------- rendering ----------
  function currentHtml() {
    return sanitizeHtml(parseMarkdown(els.editor.value));
  }

  function renderPreview() {
    els.preview.className = `document theme-${state.options.theme} mode-${state.options.colorMode}`;
    els.preview.style.fontSize = `${state.options.fontSizePt}pt`;
    els.preview.innerHTML = currentHtml();
    els.printStyle.textContent = buildPageCss(state.options);
    els.printColors.textContent = buildPrintColorCss(state.options);
    els.darkHint.hidden = state.options.colorMode !== 'dark';
    updateStats();
  }
  const renderPreviewSoon = debounce(renderPreview, 120);

  // ---------- options ----------
  function syncOptionInputs() {
    const o = state.options;
    els.optPageSize.value = o.pageSize;
    els.optOrientation.value = o.orientation;
    els.optMargin.value = o.marginMm;
    els.optFontSize.value = o.fontSizePt;
    els.optTheme.value = o.theme;
    els.optColors.value = o.colorMode;
  }

  function readOptionInputs() {
    state.options = normalizeOptions({
      pageSize: els.optPageSize.value,
      orientation: els.optOrientation.value,
      marginMm: els.optMargin.value,
      fontSizePt: els.optFontSize.value,
      theme: els.optTheme.value,
      colorMode: els.optColors.value,
    });
    persist();
    renderPreview();
  }

  [els.optPageSize, els.optOrientation, els.optTheme, els.optColors].forEach((el) =>
    el.addEventListener('change', readOptionInputs),
  );
  [els.optMargin, els.optFontSize].forEach((el) => {
    el.addEventListener('input', debounce(readOptionInputs, 300));
    el.addEventListener('change', () => {
      readOptionInputs();
      syncOptionInputs();
    });
  });

  // ---------- files ----------
  async function loadFile(file) {
    if (!file || !isMarkdownFile(file)) {
      setStatus('invalidFile', 'error');
      return;
    }
    els.editor.value = await readTextFile(file);
    state.fileName = file.name;
    renderPreview();
    setStatus('fileLoaded', 'success', { name: file.name });
  }

  els.btnOpen.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', async () => {
    await loadFile(els.fileInput.files[0]);
    els.fileInput.value = '';
  });

  els.btnSample.addEventListener('click', () => {
    els.editor.value = SAMPLES[state.locale] ?? SAMPLES.en;
    state.fileName = '';
    renderPreview();
  });

  els.btnClear.addEventListener('click', () => {
    els.editor.value = '';
    state.fileName = '';
    renderPreview();
    els.editor.focus();
  });

  // The opened file name is kept while editing, so the PDF keeps the same name.
  els.editor.addEventListener('input', renderPreviewSoon);

  // Drag and drop
  let dragDepth = 0;
  els.dropzone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragDepth += 1;
    els.dropzone.classList.add('is-dragging');
  });
  els.dropzone.addEventListener('dragover', (e) => e.preventDefault());
  els.dropzone.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) els.dropzone.classList.remove('is-dragging');
  });
  els.dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragDepth = 0;
    els.dropzone.classList.remove('is-dragging');
    await loadFile(e.dataTransfer?.files?.[0]);
  });

  // ---------- export ----------
  function setBusy(busy) {
    els.btnDownload.disabled = busy;
    els.btnPrint.disabled = busy;
  }

  els.btnDownload.addEventListener('click', async () => {
    if (!els.editor.value.trim()) {
      setStatus('emptyContent', 'error');
      return;
    }
    setBusy(true);
    setStatus('generating', 'busy');
    try {
      const filename = suggestPdfName({ fileName: state.fileName, markdown: els.editor.value });
      await exportPdf(currentHtml(), state.options, filename);
      setStatus('done', 'success');
    } catch (error) {
      console.error(error);
      setStatus('error', 'error');
    } finally {
      setBusy(false);
    }
  });

  els.btnPrint.addEventListener('click', () => {
    if (!els.editor.value.trim()) {
      setStatus('emptyContent', 'error');
      return;
    }
    renderPreview();
    window.print();
  });

  // ---------- language ----------
  els.locale.addEventListener('change', () => {
    state.locale = isSupportedLocale(els.locale.value) ? els.locale.value : state.locale;
    persist();
    applyTranslations();
  });

  // ---------- appearance ----------
  els.appearance.addEventListener('change', () => {
    state.appearance = applyAppearance(els.appearance.value);
    persist();
  });

  // ---------- boot ----------
  els.appearance.value = applyAppearance(state.appearance);
  els.editor.value = SAMPLES[state.locale] ?? SAMPLES.en;
  syncOptionInputs();
  applyTranslations();
  renderPreview();
}
