# Review — feature 22

**Veredicto:** APPROVED

## Checkpoints
- C1: [x] — Los 5 hrefs declaran `/posts/<entry.id>` reales: `00 next → /posts/01-diseño_detallado` (REQ-22-01), `01 next → /posts/02-principios` (REQ-22-02), `02 next → /posts/03-principios_solid` (REQ-22-03), `03 related → [/posts/00-agilismo, /posts/01-diseño_detallado]` (REQ-22-04). Verificado en `git diff -- src/content/architecture/`.
- C2: [x] — `related` complementario en 00/01/02 (REQ-22-05): 00→02, 01→03, 02→00 — cruzados, no el siguiente de la cadena; asercionado por `tests/next-related-hrefs-fix.test.mjs` líneas 91-106.
- C3: [x] — Integridad referencial sin espacios (REQ-22-06/07): el test audita cada ruta contra el glob real del directorio (`entryIds()`, líneas 108-148) y ningún valor del diff contiene espacios.
- C4: [x] — Alcance mínimo: `git status --short` muestra solo 4× `src/content/architecture/*.md` (frontmatter) + `tests/next-related-hrefs-fix.test.mjs` (nuevo) + `tests/next-post-data.test.mjs` (CHAIN). Sin toques a `src/domain`, `src/pages` ni `src/styles`; capas de `docs/architecture.md` intactas.
- C5: [x] — Ajuste colateral justificado + suite verde: `tests/next-post-data.test.mjs` líneas 11-13 documenta el precedente REQ-43-06 (el test sigue al dato real); los fixtures unitarios REQ-18-03/04/05 validan solo formato y siguen verdes sin cambios. `./init.sh` ejecutado por el reviewer: formato ✔, tests 100% ✔, build ✔, «El entorno está perfecto».

## Pregunta de revisión
¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final? Sí: `progress/impl_22.md` §"Ciclo rojo/verde" evidencia `tests/next-related-hrefs-fix.test.mjs` en rojo 0/7 antes del fix (con mensajes REQ-22-01/07 citados) y en verde 45/45 tras el fix junto a las suites vecinas (`next-post-data`, `related-posts-data`, `related-posts-list`, `next-post-button`, `posts-repository`); `./init.sh` verde re-verificado por el reviewer. ¿Se saltó una dependencia pendiente? No: la feature 22 declara `depends_on: []` en `feature_list.json`, sin dependencias que satisfacer.

## Cambios requeridos (si aplica)
Ninguno.
