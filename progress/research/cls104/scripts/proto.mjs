// Prototipo (no es código de la app): inyecta por CDP, antes del parseo, una hoja que reserva el layout horizontal
// antes del JS bajo (scripting: enabled) y vuelve a medir con run.mjs. Uso: node proto.mjs <out> <port> <W> <H>
import { CLS_INIT } from './lib.mjs';
const RESERVE = `@media (min-width: 1201px) and (prefers-reduced-motion: no-preference) and (scripting: enabled) {
  .latest-articles:not(.latest-articles--horizontal):has(.latest-articles__card:nth-child(3)) {
    --latest-card-width: min(calc((min(var(--container-max), 95%) - var(--gap-card)) / 2), calc((100vh - 30rem) * 16 / 9 + 3.5rem));
    --latest-pair-inset: calc((100% - 2 * var(--latest-card-width) - var(--gap-card)) / 2);
    width: 100%; min-height: 100vh; overflow: clip;
    margin-bottom: calc((var(--latest-count, 3) - 2) * (var(--latest-card-width) + var(--gap-card)));
  }
  .latest-articles:not(.latest-articles--horizontal):has(.latest-articles__card:nth-child(3)) .latest-articles__heading { width: calc(2 * var(--latest-card-width) + var(--gap-card)); margin-inline: auto; }
  .latest-articles:not(.latest-articles--horizontal):has(.latest-articles__card:nth-child(3)) .latest-articles__list { display: flex; gap: var(--gap-card); }
  .latest-articles:not(.latest-articles--horizontal):has(.latest-articles__card:nth-child(3)) .latest-articles__card { flex: 0 0 var(--latest-card-width); width: var(--latest-card-width); }
  .latest-articles:not(.latest-articles--horizontal):has(.latest-articles__card:nth-child(3)) .latest-articles__card:first-child { margin-inline-start: var(--latest-pair-inset); }
}`;
const INJECT = `(() => { const add = () => { if (document.head && !document.getElementById('cls104')) { const s = document.createElement('style'); s.id = 'cls104'; s.textContent = ${JSON.stringify(RESERVE)}; document.head.append(s); } };
  new MutationObserver(add).observe(document, { childList: true, subtree: true }); })();`;
process.env.EXTRA_INIT = INJECT;
await import('./run.mjs');
void CLS_INIT;
