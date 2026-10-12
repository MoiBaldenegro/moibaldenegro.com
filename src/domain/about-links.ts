// Selección de enlaces del About (REQ-80-12/13/14, feature 80).
// heroLinks: redes del hero (github, linkedin, youtube).
// cvContact: contacto del CV (site, linkedin, github).
// Si falta un id requerido lanza AboutDataError: nunca devuelve una lista incompleta.

import type { AboutLink, AboutLinkId, AboutProfile } from './entities/about-profile.ts';
import { AboutDataError } from './repositories/about-repository.ts';

const HERO_IDS: readonly AboutLinkId[] = ['github', 'linkedin', 'youtube'];
const CV_IDS: readonly AboutLinkId[] = ['site', 'linkedin', 'github'];

export function heroLinks(profile: AboutProfile): readonly AboutLink[] {
  return pickLinks(profile, HERO_IDS);
}

export function cvContact(profile: AboutProfile): readonly AboutLink[] {
  return pickLinks(profile, CV_IDS);
}

function pickLinks(profile: AboutProfile, ids: readonly AboutLinkId[]): readonly AboutLink[] {
  return ids.map((id) => {
    const link = profile.links.find((candidate) => candidate.id === id);
    if (!link) throw new AboutDataError(`about.json: falta el enlace "${id}"`);
    return link;
  });
}
