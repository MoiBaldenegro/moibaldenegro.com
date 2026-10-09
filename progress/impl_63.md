# Informe de implementación — feature 63 theme-color-dark

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible).

## Ciclo rojo/verde (REQ-63-06)

- Test nuevo `tests/theme-color-dark.test.mjs` escrito primero contra la spec.
- ROJO antes de tocar producción: `ℹ pass 0 / ℹ fail 5` (falta theme.ts, manifest en
  #ffffff, Layout sin meta ni import, build sin meta).
- VERDE tras el cambio: 5/5 (+ los 4 de manifest-generator-cleanup siguen verdes). Suite
  completa 766/766; `./init.sh` en verde.

## Cambios

- `src/domain/seo/theme.ts` (nuevo, 5 líneas): `export const THEME_COLOR = '#070716'`,
  réplica de `--color-background` (opaco; --color-navbar es rgba y el manifest exige opaco).
- `public/site.webmanifest`: `theme_color` y `background_color` de `#ffffff` a `#070716`.
- `src/layouts/Layout.astro` (66 líneas): `import { THEME_COLOR } from '../domain/seo/theme.ts'`
  y `<meta name="theme-color" content={THEME_COLOR} />` junto al link del manifest. Sin
  literales de color en el componente.

## Verificación

- Test de igualdad token = constante = manifest (REQ-63-01/02): si alguien cambia
  --color-background sin actualizar la constante o el manifest, la suite falla.
- Build real en outDir temporal (REQ-63-05): portada, /about y un post contienen
  `<meta name="theme-color" content="#070716">`. También comprobado en `dist/client/index.html`
  del build de `./init.sh`.

## Ronda 2 (CHANGES_REQUESTED en review_63.md)

1. `src/domain/search/normalize.ts` (+`if (!text) return '';`) **no pertenece a la feature 63**
   y no lo escribió el implementer. Su mtime (09:42:58) cae durante la pasada de la suite, pero
   ningún test ni script escribe ese archivo (grep de writeFileSync/copyFileSync/renameSync
   sobre tests/ y scripts/ sin resultados, y la guarda src-write-guard de la feature 59 sigue
   verde). Es una edición externa, probablemente manual del humano. No se revierte sin su
   decisión, para no destruir trabajo ajeno posiblemente intencional. Queda fuera del alcance de la 63
   (ningún archivo de la 63 depende de él) y se ha señalado al humano. Si lo quiere conservar, se
   tramitará como feature propia con su test.
2. `progress/current.md` documenta ahora la feature 63: inicio, plan y bitácora con rojo, verde,
   revisión y esta ronda.
