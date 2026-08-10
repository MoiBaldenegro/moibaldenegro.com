import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const architecture = defineCollection({
  loader: glob({
    base: "./src/content/architecture",
    pattern: "**/*.md",
  }),
  schema: z.object({
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
  }),
});

export const collections = { architecture };
