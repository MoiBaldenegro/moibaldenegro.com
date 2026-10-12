// Adaptador pdf-lib del CV (REQ-81-16/17/18, feature 81 cv-pdf-endpoint).
// ÚNICO archivo de src/ que importa pdf-lib: dibuja la maqueta pura de
// cv-layout.ts con Helvetica y Helvetica-Bold de StandardFonts (sin incrustar
// fuentes). Fija metadatos y fechas constantes: dos generaciones con los
// mismos datos producen bytes idénticos (build determinista).

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { AboutProfile } from '../entities/about-profile.ts';
import type { HeroProfile } from '../entities/hero-profile.ts';
import { layoutCv } from './cv-layout.ts';

const TITLE = 'CV — Moisés Baldenegro Melendez';
const LANGUAGE = 'es-MX';
// Fecha constante de creación y modificación (alta de la feature).
const FIXED_DATE = new Date('2026-10-12T00:00:00.000Z');
const INK = rgb(0.1, 0.1, 0.12);

export async function renderCvPdf(hero: HeroProfile, about: AboutProfile): Promise<Uint8Array> {
  const doc = await PDFDocument.create({ updateMetadata: false });
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle(TITLE);
  doc.setAuthor(hero.name);
  doc.setLanguage(LANGUAGE);
  doc.setCreationDate(FIXED_DATE);
  doc.setModificationDate(FIXED_DATE);
  const fontFor = (isBold: boolean) => (isBold ? bold : regular);
  const measure = (text: string, size: number, isBold: boolean) => fontFor(isBold).widthOfTextAtSize(text, size);
  for (const page of layoutCv(hero, about, measure)) {
    const pdfPage = doc.addPage([page.width, page.height]);
    for (const op of page.ops) {
      pdfPage.drawText(op.text, { x: op.x, y: op.y, size: op.size, font: fontFor(op.bold), color: INK });
    }
  }
  return doc.save();
}
