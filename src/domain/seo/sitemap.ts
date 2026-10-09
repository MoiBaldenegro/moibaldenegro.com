// sitemap.xml y robots.txt (feature 42 sitemap-robots-endpoints,
// REQ-42-02..07). Funciones puras sin dependencias: los endpoints
// prerenderizados solo pasan los Posts del repositorio y el site.
// Las loc llevan barra final, igual que los canonical (build en formato
// directorio, feature 35); /search, términos y /404 quedan fuera (noindex).
import type { Post } from '../entities/post.ts';
import { parseSpanishDate } from '../search/parse-date.ts';

const XML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
};

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

function urlEntry(loc: string, lastmod: string): string {
  const mod = lastmod === '' ? '' : `<lastmod>${lastmod}</lastmod>`;
  return `  <url><loc>${escapeXml(loc)}</loc>${mod}</url>`;
}

// Posts más la portada y /about; lastmod desde updated o, si falta, created.
export function buildSitemap(posts: readonly Post[], site: string | URL): string {
  const origin = new URL(site).origin;
  const entries = [urlEntry(`${origin}/`, ''), urlEntry(`${origin}/about/`, '')];
  for (const post of posts) {
    const lastmod = parseSpanishDate(post.updated ?? '') || parseSpanishDate(post.created ?? '');
    entries.push(urlEntry(`${origin}/posts/${encodeURIComponent(post.id)}/`, lastmod));
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

export function robotsTxt(site: string | URL): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`;
}
