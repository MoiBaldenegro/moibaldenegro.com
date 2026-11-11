// item-html.ts — Generador del item de la lista de resultados de búsqueda
// (feature 9 search-results-list-mode, REQ-09-02..05). Extraído del
// controlador (feature 3) porque estaba en 100/100 líneas (regla 12,
// precedente term-route.ts): itemHtml + esc viven aquí, y el controlador
// (REQ-09-02) y el panel en vivo de la portada (REQ-09-10) los importan.
import type { SearchIndexEntry } from '../../domain/search/index.ts';

export function itemHtml(entry: SearchIndexEntry): string {
  // Feature 15 (REQ-15-07): fila de resultado del design system MXVI.
  const tags = entry.tags.map((t) => `<li class="mx-tag mx-tag--sm">#${esc(t)}</li>`).join('');
  return [
    '<li class="mx-result-row">',
    `<img class="mx-thumb" src="/assets/content/${esc(entry.img)}" alt="" width="1376" height="768" loading="lazy" decoding="async" />`,
    '<div class="mx-result-row__body">',
    `<a class="mx-result-row__link" href="/posts/${esc(entry.id)}">`,
    `<h2 class="mx-result-row__title">${esc(entry.title)}</h2>`,
    '</a>',
    `<p class="mx-result-row__meta">Por ${esc(entry.author)} • ${entry.readtime} min de lectura</p>`,
    `<p class="mx-result-row__description">${esc(entry.description)}</p>`,
    `<ul class="mx-tag-list">${tags}</ul>`,
    '</div>',
    '</li>',
  ].join('');
}

export function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}