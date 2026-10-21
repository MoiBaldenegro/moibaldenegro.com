import { open } from './lib.mjs';
const dir = new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const b = await open(dir, 9415);
const q = `(() => { const s = getComputedStyle(document.querySelector('.search-bar__icon')); return s.transitionDuration + ' / ' + s.animationName; })()`;
await b.load('/', 1280, 800); const normal = await b.ev(q);
await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await b.load('/', 1280, 800); const reduce = await b.ev(q);
console.log(JSON.stringify({ normal, reduce, logs: b.logs })); b.close();
