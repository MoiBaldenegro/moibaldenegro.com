# Review — feature content-config

**Veredicto:** APPROVED

## Nota previa sobre el protocolo

- `CHECKPOINTS.md` **no existe** en este repositorio (verificado con glob y `Test-Path`). El
  recorrido de checkpoints se hace contra `docs/architecture.md`, `docs/conventions.md` y el
  alcance acordado por el líder (documentado en `progress/current.md`).
- `./init.sh` se ejecutó (Git Bash). Termina en rojo, pero **los 3 fallos son preexistentes y
  ajenos a esta feature**, tal como declaró el líder (harness a medio montar, fuera de alcance):
  - `feature_list.json existe` ✘ — el archivo no existe en el repo (nunca ha existido).
  - `formato de feature_list.json y progress/current.md` ✘ — cascada del fallo anterior.
  - `tests al 100% (node:test)` ✘ — `package.json` no define script `test` (solo `dev/build/preview/astro`).
  - `build de producción` ✔ — el check de build del arnés **pasa**.
  Ninguno de los fallos está causado por los cambios de esta feature; el build (verificación de
  sesión acordada) está verde.

## Checkpoints (contra alcance acordado + docs)

- C1 — `src/content.config.ts` existe y es la ubicación canónica de Astro: [x]
  - 29 líneas (≤100, `architecture.md` regla 12). Usa `defineCollection` (`astro:content`),
    `glob` (`astro/loaders`) y `z` (`astro/zod`), todo del paquete `astro` ya instalado — sin
    dependencias externas nuevas (regla 2).
  - Verificado en `node_modules/astro/dist/content/utils.js:556-570`: `searchConfig` busca solo
    `content.config.{mjs,js,mts,ts}` en `srcDir` → la ruta `src/content.config.ts` es la
    reconocida por Astro 7.2.0. `.astro/content.d.ts:166` regenerado:
    `ContentConfig = typeof import("./../src/content.config.js")`.
- C2 — El schema coincide con el frontmatter REAL de `src/content/architecture/00-agilismo.md`: [x]
  - `title/author/img/description` → `z.string()` ✔ (frontmatter: cadenas).
  - `readtime` → `z.number()` ✔ (frontmatter línea 5: `readtime: 15`, número sin comillas).
  - `tags` → `z.string().transform(...)` que hace `split(/\s+/)`, quita `#` inicial, `trim()` y
    filtra vacíos → devuelve `["arquitectura","agilismo","software-design"]` (sin `#`). ✔
  - `created`/`updated` → `z.string()` ✔ (frontmatter: `"10 Agosto 2026"` — NO es fecha ISO;
    `z.date()` habría roto el sync. La decisión de no usar `z.date()` es correcta).
  - El sync de Astro valida el schema contra el frontmatter real y el build pasa → fidelidad
    confirmada empíricamente, no solo por lectura.
- C3 — `src/components/latest-articles.astro` sin `console.log`: [x]
  - `git diff` muestra exactamente una línea eliminada (la 5, `console.log(arch_articles);`).
    El archivo actual (22 líneas) no contiene `console` ni debug. El frontmatter se limita a
    imports y paso de datos (regla 8: lógica separada de UI; el transform de tags vive en el
    schema, no en el componente).
- C4 — Desviación del loader `glob()`: legítima y NECESARIA: [x]
  - `node_modules/astro/dist/core/config/schemas/base.js:291`:
    `collectionsBackwardsCompat: z.boolean().optional().default(false)` → legacy OFF por defecto en 7.2.0.
  - `node_modules/astro/dist/content/content-layer.js:219-227`: con `backwardsCompatEnabled=false`,
    toda colección con `type !== CONTENT_LAYER_TYPE` se omite del sync (`return` en línea 222); y
    aunque se active compat, una colección sin `loader` también se omite (línea 225).
  - `node_modules/astro/dist/content/runtime.js:97`: el error `does not exist or is empty` que
    aparecía en ROJO. Sin el loader, el acceptance (artículo renderizado en la página) falla.
  - El loader no rompe convenciones: sin deps nuevas, archivo dentro del límite de líneas, patrón
    canónico de Astro 7 (no es un script del arnés ni toca UI).
- C5 — `pnpm build` en verde, verificado por el revisor: [x]
  - Ejecución propia: exit 0, sin warnings, `[content] Synced content`, `1 page(s) built`.
  - `dist/index.html` (leído en UTF-8): `<h2>Agilismo, diseño y fragilidad</h2>`,
    `Por Moises Baldenegro Melendez • 15 min de lectura`, descripción y
    `<span>#arquitectura </span><span>#agilismo </span><span>#software-design </span>` (el
    componente añade `#` al renderizar, tal como exige el acceptance).
  - `ts(2769)` resuelto: `.astro/content.d.ts:126-137` → `DataEntryMap` incluye `"architecture"`,
    por lo que `getCollection('architecture')` recibe la clave tipada.
- C6 — Alcance respetado (`git status --porcelain`): [x]
  - Únicamente: `M src/components/latest-articles.astro`, `?? src/content.config.ts`,
    `M progress/current.md`, `?? progress/impl_content-config.md` (artefactos de sesión
    permanentes, permitidos por el lifecycle). Nada del harness tocado (no hay cambios en
    `scripts/`, `init.sh`, `package.json`; `feature_list.json` ni siquiera existe).
- C7 — Evidencia rojo/verde documentada (pregunta de revisión): [x]
  - Este repo no tiene suite de tests de aplicación (`package.json` sin script `test`); el ciclo
    TDD aplicable a este fix es el red/green del build, y está documentado en
    `progress/impl_content-config.md` (ROJO: error `The collection "architecture" does not exist
    or is empty` + `[]` del console.log; VERDE: build limpio + HTML renderizado). El verde fue
    reproducido por el revisor; el rojo es consistente con el estado previo del repo (sin content
    config, `DataEntryMap` vacío → colección inexistente en runtime).
- C8 — `src/config.ts` (código muerto): observación, NO bloqueante: [x]
  - Verificado: nada lo importa (grep de imports a `config` en `src/` sin resultados) y Astro
    jamás lo busca (`utils.js:556-570` solo mira `content.config.*` y `content/config.*`).
    Es código trackeado preexistente, sin cambios. No afecta al runtime ni al build de esta
    feature. **No bloquea**: se registra como observación para el backlog (candidato a borrado o
    migración en una feature futura).

## Observaciones no bloqueantes (para backlog, no para esta ronda)

1. `src/config.ts` es código muerto (duplica el schema de `src/content.config.ts` en una
   ubicación que Astro no reconoce). Candidato a eliminación en una feature futura.
2. `CHECKPOINTS.md` referenciado por `AGENTS.md` no existe en el repo; el arnés está a medio
   montar (sin `feature_list.json`, sin script `test`). Corresponde a otra sesión, ya señalado
   por el líder.
