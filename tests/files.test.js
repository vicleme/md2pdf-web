import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTitle,
  isMarkdownFile,
  pdfNameFrom,
  slugify,
  suggestPdfName,
} from '../src/modules/files.js';

test('isMarkdownFile accepts md and text files', () => {
  assert.equal(isMarkdownFile({ name: 'README.md', type: '' }), true);
  assert.equal(isMarkdownFile({ name: 'notes.MARKDOWN', type: '' }), true);
  assert.equal(isMarkdownFile({ name: 'a.txt', type: 'text/plain' }), true);
  assert.equal(isMarkdownFile({ name: 'x', type: 'text/markdown' }), true);
});

test('isMarkdownFile rejects other files', () => {
  assert.equal(isMarkdownFile({ name: 'photo.png', type: 'image/png' }), false);
  assert.equal(isMarkdownFile({ name: 'doc.pdf', type: 'application/pdf' }), false);
  assert.equal(isMarkdownFile(undefined), false);
});

test('slugify removes accents and symbols', () => {
  assert.equal(slugify('Relatório Final: 2026!'), 'relatorio-final-2026');
  assert.equal(slugify('  --  '), '');
});

test('pdfNameFrom swaps the extension', () => {
  assert.equal(pdfNameFrom('notes.md'), 'notes.pdf');
  assert.equal(pdfNameFrom('Meu Texto Bonito.markdown'), 'meu-texto-bonito.pdf');
  assert.equal(pdfNameFrom(''), 'document.pdf');
});

test('extractTitle finds the first h1', () => {
  assert.equal(extractTitle('intro\n\n# Hello World\n\n## Sub'), 'Hello World');
  assert.equal(extractTitle('# Closed ##'), 'Closed');
  assert.equal(extractTitle('## only h2'), '');
});

test('suggestPdfName prefers the file name, then the title', () => {
  assert.equal(suggestPdfName({ fileName: 'a.md', markdown: '# Other' }), 'a.pdf');
  assert.equal(suggestPdfName({ markdown: '# Meu Título' }), 'meu-titulo.pdf');
  assert.equal(suggestPdfName({ markdown: 'no heading' }), 'document.pdf');
  assert.equal(suggestPdfName(), 'document.pdf');
});
