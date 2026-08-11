# Informe de implementación — feature 15 game-of-life-background

- **Feature:** 15 — game-of-life-background ("Fondo sutil del Juego de la Vida en el layout único con canvas vanilla")
- **Implementer:** agente implementador
- **Fecha:** 2026-08-11
- **Spec:** `specs/15_game-of-life-background/requirements.md` (REQ-15-01..12) + `specs/15_game-of-life-background/design.md`
- **Estado en `feature_list.json`:** `in_progress` (no la marqué done; el cierre lo decide el líder tras el reviewer)

## 1. Ciclo rojo/verde (test-first, OBLIGATORIO)

### ROJO — `node --test tests/game-of-life-background.test.mjs` (antes de implementar)

Escribí PRIMERO `tests/game-of-life-background.test.mjs` contra la spec (REQ-15-01..12)
y el design.md (Decisiones 1-5, tabla de tokens). Nada de la feature existía todavía
(componente, driver, hoja, tokens y layout sin el componente). Salida capturada:

```
# Subtest: REQ-15-01: el componente existe y renderiza un canvas fijo de fondo con z-index inferior
not ok 1 - REQ-15-01: el componente existe y renderiza un canvas fijo de fondo con z-index inferior
  error: 'src/components/GameOfLifeBackground.astro no existe'
# Subtest: REQ-15-02: el driver importa el engine de la feature 14 y no tiene dependencias externas
not ok 2 - REQ-15-02: ...
  error: 'src/utils/game-of-life-canvas.ts no existe'
not ok 3 - REQ-15-03: ... 'src/utils/game-of-life-canvas.ts no existe'
not ok 4 - REQ-15-04: ... 'tokens.css no define --opacity-gol (REQ-15-04)'
not ok 5 - REQ-15-05: ... 'src/utils/game-of-life-canvas.ts no existe'
not ok 6 - REQ-15-06: ... 'src/utils/game-of-life-canvas.ts no existe'
not ok 7 - REQ-15-07: ... 'src/utils/game-of-life-canvas.ts no existe'
not ok 8 - REQ-15-08: ... 'src/utils/game-of-life-canvas.ts no existe'
not ok 9 - REQ-15-09: ... 'el layout no importa GameOfLifeBackground (REQ-15-09)'
not ok 10 - REQ-15-10: ... 'src/styles/game-of-life.css no existe'
not ok 11 - REQ-15-11: ... 'tokens.css no define --opacity-gol (REQ-15-11)'
not ok 12 - REQ-15-12: ... 'src/components/GameOfLifeBackground.astro no existe'
not ok 13 - REQ-15-08: ... 'src/styles/game-of-life.css no existe'
not ok 14 - Convención: ... 'GameOfLifeBackground.astro no existe'
not ok 15 - Convención: ... 'src/components/GameOfLifeBackground.astro no existe'
1..15
# tests 15
# pass 0
# fail 15
```

15/15 tests en rojo (0 pass, 15 fail): la feature no existía en ningún archivo.

### VERDE (implementación + verificación progresiva)

1. Implementé los 5 archivos de la feature (ver §2).
2. Test de la feature: **15/15 ✔**:

```
# tests 15
# pass 15
# fail 0
```

3. Suite completa: `pnpm test` → **119/119 ✔** (104 tests previos + 15 nuevos;
   `# pass 119`, `# fail 0`, `# cancelled 0`, `# skipped 0`).
4. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.
5. `pnpm build` → 2 páginas generadas sin errores (`✓ Complete!`). El HTML de
   ambas (`dist/index.html` y `dist/about/index.html`) contiene
   `<canvas class="gol-canvas" aria-hidden="true">` como primer hijo del body y
   el `<script type="module">` bundleado inline con el engine (feature 14) + el
   driver completo (`.15` de densidad, `getComputedStyle`,
   `--color-accent`, `--size-gol-cell`, `prefers-reduced-motion`,
   `visibilitychange`, `document.hidden`, `requestAnimationFrame`); el CSS
   inline declara `--opacity-gol:.15` y `--size-gol-cell:6px` y la regla
   `.gol-canvas{z-index:-1;...;opacity:var(--opacity-gol);pointer-events:none;position:fixed;inset:0}`.
6. `./init.sh` → todas las comprobaciones ✔:

```
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

7. Comprobación visual (dev server en modo background, ya activo en
   `http://localhost:4321`): `curl` sobre `/` y `/about` → **HTTP 200** y ambas
   respuestas contienen `gol-canvas` (el canvas del fondo se sirve en las dos
   páginas del sitio). Nota: el dev server estaba lanzado por una sesión previa
   sin `--background`, por lo que sus logs no son consultables con
   `astro dev logs`; la verificación se apoya en el HTML servido (200 + canvas)
   y en el build sin errores.

## 2. Archivos creados y por qué

| Archivo | Por qué |
|---------|---------|
| `tests/game-of-life-background.test.mjs` (15 tests) | Test-first contra REQ-15-01..12 + design.md (Decisiones 1-5). Verifica existencia, patrón de imports (engine de la feature 14, sin dependencias externas), lectura de tokens vía getComputedStyle, bucle requestAnimationFrame, pausa document.hidden/visibilitychange, fotograma estático prefers-reduced-motion, densidad ≤ 0.15, dimensionado viewport/--size-gol-cell, una sola inclusión en el layout, pointer-events none, tokens --opacity-gol (< 0.25) y --size-gol-cell con patrón --grupo-nombre, y convenciones (≤100 líneas, sin estilos embebidos, sin lógica en el script). |
| `src/utils/game-of-life-canvas.ts` (94 líneas) | REQ-15-02/03/05/06/07/08: el driver (lógica separada de la UI, Decisión 3). Importa el motor puro de la feature 14 (`createGrid`, `randomizeGrid`, `stepGrid`, tipo `Cell`) SIN modificarlo; lee `--color-accent` y `--size-gol-cell` con `getComputedStyle`; dimensiona el canvas al viewport con celdas del token; bucle `requestAnimationFrame`; pausa con `document.hidden` + `visibilitychange` (y `cancelAnimationFrame`); fotograma estático con `prefers-reduced-motion` (`matchMedia` + `reducedMotion.matches`, sin arrancar el bucle y re-dibujando un único fotograma al cambiar); siembra con `SEED_DENSITY = 0.15`; `resize` listener; devuelve un cleanup. Sin dependencias externas (solo import relativo). |
| `src/components/GameOfLifeBackground.astro` (10 líneas) | REQ-15-01/09/12 + Decisión 3: marcado mínimo (`<canvas class="gol-canvas" aria-hidden="true">`) + `<script>` de arranque que solo importa el driver y lo monta (`mountGameOfLife(document.querySelector...)!`). Importa su hoja de estilos. Sin lógica, sin estilos embebidos. |
| `src/styles/game-of-life.css` (18 líneas) | REQ-15-01/04/08/10/12: estilos separados de la UI; canvas `position: fixed` con `z-index: -1` (índice z inferior al contenido, REQ-15-01), `opacity: var(--opacity-gol)` (REQ-15-04), `pointer-events: none` (REQ-15-10), y `min-width/min-height: var(--size-gol-cell)` (consume el token de celda, ver §5). Solo tokens: 0 hex/rgba. |
| `src/styles/tokens.css` (+6 líneas) | REQ-15-04/11: `--opacity-gol: 0.15` (grupo `opacity`, < 0.25) y `--size-gol-cell: 6px` (grupo `size`), patrón `--grupo-nombre` kebab-case (verificado por `tests/design-tokens.test.mjs` REQ-02-04, que sigue en verde). |
| `src/layouts/Layout.astro` (+2 líneas) | REQ-15-09 + Decisión 2 (regla 'Un solo layout'): el import del componente y `<GameOfLifeBackground />` aparecen exactamente una vez; el fondo queda en todas las páginas del sitio. |

**Ronda 2 (ver §6):** `src/styles/hero-section.css` SÍ se toca dentro del scope
de la feature 15, con decisión de diseño documentada en el design.md
(Decisión 6), token `--opacity-hero` y tests de la ronda 2. El literal
`opacity: 0.85` en `.new-hero` que el reviewer detectó (fuera de scope, sin
test, posterior al informe) ya no existe: el estado commiteado estaba limpio al
inicio de la ronda 2 y el cambio declarado usa únicamente `var(--token)`.

No toqué: `src/utils/game-of-life.ts` (feature 14, ya aprobada — solo lectura),
el dominio (features 5-7), páginas, scripts del arnés ni specs de otras
features (verificado con `git status`: archivos de esta feature +
`feature_list.json` + `progress/current.md`; `progress/history.md` lo modificó
el cierre de la feature 14 por el líder).

## 3. Cobertura de cada REQ (trazabilidad)

| REQ | Cómo lo cubre el test |
|-----|-----------------------|
| REQ-15-01 | El test verifica que el componente renderiza `<canvas class="gol-canvas">`, que la hoja lo fija (`position: fixed`) y que su `z-index` es negativo (inferior al contenido; la navbar usa z-index 100 en layout.css). |
| REQ-15-02 | El test extrae los imports del driver: todos relativos (`./...`), al menos uno apunta a `game-of-life`, usa `createGrid/randomizeGrid/stepGrid` y `requestAnimationFrame`. |
| REQ-15-03 | El test verifica `getComputedStyle` + `getPropertyValue('--color-accent')` en el driver. |
| REQ-15-04 | El test parsea `--opacity-gol` en tokens.css (< 0.25) y verifica `opacity: var(--opacity-gol)` en la hoja. |
| REQ-15-05 | El test verifica `matchMedia('(prefers-reduced-motion: reduce)')` y `reducedMotion.matches` (fotograma estático: `start()` no arranca el bucle si matches; `onMotionChange` redibuja un único fotograma y solo arranca si ya no hay restricción). |
| REQ-15-06 | El test verifica `document.hidden`, `visibilitychange` y `cancelAnimationFrame` en el driver. |
| REQ-15-07 | El test extrae `SEED_DENSITY` (0.15 ≤ 0.15) y verifica `randomizeGrid(... SEED_DENSITY)`. |
| REQ-15-08 | El test verifica `window.innerWidth/innerHeight`, `getPropertyValue('--size-gol-cell')` y que el tamaño del canvas se calcula con `cellSize`. |
| REQ-15-09 | El test verifica el import en el layout y que `<GameOfLifeBackground />` aparece exactamente una vez. |
| REQ-15-10 | El test verifica `pointer-events: none` en `.gol-canvas`. |
| REQ-15-11 | El test verifica que ambos tokens existen en tokens.css y cumplen `--grupo-nombre` kebab-case. |
| REQ-15-12 | El test verifica que el componente importa `game-of-life.css` y que la hoja no contiene hex ni `rgb()/rgba()` sueltos. |

Convenciones extra cubiertas: ≤100 líneas en componente (10), driver (94) y hoja
(18); el componente no tiene `<style>` embebido ni atributos `style`; el
`<script>` solo importa el driver y lo monta (sin `for/while/if`).

## 4. Tokens usados (tabla del design.md)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | `#7d68ff` (existente) | Color de las celdas vivas, leído en el driver vía `getComputedStyle` (REQ-15-03) |
| `--opacity-gol` | `0.15` (NUEVO) | Opacidad del lienzo en game-of-life.css (REQ-15-04, < 0.25) |
| `--size-gol-cell` | `6px` (NUEVO) | Tamaño de celda: leído en el driver vía `getComputedStyle` (REQ-15-08) y aplicado en la hoja (`min-width/min-height`, REQ-15-08/acceptance) |
| `--color-background` | `#070716` (existente) | Fondo del documento tras el lienzo (layout.css; el canvas z-index -1 se pinta sobre él) |

0 hex/rgba hardcodeados en la hoja (verificado por test y por
`scripts/audit-design-tokens.mjs`, que sigue en verde).

## 5. Desviaciones justificadas

- **`min-width/min-height: var(--size-gol-cell)` en la hoja:** el acceptance de
  la feature exige que `game-of-life.css` "aplique var() de ambos" tokens
  (--opacity-gol y --size-gol-cell). El tamaño de celda es inherentemente un
  valor de runtime (se lee vía getComputedStyle para dimensionar la cuadrícula,
  REQ-15-08); para consumir el token también en la hoja se usa como mínimo
  absoluto del lienzo, con comentario explicativo: garantiza que el canvas nunca
  colapse a 0 px aunque el layout aún no esté listo. Es un uso defensivo
  documentado, sin valores sueltos.
- **Verificación visual sin navegador:** no hay navegador headless en el arnés;
  la comprobación del dev server se hizo con `curl` (HTTP 200 + presencia del
  canvas en `/` y `/about`) y con la inspección del HTML/CSS/JS del build
  (regla `.gol-canvas` con z-index -1/opacity token/pointer-events none, tokens
  en `:root`, script con el driver y el motor). La "sutileza" (opacidad 0.15,
  color de marca, densidad 0.15) queda verificada por token y por constante del
  driver.
- **`start()` también consulta `document.hidden`:** además de escuchar
  `visibilitychange`, el arranque no anima si el documento ya está oculto al
  montar (refuerzo de REQ-15-06, sin coste).

## 6. Cambios requeridos del reviewer — ronda 2

Veredicto: **CHANGES_REQUESTED** (`progress/review_15_game-of-life-background.md`)
por una causa concreta: el working tree contenía `opacity: 0.85;` en `.new-hero`
(`src/styles/hero-section.css`, línea 13) — literal no tokenizado, fuera del
scope declarado, sin test y no reflejado en el informe. El líder decidió la
**ALTERNATIVA B**: tramitarlo como parte de la feature (la intención del
usuario —"metele el juego de la vida sutilmente en el background del
portfolio"— exige que el GOL sea visible tras el hero de la portada, que ocupa
100vh con fondo opaco).

### Antes / después

- **ANTES (estado detectado por el reviewer, ya revertido al iniciar la ronda 2):**
  `.new-hero { ... opacity: 0.85; }` — atenuaba el contenido completo del hero
  (texto + tarjetas + fondo), reduciendo el contraste; sin token, sin test, sin
  decisión en la spec. `git status` al inicio de la ronda 2 confirma que el
  literal ya no está en el working tree (estado commiteado limpio).
- **DESPUÉS (estado final):** el fondo del hero es translúcido vía el token
  nuevo `--opacity-hero: 0.85` aplicado SOLO al elemento del fondo
  (`.hero-background`, con `z-index: -1` y el gradiente `--color-hero-*` movido
  desde `.new-hero`); `.new-hero` queda sin `background` ni `opacity` → el
  contenido del hero mantiene el 100% de contraste. Decisión documentada en
  `specs/15_game-of-life-background/design.md` (Decisión 6 + tabla de tokens).

### Ciclo rojo/verde de los tests nuevos (ronda 2)

Añadí 4 tests en `tests/game-of-life-background.test.mjs` (bloque "Ronda 2").
ROJO capturado antes de implementar (los tests de la decisión fallan porque la
translucidez del hero no existe):

```
ok 16 - Ronda 2: .new-hero no declara opacity (el contenido del hero no se atenúa)
not ok 17 - Ronda 2: el fondo del hero es translúcido vía var(--opacity-hero) y queda detrás del contenido
ok 18 - Ronda 2: hero-section.css no conserva el literal opacity: 0.85 ni opacidades sueltas en .new-hero
not ok 19 - Ronda 2: tokens.css define --opacity-hero con patrón --grupo-nombre y valor sutil
# pass 17
# fail 2
```

(16 y 18 ya pasaban: el literal 0.85 fue revertido antes de la ronda; 17 y 19
son el ROJO real de la decisión.) Tras implementar (token + hero-section.css):

```
# tests 19
# pass 19
# fail 0
```

### Archivos tocados en la ronda 2

| Archivo | Cambio |
|---------|--------|
| `src/styles/tokens.css` (+4 líneas) | Token nuevo `--opacity-hero: 0.85` (grupo `opacity`, patrón `--grupo-nombre`), con comentario que referencia la Decisión 6. |
| `src/styles/hero-section.css` (49 → 51 líneas) | El gradiente radial del hero se traslada de `.new-hero` a `.hero-background`; este añade `z-index: -1` y `opacity: var(--opacity-hero)` (fondo translúcido, contenido intacto). `.new-hero` sin background/opacity. Sigue ≤100 líneas, sin hex/rgba, todo vía tokens. |
| `specs/15_game-of-life-background/design.md` | Decisión 6 (fondo del hero translúcido: por qué 0.85 y no `--opacity-gol`, cómo se aplica solo al fondo, stacking) + `--opacity-hero` en la tabla de tokens. |
| `tests/game-of-life-background.test.mjs` (+4 tests) | Ronda 2: `.new-hero` sin opacity; `.hero-background` con `opacity: var(--opacity-hero)` + `z-index: -1` + gradiente `--color-hero-*`; sin literal `opacity: 0.85`; `--opacity-hero` definido en tokens.css con patrón `--grupo-nombre`. |

El test de la feature 3 (`tests/hero-section-styles.test.mjs`) sigue en verde:
solo exige los selectores (`.new-hero`, `.hero-background`, ...), `var()` en
colores/radios y ≤100 líneas — el gradiente sigue saliendo de tokens.

## 7. Ronda 3 — alineación documental

**Contexto (verificado en `progress/review_15_game-of-life-background.md`, sección
"Ronda 2 — re-review"):** durante la re-review hubo un **cambio concurrente
externo** (probablemente un ajuste en vivo del usuario):

| Archivo | Cambio detectado por el reviewer |
|---------|----------------------------------|
| `src/styles/tokens.css` | `--opacity-hero` pasó de `0.85` a `0.80` (línea 91) |
| `src/styles/hero-section.css` | `opacity: var(--opacity-hero)` fue temporalmente ELIMINADO de `.hero-background` |

Ese cambio dejó la suite en rojo (122/123) y la Decisión 6 sin implementar.
**Estado actual del working tree (verificado al inicio de la ronda 3):**

- `opacity: var(--opacity-hero)` **restaurado** en `.hero-background`
  (`src/styles/hero-section.css`, línea 22) ✔
- `.new-hero` sin `opacity` ✔
- `src/styles/tokens.css` define `--opacity-hero: 0.80` (línea 91) ✔
- Nada más cambió en código: `src/utils/game-of-life-canvas.ts`,
  `GameOfLifeBackground.astro`, `game-of-life.css` y `Layout.astro` intactos
  (la suite 123/123 lo confirma).

**Decisión del líder (ronda 3):** mantener el valor real `0.80` (no revertirlo)
y alinear la documentación a ESE valor, que pasa a ser el valor final único:

- `specs/15_game-of-life-background/design.md` → Decisión 6 y tabla de tokens
  actualizadas a `--opacity-hero: 0.80`, con nota breve: el valor se ajustó en
  vivo a 0.80 durante la revisión manteniendo la decisión de diseño (fondo
  translúcido vía token, contenido del hero intacto). La justificación de 0.80
  es la misma que la de 0.85 (sutil, mantiene la legibilidad del gradiente,
  GOL perceptible al 15% a través del fondo al 80%).
- Los tests de la ronda 2 no se tocaron: ya aceptan cualquier valor de
  `--opacity-hero` en (0, 1) con patrón `--grupo-nombre`, y verifican
  `opacity: var(--opacity-hero)` en `.hero-background` — pasan con 0.80 ✔.
- `progress/current.md` → valor final 0.80 (ver arriba).
- `progress/review_15_game-of-life-background.md` → NO tocado (es del reviewer).

**Verificación completa (ronda 3):**

```
# tests 123 / # pass 123 / # fail 0        ← node --test "tests/**/*.test.mjs"
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos
AUDIT ✔ ningún color fuera de tokens.css en src/styles
✓ Complete! · 2 page(s) built              ← pnpm build
✔ El entorno está perfecto.                ← ./init.sh
```

En `dist/index.html` (y `dist/_astro/index.*.css`): `.hero-background` con
`z-index:-1` y `opacity:var(--opacity-hero)` ✔, `.new-hero` sin background ni
opacity ✔, `:root{...--opacity-hero:.8...}` (el minificador de Astro emite `.8`)
✔, canvas GOL presente en `/` y `/about` ✔.

## 8. Resultado final

Rondas 1-3: suite completa **123/123 ✔**, `node scripts/check-format.mjs` ✔,
`node scripts/audit-design-tokens.mjs` ✔, `pnpm build` ✔ (`.hero-background` con
`z-index:-1` y `opacity:var(--opacity-hero)`, token `--opacity-hero: 0.80` en
tokens.css y emitido como `.8` en dist, canvas GOL en ambas páginas) y
`./init.sh` → **"El entorno está perfecto"**. Valor final único `--opacity-hero:
0.80` alineado en tokens.css, design.md, informe y current.md. Feature 15 en
`in_progress` en `feature_list.json` (el cierre lo decide el líder tras el
reviewer). Listo para que el líder re-lance al reviewer.
