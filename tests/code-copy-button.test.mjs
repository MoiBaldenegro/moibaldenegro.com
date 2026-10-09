// Tests del botón Copiar en bloques de código (feature 2026-09-19), sin dependencias:
// REQ-CC-01 arranque en astro:page-load sin llamada directa; REQ-CC-02 un botón por
// pre.astro-code que copia y confirma; REQ-CC-03 idempotencia (ClientRouter); REQ-CC-04
// detalle sin <script> propio; REQ-CC-05 hoja solo con tokens y archivos ≤100 líneas.
// Ajuste feature 62 (precedente REQ-43-06): el pre se envuelve en div.code-block y el
// botón cuelga del envoltorio (fake: wraps). Compactado para REQ-62-08, mismas aserciones.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { initCodeCopy } from '../src/components/code-copy/code-copy.ts';

const COMPONENT_URL = new URL('../src/components/code-copy/code-copy.astro', import.meta.url);
const MODULE_URL = new URL('../src/components/code-copy/code-copy.ts', import.meta.url);
const CSS_URL = new URL('../src/styles/code-copy.css', import.meta.url);
const PAGE_URL = new URL('../src/pages/posts/[id].astro', import.meta.url);

const countLines = (c) => c.split('\n').length - (c.endsWith('\n') ? 1 : 0);

// Fakes mínimos de DOM: botones (setAttribute, classList, innerHTML, listeners),
// envoltorios div (appendChild) y navigator.clipboard.writeText.
function installDom(pres, clipboard) {
  const created = [];
  const wraps = [];
  globalThis.document = {
    querySelectorAll: (sel) => (sel === 'pre.astro-code' ? pres : []),
    querySelector: () => null, // región data-code-copy-status (feature 54) ausente
    createElement: (tag) => {
      if (tag === 'div') { const w = { className: '', appended: [], appendChild(n) { w.appended.push(n); return n; } }; wraps.push(w); return w; }
      assert.equal(tag, 'button', 'solo debe crear botones y envoltorios (REQ-CC-02)');
      const btn = { type: '', className: '', attrs: {}, html: '', handlers: {}, classes: new Set(),
        classList: { add(c) { btn.classes.add(c); }, remove(c) { btn.classes.delete(c); } },
        setAttribute(n, v) { this.attrs[n] = v; }, getAttribute(n) { return this.attrs[n]; },
        set innerHTML(v) { this.html = v; }, addEventListener(e, h) { this.handlers[e] = h; } };
      created.push(btn);
      return btn;
    },
  };
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard }, configurable: true });
  return { created, wraps, cleanup() { delete globalThis.document; delete globalThis.navigator; } };
}

const fakeClipboard = () => ({ written: [], async writeText(text) { this.written.push(text); } });
const fakePre = (text) => ({ dataset: {}, querySelector: () => ({ textContent: text }), appendChild: (n) => n });

test('REQ-CC-01: el componente arranca con astro:page-load sin llamada directa', () => {
  assert.ok(existsSync(COMPONENT_URL), 'code-copy.astro no existe (REQ-CC-01)');
  const astro = readFileSync(COMPONENT_URL, 'utf8');
  assert.match(astro, /astro:page-load/, 'no registra astro:page-load (REQ-CC-01)');
  assert.match(astro, /initCodeCopy/, 'no usa initCodeCopy (REQ-CC-01)');
  assert.equal(astro.match(/initCodeCopy/g)?.length, 2, 'initCodeCopy debe aparecer solo en import y listener (REQ-CC-01)');
  assert.match(astro, /code-copy\.css/, 'no importa su hoja (REQ-CC-01)');
});

test('REQ-CC-02: añade botón con aria-label y copia el bloque al pulsar', async () => {
  assert.ok(existsSync(MODULE_URL), 'code-copy.ts no existe (REQ-CC-02)');
  const clipboard = fakeClipboard();
  const dom = installDom([fakePre('int x = 1;')], clipboard);
  try {
    initCodeCopy();
    assert.equal(dom.created.length, 1, 'no crea un botón por bloque (REQ-CC-02)');
    assert.ok(dom.wraps[0]?.appended.includes(dom.created[0]), 'el botón no cuelga del envoltorio (REQ-CC-02 + feature 62)');
    assert.equal(dom.created[0].attrs['aria-label'], 'Copiar código', 'sin aria-label (REQ-CC-02)');
    await dom.created[0].handlers.click();
    assert.deepEqual(clipboard.written, ['int x = 1;'], 'no copia el texto del bloque (REQ-CC-02)');
    assert.equal(dom.created[0].attrs['aria-label'], '¡Copiado!', 'sin confirmación (REQ-CC-02)');
  } finally { dom.cleanup(); }
});

test('REQ-CC-03: segunda llamada no duplica botones', () => {
  const dom = installDom([fakePre('x')], fakeClipboard());
  try {
    initCodeCopy();
    initCodeCopy();
    assert.equal(dom.created.length, 1, 'duplica botones en re-navegación (REQ-CC-03)');
    assert.equal(dom.wraps.length, 1, 'duplica envoltorios en re-navegación (REQ-CC-03 + feature 62)');
  } finally { dom.cleanup(); }
});

test('REQ-CC-04: el detalle renderiza el componente sin script propio', () => {
  const page = readFileSync(PAGE_URL, 'utf8');
  assert.match(page, /CodeCopy/, 'la página no renderiza CodeCopy (REQ-CC-04)');
  assert.match(page, /code-copy\/code-copy\.astro/, 'la página no importa el componente (REQ-CC-04)');
  // Ajuste feature 44 (precedente REQ-43-06): el JSON-LD son datos, no JS de runtime.
  assert.doesNotMatch(page, /<script(?![^>]*type="application\/ld\+json")/i, 'la página añade JS propio (REQ-CC-04)');
  assert.ok(countLines(page) <= 100, 'la página supera 100 líneas (REQ-CC-04)');
});

test('REQ-CC-05: hoja con tokens y archivos en límite', () => {
  const css = readFileSync(CSS_URL, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.code-copy/, 'sin clase .code-copy (REQ-CC-05)');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'hex hardcodeado (REQ-CC-05)');
  assert.doesNotMatch(css, /rgba?\(/, 'rgb()/rgba() hardcodeado (REQ-CC-05)');
  for (const [url, label] of [[MODULE_URL, 'code-copy.ts'], [COMPONENT_URL, 'code-copy.astro'], [CSS_URL, 'code-copy.css']]) {
    const lines = countLines(readFileSync(url, 'utf8'));
    assert.ok(lines <= 100, `${label} tiene ${lines} líneas (REQ-CC-05)`);
  }
});
