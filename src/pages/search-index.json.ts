// /search-index.json prerenderizado (feature 46, REQ-46-01/04): el mismo
// índice que hoy embeben las páginas, como asset estático cacheable. Los
// consumidores pasarán a pedirlo con fetch en la feature 47.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PostsRepository } from '../domain/repositories/posts-repository.ts';
import { searchIndexJson } from '../domain/search/index-json.ts';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(searchIndexJson(await new PostsRepository().getPosts(), await getCollection('posts')), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
