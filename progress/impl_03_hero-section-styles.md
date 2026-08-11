# Informe de implementación — feature 3 hero-section-styles

- **Fecha:** 2026-08-10
- **Implementer:** agente implementador (una sola feature por sesión)
- **Spec:** `specs/03_hero-section-styles/requirements.md` (REQ-03-01..05) + `design.md`
- **Estado del backlog:** feature 3 en `in_progress` (NO marcada `done`: el reviewer aún no aprueba; ver `progress/review_03_hero-section-styles.md`).

## Contexto de la sesión

Una sesión concurrente (misma feature 3) dejó la implementación en disco y el reviewer ya emitió `review_03_hero-section-styles.md` con veredicto **CHANGES_REQUESTED** (2 cambios). Esta sesión:

1. Re-ejecutó el ciclo rojo/verde contra el estado real del disco.
2. Aplicó los 2 cambios requeridos del reviewer.
3. Re-verificó todo: suite 16/16, formato, build, `./init.sh` y la identidad visual (bundle + dev server).

## Ciclo rojo/verde (evidencia re-ejecutada en esta sesión)

### ROJO — `node --test tests/hero-section-styles.test.mjs` (estado feature ausente)

Se revirtió temporalmente el working tree de la feature (`hero-section.css` retirado, `new-hero.astro` y `hero.css` restaurados desde HEAD) y se ejecutó el test:

```
not ok 1 - REQ-03-01: new-hero.astro importa src/styles/hero-section.css
not ok 2 - REQ-03-04: hero-section.css existe y no supera 100 líneas
not ok 3 - REQ-03-02: los selectores cubren fondo, navbar y cuadrícula del hero
not ok 4 - REQ-03-03: colores, radios y transiciones usan var() de los tokens
not ok 5 - REQ-03-05: sin valores hex ni rgb()/rgba() hardcodeados
# tests 5
# pass 0
# fail 5
```

### VERDE — tras restaurar la implementación y aplicar el cambio 1 del reviewer

```
ok 1 - REQ-03-01 / ok 2 - REQ-03-04 / ok 3 - REQ-03-02 / ok 4 - REQ-03-03 / ok 5 - REQ-03-05
# tests 5  # pass 5  # fail 0
```

Suite completa (`pnpm test`, equivalente a `node --test "tests/**/*.test.mjs"`):

```
# tests 16  # pass 16  # fail 0   (4 design-tokens + 7 harness-kit-integrity + 5 hero-section-styles)
```

Formato: `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`
Build: `pnpm build` → `1 page(s) built ... Complete!`

### `./init.sh` (Git Bash)

```
✔ node instalado / ✔ gestor de paquetes instalado (pnpm) / ✔ dependencias instaladas
✔ AGENTS.md existe / ✔ feature_list.json existe / ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Cambios requeridos del reviewer (CHANGES_REQUESTED) — aplicados

| # | Cambio requerido | Aplicación |
|---|---|---|
| 1 | Retirar de `src/styles/hero.css` el bloque `.hero-grid` duplicado dentro de `@media (max-width:768px)` (la regla ya vive en `hero-section.css`) | ✔ Aplicado: el media 768 de `hero.css` quedó solo con `.profile-card`, `.hero-card`, `.profile-content*`, `.profile-username`, `.card-header h3` y `.card-icon svg`. `grep -n "hero-grid" src/styles/hero.css` → sin coincidencias (exit 1). Confirmado en el bundle: `grid-auto-rows:190px` aparece **1 sola vez** en `dist/_astro/index.*.css`. |
| 2 | Corregir `progress/impl_03_hero-section-styles.md` para reflejar el estado real del disco | ✔ Este informe reescrito (la lista de lo que queda en hero.css no incluye `.hero-grid`). |

## Archivos de la feature y por qué

| Archivo | Acción | Motivo |
|---|---|---|
| `tests/hero-section-styles.test.mjs` | adoptado (escrito primero, en rojo) | Verifica REQ-03-01..05: import en new-hero.astro, existencia, ≤100 líneas (REQ-03-04), selectores de fondo/navbar/grid (REQ-03-02), `var()` en colores/radios/transiciones (REQ-03-03) y ausencia de hex/rgb()/rgba() (REQ-03-05). |
| `src/styles/hero-section.css` | creado (98 líneas ≤ 100) | Hoja de la sección hero (fondo, navbar, grid + media queries + `@keyframes float`) consumiendo únicamente tokens. |
| `src/styles/tokens.css` | modificado (+7 tokens) | La sección requiere valores que no existían como tokens y no son reproducibles con los existentes sin cambiar el aspecto (ver "Tokens añadidos"). |
| `src/components/new-hero/new-hero.astro` | modificado (imports) | REQ-03-01: importa `tokens.css` + `hero-section.css`; conserva `hero.css`. |
| `src/styles/hero.css` | modificado (782 → 532 líneas) | Retirados los selectores de sección movidos (fondo, navbar, grid y sus media queries); conserva `:root`, reset, `.profile-card*`, `.hero-card*`, partes de tarjetas/perfil de los media queries y scrollbar (hasta la feature 4). |

## Decisión sobre el import en new-hero.astro (AMBAS hojas + tokens)

`new-hero.astro` importa **tres** hojas, en este orden:

```
import "../../styles/tokens.css";
import "../../styles/hero-section.css";
import "../../styles/hero.css";
```

Justificación:
- `tokens.css`: **ningún componente lo importaba** (feature 2 lo creó, solo lo leía su test). Sin él, `var(--color-*)` de hero-section.css no resuelven en la página y el hero perdería fondo/colores. Es la importación mínima necesaria para que la extracción funcione (design.md, Decisión 2).
- `hero-section.css`: REQ-03-01 — estilos de la sección.
- `hero.css` **se conserva**: el markup de `.profile-card` vive en `new-hero.astro` y `hero-card.astro` no tiene hoja propia; ambos se estilan exclusivamente desde `hero.css`. Quitarlo rompería el aspecto (viola REQ-03-02 "se ve idéntico"). La feature 4 creará `hero-card.css`/`profile-card.css` y entonces se retirará el import.

## Selectores movidos a hero-section.css vs. lo que queda en hero.css

Movidos (fondo, navbar, grid y sus media queries — REQ-03-02):
- `.new-hero`, `.hero-background`, `.hero-gradient` (incl. `animation: float`), `.hero-noise`
- `.hero-navbar`, `.hero-navbar nav`, `.hero-navbar a`, `a::after`, `a:hover`, `a:hover::after`
- `.hero-grid`
- `@keyframes float`
- `@media (max-width:1200px)`: solo las reglas de `.hero-grid`
- `@media (max-width:768px)`: `.hero-navbar nav`, `.hero-navbar a` y `.hero-grid`

Quedan en hero.css (hasta la feature 4):
- `:root` con las variables antiguas (aún las usan `.profile-card`/`.hero-card`; eliminarlo rompería las tarjetas y está fuera del scope de sección)
- Reset global `*`, `.profile-card*`, `.hero-card*`, `.card-*`, `.verified`
- Partes de tarjetas/perfil de ambos media queries (media 768 **sin** `.hero-grid`, retirado por el cambio 1 del reviewer)
- Scrollbar de `.new-hero` (`::-webkit-scrollbar*`): no es fondo/navbar/grid (alcance de REQ-03-02); se deja en hero.css para que una feature posterior decida su destino. Sin impacto visual: hero.css sigue importada.

## Tokens usados (tokens.css tras la feature: 71 líneas ≤ 100)

Existentes (feature 2): `--color-text`, `--color-border-strong`, `--color-accent`, `--gap-card`, `--container-max`, `--transition-default`, `--font-sans`, `--color-background`.

## Tokens añadidos a tokens.css (sí, justificado)

Valores idénticos a los actuales de hero.css — sin ellos el aspecto NO sería idéntico (REQ-03-02) y la regla "Tokens, no valores sueltos" prohíbe hardcodearlos en la hoja:

| Token | Valor | Por qué es imprescindible |
|---|---|---|
| `--color-hero-top` | `#25144f` | Parada 0% del degradado radial de `.new-hero`; ningún token existente coincide. |
| `--color-hero-mid` | `#0b0818` | Idem (parada 35%). |
| `--color-hero-bottom` | `#05050b` | Idem (parada 100%; `--color-background #070716` NO coincide). |
| `--color-glow` | `rgba(120, 70, 255, 0.25)` | Glow flotante de `.hero-gradient`; sin él el fondo pierde su orbe violeta. |
| `--color-navbar` | `rgba(8, 8, 18, 0.75)` | Fondo translúcido de la navbar (backdrop-filter); ningún token coincide. |
| `--color-accent-hover` | `#9a89ff` | Hover de los enlaces de la navbar (`--color-accent #7d68ff` es el subrayado, no el hover). |
| `--radius-pill` | `999px` | Radio de píldora del subrayado de enlaces; también produce el círculo del glow (sobre cuadrado 900×900, 999px ≡ 50% visualmente idéntico). `--radius-card 22px` cambiaría el aspecto. |

Todos cumplen el patrón `--grupo-nombre` kebab-case (REQ-02-04) y el test de la feature 2 sigue en verde (suite 16/16).

## Verificación visual del hero ("se ve idéntico", REQ-03-02)

1. **Equivalencia numérica** (revisada también por el reviewer, review_03 punto 4): todos los valores de la hoja nueva son idénticos a los originales de hero.css — gradiente `#25144f 0% / #0b0818 35% / #05050b 100%`, glow `rgba(120,70,255,.25)`, navbar `rgba(8,8,18,.75)`, hover `#9a89ff`, pill `999px`, grid `12×95px`, media 1200 `6×140px`, media 768 `1fr/190px`, keyframes float. Sustituciones equivalentes: `#fff`→`var(--color-text)`, `white`→`var(--color-text)`, `--transition`→`--transition-default` (mismo valor `.28s cubic-bezier(.2,.8,.2,1)`), `--container`→`--container-max`, `--gap`→`--gap-card`. Diferencias deliberadas aceptables: `a::after` transition `.25s`→`.28s` (30 ms, exigida por REQ-03-03) y glow `50%`→`999px` (círculo idéntico por clamping).
2. **Bundle emitido** (`pnpm build`): `dist/_astro/index.JVu1u6U_.css` contiene los 7 tokens nuevos (`--color-hero-top:#25144f`, `--color-glow:#7846ff40`, `--color-navbar:#080812bf`, ...), las reglas `.hero-navbar*`, `.hero-grid`, `.hero-gradient`, `.hero-noise`, y las tarjetas `.hero-card`/`.profile-card` (hero.css sigue importada). `grid-auto-rows:190px` aparece 1 sola vez (duplicado retirado).
3. **Dev server** (`pnpm dev` en background + curl): `http://localhost:4321/` responde HTTP 200 con el markup del hero (`.new-hero`, `.hero-background`, `.hero-gradient`, `.hero-navbar`, `.hero-grid`) y referencia las 3 hojas (tokens.css, hero-section.css, hero.css). `/src/styles/hero-section.css` se sirve con el contenido completo consumiendo tokens.

## Notas

- `new-hero.astro` queda en 104 líneas: ya tenía 102 antes de la feature (violación pre-existente detectada por el spec_author); esta feature solo añadió los imports de REQ-03-01. Su refactor (repositorios, feature 9) resolverá la longitud. Fuera del scope de esta feature.
- `hero.css` queda en 532 líneas (violación transitoria): la feature 4 lo eliminará por completo (REQ-04-05). Documentado en design.md (Decisión 1) y aceptado por el reviewer.
- Ninguna herramienta falló de forma inesperada. El dev server se detuvo tras la verificación (`taskkill //F //IM node.exe`).

## Resolución de los cambios requeridos (ronda 1)

El reviewer emitió `progress/review_03_hero-section-styles.md` con **CHANGES_REQUESTED** (2 cambios). Estado verificado en disco y resolución:

### Cambio 1 — Retirar `.hero-grid` duplicado de `@media (max-width:768px)` en `src/styles/hero.css`

**Verificado en disco (esta sesión): SÍ aplicado.** La regla duplicada ya no existe en hero.css:

- `src/styles/hero.css` tiene **532 líneas** y su único selector restante con prefijo de sección son los `::-webkit-scrollbar` (líneas 514, 520, 528). `Select-String -Path "src/styles/hero.css" -Pattern "^\.new-hero|^\.hero-background|^\.hero-gradient|^\.hero-noise|^\.hero-navbar|^\.hero-grid|@keyframes float"` → **sin coincidencias** (solo los 3 scrollbar de `.new-hero ::-webkit-scrollbar*`).
- El bloque `@media (max-width:768px)` de hero.css queda solo con las partes de tarjetas/perfil: `.profile-card`, `.hero-card`, `.profile-content`, `.profile-content h1`, `.profile-content p`, `.profile-username`, `.card-header h3`, `.card-icon svg` (verificado por lectura del bloque completo).
- La regla `.hero-grid` del 768 vive únicamente en `src/styles/hero-section.css` (líneas 94-97 dentro de su `@media (max-width:768px)`).
- Evidencia en el bundle: tras `pnpm build`, `dist/_astro/index.JVu1u6U_.css` contiene **`grid-template-columns:1fr` 1 sola vez** (antes del cambio aparecía 2 veces, duplicado). También `grid-auto-rows:190px` aparece 1 sola vez.
- Sin impacto visual: los valores eran idénticos; ahora hay una única fuente de verdad.

### Cambio 2 — Corregir `progress/impl_03_hero-section-styles.md`

**Aplicado.** La sección "Selectores movidos a hero-section.css vs. lo que queda en hero.css" refleja el estado real: el media 768 de hero.css ya no contiene `.hero-grid` (ver bullet "Partes de tarjetas/perfil de ambos media queries (media 768 **sin** `.hero-grid`, retirado por el cambio 1 del reviewer)") y la nota del bundle apunta a `dist/_astro/index.*.css` (el CSS emitido vive en `dist/_astro/`; `dist/assets/` solo contiene `svg/` y `moises-hero.jpg`). Esta sección de resolución queda añadida al final con la evidencia.

### Verificación final (re-ejecutada en esta sesión tras confirmar el disco)

```
node --test "tests/**/*.test.mjs"
# tests 16  # pass 16  # fail 0        (4 design-tokens + 7 harness-kit-integrity + 5 hero-section-styles)

node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

pnpm.cmd build
1 page(s) built in 784ms ... Complete!

./init.sh (Git Bash)
✔ node instalado / ✔ gestor de paquetes instalado (pnpm) / ✔ dependencias instaladas
✔ AGENTS.md existe / ✔ feature_list.json existe / ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

La feature 3 NO se marca `done`: queda pendiente de re-revisión del reviewer (protocolo: APPROVED en `progress/review_03_hero-section-styles.md` antes de cerrar).
