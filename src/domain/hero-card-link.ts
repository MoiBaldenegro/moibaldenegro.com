// Liga de las cards del hero (feature 107 hero-cards-links, REQ-107-08/09; feature 110, REQ-110-03/04).
// Solo las ligas https:// son externas (aviso « (sitio externo)»). Toda liga abre en pestaña nueva y lo avisa.

const EXTERNAL_NOTICE = ' (sitio externo)';
const NEW_TAB_NOTICE = ' (se abre en una pestaña nueva)';

export function isExternalHref(href: string | null): boolean {
  return href !== null && href.startsWith('https://');
}

// Texto oculto (span.visually-hidden) del a.card-link: título, aviso externo si aplica y aviso de pestaña nueva.
export function cardLinkLabel(title: string, href: string | null): string {
  return `${title}${isExternalHref(href) ? EXTERNAL_NOTICE : ''}${NEW_TAB_NOTICE}`;
}
