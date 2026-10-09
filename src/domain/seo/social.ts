// Open Graph y Twitter/X cards (feature 43 social-meta-tags, REQ-43-01..05).
// Función pura: devuelve la lista inmutable de metas y el Layout la pinta.
// og:locale es_MX y las fechas sin zona horaria son decisiones revisables
// por el humano (progress/research/audit_backlog.md).
import { BRAND, SITE_DESCRIPTION, canonicalUrl } from './head.ts';
import { parseSpanishDate } from '../search/parse-date.ts';

export interface MetaTag {
  readonly property?: string;
  readonly name?: string;
  readonly content: string;
}

export interface SocialInput {
  readonly title: string;
  readonly description?: string;
  readonly pathname: string;
  readonly site: string | URL;
  readonly image?: string;
  readonly type?: 'website' | 'article';
  readonly published?: string;
  readonly modified?: string;
}

export const DEFAULT_SOCIAL_IMAGE = '/assets/moises-hero.jpg';
export const TWITTER_SITE = '@moibaldenegro';

export function socialMeta(input: SocialInput): readonly MetaTag[] {
  const type = input.type ?? 'website';
  const og = (property: string, content: string): MetaTag => ({ property, content });
  const tags: MetaTag[] = [
    og('og:title', input.title),
    og('og:description', input.description || SITE_DESCRIPTION),
    og('og:url', canonicalUrl(input.pathname, input.site)),
    og('og:image', new URL(input.image || DEFAULT_SOCIAL_IMAGE, input.site).href),
    og('og:type', type),
    og('og:site_name', BRAND),
    og('og:locale', 'es_MX'),
  ];
  if (type === 'article') {
    const published = parseSpanishDate(input.published ?? '');
    const modified = parseSpanishDate(input.modified ?? '') || published;
    if (published !== '') tags.push(og('article:published_time', published));
    if (modified !== '') tags.push(og('article:modified_time', modified));
  }
  tags.push({ name: 'twitter:card', content: 'summary_large_image' }, { name: 'twitter:site', content: TWITTER_SITE });
  return Object.freeze(tags.map((tag) => Object.freeze(tag)));
}
