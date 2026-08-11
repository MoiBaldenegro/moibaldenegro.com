# Informe de implementación — feature 4 hero-cards-styles

- **Feature:** 4 — hero-cards-styles (extraer estilos de tarjetas y perfil del hero con tokens y data-color-token)
- **Spec:** `specs/04_hero-cards-styles/requirements.md` (REQ-04-01..05) + `design.md` (Decisiones 1-3)
- **Estado en feature_list.json:** `in_progress` (no se marca `done`: pendiente reviewer)
- **Fecha:** 2026-08-10

## 1. Resumen

Los estilos de tarjetas y perfil salen de `src/styles/hero.css` (532 líneas, transitorio) y pasan a dos hojas nuevas que consumen solo tokens: `src/styles/hero-card.css` (77 líneas) y `src/styles/profile-card.css` (66 líneas). El fondo y la posición de cada tarjeta se asignan mediante el atributo `data-color-token` (mapeo por token de marca en la hoja), `hero-card.astro` pierde el atributo `style` inline y `src/styles/hero.css` queda eliminada por completo (Decisión 3). El contenido restante de hero.css (reset global y scrollbar del hero) se reparte en `src/styles/hero-section.css` (hoja 3, 90 líneas), tal como exige el reparto de la Decisión 3.

## 2. Estado de partida en disco (sesión concurrente)

Al iniciar la sesión se verificó el estado real en disco (protocolo de sesiones concurrentes): la implementación ya estaba **completa** en disco, escrita por una sesión paralela entre las 17:51 y 17:52 (timestamps de `LastWriteTime`):

| Artefacto | Timestamp | Estado |
|---|---|---|
| `tests/hero-cards-styles.test.mjs` | 17:51:41 | Existe (7 tests, REQ-04-01..05 + Decisiones 1-2) |
| `src/styles/tokens.css` | 17:51:55 | 86 líneas, con tokens de perfil/scrollbar/sombras añadidos |
| `src/styles/hero-card.css` | 17:52:22 | 77 líneas, solo tokens |
| `src/styles/profile-card.css` | 17:52:28 | 66 líneas, solo tokens |
| `src/styles/hero-section.css` | 17:52:43 | 90 líneas, con reset + scrollbar (desde hero.css) |
| `src/components/hero-card.astro` | M | importa hero-card.css; sin `style`; `data-color-token={card.id}` |
| `src/components/new-hero/new-hero.astro` | M | importa tokens + hero-section + profile-card; sin hero.css |
| `src/styles/hero.css` | D | eliminado |

No existía `progress/impl_hero-cards-styles.md` ni `progress/review_hero-cards-styles.md`. Conforme al protocolo ("si hay impl sin review, verifica contra la spec y completa lo que falte, dejando tu informe"), **no se duplicó** el trabajo: se verificó contra la spec y el design.md, se reprodujo el ciclo rojo/verde real, se completó la verificación (suite, formato, build, init.sh, dev server) y se deja este informe.

## 3. Verificación contra la spec (REQ-04-01..05 + design.md)

| Criterio | Resultado | Evidencia |
|---|---|---|
| REQ-04-01: estilos de tarjetas en `hero-card.css` y del perfil en `profile-card.css`, importados desde sus componentes | ✔ | `hero-card.astro` línea 2 importa `../styles/hero-card.css`; `new-hero.astro` línea 4 importa `../../styles/profile-card.css` y ya no importa `hero.css` |
| REQ-04-02: fondo por `data-color-token` con el token correspondiente | ✔ | `hero-card.css` líneas 56-67: 12 reglas `[data-color-token="react"…"twitch-bottom"] { --card-bg: var(--color-marca-*) }`; el componente aplica `data-color-token={card.id}` (los ids actuales coinciden 1:1 con los tokens de marca) |
| REQ-04-03: ambas hojas consumen únicamente tokens | ✔ | Verificado por test (var() en colores/radios/sombras/transiciones; cero hex/rgba) y por lectura: todos los valores de color salen de `var(--...)` |
| REQ-04-04: ≤100 líneas cada hoja | ✔ | hero-card.css 77 líneas; profile-card.css 66 líneas (split `\n` = 78/67) |
| REQ-04-05: hero.css sin estilos de tarjetas/perfil | ✔ | `src/styles/hero.css` **no existe** (git status `D`); test `REQ-04-05` en verde; dev server responde 404 para `/src/styles/hero.css` |
| design.md Decisión 1: mapeo `[data-color-token]` en la hoja CSS | ✔ | Reglas por token de marca (12) en hero-card.css |
| design.md Decisión 2: sin `style` inline; grid por `--card-column`/`--card-row` desde la hoja | ✔ | `hero-card.astro` sin atributo `style`; `.hero-card { grid-column: var(--card-column); grid-row: var(--card-row); }`; cada regla `[data-color-token]` define `--card-column` y `--card-row` con las posiciones reales de `hero.data.ts` |
| design.md Decisión 3: hero.css eliminada y contenido repartido entre hojas 3 y 4 | ✔ | hero.css borrada; reset global (`box-sizing`) y scrollbar de `.new-hero` pasan a `hero-section.css` (90 líneas ≤100, test REQ-03-04 de la feature 3 sigue en verde) |

### Decisión documentada sobre `data-color-token` en el componente

El design.md (Decisión 1) dice que la feature 9 aplica el atributo "desde los datos" y la feature 6 guarda `colorToken` en el JSON. En esta feature el componente aplica **ya** el atributo con `data-color-token={card.id}`: los `id` actuales de `hero.data.ts` coinciden exactamente con los tokens de marca (`react`, `html`, `node`, `github`, `youtube`, `twitch`, `typescript`, `css`, `node-bottom`, `github-bottom`, `youtube-bottom`, `twitch-bottom`), de modo que el mapeo de la hoja resuelve y la UI queda funcional (fondo + posición + tamaño de icono por tarjeta) sin estilos inline. La feature 6 cambiará la fuente de datos (JSON con `colorToken`) y la feature 9 conectará el atributo a la entidad; el mecanismo CSS no cambiará.

## 4. Ciclo rojo/verde (evidencia real ejecutada)

El test de la feature se encontró escrito en disco (sesión concurrente) y se verificó contra la spec antes de usarlo como test de referencia (cubre REQ-04-01..05 y las Decisiones 1-2 del design.md, incl. `--card-bg` por token, `--card-column`/`--card-row`, sin `style` inline y `data-color-token={card.id}`).

**ROJO** — se reprodujo el estado pre-implementación retirando temporalmente las dos hojas nuevas (`mv src/styles/hero-card.css src/styles/profile-card.css` a temp) y ejecutando el test de la feature:

```
$ node --test tests/hero-cards-styles.test.mjs
not ok 1 - REQ-04-01: las hojas existen y se importan desde sus componentes
not ok 2 - REQ-04-04: ambas hojas no superan las 100 líneas
not ok 3 - REQ-04-02: hero-card.css asigna el fondo por data-color-token (12 tarjetas)
not ok 4 - REQ-04-03: colores, radios, sombras y transiciones usan var() de los tokens
not ok 5 - REQ-04-03: sin valores hex ni rgb()/rgba() hardcodeados
ok 6 - REQ-04-05: src/styles/hero.css ya no existe (Decisión 3 del design.md)
not ok 7 - design.md Decisión 2: hero-card.astro sin style inline y grid desde la hoja
# tests 7
# pass 1
# fail 6
```

(REQ-04-05 pasa incluso en rojo porque hero.css ya estaba eliminado — el resto falla por ausencia de las hojas.) Las hojas se restauraron inmediatamente.

**VERDE** — con la implementación completa en disco:

```
$ pnpm test
# tests 23    # pass 23    # fail 0     (16 previas + 7 de la feature 4)

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

$ pnpm build
[build] ✓ Completed in 803ms — 1 page(s) built

$ bash ./init.sh
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 5. Verificación visual / bundle / dev server

- **HTML renderizado** (`dist/index.html` y dev server): las 12 tarjetas llevan su atributo `data-color-token` (react, html, node, github, youtube, twitch, typescript, css, node-bottom, github-bottom, youtube-bottom, twitch-bottom).
- **Bundle CSS** (`dist/_astro/index.*.css`): presentes los 12 `--color-marca-*`, las reglas `[data-color-token=react]…` con `--card-bg: var(--color-marca-react)`, `grid-column: var(--card-column)` / `grid-row: var(--card-row)`, `.hero-card`/`.profile-card`/`.profile-username`/`.card-icon`, `::-webkit-scrollbar-thumb` y `box-sizing: border-box`. **Cero referencias a `hero.css`** en el bundle.
- **Dev server** (`pnpm dev` + curl): HTTP 200; `/src/styles/hero-card.css` y `/src/styles/profile-card.css` se sirven con su contenido completo consumiendo tokens; `/src/styles/hero.css` → HTTP 404.

## 6. Alcance (archivos)

| Archivo | Cambio |
|---|---|
| `src/styles/hero-card.css` | Nuevo (77 líneas, solo tokens): base de tarjeta (grid por `--card-column`/`--card-row`, `--card-bg`, `--icon-rotation`/`--icon-scale`/`--icon-width` con defaults y valores por tarjeta), hover, `::before`/`::after`, header, icono, 12 reglas `[data-color-token]`, media queries 1200/768 |
| `src/styles/profile-card.css` | Nuevo (66 líneas, solo tokens): perfil, imagen, overlay, pill de username, badge verified, contenido, media queries |
| `src/styles/hero.css` | **Eliminado** (REQ-04-05, Decisión 3) |
| `src/styles/hero-section.css` | Modificado (98 → 90 líneas, ≤100): recibe el reset global y el scrollbar de `.new-hero` que quedaban en hero.css (repaso compacto; todos los valores por var()) |
| `src/styles/tokens.css` | Modificado (71 → 86 líneas, ≤100): +11 tokens del perfil/tarjetas — `--color-overlay-strong`, `--color-overlay-soft`, `--color-username-bg/border/text`, `--color-verified`, `--color-scrollbar-thumb/track`, `--shadow-card-rest`, `--shadow-card-hover`, `--shadow-username` (valores idénticos a los de hero.css, patrón `--grupo-nombre`; test de la feature 2 en verde) |
| `src/components/hero-card.astro` | Importa `../styles/hero-card.css`; `style={...}` eliminado (Decisión 2); aplica `data-color-token={card.id}` |
| `src/components/new-hero/new-hero.astro` | Importa `../../styles/profile-card.css`; retira el import de `../../styles/hero.css` |
| `tests/hero-cards-styles.test.mjs` | Nuevo (encontrado en disco, verificado contra la spec): 7 tests REQ-04-01..05 + Decisiones 1-2 |

## 7. Decisiones y justificaciones

1. **Atributo `data-color-token` aplicado ya en el componente** (`data-color-token={card.id}`): necesario para que REQ-04-02 sea efectivo (el fondo se asigna por el atributo) y la UI quede funcional sin estilos inline; los ids actuales coinciden con los tokens. La feature 9 conectará el atributo al `colorToken` de la entidad (documentado en §3).
2. **Valores por tarjeta en la hoja** (`--card-column`, `--card-row`, `--icon-width`, `--icon-rotation`; `--icon-scale: 5` como default en la base porque las 12 tarjetas usan escala 5): Decisión 2 del design.md ("las posiciones de cuadrícula como variables aplicadas desde la hoja"); el atributo `style` desaparece del componente.
3. **Reset global y scrollbar → `hero-section.css`**: es el reparto de la Decisión 3 ("todo su contenido queda repartido entre las hojas 3 y 4"); son reglas de sección/globales, no de tarjeta ni perfil. La hoja queda en 90 líneas (≤100, REQ-03-04 intacta) y consume los tokens `--color-scrollbar-thumb/track`. Comentario en la hoja: transitorio hasta el `layout.css` de la feature 8.
4. **Tokens añadidos a `tokens.css`** con valores idénticos a los de hero.css (mismo criterio aceptado en la feature 3): sin ellos es imposible cumplir REQ-04-03 (solo `var()`) manteniendo el aspecto; la alternativa (hardcodear) viola "Tokens, no valores sueltos". Todos cumplen `--grupo-nombre` kebab-case y el test de la feature 2 (≤100 líneas, grupos, paleta de marca) sigue en verde.
5. **Radios `50%`** (badge verified, glow inferior) se conservan como porcentaje: el test de la feature exime los radios porcentuales (forma de círculo, no radio de diseño); el resto de radios usan `--radius-card`/`--radius-pill`.

## 8. Reglas duras del proyecto

- **Tests antes que el código:** el test de la feature se escribió antes que la implementación (sesión concurrente, timestamp 17:51:41 anterior a las hojas 17:52:22/17:52:28); el ciclo rojo/verde se reprodujo y verificó en esta sesión (§4).
- **Estilos separados de la UI:** `hero-card.astro` y `new-hero.astro` sin `<style>` ni `style` inline; toda la presentación en `src/styles/`.
- **Tokens, no valores sueltos:** las dos hojas nuevas contienen únicamente `var(--...)` para colores/radios/sombras/transiciones (verificado por test y por lectura).
- **≤100 líneas por archivo:** hero-card.css 77, profile-card.css 66, hero-section.css 90, tokens.css 86; todos los archivos del cambio dentro del límite.
- **Sin dependencias externas:** ninguna añadida.
- **Una sola feature:** el cambio toca exclusivamente el alcance de la feature 4 (hojas de tarjetas/perfil, imports de componentes, tokens de soporte y eliminación de hero.css); el reparto de contenido en hero-section.css está mandatado por la Decisión 3 del design.md.

## 9. Pendiente

- Revisión externa del reviewer (`progress/review_hero-cards-styles.md`). La feature queda `in_progress` en `feature_list.json`; solo el líder cierra con el APPROVED en disco.
