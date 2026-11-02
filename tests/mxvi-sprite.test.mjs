import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sprite = readFileSync(new URL('../public/assets/svg/sprite.svg', import.meta.url), 'utf8');

test('el sprite expone la letra M de MXVI con su geometría y color', () => {
  assert.match(sprite, /<symbol id="mxvi-m" viewBox="0 0 717 716">/);
  assert.match(sprite, /<path fill="#6C387A" d="M0,2 L0,716/);
});

test('el sprite expone la letra X de MXVI con su geometría y color', () => {
  assert.match(sprite, /<symbol id="mxvi-x" viewBox="0 0 805 716">/);
  assert.match(sprite, /<path fill="#6C387A" d="M0,0 L290.9,356.5/);
});

test('el sprite expone la letra V de MXVI con su geometría y color', () => {
  assert.match(sprite, /<symbol id="mxvi-v" viewBox="0 0 795 716">/);
  assert.match(sprite, /<path fill="#F7941D" d="M0,0 L591.3,713/);
});

test('el sprite expone la letra I de MXVI con sus colores y geometría', () => {
  assert.match(sprite, /<symbol id="mxvi-i" viewBox="0 0 190 716">/);
  assert.match(sprite, /<path fill="#6C387A" d="M166.7,0 L0,0 L0,166.7 Z"\/>/);
  assert.match(sprite, /<path fill="#F7941D" d="M190,0.3 L0,189.3 L0,713 L190,713 Z"\/>/);
});
