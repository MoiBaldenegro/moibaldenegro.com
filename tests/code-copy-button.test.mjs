// Tests del botón Copiar en bloques de código (feature 2026-09-19).
//
// Lo pedido: en los posts con código (```text de 02-principios, ```c# de
// 03-principios_solid) no hay forma de copiar el bloque. Astro/Shiki no
// trae botón de copiar, así que se añade uno propio sin dependencias:
//   REQ-CC-01 — el componente registra initCodeCopy como listener de
//               astro:page-load (patrón search-results.astro, fix feature 10:
//               los scripts empaquetados corren una vez por sesión) sin
//               invocación directa.
//   REQ-CC-02 — initCodeCopy añade un botón por cada pre.astro-code con
//               aria-label "Copiar código"; al pulsarlo escribe el texto del
//               bloque en el portapapeles y confirma con "¡Copiado!".
//   REQ-CC-03 — segunda llamada no duplica botones (idempotencia ante
//               re-navegaciones del ClientRouter).
//   REQ-CC-04 — la página de detalle renderiza el componente sin <script>
//               propio (convención: frontmatter solo imports y paso de datos)
//               y no supera 100 líneas.
//   REQ-CC-05 — la hoja usa solo tokens, sin hex ni rgb(), y los tres
//               archivos nuevos no superan 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { initCodeCopy } from '../src/components/code-copy/code-copy.ts';

const COMPONENT_URL = new URL('../src/components/code-copy/code-copy.astro', import.meta.url);
const MODULE_URL = new URL('../src/components/code-copy/code-copy.ts', import.meta.url);
const CSS_URL = new URL('../src/styles/code-copy.css', import.meta.url);
const PAGE_URL = new URL('../src/pages/posts/[id].astro', import.meta.url);

function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

// --- Fakes mínimos de DOM ------------------------------------------------
// initCodeCopy solo usa querySelectorAll/appendChild/dataset (marcado de
// idempotencia), createElement/setAttribute/addEventListener en el botón y
// navigator.clipboard.writeText (con fallback a execCommand).
function installDom(pres, clipboard) {
  const created = [];
  globalThis.document = {
    querySelectorAll: (sel) => (sel === 'pre.astro-code' ? pres : []),
    createElement: (tag) => {
      assert.equal(tag, 'button', 'solo debe crear botones (REQ-CC-02)');
      const btn = {
        type: '',
        className: '',
        attrs: {},
        html: '',
        handlers: {},
        classes: new Set(),
        classList: {
          add(c) { btn.classes.add(c); },
          remove(c) { btn.classes.delete(c); },
        },
        setAttribute(n, v) { this.attrs[n] = v; },
        getAttribute(n) { return this.attrs[n]; },
        set innerHTML(v) { this.html = v; },
        addEventListener(e, h) { this.handlers[e] = h; },
      };
      created.push(btn);
      return btn;
    },
  };
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard }, configurable: true });
  return {
    created,
    cleanup() { delete globalThis.document; delete globalThis.navigator; },
  };
}

function fakeClipboard() {
  return { written: [], async writeText(text) { this.written.push(text); } };
}

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
  const dom = installDom(
    [{ dataset: {}, appended: [], querySelector: () => ({ textContent: 'int x = 1;' }), appendChild(n) { this.appended.push(n); return n; } }],
    clipboard,
  );
  try {
    initCodeCopy();
    assert.equal(dom.created.length, 1, 'no crea un botón por bloque (REQ-CC-02)');
    assert.equal(dom.created[0].attrs['aria-label'], 'Copiar código', 'sin aria-label (REQ-CC-02)');
    await dom.created[0].handlers.click();
    assert.deepEqual(clipboard.written, ['int x = 1;'], 'no copia el texto del bloque (REQ-CC-02)');
    assert.equal(dom.created[0].attrs['aria-label'], '¡Copiado!', 'sin confirmación (REQ-CC-02)');
  } finally { dom.cleanup(); }
});

test('REQ-CC-03: segunda llamada no duplica botones', () => {
  const clipboard = fakeClipboard();
  const dom = installDom(
    [{ dataset: {}, appended: [], querySelector: () => ({ textContent: 'x' }), appendChild(n) { this.appended.push(n); return n; } }],
    clipboard,
  );
  try {
    initCodeCopy();
    initCodeCopy();
    assert.equal(dom.created.length, 1, 'duplica botones en re-navegación (REQ-CC-03)');
  } finally { dom.cleanup(); }
});

test('REQ-CC-04: el detalle renderiza el componente sin script propio', () => {
  const page = readFileSync(PAGE_URL, 'utf8');
  assert.match(page, /CodeCopy/, 'la página no renderiza CodeCopy (REQ-CC-04)');
  assert.match(page, /code-copy\/code-copy\.astro/, 'la página no importa el componente (REQ-CC-04)');
  assert.doesNotMatch(page, /<script/i, 'la página añade JS propio (REQ-CC-04)');
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
