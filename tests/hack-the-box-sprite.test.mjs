// Verifica que el logo de Hack The Box se puede reutilizar como símbolo del sprite.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SPRITE_URL = new URL('../public/assets/svg/sprite.svg', import.meta.url);

test('el sprite expone el logo htb como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="htb"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="htb" viewBox="0 0 1024 791\.27002">/);
  assert.match(symbol, /<path fill="#9FEF00" d="M697\.93835/);
  assert.doesNotMatch(symbol, /<style|class=|enable-background|xml:/);
  assert.equal((sprite.match(/<symbol id="htb"/g) ?? []).length, 1);
});

test('el sprite expone el logotipo horizontal de htb con sus letras', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="htb-wordmark"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="htb-wordmark" viewBox="0 0 300 58\.8">/);
  assert.match(symbol, /<path fill="#9FEF00" d="M59\.9,18\.5/);
  assert.match(symbol, /<path fill="#FFFFFF" d="M90,38\.5/);
  assert.match(symbol, /<path fill="#FFFFFF" d="M281\.2,38\.9/);
  assert.doesNotMatch(symbol, /<style|class=|enable-background|xml:/);
  assert.equal((sprite.match(/<symbol id="htb-wordmark"/g) ?? []).length, 1);
});

test('el sprite expone el logo de NestJS como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="nestjs"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="nestjs" viewBox="0 0 264\.6 255\.6">/);
  assert.match(symbol, /<path fill="#E0234E"[^>]*d="M153\.3 4\.2/);
  assert.doesNotMatch(symbol, /<style|class=|enable-background|xml:/);
  assert.equal((sprite.match(/<symbol id="nestjs"/g) ?? []).length, 1);
});

test('el sprite expone el logo de AWS como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="aws"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="aws" viewBox="0 0 24 24">/);
  assert.match(symbol, /<path fill="currentColor"[^>]*d="M6\.763 11\.212/);
  assert.match(symbol, /<path fill="#F90" d="M\.378 15\.475/);
  assert.doesNotMatch(symbol, /<title|<style|class=|xml:/);
  assert.equal((sprite.match(/<symbol id="aws"/g) ?? []).length, 1);
});

test('el sprite expone el logo de Cloudflare como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="cloudflare"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="cloudflare" viewBox="0 0 512 76">/);
  assert.match(symbol, /<path fill="currentColor" d="M214\.633 47\.4/);
  assert.match(symbol, /<path fill="#fbad41" d="M132\.234 32\.698/);
  assert.match(symbol, /<path fill="#f6821f" d="m112\.457 74\.235/);
  assert.doesNotMatch(symbol, /<title|<style|class=|xml:/);
  assert.equal((sprite.match(/<symbol id="cloudflare"/g) ?? []).length, 1);
});

test('el sprite expone el logo de Rust como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="rust"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="rust" viewBox="0 0 224 224">/);
  assert.match(symbol, /<path fill="currentColor" d="M218\.46 109\.358/);
  assert.doesNotMatch(symbol, /<title|<style|class=|xml:/);
  assert.equal((sprite.match(/<symbol id="rust"/g) ?? []).length, 1);
});

test('el sprite expone el logo de Claude como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="claude"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="claude" viewBox="0 0 24 24">/);
  assert.match(symbol, /<path fill="#D97757" d="m4\.7144 15\.9555/);
  assert.doesNotMatch(symbol, /<title|<style|class=|role=|xml:/);
  assert.equal((sprite.match(/<symbol id="claude"/g) ?? []).length, 1);
});

test('el sprite expone el logo de Bun como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="bun"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="bun" viewBox="0 0 80 70">/);
  assert.match(symbol, /<path d="M71\.09 20\.74/);
  assert.match(symbol, /<path fill="#fbf0df" d="M73 35\.7/);
  assert.match(symbol, /<path fill="#b71422" d="M45\.05 43/);
  assert.match(symbol, /<ellipse fill="#febbd0"[^>]*cx="53\.22"/);
  assert.doesNotMatch(symbol, /<title|<style|class=|data-name=|xml:/);
  assert.equal((sprite.match(/<symbol id="bun"/g) ?? []).length, 1);
});

test('el sprite expone el logo de Claude Code como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="claude-code"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="claude-code" viewBox="0 0 24 24">/);
  assert.match(symbol, /<path fill="#D97757" fill-rule="evenodd" d="M20\.998 10\.949/);
  assert.doesNotMatch(symbol, /<title|<style|class=|clip-rule=|xml:/);
  assert.equal((sprite.match(/<symbol id="claude-code"/g) ?? []).length, 1);
});
