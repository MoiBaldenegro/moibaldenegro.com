import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Colección unificada posts (DECISIÓN 2026-09-18): subcarpetas
// architecture/ y os/ bajo la misma colección para búsqueda y /posts/[id]
// únicos. post.id = data.slug (ver posts-repository.ts): entry.id incluye
// la subcarpeta y no sirve como clave de ruta ni de next/related.
const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.md",
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    author: z.string(),
    img: z.string(),
    readtime: z.number(),
    description: z.string(),
    tags: z
      .string()
      .transform((value) =>
        value
          .split(/\s+/)
          .map((tag) => tag.replace(/^#/, "").trim())
          .filter(Boolean)
      ),
    created: z.string(),
    updated: z.string(),
    next: z.string().optional(),
    related: z.array(z.string()).optional(),
  }),
});

export const collections = { posts };
