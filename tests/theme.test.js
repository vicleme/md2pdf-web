import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAppearance, normalizeAppearance } from '../src/modules/theme.js';

function fakeRoot() {
  const attrs = new Map();
  return {
    setAttribute: (k, v) => attrs.set(k, v),
    removeAttribute: (k) => attrs.delete(k),
    getAttribute: (k) => attrs.get(k) ?? null,
  };
}

test('normalizeAppearance falls back to system', () => {
  assert.equal(normalizeAppearance('dark'), 'dark');
  assert.equal(normalizeAppearance('light'), 'light');
  assert.equal(normalizeAppearance('neon'), 'system');
  assert.equal(normalizeAppearance(undefined), 'system');
});

test('applyAppearance sets or clears data-theme', () => {
  const root = fakeRoot();
  assert.equal(applyAppearance('dark', root), 'dark');
  assert.equal(root.getAttribute('data-theme'), 'dark');
  assert.equal(applyAppearance('light', root), 'light');
  assert.equal(root.getAttribute('data-theme'), 'light');
  assert.equal(applyAppearance('system', root), 'system');
  assert.equal(root.getAttribute('data-theme'), null);
});
