# Informe de implementación — feature 4 hero-cards-styles

Fecha: 2026-08-10 · Implementer · Sin subagentes (el líder lanzará al reviewer).

## Resumen

Extracción de los estilos de tarjetas y perfil del hero de `src/styles/hero.css`
hacia `src/styles/hero-card.css` y `src/styles/profile-card.css` (solo tokens,
≤100 líneas cada una), fondos de tarjeta por `data-color-token` (Decisión 1),
posiciones de grid desde la hoja vía `--card-column`/`--card-row` (Decisión 2),
eliminación del atributo `style` de `hero-card.astro` y **eliminación completa de
`src/styles/hero.css`** (Decisión 3). REQ-04-01..05 cubiertos.

## Ciclo rojo/verde (test-first)

### ROJO (antes de implementar) — `node --test tests/hero-cards-styles.test.mjs`

```
# tests 7
# pass 0
# fail 7
```

Fallas capturadas (resumen de la salida TAP):
- `REQ-04-01` → `src/styles/hero-card.css no existe (REQ-04-01)`
- `REQ-04-04` → `hero-card.css no existe (REQ-04-01)` (vía readCss)
- `REQ-04-02` → `src/styles/hero-card.css no existe (REQ-04-01)`
- `REQ-04-03` (var()) → `hero-card.css no existe (REQ-04-01)`
- `REQ-04-03` (hex/rgba) → `hero-card.css no existe (REQ-04-01)`
- `REQ-04-05` → `src/styles/hero.css sigue existiendo (REQ-04-05)`
- `design.md Decisión 2` → `hero-card.astro conserva el atributo style inline`
  (con dump del `style={...}` completa)

### VERDE (tras implementar) — `node --test tests/hero-cards-styles.test.mjs`

```
1..7
# tests 7
# pass 7
# fail 0
```

### Suite completa — `node --test "tests/**/*.test.mjs"`

```
1..23
# tests 23
# pass 23
# fail 0
```

(4 design-tokens + 7 harness-kit-integrity + 5 hero-section-styles + 7
hero-cards-styles; los tests de las features 1-3 siguen en verde tras la
compresión de hero-section.css y la eliminación de hero.css.)

## Archivos creados / modificados / eliminados

| Archivo | Cambio | Por qué |
|---------|--------|---------|
| `src/styles/hero-card.css` | **creado** (77 líneas) | REQ-04-01/04: estilos de las 12 tarjetas, solo tokens. |
| `src/styles/profile-card.css` | **creado** (66 líneas) | REQ-04-01/04: estilos del perfil, solo tokens. |
| `src/styles/tokens.css` | **modificado** (71 → 84 líneas) | 11 tokens nuevos con valores idénticos a hero.css (mismo criterio que la feature 3): `--color-overlay-strong`, `--color-overlay-soft`, `--color-username-bg`, `--color-username-border`, `--color-username-text`, `--color-verified`, `--color-scrollbar-thumb`, `--color-scrollbar-track`, `--shadow-card-rest`, `--shadow-card-hover`, `--shadow-username`. Sin ellos es imposible cumplir REQ-04-03 (solo var()) manteniendo el aspecto. Todos kebab-case `--grupo-nombre` (test feature 2 en verde). |
| `src/components/hero-card.astro` | **modificado** | Quitado `style={...}` por completo (Decisión 2); añadido `data-color-token={card.id}` (Decisión 1); importa `../styles/hero-card.css` (REQ-04-01). Sigue recibiendo `card` de `hero.data.ts` (la feature 9 cambiará el tipo a la entidad del dominio; `hero.data.ts` NO se toca). |
| `src/components/new-hero/new-hero.astro` | **modificado** | Import de `hero.css` sustituido por `../../styles/profile-card.css` (REQ-04-01); conserva `tokens.css` y `hero-section.css`. |
| `src/styles/hero-section.css` | **modificado** (98 → 90 líneas) | Recibe el reset global y el scrollbar de `.new-hero` (ver decisión abajo); comprimido para no superar 100 líneas. Test feature 3 (REQ-03-01..05) sigue en verde. |
| `src/styles/hero.css` | **ELIMINADO** | Decisión 3 del design.md; todo su contenido repartido (tabla abajo). |
| `tests/hero-cards-styles.test.mjs` | **creado** (ROJO primero) | Verifica REQ-04-01..05 + Decisiones 1-2 del design.md. |
| `feature_list.json` | status 4 → `in_progress` | Protocolo. |

## Reparto de selectores de hero.css (532 líneas originales)

| Selector / bloque original | Destino | Notas |
|----------------------------|---------|-------|
| `:root` (variables antiguas) | Eliminado | Duplicaban tokens.css: `--background`→`--color-background`, `--surface`→`--color-surface`, `--border`→`--color-border`, `--border-strong`→`--color-border-strong`, `--text`→`--color-text`, `--text-secondary`→`--color-text-secondary`, `--radius`→`--radius-card`, `--gap`→`--gap-card`, `--container`→`--container-max`, `--transition`→`--transition-default`. Ninguna otra hoja las consumía. |
| Reset `*, *::before, *::after` | `hero-section.css` | Transitorio: ver decisión abajo. |
| `.profile-card` / `:hover` | `profile-card.css` | grid 1/span 5 × 1/span 6; `--color-surface`; `--color-border`; `--radius-card`; `--shadow-card`; `--transition-default`. |
| `.profile-image` / `img` / `.profile-overlay` | `profile-card.css` | Overlay con `--color-overlay-strong`/`--color-overlay-soft`. |
| `.profile-username` / `span:first-child` | `profile-card.css` | `--radius-pill`; `--color-username-bg/-border/-text`; `--shadow-username`. |
| `.verified` | `profile-card.css` | `--color-verified`; `color: var(--color-text)`. |
| `.profile-content` / `h1` / `p` | `profile-card.css` | |
| `.hero-card` / `:hover` / `::before` / `::after` | `hero-card.css` | `--card-bg` resuelto por data-color-token; `--shadow-card-rest/-hover`; gradientes con `--color-border`. |
| `.card-header` / `h3` / `.card-icon` / `svg` / hover del svg | `hero-card.css` | `--icon-*` ahora definidos por token en la hoja. |
| media 1200 (`.profile-card`, `.hero-card`) | split `profile-card.css` / `hero-card.css` | |
| media 768 (partes de tarjetas/perfil) | split | `.card-header h3`, `.card-icon svg`, `.profile-content*`, `.profile-username` repartidos por responsabilidad. |
| Scrollbar `.new-hero ::-webkit-scrollbar*` | `hero-section.css` | Scoped a `.new-hero` → responsable: hoja de sección. |

## Decisión reset / scrollbar / :root

- **`:root`**: eliminado sin destino (valores duplicados de tokens.css; nada
  externo lo consumía — verificado por grep en `src/`).
- **Reset y scrollbar**: movidos a `hero-section.css` (la hoja de la sección,
  única hoja global del hero activa; el layout todavía no existe y `layout.css`
  es de la feature 8). Ambos son **transitorios**: la feature 8 los recolocará
  en `layout.css` (documentado en el propio archivo con comentarios). `hero-section.css`
  quedó en **90 líneas ≤ 100** (comprimido: solo bloques sin props de color;
  el test REQ-03-03 sigue verificando var() en todas las líneas de color y
  REQ-03-05 sin hex/rgba — en verde). Scrollbar con tokens
  `--color-scrollbar-thumb` (#4732a5) y `--color-scrollbar-track` (#090912),
  valores idénticos a hero.css.

## data-color-token en el markup

- **Tarjetas**: `hero-card.astro` aplica `data-color-token={card.id}`.
  `card.id` coincide 1:1 con los sufijos de `--color-marca-*` de tokens.css
  (`react`, `html`, `node`, `github`, `youtube`, `twitch`, `typescript`, `css`
  y las 4 variantes `-bottom`). La feature 6 guardará `colorToken` en el JSON y
  la 9 la aplicará; hoy `card.id` actúa como identificador del token sin tocar
  `hero.data.ts` (fuera de alcance).
- **Perfil**: NO lleva `data-color-token` — el mecanismo de Decisión 1 es para
  fondos de marca; `.profile-card` aplica `background: var(--color-surface)`
  directamente desde su clase (mecanismo coherente: clase).

## Decisiones 1 y 2 del design.md — implementación

- **Decisión 1**: `hero-card.css` define 12 reglas
  `[data-color-token="<id>"] { --card-bg: var(--color-marca-<id>); ... }`.
  Verificado en el bundle de producción: las 12 reglas presentes.
- **Decisión 2**: el atributo `style` desaparece de `hero-card.astro` (0
  atributos `style=` en el HTML servido). Cada regla de token define también
  `--card-column` y `--card-row` con los valores exactos de `gridColumn`/
  `gridRow` de `hero.data.ts`, y `.hero-card { grid-column: var(--card-column);
  grid-row: var(--card-row); }`. Las variables de icono (`--icon-width`,
  `--icon-rotation`, `--icon-scale`) también pasan a la hoja (valores idénticos
  a los del inline: `rotate ?? 12`→12deg por defecto, `scale` 5, `iconWidth`
  por tarjeta). Los `!important` de los media queries se conservan tal cual
  (equivalencia de cascada exacta con el original).

## Diferencias deliberadas (diseño, aceptadas por design.md)

- `border-radius` de perfil 24px → `--radius-card` 22px y de tarjeta 20px →
  `--radius-card` 22px: la tabla de tokens del design.md asigna `--radius-card`
  a los radios de ambas tarjetas (decisión de diseño aprobada).
- `transition: transform .35s ease` del svg de icono → `var(--transition-default)`
  (.28s cubic-bezier(.2,.8,.2,1)): exigido por REQ-04-03 (solo tokens) — mismo
  criterio que la feature 3 (ajustes de transición aceptados por el reviewer).

## Verificación

- `node --test "tests/**/*.test.mjs"` → 23/23 ✔
- `node scripts/check-format.mjs` → `FORMATO ✔` ✔
- `pnpm build` → `1 page(s) built` ✔ (sin errores)
- `./init.sh` (Git Bash) → `✔ El entorno está perfecto. Podemos empezar a trabajar.` ✔
- **Build renderizado** (`dist/index.html`): 12 `<article class="hero-card"
  data-color-token="...">` (react, html, node, github, youtube, twitch,
  typescript, css, node-bottom, github-bottom, youtube-bottom, twitch-bottom);
  **0** atributos `style=`; `.profile-card` presente.
- **Bundle CSS** (`dist/_astro/*.css`): 12 reglas `[data-color-token=...]` con
  `--card-bg: var(--color-marca-*)`, `grid-column: var(--card-column)`; las
  variables viejas de hero.css ausentes (p. ej. `--background:#070716` no existe).
- **Dev server** (background, `node node_modules/astro/bin/astro.mjs dev`):
  HTTP 200; 12 `.hero-card`; profile-card presente; 0 `style=`; hojas servidas:
  `tokens.css`, `hero-section.css`, `hero-card.css`, `profile-card.css`;
  **0** referencias `link/src` a `hero.css` (la subcadena "hero.css" que aparece
  en el HTML inyectado es solo texto de comentarios de tokens.css documentando
  el origen de los tokens).

## Fuera de alcance (no tocado)

- `src/data/hero.data.ts` (features 5, 6, 9), dominio (7), `Layout.astro`/
  `layout.css` (feature 8), `latest-articles.astro` (10), `about` (11), limpieza (12).

## Actualización post-implementación (sesión concurrente features 5-9)

Durante mi sesión, sesiones concurrentes del arnés implementaron las features
5-9 encima de mi feature 4 (mismo patrón que la sesión 2 de la feature 3).
Estado final verificado en disco:

- El reviewer lanzado por el líder ya emitió `progress/review_hero-cards-styles.md`
  con **Veredicto APPROVED** (sin cambios requeridos) contra mi implementación
  (timestamps del disco 17:51-17:52: test 17:51:41 → hero-card.css 17:52:22 →
  profile-card.css 17:52:28 → hero-card.astro 17:52:31 → new-hero.astro 17:52:35
  → hero-section.css 17:52:43). Feature 4 marcada `done` en feature_list.json.
- La feature 9 (hero-ui-refactor) sustituyó después `data-color-token={card.id}`
  por `data-color-token={card.colorToken}` en `hero-card.astro` (Decisión 2 del
  design.md de la feature 9; los 12 `colorToken` del JSON son idénticos a los
  `id` de `hero.data.ts`, por lo que el mecanismo CSS de la feature 4 NO cambia)
  y ajustó mi test en la línea 160 (`{card.colorToken}`). El resto de mi test
  (REQ-04-01..05 + Decisiones 1-3) quedó intacto.
- Re-verificación completa contra el estado real (con features 5-9 presentes):
  `node --test "tests/**/*.test.mjs"` → **60/60 ✔**; `node scripts/check-format.mjs`
  → `FORMATO ✔`; `pnpm build` → `1 page(s) built` ✔; `bash ./init.sh` →
  `✔ El entorno está perfecto. Podemos empezar a trabajar.` ✔. `hero.css` sigue
  eliminado; `hero-card.css` (77 líneas) y `profile-card.css` (66 líneas)
  siguen importadas por sus componentes.