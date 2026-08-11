# Review — feature 4 hero-cards-styles

**Veredicto:** APPROVED

## Checkpoints
- C1: [x] — Estilos separados de la UI: `hero-card.astro` y `new-hero.astro` sin `<style>` ni `style=` inline; toda la presentación en `src/styles/` (hero.css eliminado; hero-card.css/profile-card.css/hero-section.css consumen tokens).
- C2: [x] — Frontmatter de los componentes de la feature solo importa y pasa datos (sin lógica).
- C3: [ ] — Razón: `new-hero.astro`/`hero-card.astro` aún importan `src/data/hero.data.ts`; pendiente de la feature 9 (hero-ui-refactor). Fuera del alcance de la feature 4.
- C4: [x] — Tokens, no valores sueltos: las dos hojas nuevas consumen únicamente `var(--...)` para colores, radios, sombras y transiciones (verificado por test REQ-04-03 y por lectura).
- C5: [x] — ≤100 líneas: hero-card.css 77, profile-card.css 66, hero-section.css 90, tokens.css 86.
- C6: [x] — Sin dependencias externas añadidas.
- C7: [ ] — Razón: datos en JSON con entidades/repositorios fuera de alcance (features 5-6); `hero.data.ts` sigue en TS hasta la feature 9.
- C8: [ ] — Razón: repositorios con errores nombrados pendientes (features 5-7).
- C9: [x] — `./init.sh` en verde, re-ejecutado por el reviewer: "El entorno está perfecto".
- C10: [x] — UI verificada: build genera las 12 tarjetas con `data-color-token`; dev server HTTP 200 sirviendo las hojas nuevas y 404 en hero.css (verificado por el implementer); media queries 1200/768 presentes en ambas hojas.
- C11: [ ] — Razón: feature 4 queda `in_progress` hasta el cierre del líder tras este APPROVED (correcto por protocolo del arnés).
- C12: [x] — `progress/current.md` documenta la sesión y la bitácora de la feature 4.
- C13: [x] — Sin archivos temporales ni debug; los comentarios "transitorio" de hero-section.css tienen contexto (feature 8).

## Verificación por puntos

### REQ-04-01 — Hojas en `src/styles/` e importadas desde sus componentes ✔
- `src/styles/hero-card.css` (77 líneas) y `src/styles/profile-card.css` (66 líneas) existen.
- `hero-card.astro` línea 2: `import "../styles/hero-card.css"`.
- `new-hero.astro` líneas 2-4: importa `tokens.css`, `hero-section.css` y `profile-card.css`; **no** importa `hero.css`.
- Test 1 de `tests/hero-cards-styles.test.mjs` en verde.

### REQ-04-02 — Fondo por `data-color-token` ✔
- `hero-card.css` líneas 56-67: 12 reglas `[data-color-token="react"…"twitch-bottom"] { --card-bg: var(--color-marca-*) }`, una por token de marca.
- `hero-card.astro` línea 14: `data-color-token={card.id}`.
- Los 12 `id` de `src/data/hero.data.ts` coinciden 1:1 con los tokens de marca de `tokens.css` (react, html, node, github, youtube, twitch, typescript, css, node-bottom, github-bottom, youtube-bottom, twitch-bottom).
- Bundle (`dist/_astro/index.tG7ZRJjs.css`): 12 selectores `[data-color-token=...]` y 12 `--card-bg:var(--color-marca-*)`; `dist/index.html` con 12 atributos `data-color-token="…"`, uno por tarjeta.

### REQ-04-03 — Solo tokens ✔
- Test 4 (var() en colores/radios/sombras/transiciones) y test 5 (sin hex ni rgb()/rgba()) en verde sobre ambas hojas.
- Lectura directa: `--radius-card`, `--color-border`, `--shadow-card-rest`, `--transition-default`, `--color-surface`, `--color-username-bg`, `--shadow-username`, etc.; cero literales de color. Los `border-radius: 50%` (círculos) están exentos por decisión documentada del impl (decisión 5) y el propio test los exime.

### REQ-04-04 — ≤100 líneas ✔
- hero-card.css 77, profile-card.css 66 (test 2 en verde; split `\n` = 78/67, dentro del límite).

### REQ-04-05 — `src/styles/hero.css` eliminada ✔
- `git status` muestra `D src/styles/hero.css`; el archivo no existe en disco.
- Test 6 en verde; cero referencias a `hero.css` en `src/` (solo comentarios en tokens.css) ni en el bundle (`grep hero\.css dist/` → 0).
- Contenido repartido según Decisión 3: reset global y scrollbar pasan a `hero-section.css` (90 líneas, ≤100; test REQ-03-04 de la feature 3 sigue en verde).

### design.md — Decisiones 1-3 ✔
- D1: mapeo `[data-color-token]` en la hoja (12 reglas). ✔
- D2: sin `style` inline; `grid-column: var(--card-column)` / `grid-row: var(--card-row)` en `.hero-card` con valores por token (test 7 en verde; bundle contiene ambas con var()).
- D3: hero.css eliminada por completo; contenido repartido entre las hojas 3 y 4. ✔

### Acceptance de feature 4 en `feature_list.json` (trazabilidad REQ) ✔
- A1 (REQ-04-01) ✔ — hojas existen e importadas desde sus componentes.
- A2 (REQ-04-03, REQ-04-04) ✔ — el test verifica ≤100 líneas y ausencia de valores sueltos.
- A3 (REQ-04-02) ✔ — reglas data-color-token para cada token de marca.
- A4 (REQ-04-05) ✔ — hero.css ya no existe.

### Ciclo rojo/verde ✔
- Test-first corroborado por timestamps del disco: `tests/hero-cards-styles.test.mjs` 17:51:41 < `hero-card.css` 17:52:22 < `profile-card.css` 17:52:28.
- ROJO documentado (6/7 fail retirando las dos hojas; solo REQ-04-05 pasa porque hero.css ya estaba eliminado) — coherente con la semántica del test: sin hojas fallan los tests 1-5 y 7, y el 6 depende solo de que hero.css no exista.
- VERDE reproducido por el reviewer: `node --test "tests/**/*.test.mjs"` → 23 pass / 0 fail.

### Comandos ejecutados por el reviewer (todos en verde)
- `node --test "tests/**/*.test.mjs"` → # tests 23, # pass 23, # fail 0.
- `node scripts/check-format.mjs` → "FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos".
- `pnpm build` → ✓ 1 page(s) built.
- `bash ./init.sh` → "✔ El entorno está perfecto. Podemos empezar a trabajar."

## Cambios requeridos
Ninguno.

## Observaciones
1. **Sesión concurrente (no bloqueo):** parte del trabajo de la feature ya existía en disco (timestamps 17:51-17:52) y el implementer lo verificó contra spec/design en lugar de duplicarlo, dejando su informe. La evidencia en disco confirma su relato: test 17:51:41, tokens.css 17:51:55, hero-card.css 17:52:22, profile-card.css 17:52:28, hero-card.astro 17:52:31, new-hero.astro 17:52:35, hero-section.css 17:52:43.
2. **Repositorio sin commits del arnés:** `tokens.css` y `hero-section.css` figuran como `??` (untracked) porque el trabajo de las features 2-4 nunca se commiteó (`hero.css` era la única hoja trackeada). Estado del repo, no defecto de esta feature.
3. **Fuera de alcance en `git status` (observación, no bloqueo):** `M package.json` (solo el script `test` de la feature 1), `M tests/harness-kit-integrity.test.mjs` (feature 1), `M progress/current.md` (bitácora de sesión), `?? specs/…` (features 1-3 y 5-13), `?? templates/`, `?? progress/research/`, `impl_*`/`review_*` de features 1-3, `impl_01_harness-kit-mount.md`/`impl_content-config.md` (informes anteriores). Ninguno pertenece a la feature 4.
4. **Decisión documentada:** `data-color-token={card.id}` ya se aplica en el componente (los ids actuales coinciden 1:1 con los tokens de marca); la feature 6 guardará `colorToken` en el JSON y la 9 conectará el atributo a la entidad. El mecanismo CSS no cambiará.
5. El atributo `style` inline desapareció de `hero-card.astro` (Decisión 2); el grid se mantiene funcional vía `--card-column`/`--card-row` con los valores reales de `hero.data.ts`.

## Conclusión
La feature 4 hero-cards-styles cumple REQ-04-01..05, las Decisiones 1-3 del design.md y los 4 criterios de aceptación de `feature_list.json`. Suite 23/23, formato, build e `./init.sh` en verde, re-ejecutados por el reviewer. Evidencia del ciclo rojo/verde real y coherente con el disco. Sin cambios requeridos: **APPROVED**.
