// /robots.txt prerenderizado (feature 42, REQ-42-07): permite todo y apunta
// al sitemap absoluto sobre el site configurado (feature 35).
import type { APIRoute } from 'astro';
import { robotsTxt } from '../domain/seo/sitemap.ts';

export const prerender = true;

export const GET: APIRoute = ({ site, url }) =>
  new Response(robotsTxt(site ?? url.origin), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
