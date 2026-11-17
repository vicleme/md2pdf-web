import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, stripFrontMatter } from '../src/modules/markdown.js';

test('converts headings, emphasis and lists', () => {
  const html = parseMarkdown('# Title\n\nHello **world**\n\n- a\n- b');
  assert.match(html, /<h1[^>]*>Title<\/h1>/);
  assert.match(html, /<strong>world<\/strong>/);
  assert.match(html, /<ul>[\s\S]*<li>a<\/li>[\s\S]*<li>b<\/li>/);
});

test('supports GFM tables and task lists', () => {
  const table = parseMarkdown('| a | b |\n| - | - |\n| 1 | 2 |');
  assert.match(table, /<table>/);
  const tasks = parseMarkdown('- [x] done\n- [ ] todo');
  assert.match(tasks, /type="checkbox"/);
});

test('returns an empty string for empty input', () => {
  assert.equal(parseMarkdown(''), '');
  assert.equal(parseMarkdown('   \n  '), '');
  assert.equal(parseMarkdown(undefined), '');
});

test('strips YAML front matter', () => {
  const md = '---\ntitle: Test\ntags: [a]\n---\n# Body';
  assert.equal(stripFrontMatter(md), '# Body');
  assert.match(parseMarkdown(md), /<h1[^>]*>Body<\/h1>/);
});

test('keeps text that only looks like front matter', () => {
  const md = 'Intro\n---\nnot front matter\n---';
  assert.equal(stripFrontMatter(md), md);
});

test('removes a UTF-8 BOM', () => {
  assert.equal(stripFrontMatter('﻿# Hi'), '# Hi');
});
