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

test('el sprite expone la nube de Cloudflare como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="cloudflare-cloud"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="cloudflare-cloud" viewBox="0 0 256 116">/);
  assert.match(symbol, /<path fill="#FFF" d="m202\.357 49\.394/);
  assert.match(symbol, /<path fill="#F4811F" d="M176\.332 108\.348/);
  assert.match(symbol, /<path fill="#FAAD3F" d="M205\.544 48\.863/);
  assert.doesNotMatch(symbol, /<title|<style|class=|width=|height=|xmlns=|preserveAspectRatio|xml:/);
  assert.equal((sprite.match(/<symbol id="cloudflare-cloud"/g) ?? []).length, 1);
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

test('el sprite expone el wordmark de GitHub como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="github-wordmark"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="github-wordmark" viewBox="0 0 249\.1 67\.5">/);
  assert.match(symbol, /<path fill="#fff" d="M103\.4 55\.9/);
  assert.doesNotMatch(symbol, /<title|<style|class=|xml:|space-preserve/);
  assert.equal((sprite.match(/<symbol id="github-wordmark"/g) ?? []).length, 1);
});

test('el sprite expone el wordmark de Anthropic como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="anthropic-wordmark"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="anthropic-wordmark" viewBox="0 0 182 24">/);
  assert.match(symbol, /<path fill="#ffff" fill-rule="evenodd" d="M38\.247 15\.874/);
  assert.doesNotMatch(symbol, /<title|<style|class=|xml:|line-height|flex:/);
  assert.equal((sprite.match(/<symbol id="anthropic-wordmark"/g) ?? []).length, 1);
});

test('el sprite expone el logo de Bash como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="bash"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="bash" viewBox="0 0 32 32">/);
  assert.match(symbol, /<path fill="#fff" fill-rule="evenodd" d="M28\.057 6\.53/);
  assert.doesNotMatch(symbol, /<title|<style|class=|width=|height=|xmlns=|xml:/);
  assert.equal((sprite.match(/<symbol id="bash"/g) ?? []).length, 1);
});

test('el sprite expone el logo de WebAssembly como símbolo SVG limpio', () => {
  const sprite = readFileSync(SPRITE_URL, 'utf8');
  const symbol = sprite.match(/<symbol id="webassembly"[\s\S]*?<\/symbol>/)?.[0] ?? '';

  assert.match(symbol, /<symbol id="webassembly" viewBox="0 0 24 24">/);
  assert.match(symbol, /<path fill="#654FF0" d="M14\.745,0c0,0\.042/);
  assert.doesNotMatch(symbol, /<title|<style|role=|xmlns=|xml:/);
  assert.equal((sprite.match(/<symbol id="webassembly"/g) ?? []).length, 1);
});
