// item-html.ts — Generador del item de la lista de resultados de búsqueda
// (feature 9 search-results-list-mode, REQ-09-02..05). Extraído del
// controlador (feature 3) porque estaba en 100/100 líneas (regla 12,
// precedente term-route.ts): itemHtml + esc viven aquí, y el controlador
// (REQ-09-02) y el panel en vivo de la portada (REQ-09-10) los importan.
import type { SearchIndexEntry } from '../../domain/search/index.ts';

export function itemHtml(entry: SearchIndexEntry): string {
  const tags = entry.tags.map((t) => `<span class="search-results__tag">#${esc(t)}</span>`).join('');
  return [
    '<li class="search-results__item">',
    `<img class="search-results__thumb" src="/assets/content/${esc(entry.img)}" alt="${esc(entry.title)}" loading="lazy" />`,
    '<div class="search-results__body">',
    `<a class="search-results__link" href="/posts/${esc(entry.id)}">`,
    `<h2 class="search-results__title">${esc(entry.title)}</h2>`,
    '</a>',
    `<p class="search-results__meta">Por ${esc(entry.author)} • ${entry.readtime} min de lectura</p>`,
    `<p class="search-results__description">${esc(entry.description)}</p>`,
    `<div class="search-results__tags">${tags}</div>`,
    '</div>',
    '</li>',
  ].join('');
}

export function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}