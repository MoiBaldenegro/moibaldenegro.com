// Feature 78 (site-menu-state): estado puro del menú hamburguesa móvil y su wiring al DOM, con
// fakes contables (patrón code-copy). Spec: specs/78_site-menu-state/requirements.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => { assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`); return readFileSync(new URL(rel, root), 'utf8'); };
const domain = () => { read('src/domain/site-menu.ts'); return import(new URL('src/domain/site-menu.ts', root).href); };
const wiring = () => { read('src/components/site-menu/site-menu.ts'); return import(new URL('src/components/site-menu/site-menu.ts', root).href); };

function el(name, parent = null) {
  const e = { name, parent, attrs: {}, listeners: {}, focused: 0, children: [],
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k] ?? null; },
    addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }, focus() { this.focused++; },
    contains(o) { for (let n = o; n; n = n.parent) if (n === this) return true; return false; },
    closest(sel) { for (let n = this; n; n = n.parent) if (n.name === sel) return n; return null; },
    fire(t, ev = {}) { for (const f of this.listeners[t] ?? []) f({ target: this, ...ev }); } };
  if (parent) parent.children.push(e);
  return e;
}
function setup() {
  const header = el('header'); const button = el('button', header); const panel = el('panel', header);
  const link = el('a', panel); const outside = el('main');
  header.querySelector = (s) => (s === '[data-site-menu-toggle]' ? button : s === '[data-site-menu]' ? panel : null);
  panel.querySelector = (s) => (s.includes('a') ? link : null);
  const doc = el('document'); doc.querySelector = (s) => (s === '.site-navbar' ? header : null);
  const media = { matches: true, listeners: [], addEventListener(t, f) { this.listeners.push(f); } };
  return { header, button, panel, link, outside, doc, media };
}
const count = (e, t) => (e.listeners[t] ?? []).length;

test('REQ-78-01..06: estado, atributos y Escape puros', async () => {
  const { nextMenuState: next, menuAttributes, menuEscapeAction, MenuStateError } = await domain();
  assert.equal(next('closed', 'toggle'), 'open'); assert.equal(next('open', 'toggle'), 'closed');
  for (const ev of ['escape', 'outside', 'link', 'focus-out', 'desktop']) for (const s of ['open', 'closed']) assert.equal(next(s, ev), 'closed', `${s}+${ev}`);
  assert.throws(() => next('raro', 'toggle'), (e) => e instanceof MenuStateError && e.name === 'MenuStateError' && e.message.includes('raro'));
  assert.throws(() => next('open', 'boom'), (e) => e instanceof MenuStateError && e.message.includes('boom'));
  assert.deepEqual(menuAttributes('open'), { expanded: 'true', label: 'Cerrar menú' });
  assert.deepEqual(menuAttributes('closed'), { expanded: 'false', label: 'Abrir menú' });
  assert.equal(menuEscapeAction('open', false), 'close');
  for (const [s, h] of [['open', true], ['closed', false], ['closed', true]]) assert.equal(menuEscapeAction(s, h), 'none');
  assert.doesNotMatch(read('src/domain/site-menu.ts'), /document|window|location/);
});

test('REQ-78-07..12: init, toggle y foco', async () => {
  const { initSiteMenu } = await wiring();
  const empty = el('document'); empty.querySelector = () => null;
  const m0 = { addEventListener() { throw new Error('no debe registrar'); } };
  assert.doesNotThrow(() => initSiteMenu(empty, m0, () => false)); assert.equal(count(empty, 'click'), 0);
  const { header, button, link, doc, media } = setup();
  initSiteMenu(doc, media, () => false);
  assert.equal(header.attrs['data-menu'], 'closed'); assert.equal(button.attrs['aria-expanded'], 'false'); assert.equal(button.attrs['aria-label'], 'Abrir menú');
  button.fire('click');
  assert.equal(header.attrs['data-menu'], 'open'); assert.equal(button.attrs['aria-expanded'], 'true');
  assert.equal(button.attrs['aria-label'], 'Cerrar menú'); assert.equal(link.focused, 1);
  button.fire('click');
  assert.equal(header.attrs['data-menu'], 'closed'); assert.equal(link.focused, 1);
});

test('REQ-78-13..19: Escape, clic fuera, enlace y focusout', async () => {
  const { initSiteMenu } = await wiring();
  let handle = false; const { header, button, link, outside, doc, media } = setup();
  initSiteMenu(doc, media, () => handle);
  const open = () => button.fire('click');
  open(); handle = true; header.fire('keydown', { key: 'Escape' });
  assert.equal(header.attrs['data-menu'], 'open'); assert.equal(button.focused, 0);
  handle = false; header.fire('keydown', { key: 'Escape' });
  assert.equal(header.attrs['data-menu'], 'closed'); assert.equal(button.focused, 1);
  assert.equal(count(doc, 'keydown'), 0); assert.ok(count(header, 'keydown') >= 1);
  open(); doc.fire('click', { target: outside }); assert.equal(header.attrs['data-menu'], 'closed');
  open(); doc.fire('click', { target: button }); assert.equal(header.attrs['data-menu'], 'open');
  link.parent.fire('click', { target: link }); assert.equal(header.attrs['data-menu'], 'closed');
  open(); header.fire('focusout', { relatedTarget: header.children[0] }); assert.equal(header.attrs['data-menu'], 'open');
  header.fire('focusout', { relatedTarget: null }); assert.equal(header.attrs['data-menu'], 'open');
  const before = button.focused; header.fire('focusout', { relatedTarget: outside });
  assert.equal(header.attrs['data-menu'], 'closed'); assert.equal(button.focused, before);
});

test('REQ-78-15/20/21/22: búsqueda importada, escritorio y listeners únicos', async () => {
  const mod = read('src/components/site-menu/site-menu.ts');
  for (const fn of ['isSearchFocus', 'escapeAction', 'activeTerm', 'escapeContext']) {
    assert.match(mod, new RegExp('import [{][^}]*' + fn + '[^}]*[}] from .[.][.][/]search-escape[/]search-escape[.]ts.'), fn);
  }
  assert.doesNotMatch(mod, /function (isSearchFocus|escapeAction|activeTerm|escapeContext)/);
  const { initSiteMenu } = await wiring();
  const a = setup(); initSiteMenu(a.doc, a.media, () => false); a.button.fire('click');
  for (const f of a.media.listeners) f({ matches: false });
  assert.equal(a.header.attrs['data-menu'], 'closed');
  for (let i = 0; i < 2; i++) { const b = setup(); a.doc.querySelector = () => b.header; initSiteMenu(a.doc, a.media, () => false); }
  assert.equal(count(a.doc, 'click'), 1); assert.equal(a.media.listeners.length, 1);
  const c = setup(); initSiteMenu(c.doc, c.media, () => false); initSiteMenu(c.doc, c.media, () => false);
  assert.equal(count(c.button, 'click'), 1); assert.equal(count(c.header, 'keydown'), 1); assert.equal(count(c.panel, 'click'), 1);
});

test('REQ-78-25: archivos <= 100 líneas', () => {
  for (const rel of ['src/domain/site-menu.ts', 'src/components/site-menu/site-menu.ts', 'tests/site-menu-state.test.mjs']) {
    const s = read(rel); assert.ok(s.split('\n').length - (s.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
