// Datos estructurados JSON-LD BlogPosting (feature 44 article-json-ld,
// REQ-44-01..05). Funciones puras: la página del post solo las invoca.
// Fechas en YYYY-MM-DD (ISO 8601 válido) vía parseSpanishDate; añadir hora y
// zona horaria es decisión del humano (progress/research/audit_backlog.md).
import type { Post } from '../entities/post.ts';
import { parseSpanishDate } from '../search/parse-date.ts';
import { canonicalUrl } from './head.ts';

export interface BlogPostingJsonLd {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'BlogPosting';
  readonly headline: string;
  readonly description: string;
  readonly image: string;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly author: { readonly '@type': 'Person'; readonly name: string; readonly url: string };
  readonly mainEntityOfPage: string;
}

export function blogPostingJsonLd(post: Post, site: string | URL): BlogPostingJsonLd {
  const published = parseSpanishDate(post.created);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: new URL(`/assets/content/${post.img}`, site).href,
    datePublished: published,
    dateModified: parseSpanishDate(post.updated) || published,
    author: { '@type': 'Person', name: post.author, url: new URL('/about', site).href },
    // Mismo canonical que la página (formato directorio con barra final).
    mainEntityOfPage: canonicalUrl(`/posts/${encodeURIComponent(post.id)}/`, site),
  };
}

// JSON para <script type="application/ld+json">: escapa «</script» como
// «<\/script» (escape JSON válido de «/») para no cerrar el script (REQ-44-05).
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/<\/script/gi, '<\u005c/script');
}
