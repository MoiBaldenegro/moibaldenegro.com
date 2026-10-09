// Test de la confirmación del botón Copiar (feature 54 code-copy-status,
// REQ-54-01..07): región role="status" compartida, mensajes de éxito y de
// error, texto visible «Copiado» 2000 ms y estilos con tokens.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initCodeCopy } from '../src/components/code-copy/code-copy.ts';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

function setup(clipboard) {
  const status = { textContent: '' };
  const buttons = [];
  globalThis.document = {
    querySelectorAll: (sel) => (sel === 'pre.astro-code' ? [pre] : []),
    querySelector: (sel) => (sel === '[data-code-copy-status]' ? status : null),
    // Ajuste feature 62 (precedente REQ-43-06): initCodeCopy crea también el envoltorio div.code-block.
    createElement: (tag) => {
      if (tag === 'div') return { appendChild: (n) => n };
      const btn = { attrs: {}, classes: new Set(), html: '', handlers: {},
        classList: { add: (c) => btn.classes.add(c), remove: (c) => btn.classes.delete(c) },
        setAttribute(n, v) { this.attrs[n] = v; }, set innerHTML(v) { this.html = v; }, get innerHTML() { return this.html; },
        addEventListener(e, h) { this.handlers[e] = h; } };
      buttons.push(btn);
      return btn;
    },
  };
  const pre = { dataset: {}, querySelector: () => ({ textContent: 'x = 1' }), appendChild: (n) => n };
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard }, configurable: true });
  initCodeCopy();
  return { status, button: buttons[0] };
}
const cleanup = () => { delete globalThis.document; delete globalThis.navigator; };

test('REQ-54-01: una única región de estado accesible en el componente', () => {
  const astro = read('src/components/code-copy/code-copy.astro');
  const regions = astro.match(/<p[^>]*class="visually-hidden"[^>]*role="status"[^>]*aria-live="polite"[^>]*data-code-copy-status[^>]*><\/p>/g) ?? [];
  assert.equal(regions.length, 1);
});

test('REQ-54-02: tras copiar, la región anuncia «Código copiado»', async () => {
  const { status, button } = setup({ async writeText() {} });
  try {
    await button.handlers.click();
    assert.equal(status.textContent, 'Código copiado');
  } finally { cleanup(); }
});

test('REQ-54-03: si el portapapeles falla, la región lo anuncia', async () => {
  const { status, button } = setup({ async writeText() { throw new Error('denegado'); } });
  globalThis.document.createElement = () => { throw new Error('sin fallback'); };
  try {
    await button.handlers.click();
    assert.equal(status.textContent, 'No se pudo copiar el código');
    assert.ok(!button.classes.has('is-copied'));
  } finally { cleanup(); }
});

test('REQ-54-04: «Copiado» visible con is-copied durante 2000 ms', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const { button } = setup({ async writeText() {} });
  try {
    await button.handlers.click();
    assert.ok(button.classes.has('is-copied'));
    assert.match(button.innerHTML, /<span class="code-copy__done">Copiado<\/span>/);
    mock.timers.tick(1999);
    assert.ok(button.classes.has('is-copied'), 'se retiró antes de 2000 ms');
    mock.timers.tick(1);
    assert.ok(!button.classes.has('is-copied'));
    assert.doesNotMatch(button.innerHTML, /Copiado/);
  } finally { mock.timers.reset(); cleanup(); }
});

test('REQ-54-05: estilos del texto visible en code-copy.css con tokens', () => {
  const css = read('src/styles/code-copy.css');
  const at = css.indexOf('.code-copy__done {');
  assert.ok(at >= 0, 'falta .code-copy__done');
  const body = css.slice(at, css.indexOf('}', at));
  assert.match(body, /var\(--color-accent\)/);
  assert.match(body, /var\(--font-sans\)/);
  assert.doesNotMatch(body, /#[0-9a-f]{3,8}\b|rgba?\(/i);
});

test('REQ-54-04 (ronda 2): el botón copiado crece con el texto en lugar de desbordarse', () => {
  // El botón base mide 30×30 px; con «Copiado» debe ensancharse (crece hacia la
  // izquierda porque está anclado con right) y no partir el texto.
  const css = read('src/styles/code-copy.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const at = css.indexOf('.code-copy.is-copied {');
  assert.ok(at >= 0, 'falta .code-copy.is-copied');
  const body = css.slice(at, css.indexOf('}', at));
  assert.match(body, /width:\s*auto/, 'el botón copiado conserva el ancho fijo de 30px');
  assert.match(body, /white-space:\s*nowrap/);
  assert.match(body, /padding:\s*0 var\(--gap-card\)|padding-inline:/, 'sin padding horizontal para el texto');
});

test('REQ-54-07: los archivos tocados no superan 100 líneas', () => {
  for (const rel of ['src/components/code-copy/code-copy.ts', 'src/components/code-copy/code-copy.astro', 'src/styles/code-copy.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
