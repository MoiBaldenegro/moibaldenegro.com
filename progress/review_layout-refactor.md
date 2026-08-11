# Review — feature 08 layout-refactor

**Veredicto:** APPROVED

**Fecha:** 2026-08-10 (reviewer, nivel 1)
**Spec:** `specs/08_layout-refactor/requirements.md` (REQ-08-01..06) + `design.md` (Decisiones 1-3)
**Acceptance:** feature id 8 de `feature_list.json` (5 acceptance)

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?

**Sí, con evidencia coherente con el disco.**
- ROJO inicial 6/6 (`impl_layout-refactor.md` líneas 33-59): `node --test tests/layout-refactor.test.mjs` contra el layout starter intacto y sin `layout.css` → fail en los 6 REQ (`lang="en"`, título "Astro Basics", sin prop title, `layout.css` no existe, sin navbar en el layout). Coherente con la estructura del test actual (cada subtest fallaría exactamente así contra el estado previo).
- ROJO reproducible 3/6 (líneas 61-75): retirando temporalmente `layout.css` → fallan REQ-08-04/05/06 (los que dependen de la hoja), pasan 01-03 (que dependen de `Layout.astro`, ya implementado). Restaurado → verde 6/6. Reproducción honesta.
- VERDE final: feature 6/6 → suite completa **53/53 re-ejecutada por mí** (`# pass 53 / # fail 0`).

## Verificación ejecutada por mí (evidencia concreta)

| # | Punto | Resultado | Evidencia |
|---|-------|-----------|-----------|
| 1 | `node --test "tests/**/*.test.mjs"` | ✔ 53/53 | `# tests 53 / # pass 53 / # fail 0`, exit 0. |
| 2 | `node scripts/check-format.mjs` | ✔ | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, exit 0. |
| 3 | `pnpm build` | ✔ | `1 page(s) built in 725ms / Complete!`, exit 0. |
| 4 | `bash ./init.sh` | ✔ | Todas las comprobaciones ✔ → `✔ El entorno está perfecto. Podemos empezar a trabajar.`, exit 0. |
| 5 | Dev server (background + HTTP) | ✔ | `HTTP 200` en `/`; `lang="es"` ✔; `<title>moibaldenegro.com</title>` ✔; `class="site-navbar"` **1 sola vez**; `hero-navbar` 0 coincidencias; sin `<style>` embebido en body; enlaces Home/About/@moibaldenegro ✔; `/src/styles/layout.css` HTTP 200 con `.site-navbar` y sin hex/rgba fuera de comentarios. |
| 6 | HTML de build (`dist/index.html`) | ✔ | `lang="es"` ✔; title `moibaldenegro.com` ✔; `site-navbar` 1 vez; `hero-navbar` 0; sin `<style>` en body; 3 enlaces ✔. Bundle `dist/_astro/index.*.css`: `.site-navbar` presente, `.hero-navbar` ausente, `body{background:var(--color-background)` presente. |

## Verificación por REQ / acceptance

| Acceptance (feature_list.json) | REQ | Resultado | Evidencia |
|---|---|---|---|
| Layout.astro declara `lang="es"` y el título por defecto moibaldenegro.com | REQ-08-01, REQ-08-02 | ✔ | `Layout.astro` línea 13 `<html lang="es">`; línea 20 `<title>{title ?? 'moibaldenegro.com'}</title>`. Test 1-2 verdes. |
| Una página puede pasar un título propio al layout | REQ-08-03 | ✔ | `interface Props { title?: string }` (líneas 5-7) + `const { title } = Astro.props` (línea 9) + `{title ?? 'moibaldenegro.com'}`. Test 3 verde (declara prop + lee `Astro.props`). `index.astro` usa el default — correcto. |
| Layout.astro sin `<style>` y `src/styles/layout.css` importada | REQ-08-04 | ✔ | Layout.astro solo imports de `tokens.css` + `layout.css` (líneas 2-3); grep `<style` en el archivo sin coincidencias; `layout.css` existe (53 líneas). Test 4 verde. |
| La navbar con Home About y @moibaldenegro se renderiza desde el layout | REQ-08-05 | ✔ | `<header class="site-navbar">` con los 3 enlaces en Layout.astro (líneas 23-29); `new-hero.astro` sin navbar (leído: ni `<header>` ni `x.com` ni `hero-navbar`); `hero-section.css` sin `.hero-navbar` (49 líneas, solo fondo/cuadrícula). Dev server y build con `site-navbar` 1 vez. Test 5 verde. |
| `tests/layout-refactor.test.mjs` verifica layout.css ≤100 líneas y sin valores sueltos | REQ-08-06 | ✔ | Test 6 verde: 53 líneas ≤100; sin hex ni `rgb()/rgba()` fuera de comentarios; todas las props de color/radio/transición con `var(--)`. Verificado además por mí: cada token usado en `layout.css` (`--color-background`, `--color-text`, `--color-navbar`, `--color-border-strong`, `--color-accent`, `--color-accent-hover`, `--color-scrollbar-thumb/track`, `--container-max`, `--radius-pill`, `--transition-default`, `--font-sans`) existe en `tokens.css`. |

## Arquitectura / convenciones (archivos tocados)

- **Un solo layout:** `src/layouts/` contiene únicamente `Layout.astro` (glob verificado).
- **Estilos separados de la UI:** sin `<style>` en `Layout.astro` ni `new-hero.astro`; estilos en `src/styles/layout.css`.
- **Chrome compartido solo en el layout:** navbar única; `new-hero.astro` (87 líneas) quedó solo con su sección.
- **Tokens, no valores sueltos:** `layout.css` solo `var(--...)`; valores literales únicamente dimensiones/posicionamiento (74px, 42px, 0.95rem, 18px, blur(18px), z-index, width/height), misma lectura que en la feature 3 (REQ-03-05).
- **≤100 líneas:** `Layout.astro` 32, `layout.css` 53, `new-hero.astro` 87, `hero-section.css` 49, test 196 (el límite de 100 se aplica a código de la app; el test es del arnés — precedente reviews 01/02/03).
- **Sin dependencias nuevas** (CSS puro + node:test).
- **Media queries al final** (conventions.md): `@media (max-width:768px)` al final de `layout.css` (líneas 50-53).

## Legitimidad del ajuste a `tests/hero-section-styles.test.mjs` (REQ-03-02)

**Legítimo y documentado.** La descripción de la feature 3 anticipa el traslado: "La navbar se moverá al layout en la feature 8; aquí solo se extraen sus estilos". Al mover la navbar al layout (Decisión 1 de design.md), los estilos `.hero-navbar` dejaron de pertenecer al hero; retirar el selector de REQ-03-02 es consecuencia directa y necesaria (de lo contrario la suite de la feature 3 fallaría). El comentario del test (líneas 15-17) y el informe `impl_layout-refactor.md` (punto 5) lo documentan; los selectores restantes (`.new-hero`, `.hero-background`, `.hero-gradient`, `.hero-grid`) siguen verificados. Los valores de la navbar migraron idénticos vía tokens (`--color-navbar` = rgba(8,8,18,.75) original, `--color-border-strong`, `--color-accent-hover`, `--radius-pill`, `--transition-default`). El comportamiento verificado en la feature 3 ("hero idéntico") se conserva: la navbar se sigue renderizando (desde el layout) con los mismos valores.

## Checkpoints (CHECKPOINTS.md)

- C1 — Estilos separados de la UI: [x] — Layout.astro y new-hero.astro sin `<style>`; layout.css importada.
- C2 — Lógica fuera de la UI: [x] — Layout.astro: solo imports y `Astro.props`.
- C3 — Ningún componente lee JSON directamente: [ ] — N/A en esta feature (`new-hero.astro` sigue leyendo `hero.data.ts`; migración planificada en feature 9). Precedente reviews 01-03.
- C4 — Tokens, no valores sueltos: [x] — layout.css solo `var(--...)`.
- C5 — ≤100 líneas por archivo: [x] — todos los archivos tocados ≤100.
- C6 — Sin dependencias externas: [x].
- Datos del dominio válidos: [ ] — N/A (no toca datos).
- Repositorios con errores nombrados: [ ] — N/A.
- `./init.sh` en verde: [x] — ejecutado por mí, exit 0.
- UI correcta desktop/móvil: [x] — dev server HTTP 200 con navbar única y media 768 presente en layout.css.
- `feature_list.json` con la tarea en `done`: [ ] — correctamente en `in_progress` (pasará a `done` tras este APPROVED, protocolo).
- `progress/current.md` documenta la sesión: [x] — bitácora con rojo → implementación → verde.
- Sin temporales/`print()`/TODOs: [x] — sin restos.

## Cambios requeridos

Ninguno.

## Observaciones (no bloqueantes)

1. `src/components/Welcome.astro` (starter) conserva un `<style>` embebido (línea 44) — es el único match de `<style>` en `src/`. Preexistente, fuera del alcance de la feature 8; su eliminación está planificada en la feature 12 (REQ-12-04: "src/components/Welcome.astro y src/ui ya no existen").
2. El árbol git acumula las features 1-7 sin commits intermedios (`git status` muestra spec/domain/styles/progress de features anteriores); `git status` no muestra cambios fuera del alcance declarado para la feature 8 (Layout.astro, layout.css, new-hero.astro, hero-section.css, layout-refactor.test.mjs, hero-section-styles.test.mjs, feature_list.json, progress/current.md, impl_layout-refactor.md). Sin restos ajenos de la sesión concurrente en los archivos de esta feature.
3. design.md (tabla de tokens) menciona `--color-surface` para el fondo de la navbar; la implementación usa `--color-navbar` (token translúcido original rgba(8,8,18,.75)) que preserva el aspecto idéntico — mismo criterio ya aceptado en review_03 (observación 2). No bloqueante.
4. `layout.css` se sirve completa en dev (`/src/styles/layout.css` HTTP 200), confirmando que Astro no requiere procesamiento adicional para la hoja importada.

## Conclusión

La feature 8 cumple REQ-08-01..06 y sus 5 acceptance. Ciclo rojo/verde real y verificable (ROJO 6/6 con starter intacto + ROJO reproducible 3/6; VERDE 6/6). Re-ejecuté la suite completa **53/53**, `check-format`, `pnpm build`, `./init.sh` (todo verde) y el dev server (HTTP 200, navbar única `site-navbar` ×1, sin `hero-navbar`, sin `<style>` embebido, título y `lang="es"` correctos). El ajuste del test de la feature 3 es consecuencia legítima y documentada del traslado planificado de la navbar. Arquitectura respetada: un solo layout, estilos separados, tokens, ≤100 líneas, chrome compartido solo en el layout. **APPROVED.**
