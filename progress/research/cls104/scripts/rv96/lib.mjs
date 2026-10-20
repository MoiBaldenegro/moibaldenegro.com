// Reviewer 96: helper CDP mínimo (Chrome headless + WebSocket nativo).
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
export const BASE = process.env.BASE || 'http://localhost:4360'; // feature 104: copia de los scripts del reviewer 96 (scratchpad rv96/)
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function open(dir, port) {
  const profile = mkdtempSync(join(process.env.PROF || dir, 'prof-'));
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
    ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank']);
  let url;
  for (let i = 0; i < 60 && !url; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); url = l.find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!url) await sleep(200); }
  const ws = new WebSocket(url); await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const pending = new Map(); const logs = []; const handlers = [];
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    if (m.method === 'Runtime.exceptionThrown') logs.push(['exception', m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text]);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push(['console', m.params.args.map((x) => x.value ?? x.description).join(' ')]);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') logs.push(['log', m.params.entry.text, m.params.entry.url]);
    for (const h of handlers) h(m); });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description); return r.result.value; };
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  const vp = (width, height = 800) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const load = async (path, width, height = 800) => {
    await vp(width, height);
    await send('Page.navigate', { url: BASE + path });
    for (let i = 0; i < 100; i++) { await sleep(100); try { if (await ev('document.readyState') === 'complete') break; } catch {} }
    await ev('document.fonts.ready.then(() => true)'); await sleep(800);
  };
  const shot = async (file) => { const { writeFileSync } = await import('node:fs'); const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(file, Buffer.from(r.data, 'base64')); };
  const close = () => { try { ws.close(); } catch {} chrome.kill(); };
  return { send, ev, load, vp, logs, handlers, shot, close };
}
// Estado de una card: translateX de la matriz, opacity, style attr.
export const CARDS = `[...document.querySelectorAll('.latest-articles__card')].map((c) => { const cs = getComputedStyle(c); const t = cs.transform;
  let tx = 0, sc = 1; if (t && t !== 'none') { const m = new DOMMatrix(t); tx = m.m41; sc = Math.hypot(m.m11, m.m12); }
  const r = c.getBoundingClientRect(); return { tx: +tx.toFixed(2), sc: +sc.toFixed(3), op: +(+cs.opacity).toFixed(3), t, style: c.getAttribute('style'), l: Math.round(r.left), r: Math.round(r.right), top: Math.round(r.top), b: Math.round(r.bottom) }; })`;
