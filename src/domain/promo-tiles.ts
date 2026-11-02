// Atributos de los enlaces de la sección promocional (REQ-04-13, feature 4).
// Solo los href https:// son externos: abren en pestaña nueva sin opener ni referrer.
// Los internos (empiezan por "/") no llevan target ni rel.

export interface PromoLinkAttrs {
  readonly target?: '_blank';
  readonly rel?: 'noopener noreferrer';
}

export function linkAttrs(href: string): PromoLinkAttrs {
  return href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
