// Feature 62 (code-copy-fixed-corner): el botón Copiar colgaba del pre (overflow-x: auto)
// y se desplazaba con su scroll horizontal. Ahora initCodeCopy envuelve cada pre en
// div.code-block (position: relative) y el botón es hijo del envoltorio.
// Spec: specs/62_code-copy-fixed-corner/requirements.md. Verificación en navegador
// (REQ-62-05) en progress/impl_62.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initCodeCopy } from '../src/components/code-copy/code-copy.ts';

const CSS = readFileSync(new URL('../src/styles/code-copy.css', import.meta.url), 'utf8').replace(/[/][*][^]*?[*][/]/g, '');

/** Nodo fake con appendChild/insertBefore que mueve hijos como el DOM real. */
function node(extra = {}) {
  const n = { children: [], parentNode: null, dataset: {}, attrs: {}, handlers: {}, classList: { add() {}, remove() {} }, ...extra };
  const detach = (c) => { if (c.parentNode) c.parentNode.children = c.parentNode.children.filter((x) => x !== c); };
  n.appendChild = (c) => { detach(c); c.parentNode = n; n.children.push(c); return c; };
  n.insertBefore = (c, ref) => { detach(c); c.parentNode = n; n.children.splice(n.children.indexOf(ref), 0, c); return c; };
  n.setAttribute = (k, v) => { n.attrs[k] = v; };
  n.addEventListener = (e, h) => { n.handlers[e] = h; };
  return n;
}

function setup() {
  const article = node({ tag: 'article' });
  const before = node({ tag: 'p' });
  const pre = node({ tag: 'pre', querySelector: () => ({ textContent: 'const x = 1;\n' }) });
  article.appendChild(before); article.appendChild(pre); article.appendChild(node({ tag: 'p' }));
  const clipboard = { written: [], async writeText(t) { this.written.push(t); } };
  globalThis.document = {
    querySelectorAll: (sel) => (sel === 'pre.astro-code' ? [pre] : []),
    querySelector: () => null,
    createElement: (tag) => node({ tag }),
  };
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard }, configurable: true });
  return { article, pre, clipboard, cleanup() { delete globalThis.document; delete globalThis.navigator; } };
}

test('REQ-62-01/02: envuelve el pre en div.code-block en su posición y el botón cuelga del envoltorio', () => {
  const { article, pre, cleanup } = setup();
  try {
    initCodeCopy();
    const wrap = article.children[1];
    assert.equal(wrap.tag, 'div', 'el envoltorio debe ocupar la posición original del pre');
    assert.equal(wrap.className, 'code-block');
    assert.equal(pre.parentNode, wrap, 'el pre debe quedar dentro del envoltorio');
    const button = wrap.children.find((c) => c.tag === 'button');
    assert.ok(button, 'el botón debe ser hijo del envoltorio');
    assert.equal(button.className, 'code-copy');
    assert.ok(!pre.children.some((c) => c.tag === 'button'), 'el botón no debe ser hijo del pre');
  } finally { cleanup(); }
});

test('REQ-62-03: dos llamadas conservan un único envoltorio y un único botón', () => {
  const { article, pre, cleanup } = setup();
  try {
    initCodeCopy(); initCodeCopy();
    assert.equal(article.children.filter((c) => c.className === 'code-block').length, 1);
    assert.equal(pre.parentNode.children.filter((c) => c.tag === 'button').length, 1);
    assert.equal(pre.parentNode.parentNode, article, 'no debe anidar envoltorios');
  } finally { cleanup(); }
});

test('REQ-62-06: el botón copia el texto del code del pre envuelto', async () => {
  const { pre, clipboard, cleanup } = setup();
  try {
    initCodeCopy();
    await pre.parentNode.children.find((c) => c.tag === 'button').handlers.click();
    assert.deepEqual(clipboard.written, ['const x = 1;']);
  } finally { cleanup(); }
});

test('REQ-62-04: position: relative en .post__content .code-block y no en pre.astro-code', () => {
  assert.match(CSS, /[.]post__content [.]code-block[ ]*[{][^}]*position:[ ]*relative/);
  assert.doesNotMatch(CSS, /pre[.]astro-code[ ]*[{][^}]*position:[ ]*relative/);
});

test('REQ-62-08: archivos de producción y tests tocados por la feature no superan 100 líneas', () => {
  const files = ['../src/components/code-copy/code-copy.ts', '../src/styles/code-copy.css', './code-copy-fixed-corner.test.mjs',
    './code-copy-button.test.mjs', './code-copy-status.test.mjs'];
  for (const rel of files) {
    const src = readFileSync(new URL(rel, import.meta.url), 'utf8');
    const lines = src.split('\n').length - (src.endsWith('\n') ? 1 : 0);
    assert.ok(lines <= 100, `${rel} tiene ${lines} líneas`);
  }
});
