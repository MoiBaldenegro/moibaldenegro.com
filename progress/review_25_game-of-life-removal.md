# Review — feature 25 `game-of-life-removal`

**Veredicto:** APPROVED

Fecha: 2026-08-13. Revisión independiente en disco (verificaciones reproducidas
por el reviewer, no solo leídas del informe).

## Evidencia reproducida

| Verificación | Resultado |
|---|---|
| `node --test tests/game-of-life-removal.test.mjs` | 8/8 pass (REQ-25-01..07) |
| `pnpm test` | 158/158 pass, 0 fail |
| `pnpm build` | OK: `/about`, `/posts/00-agilismo`, `/posts/01-diseño-detallado`, `/index.html` |
| `./init.sh` | ✔ "El entorno está perfecto" |
| `node --test tests/harness-kit-integrity.test.mjs` | 7/7 pass (sin token 'hero' en el kit) |
| `node scripts/check-format.mjs` | FORMATO ✔ |
| `grep -rin "game-of-life\|GameOfLife\|gol-canvas\|gol-render\|mountGameOfLife\|--opacity-gol\|--size-gol-cell\|--opacity-hero" src/` | 0 resultados (exit 1) |
| Mismo grep en `scripts/ docs/ templates/ README.md AGENTS.md KICKOFF.md CHECKPOINTS.md package.json astro.config.mjs` | 0 resultados |
| Archivos eliminados (5 src + 3 tests) y `src/utils/` | inexistentes en disco |

Nota: un `pnpm build` directo del reviewer falló una vez por un chunk obsoleto
de `dist/`; fue condición de carrera del reviewer al lanzar build e `init.sh`
en paralelo sobre el mismo `dist/`. Reproducido en secuencia (`rm -rf dist &&
pnpm build`) → verde. No es defecto del implementer.

## Cobertura REQ-25-01..08

| REQ | Evidencia |
|---|---|
| REQ-25-01 | Test 1 verde; `ls` confirma ausencia de `GameOfLifeBackground.astro`, `game-of-life.ts`, `game-of-life-canvas.ts`, `gol-render.ts`, `game-of-life.css` y del directorio `src/utils/`. |
| REQ-25-02 | Test 2 verde; `ls tests/` confirma ausencia de `game-of-life-engine/background/gol-performance.test.mjs`. |
| REQ-25-03 | Test 3 verde; `tokens.css` tiene 87 líneas, sin `--opacity-gol`, `--size-gol-cell` ni `--opacity-hero`; resto de tokens intactos (color/radio/espaciado/contenedor/sombra/transición/tipografía). |
| REQ-25-04 | Test 4 verde; `Layout.astro` 35 líneas sin import ni comentario GOL; `ClientRouter` y navbar intactos; ≤100 líneas. |
| REQ-25-05 | Test 5 verde; `hero-section.css` 51 líneas conserva `.hero-background` (REQ-03-02, exigido por `tests/hero-section-styles.test.mjs`, verde) sin tokens de opacidad; ≤100 líneas. |
| REQ-25-06 | Test 6 verde; `docs/architecture.md` 81 líneas sin `GameOfLifeBackground`/`game-of-life` y sin token 'hero' (líneas 15 y 56 con `LatestArticles`/`HtbStadistics`); `harness-kit-integrity` 7/7. |
| REQ-25-07 | Tests 7 y 8 verdes: escaneo recursivo de `src/` → 0 cadenas; en `tests/` solo `game-of-life-removal.test.mjs` las menciona (Decisión 6 del design). Grep extendido del reviewer fuera de src/tests también 0. |
| REQ-25-08 | Suite 158/158, build OK con rutas `/posts`, `./init.sh` en verde. |

## Juicio EXPLÍCITO: cambio a `tests/article-card-images.test.mjs` (REQ-17-09)

**Veredicto del juicio: AUTORIZADO por la spec 25, justificado y correctamente
documentado.** No requiere discusión.

1. **La spec 25 prevé el efecto colateral.** REQ-25-03 ordena eliminar los
   tokens GOL y `--opacity-hero` de `tokens.css`; el `design.md` anuncia
   explícitamente el cambio de conteo ("tokens.css pasa de 96 a ~89 líneas",
   sección Tokens usados). REQ-25-08 exige la suite verde, lo que hace
   inevitable ajustar la aserción de conteo exacto del REQ-17-09 (96).
   Discrepancia menor: el design estimaba ~89 y el resultado real es 87; la
   estimación era aproximada ("~", 9 líneas eliminadas: 3 tokens + comentarios
   + separadores) y ninguna aserción de la spec 25 fija un conteo, así que no
   es material.
2. **La semántica del REQ-17-09 se conserva.** El test mantiene las 3
   aserciones "sin tokens nuevos" (`--aspect-`, `--ratio-`, `--radius-image`,
   líneas 179-196 de `tests/article-card-images.test.mjs`) y solo actualiza el
   conteo exacto a 87 con un comentario que referencia REQ-25-03 (líneas
   18-22 y 170-177). El contrato "no añadir tokens" queda íntegro.
3. **No hay OTRAS aserciones de conteo de tokens.css que se rompan.** Grep
   completo de `tests/`: solo `article-card-images.test.mjs` (87, actualizado),
   `htb-stadistics-section.test.mjs` REQ-22-05 (`<= 100`, tolerante — verde) y
   `design-tokens.test.mjs` (`<= 100`, verde). Ningún otro test fija 96.
4. **Precedente del arnés:** la feature 21 adaptó `tests/about-page.test.mjs`
   (REQ-11-05) al output real del adapter; las features 18-20 restauraron
   tests de features cerradas. El patrón "una feature nueva ajusta un test
   heredado cuando su requisito colisiona directamente" está establecido y el
   comentario del test documenta el porqué.
5. **Sin fuga GOL:** el comentario nuevo del test 17 no contiene ninguna de las
   8 cadenas prohibidas por REQ-25-07 (el test 8 de la 25 escanea `tests/` y
   pasa).

## Archivos eliminados y tocados vs alcance permitido

**Eliminados (8 + directorio):** `GameOfLifeBackground.astro`,
`game-of-life.ts`, `game-of-life-canvas.ts`, `gol-render.ts`,
`game-of-life.css`, `game-of-life-engine.test.mjs`, `game-of-life-background.test.mjs`,
`gol-performance.test.mjs`, y el directorio `src/utils/` (vacío). — Todos
dentro del alcance REQ-25-01/02.

**Creados:** `tests/game-of-life-removal.test.mjs` (197 líneas, 8 tests
REQ-25-01..07). — Dentro del alcance.

**Modificados (5):** `Layout.astro` (37→35), `tokens.css` (96→87),
`hero-section.css` (58→51), `docs/architecture.md` (ejemplos líneas 15/56),
`tests/article-card-images.test.mjs` (REQ-17-09, juzgado arriba). — Los 4
primeros son exactamente los archivos que REQ-25-03..06 ordenan tocar; el
quinto es la adaptación colateral autorizada.

**Sin tocar (verificado):** `src/pages/posts/[id].astro` (37 líneas,
`transition:name` intactos — contrato feature 24), `htb-stadistics.astro`
(38), `latest-articles.astro` (30, `transition:name` intactos), dominio
(`post.ts` 14, `posts-repository.ts` 90), repositorios JSON, resto de tests
(todos verdes en la suite). Las features 14-16 permanecen `done` en
`feature_list.json` y sus specs/artefactos son historial inamovible
(Decisión 5 del design).

## Ciclo rojo → verde (pregunta de revisión)

Sí. `progress/impl_25_game-of-life-removal.md` documenta el test escrito
primero contra la spec 25, con la salida ROJA capturada (8/8 fail, mensajes
por REQ) antes de implementar y la salida VERDE (8/8 pass) después. La suite
final quedó verde (158/158 reproducido). Dependencias: la feature 25 no
declara `depends_on`; sus predecesoras (14-16, y el resto del arnés) están
`done`.

## Observaciones

- El look del hero no cambia: `--opacity-hero` estaba inactivo (comentado);
  el hero renderiza a opacidad plena desde antes (aspecto aprobado).
- La suite pasa de 190 a 158 tests: los subtests de las features 14-16 se
  fueron con sus archivos; el acceptance de la 25 no fija conteo y exige solo
  suite verde + build + init.sh (cumplido).
- Sin dependencias nuevas, sin JS de runtime, sin tokens nuevos.
