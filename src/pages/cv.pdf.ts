// /cv.pdf prerenderizado (feature 81 cv-pdf-endpoint, REQ-81-19/20/21): el CV
// en PDF se genera en build desde los mismos datos de /about (hero.json y
// about.json vía sus repositorios). Recurso descargable: no entra al sitemap.
import type { APIRoute } from 'astro';
import { HeroProfileRepository } from '../domain/repositories/hero-profile-repository.ts';
import { AboutRepository } from '../domain/repositories/about-repository.ts';
import { renderCvPdf } from '../domain/cv/cv-pdf.ts';

export const prerender = true;

export const GET: APIRoute = async () => {
  const pdf = await renderCvPdf(new HeroProfileRepository().getProfile(), new AboutRepository().getProfile());
  return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
};
