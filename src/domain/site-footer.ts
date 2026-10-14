// Contenido del footer del sitio (REQ-89-01/02/03, feature 89 site-footer).
// Columnas de enlaces y aviso de copyright; el componente solo pinta lo que entrega este módulo.
// Las redes salen de about.json vía heroLinks (falla con AboutDataError si falta alguna).

import type { AboutProfile } from './entities/about-profile.ts';
import { heroLinks } from './about-links.ts';

export interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly icon?: string;
  readonly external?: boolean;
}

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

const NAVIGATION: readonly FooterLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Arquitectura', href: '/arquitectura' },
  { label: 'Buscar artículos', href: '/search' },
];

const X_LINK: FooterLink = { label: 'X', href: 'https://x.com/moibaldenegro', icon: 'x', external: true };

/** Columnas Navegación y Conecta del footer. */
export function footerColumns(profile: AboutProfile): readonly FooterColumn[] {
  const social = heroLinks(profile).map((link) => ({ label: link.label, href: link.href, icon: link.id, external: true }));
  return [
    { title: 'Navegación', links: NAVIGATION },
    { title: 'Conecta', links: [...social, X_LINK] },
  ];
}

/** Aviso «© <año> <nombre>» con el año de la fecha recibida (en build, la actual). */
export function copyrightLine(name: string, now: Date = new Date()): string {
  return `© ${now.getFullYear()} ${name}`;
}
