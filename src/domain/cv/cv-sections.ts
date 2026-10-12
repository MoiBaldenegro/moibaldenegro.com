// Contenido del CV en PDF como bloques de texto (REQ-81-10/12/14/15, feature 81).
// Orden: nombre (hero.json), titular, ubicación, contacto (URLs visibles de
// cvContact), Perfil, Experiencia, Habilidades, Educación, Certificaciones e
// Idiomas. Excluye a propósito la foto, la línea de enfoque de hero.json, los
// proyectos, el contenido y la filosofía. Sin correo ni teléfono: about.json
// no los tiene y el contacto solo usa los enlaces públicos de cvContact.

import type { AboutExperience, AboutProfile } from '../entities/about-profile.ts';
import type { HeroProfile } from '../entities/hero-profile.ts';
import { cvContact } from '../about-links.ts';

// Un párrafo del CV: la maqueta lo parte en líneas y lo coloca.
export interface CvBlock {
  readonly text: string;
  readonly size: number;
  readonly bold?: boolean;
  // Espacio vertical extra antes del bloque (se omite al inicio de página).
  readonly gapBefore?: number;
  // Las líneas de continuación se sangran con la anchura de la viñeta '• '.
  readonly bullet?: boolean;
  // El bloque no se separa del siguiente al saltar de página (títulos).
  readonly keepWithNext?: boolean;
}

const BODY = 9.5;

const heading = (text: string): CvBlock => ({ text, size: 12, bold: true, gapBefore: 10, keepWithNext: true });
const bullet = (text: string): CvBlock => ({ text: `• ${text}`, size: BODY, bullet: true });

function job(entry: AboutExperience, index: number): CvBlock[] {
  return [
    { text: entry.role, size: 10.5, bold: true, gapBefore: index === 0 ? 0 : 6, keepWithNext: true },
    { text: `${entry.organization} · ${entry.place} · ${entry.period}`, size: BODY, keepWithNext: true },
    ...entry.highlights.map(bullet),
    ...(entry.result ? [{ text: `Resultado: ${entry.result}`, size: BODY, bold: true }] : []),
  ];
}

export function cvSections(hero: HeroProfile, about: AboutProfile): CvBlock[] {
  return [
    { text: hero.name, size: 20, bold: true },
    { text: about.headline, size: 11, gapBefore: 4 },
    { text: about.location, size: BODY, gapBefore: 2 },
    { text: cvContact(about).map((link) => link.href).join(' | '), size: BODY },
    heading('Perfil'),
    { text: about.summary, size: BODY },
    heading('Experiencia'),
    ...about.experience.flatMap(job),
    heading('Habilidades'),
    ...about.skills.map((skill) => ({ text: `${skill.area}: ${skill.items.join(', ')}`, size: BODY })),
    heading('Educación'),
    ...about.education.flatMap((edu) => [
      { text: edu.degree, size: 10.5, bold: true, keepWithNext: true },
      { text: `${edu.institution} · ${edu.place}`, size: BODY },
    ]),
    heading('Certificaciones'),
    ...about.certifications.map((cert) => bullet(`${cert.name} — ${cert.issuer}`)),
    heading('Idiomas'),
    ...about.languages.map((lang) => ({ text: `${lang.name}: ${lang.level}`, size: BODY })),
  ];
}
