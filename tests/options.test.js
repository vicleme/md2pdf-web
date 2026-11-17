import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_OPTIONS,
  buildPageCss,
  buildPdfConfig,
  buildPrintColorCss,
  contentHeightMm,
  padHeightToPages,
  contentWidthMm,
  normalizeOptions,
} from '../src/modules/options.js';

test('normalizeOptions fills defaults for missing or invalid input', () => {
  assert.deepEqual(normalizeOptions(), { ...DEFAULT_OPTIONS });
  assert.deepEqual(normalizeOptions(null), { ...DEFAULT_OPTIONS });
  assert.deepEqual(
    normalizeOptions({ pageSize: 'a0', orientation: 'diagonal', theme: 'neon', colorMode: 'sepia', marginMm: 'x', fontSizePt: NaN }),
    { ...DEFAULT_OPTIONS },
  );
});

test('normalizeOptions clamps numeric values', () => {
  const o = normalizeOptions({ marginMm: 999, fontSizePt: 1 });
  assert.equal(o.marginMm, 40);
  assert.equal(o.fontSizePt, 8);
  assert.equal(normalizeOptions({ marginMm: 0 }).marginMm, 5);
});

test('normalizeOptions keeps valid values', () => {
  const o = normalizeOptions({ pageSize: 'letter', orientation: 'landscape', marginMm: 20, fontSizePt: 12, theme: 'academic', colorMode: 'dark' });
  assert.deepEqual(o, { pageSize: 'letter', orientation: 'landscape', marginMm: 20, fontSizePt: 12, theme: 'academic', colorMode: 'dark' });
});

test('contentWidthMm subtracts margins and respects orientation', () => {
  assert.equal(contentWidthMm({ pageSize: 'a4', marginMm: 15 }), 180);
  assert.equal(contentWidthMm({ pageSize: 'a4', orientation: 'landscape', marginMm: 15 }), 267);
  assert.equal(contentWidthMm({ pageSize: 'letter', marginMm: 20 }), 175.9);
});

test('buildPdfConfig maps options to html2pdf settings', () => {
  const cfg = buildPdfConfig({ pageSize: 'legal', orientation: 'landscape', marginMm: 10 }, 'x.pdf');
  assert.equal(cfg.filename, 'x.pdf');
  assert.equal(cfg.margin, 10);
  assert.deepEqual(cfg.jsPDF, { unit: 'mm', format: 'legal', orientation: 'landscape' });
  assert.ok(cfg.pagebreak.avoid.includes('pre'));
});

test('buildPageCss produces an @page rule', () => {
  assert.equal(buildPageCss({ pageSize: 'a4', orientation: 'portrait', marginMm: 15 }), '@page { size: A4 portrait; margin: 15mm; }');
  assert.equal(buildPageCss({ pageSize: 'letter', orientation: 'landscape', marginMm: 10 }), '@page { size: letter landscape; margin: 10mm; }');
});

test('contentHeightMm subtracts margins and respects orientation', () => {
  assert.equal(contentHeightMm({ pageSize: 'a4', marginMm: 15 }), 267);
  assert.equal(contentHeightMm({ pageSize: 'a4', orientation: 'landscape', marginMm: 15 }), 180);
});

test('padHeightToPages rounds up to whole pages, never an exact multiple', () => {
  const pagePx = (267 * 96) / 25.4;
  const one = padHeightToPages(100, { pageSize: 'a4', marginMm: 15 });
  assert.ok(one < pagePx && one > pagePx - 2);
  const two = padHeightToPages(pagePx + 10, { pageSize: 'a4', marginMm: 15 });
  assert.ok(two < 2 * pagePx && two > 2 * pagePx - 2);
  assert.equal(padHeightToPages(0, { pageSize: 'a4', marginMm: 15 }), one);
});

test('buildPrintColorCss paints the page with the document color', () => {
  assert.match(buildPrintColorCss({ colorMode: 'dark' }), /#0d1117/);
  assert.match(buildPrintColorCss({ colorMode: 'light' }), /#ffffff/);
  assert.match(buildPrintColorCss({}), /print-color-adjust: exact/);
  assert.match(buildPrintColorCss({ colorMode: 'dark' }), /@page \{ background: #0d1117; \}/);
});
