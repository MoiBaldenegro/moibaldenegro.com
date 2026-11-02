// Parseo y validación de src/data/mxvi-logos.json (REQ-05-09..13, feature 5).
// Módulo hermano de mxvi-logos-repository.ts para mantener ambos en <=100 líneas.
// Todo fallo lanza MxviLogosDataError nombrando mxvi-logos.json, el logo y el campo.

import type { MxviLogo } from '../entities/mxvi-logo.ts';

export class MxviLogosDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MxviLogosDataError';
  }
}

type Data = Record<string, unknown>;

const LOGO_COUNT = 4;
const TEXTS = ['id', 'letter', 'viewBox', 'href', 'label'] as const;
const HREF_PREFIX = 'https://';
const VIEW_BOX = /^0 0 [1-9]\d* [1-9]\d*$/;

const fail = (detail: string): never => {
  throw new MxviLogosDataError(`mxvi-logos.json: ${detail}`);
};

export function parseMxviLogos(data: unknown): readonly MxviLogo[] {
  const logos = isRecord(data) ? data.logos : undefined;
  if (!Array.isArray(logos)) fail('falta el array "logos"');
  const list = logos as unknown[];
  if (list.length !== LOGO_COUNT) {
    fail(`"logos" debe tener exactamente ${LOGO_COUNT} logos (tiene ${list.length})`);
  }
  return list.map(parseLogo);
}

function parseLogo(value: unknown, index: number): MxviLogo {
  const where = `logos[${index}]`;
  if (!isRecord(value)) return fail(`el logo ${where} debe ser un objeto`);
  const [id, letter, viewBox, href, label] = TEXTS.map((key) => text(value, key, where));
  if (!href.startsWith(HREF_PREFIX)) {
    fail(`el campo "${where}.href" del logo ${where} debe empezar por "${HREF_PREFIX}"`);
  }
  if (!VIEW_BOX.test(viewBox)) {
    fail(`el campo "${where}.viewBox" del logo ${where} debe tener la forma "0 0 <ancho> <alto>"`);
  }
  return { id, letter, viewBox, href, label };
}

function text(record: Data, key: string, where: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`el campo "${where}.${key}" del logo ${where} debe ser un texto no vacío`);
  }
  return value as string;
}

function isRecord(value: unknown): value is Data {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
