# Informe de implementación — content-config

## Feature

Fix puntual (sin `feature_list.json` en este repo): crear `src/content.config.ts` para las content collections de Astro 7 y eliminar el `console.log` de `src/components/latest-articles.astro`.

## Causa raíz confirmada

- Astro **7.2.0** instalado. No existía `src/content.config.ts` ni `src/content/config.ts`.
- Sin content config, Astro no genera tipos para las colecciones → `getCollection('architecture')` recibe `collection: never` (error `ts(2769)` en el editor) y en runtime la colección no existe.
- Hallazgo adicional (verificado en `node_modules/astro/dist/...`): en Astro 7.2.0 `legacy.collectionsBackwardsCompat` es `false` por defecto (`core/config/schemas/base.js:291`). Una colección definida SOLO con schema (sin loader) se considera "legacy": el content sync la omite (`content/content-layer.js:222`) y el store queda vacío. Es necesario usar el loader `glob()` de `astro/loaders` para que la colección se pueble en runtime.

## Evidencia ciclo rojo/verde

### ROJO — `pnpm.cmd build` (antes, sin `src/content.config.ts`)

```
> astro build
[types] Generated
[build] output: "static"
...
generating static routes
  ├─ /index.htmlThe collection "architecture" does not exist or is empty. Please check your content config file for errors.
[]          ← salida del console.log(arch_articles) → colección vacía
[build] Complete!
```

- Advertencia de runtime: la colección no existe → página renderizada sin artículos (`<section></section>` vacío en `dist/index.html`).
- El `ts(2769)` del editor es la manifestación en tipos: `getCollection` tipada con `CollectionKey = keyof DataEntryMap` y `DataEntryMap` sin colecciones → `collection: never`.

### VERDE — `pnpm.cmd build` (después, con `src/content.config.ts` + loader glob + sin console.log)

```
> astro build
[content] Syncing content
[content] Content config changed
[content] Clearing content store
[content] Synced content
[types] Generated 1.00s
[build] output: "static"
...
generating static routes
  ├─ /index.html
[build] Complete!
```

- Sin advertencias, sin errores, build completo (`1 page(s) built`).
- `dist/index.html` renderiza el artículo desde la colección:

```html
<section><article><h2>Agilismo, diseño y fragilidad</h2>
<p>Por Moises Baldenegro Melendez • 15 min de lectura</p>
<p>En este capitulo aprenderemos los conceptos fundamentales de la arquitectura de software.</p>
<div><span>#arquitectura </span><span>#agilismo </span><span>#software-design </span></div>
</article></section>
```

- Los tags llegan transformados a array SIN `#` (`["arquitectura","agilismo","software-design"]`) y el componente añade `#` al renderizar, tal como exige el acceptance.
- El `ts(2769)` queda resuelto: `.astro/content.d.ts` regenerado con `DataEntryMap` conteniendo `"architecture"` y `ContentConfig = typeof import("./../src/content.config.js")` → `getCollection('architecture')` tipada correctamente.

## Archivos tocados

| Archivo | Cambio | Por qué |
|---------|--------|---------|
| `src/content.config.ts` (NUEVO) | Colección `architecture` con loader `glob({ base: "./src/content/architecture", pattern: "**/*.md" })` y schema Zod: `title`, `author`, `img` (string), `readtime` (z.number(), el frontmatter es `15`), `description` (string), `tags` (z.string() → transform a array sin `#`, separador espacios), `created`/`updated` (z.string(), el frontmatter es `"10 Agosto 2026"` — NO `z.date()`), 24 líneas | Es la ubicación que Astro 7 exige (`getContentPaths` → `searchConfig` busca `content.config.ts` en `srcDir`); sin él no se generan tipos ni se puebla la colección |
| `src/components/latest-articles.astro` | Eliminada línea 5 `console.log(arch_articles);` | Debug prohibido por `docs/architecture.md` (regla 5: "No dejes ... print() de debug") |

## Desviaciones del alcance

1. **Loader `glob()` añadido a la colección.** El encargo decía "colección tipada con Zod" sin mencionar loader. Sin el loader, Astro 7.2.0 (default `legacy.collectionsBackwardsCompat: false`) considera la colección legacy, el sync la omite y el build falla en runtime con `The collection "architecture" does not exist or is empty` + página sin artículos (verificado empíricamente en el build intermedio). El loader es la forma canónica de Astro 7 y es condición necesaria para cumplir el acceptance (colección funcional). El cambio vive dentro del propio `src/content.config.ts`; no se tocó ningún otro archivo fuera del alcance.
2. **No se ejecutó `./init.sh` completo** (fallará por piezas del harness ajenas: sin `feature_list.json`, sin `scripts/check-format.mjs`, sin script `test`). Conocido y fuera de responsabilidad según instrucciones del líder; la verificación de esta sesión es `pnpm build` (valida schema, frontmatter y build completo).
3. **Observación (sin tocar):** existe `src/config.ts` con una definición de colecciones en ubicación NO reconocida por Astro (`searchConfig`/`searchLegacyConfig` solo miran `content.config.*` y `content/config.*`). Es código muerto (nadie lo importa, `grep getCollection|defineCollection` solo lo referencia a él mismo). Fuera del alcance: no se modificó; se deja para decisión del líder/reviewer.

## Estado final de la verificación

- `pnpm.cmd build` → **VERDE** (exit 0, sin warnings ni errores).
- `getCollection('architecture')` devuelve el artículo real: título, autor, `readtime: 15`, description y tags transformados renderizados correctamente en `dist/index.html`.
- Tipos regenerados: `ts(2769)` resuelto (DataEntryMap incluye `"architecture"`).
- `console.log` eliminado del componente.
- Sin archivos temporales; `git status`: `M src/components/latest-articles.astro`, `?? src/content.config.ts` (+ `progress/current.md` de sesión).
