// Parseo y validación de src/data/about.json (REQ-80-05..08, feature 80).
// Módulo hermano de about-repository.ts para mantener ambos en <=100 líneas.
// Todo fallo lanza AboutDataError nombrando about.json y el campo o id culpable.

import type { AboutLinkId, AboutProfile } from '../entities/about-profile.ts';

export class AboutDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AboutDataError';
  }
}

type Data = Record<string, unknown>;

const LINK_IDS: readonly AboutLinkId[] = ['github', 'linkedin', 'youtube', 'site'];
const TEXTS = ['headline', 'location', 'photoAlt', 'summary'] as const;

// Campos de texto obligatorios de cada elemento de lista.
const LIST_ITEMS = {
  links: ['id', 'label', 'href'],
  stats: ['value', 'label'],
  experience: ['role', 'organization', 'place', 'period'],
  skills: ['area'],
  projects: ['name', 'description', 'href'],
  content: ['title', 'description', 'href'],
  education: ['degree', 'institution', 'place'],
  certifications: ['name', 'issuer'],
  languages: ['name', 'level'],
} as const;

export function parseAboutProfile(data: unknown): AboutProfile {
  const record = asRecord(data, 'el contenido');
  for (const field of TEXTS) expectText(record, field, field);
  for (const [field, keys] of Object.entries(LIST_ITEMS)) {
    expectList(record, field, field).forEach((item, i) => {
      const entry = asRecord(item, `${field}[${i}]`);
      for (const key of keys) expectText(entry, key, `${field}[${i}].${key}`);
    });
  }
  expectNested(record);
  return record as unknown as AboutProfile;
}

function expectNested(record: Data): void {
  (record.links as Data[]).forEach((link) => {
    if (!LINK_IDS.includes(link.id as AboutLinkId)) {
      throw new AboutDataError(`about.json: el enlace "${String(link.id)}" no es un id válido`);
    }
  });
  (record.experience as Data[]).forEach((job, i) => {
    const path = `experience[${i}]`;
    expectList(job, 'highlights', `${path}.highlights`).forEach((_, j) => {
      expectText(job.highlights as unknown as Data, String(j), `${path}.highlights[${j}]`);
    });
    if (job.result !== undefined) expectText(job, 'result', `${path}.result`);
  });
  (record.skills as Data[]).forEach((skill, i) => {
    expectList(skill, 'items', `skills[${i}].items`).forEach((_, j) => {
      expectText(skill.items as unknown as Data, String(j), `skills[${i}].items[${j}]`);
    });
  });
  const philosophy = asRecord(record.philosophy, 'philosophy');
  expectText(philosophy, 'motto', 'philosophy.motto');
  expectText(philosophy, 'text', 'philosophy.text');
}

function asRecord(value: unknown, name: string): Data {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AboutDataError(`about.json: ${name} debe ser un objeto`);
  }
  return value as Data;
}

function expectText(record: Data, key: string, name: string): void {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AboutDataError(`about.json: el campo "${name}" debe ser un texto no vacío`);
  }
}

function expectList(record: Data, key: string, name: string): readonly unknown[] {
  const value = record[key];
  if (!Array.isArray(value) || value.length === 0) {
    throw new AboutDataError(`about.json: el campo "${name}" debe ser una lista no vacía`);
  }
  return value;
}
