// Entidad del dominio: perfil del About (REQ-80-02, feature 80 about-data-repository).
// Tipa los datos de src/data/about.json. Inmutable: campos, arrays y objetos readonly.
// Nombre, handle, foto y línea de enfoque viven SOLO en HeroProfile (hero.json).

export type AboutLinkId = 'github' | 'linkedin' | 'youtube' | 'site';

export interface AboutLink {
  readonly id: AboutLinkId;
  readonly label: string;
  readonly href: string;
}

export interface AboutStat {
  readonly value: string;
  readonly label: string;
}

export interface AboutExperience {
  readonly role: string;
  readonly organization: string;
  readonly place: string;
  readonly period: string;
  readonly highlights: readonly string[];
  readonly result?: string;
}

export interface AboutSkillArea {
  readonly area: string;
  readonly items: readonly string[];
}

export interface AboutProject {
  readonly name: string;
  readonly description: string;
  readonly href: string;
}

export interface AboutContent {
  readonly title: string;
  readonly description: string;
  readonly href: string;
}

export interface AboutEducation {
  readonly degree: string;
  readonly institution: string;
  readonly place: string;
}

export interface AboutCertification {
  readonly name: string;
  readonly issuer: string;
}

export interface AboutLanguage {
  readonly name: string;
  readonly level: string;
}

export interface AboutPhilosophy {
  readonly motto: string;
  readonly text: string;
}

export interface AboutProfile {
  readonly headline: string;
  readonly location: string;
  readonly photoAlt: string;
  readonly summary: string;
  readonly links: readonly AboutLink[];
  readonly stats: readonly AboutStat[];
  readonly experience: readonly AboutExperience[];
  readonly skills: readonly AboutSkillArea[];
  readonly projects: readonly AboutProject[];
  readonly content: readonly AboutContent[];
  readonly education: readonly AboutEducation[];
  readonly certifications: readonly AboutCertification[];
  readonly languages: readonly AboutLanguage[];
  readonly philosophy: AboutPhilosophy;
}
