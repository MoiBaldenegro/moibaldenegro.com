# Review — feature 33

**Veredicto:** APPROVED

Feature: `broken-resources-fix`. Spec: `specs/33_broken-resources-fix/requirements.md`.
Implementer: el líder en rol de implementer (autorización humana explícita); revisado con el mismo rigor.
Fuera de alcance: cambios de las features 31/32 (ya APPROVED), `feature_list.json`, `docs/dependencies.md`, `progress/`, `specs/`.

## Verificación por requisito

- REQ-33-01: `git diff src/layouts/Layout.astro` elimina las dos líneas `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` (las antiguas :20 y :27). `grep -r favicon.svg src dist` no devuelve nada. [x]
- REQ-33-02: también elimina el `<link rel="icon" href="/favicon.ico" />` duplicado (el antiguo :28). Quedan una sola vez: favicon-96x96.png, favicon.ico (shortcut icon), apple-touch-icon.png y site.webmanifest. Lo confirma `dist/client/index.html`. [x]
- REQ-33-03: el test recorre los `href`/`src` locales del Layout y comprueba que existen en `public/`. `public/` contiene apple-touch-icon.png, favicon-96x96.png, favicon.ico y site.webmanifest. [x]
- REQ-33-04: `03-principios_solid.md:5` pasa de `img: arch03.webp` a `img: arch00.webp`, y `public/assets/content/arch00.webp` existe. [x]
- REQ-33-05: `postFiles()` recorre `src/content/posts/` de forma recursiva y comprueba el `img` de cada post. Pasa con los 8 posts. [x]
- REQ-33-06: `progress/impl_33.md` documenta el rojo previo (5 fallos, 1 OK; el de REQ-33-07 ya pasaba antes del cambio, como cabe esperar en una guarda de tamaño) y el verde final (581/581). [x]
- REQ-33-07: Layout.astro tiene 43 líneas y el test nuevo 54. `03-principios_solid.md` tiene 105 líneas, pero ya las tenía en HEAD (`git show HEAD:... | wc -l` = 105): la feature solo cambia 1 línea del frontmatter y no añade ninguna. Es prosa editorial, no código, así que la regla de "líneas de código" de `docs/architecture.md §12` no se aplica (mismo criterio que en `progress/review_28.md:227`; `02-principios.md` tiene 173). Con la letra del acceptance 7 ("archivos de src/ modificados") esto queda en el límite, por eso lo anoto como observación y no como bloqueo. [x]
- REQ-33-08: `./init.sh` en verde (entorno, formato, tests al 100 % y build). `node --test tests/broken-resources-fix.test.mjs` da 6/6. [x]

`depends_on`: la feature 33 no declara dependencias, así que no salta ninguna pendiente.

Pregunta de revisión: sí. El test se escribió antes del código y quedó en rojo (evidencia en `progress/impl_33.md`, sección "Ciclo rojo/verde"), y la suite terminó en verde (re-ejecutada por el reviewer con `./init.sh`).

## Checkpoints
- Estilos en src/styles, sin `<style>` en .astro: [x] (la feature no toca estilos)
- Sin lógica JS en UI; el frontmatter solo importa y pasa datos: [x] (no se toca el frontmatter de Layout)
- Ningún componente lee JSON directamente: [x]
- Tokens, sin valores hardcodeados: [x] (no aplica)
- Ningún archivo supera las 100 líneas de código: [x] (ver la nota de REQ-33-07 sobre la prosa del post)
- Sin dependencias externas nuevas: [x]
- Datos JSON válidos y repositorios con errores nombrados: [x] (no se tocan)
- `./init.sh` en verde: [x]
- La página se ve correcta en desktop y móvil: [ ]  ← Razón: no hay inspección visual en navegador por parte del reviewer; el cambio no afecta al layout visual.
- `feature_list.json` con la tarea en done: [ ]  ← Razón: la feature sigue `in_progress`; el cierre lo hace el líder después de este APPROVED.
- `progress/` al día: [x]
- Sin temporales, debug ni TODOs: [x]

## Observaciones (no bloqueantes)
1. `tests/broken-resources-fix.test.mjs:52-54` (REQ-33-07) solo comprueba Layout.astro. El acceptance 7 habla de "archivos de src/ modificados". Si en el futuro se quiere una guarda literal, habrá que excluir de forma explícita la prosa de `src/content/`.
2. Queda pendiente que el humano aporte un `arch03.webp` propio (anotado en impl_33.md).

## Cambios requeridos
Ninguno.
