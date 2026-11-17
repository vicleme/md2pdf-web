import { Marked } from 'marked';

const parser = new Marked({ gfm: true, breaks: false });

/**
 * Removes a leading YAML front matter block (--- ... ---) if present.
 * @param {string} source
 * @returns {string}
 */
export function stripFrontMatter(source) {
  const text = String(source ?? '').replace(/^﻿/, '');
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/);
  return match ? text.slice(match[0].length) : text;
}

/**
 * Converts Markdown to an HTML string (NOT sanitized, see sanitize.js).
 * @param {string} source
 * @returns {string}
 */
export function parseMarkdown(source) {
  const body = stripFrontMatter(source);
  if (!body.trim()) return '';
  return parser.parse(body, { async: false });
}
