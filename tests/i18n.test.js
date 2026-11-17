import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLocale, messages, t } from '../src/modules/i18n.js';
import { countWords, debounce } from '../src/modules/utils.js';
import { loadSettings, saveSettings } from '../src/modules/storage.js';

test('every locale has exactly the same keys', () => {
  const en = Object.keys(messages.en).sort();
  const pt = Object.keys(messages['pt-BR']).sort();
  assert.deepEqual(pt, en);
});

test('no message is empty and none uses an em dash', () => {
  for (const [locale, dict] of Object.entries(messages)) {
    for (const [key, value] of Object.entries(dict)) {
      assert.ok(value.trim().length > 0, `${locale}.${key} is empty`);
      assert.ok(!value.includes('—'), `${locale}.${key} contains an em dash`);
    }
  }
});

test('placeholders match across locales', () => {
  const vars = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
  for (const key of Object.keys(messages.en)) {
    assert.equal(vars(messages['pt-BR'][key]), vars(messages.en[key]), key);
  }
});

test('detectLocale picks pt-BR for Portuguese and en otherwise', () => {
  assert.equal(detectLocale({ languages: ['pt-BR', 'en'] }), 'pt-BR');
  assert.equal(detectLocale({ language: 'pt-PT' }), 'pt-BR');
  assert.equal(detectLocale({ languages: ['en-US'] }), 'en');
  assert.equal(detectLocale({ language: 'ja' }), 'en');
  assert.equal(detectLocale({}), 'en');
});

test('t interpolates variables and falls back safely', () => {
  assert.equal(t('en', 'fileLoaded', { name: 'a.md' }), 'Loaded a.md');
  assert.equal(t('pt-BR', 'fileLoaded', { name: 'a.md' }), 'a.md carregado');
  assert.equal(t('xx', 'done'), messages.en.done);
  assert.equal(t('en', 'does.not.exist'), 'does.not.exist');
});

test('countWords ignores extra whitespace', () => {
  assert.equal(countWords('  hello   big\nworld '), 3);
  assert.equal(countWords(''), 0);
  assert.equal(countWords(null), 0);
});

test('debounce only fires the last call', async () => {
  let calls = 0;
  const fn = debounce(() => (calls += 1), 20);
  fn();
  fn();
  fn();
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(calls, 1);
});

test('storage helpers never throw', () => {
  const broken = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  };
  assert.deepEqual(loadSettings(broken), {});
  assert.doesNotThrow(() => saveSettings({ a: 1 }, broken));

  const memory = new Map();
  const fake = { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) };
  saveSettings({ locale: 'en' }, fake);
  assert.deepEqual(loadSettings(fake), { locale: 'en' });
});
