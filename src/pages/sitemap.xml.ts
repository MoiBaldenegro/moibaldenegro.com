// /sitemap.xml prerenderizado (feature 42, REQ-42-01): tiene prioridad sobre
// la ruta catch-all [...term]. El XML lo construye buildSitemap (dominio).
import type { APIRoute } from 'astro';
import { PostsRepository } from '../domain/repositories/posts-repository.ts';
import { buildSitemap } from '../domain/seo/sitemap.ts';

export const prerender = true;

export const GET: APIRoute = async ({ site, url }) =>
  new Response(buildSitemap(await new PostsRepository().getPosts(), site ?? url.origin), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
