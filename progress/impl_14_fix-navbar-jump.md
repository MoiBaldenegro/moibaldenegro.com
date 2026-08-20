# Informe de implementación — feature 14 `fix-navbar-jump`

> Sesión implementer, 2026-08-20. Feature: 14 `fix-navbar-jump` — Eliminar el
> salto horizontal del contenido al navegar por el navbar.
> Spec: `specs/14_fix-navbar-jump/requirements.md` (REQ-14-01..05) + `design.md`.
> Causa raíz: `progress/research/navbar-home-logo-jump.md` (Problema B).

## 1. Causa raíz (resumen verificado)

Con `<ClientRouter />` se navega entre páginas de alturas distintas (portada
larga vs. /about corta). `layout.css` estiliza el scrollbar global con
`::-webkit-scrollbar { width: 10px }`, que solo aparece cuando el contenido
desborda: al aparecer/desaparecer entre páginas, el viewport se
ensancha/estrecha ~10px y el contenido centrado se desplaza ~5px a la derecha
(el «saltito» al clickar el nav). Candidatos descartados en el research:
`a:focus-visible` (outline, no desplaza), border-color del input (mismo 1px),
subrayado `::after` (crece desde left).

## 2. Fix implementado (Decisión D1 del design.md)

`src/styles/layout.css`, sección «Reset global» (tras `html, body {...}`):

```css
/* Reserva del hueco del scrollbar vertical (feature 14, REQ-14-01..05): con
   ClientRouter se navega entre páginas de alturas distintas y el scrollbar
   estilizado (10px) aparece/desaparece → el viewport se ensancha/estrecha y el
   contenido centrado salta ~5px. stable mantiene el ancho estable; los
   navegadores sin soporte conservan el comportamiento actual (REQ-14-04). */
html { scrollbar-gutter: stable; }
```

- `scrollbar-gutter: stable` reserva permanentemente el hueco del scrollbar
  vertical: el ancho del viewport permanece estable durante la navegación.
- Soporte: Chrome/Edge 94+, Firefox 97+, Safari 18.2+; degradación elegante
  (REQ-14-04): navegadores sin soporte conservan el comportamiento actual.
- NO se usó `overflow-y: scroll` (alternativa descartada en design.md: track
  permanente = regresión estética + no-op con overlay scrollbars de macOS).
- layout.css: 69 → 75 líneas (≤100 OK). Sin tokens nuevos (propiedad de
  layout, no color/radio/transición). Las reglas `::-webkit-scrollbar`
  existentes se conservan intactas.
- Sin JS de runtime, sin cambios en `Layout.astro` ni `src/pages`.

## 3. Test-first (TDD)

`tests/fix-navbar-jump.test.mjs` (nuevo, patrón de los tests de inspección de
CSS existentes: `post-page-styles.test.mjs`, `article-iframe-styles.test.mjs`,
`layout-refactor.test.mjs`), 6 tests:

| Test | REQ |
|------|-----|
| `html { }` declara `scrollbar-gutter: stable` | REQ-14-01/02 |
| La regla `html` no usa la alternativa descartada `overflow-y: scroll` | design.md D1 |
| layout.css ≤100 líneas tras la regla | REQ-14-03 (REQ-08-06) |
| layout.css conserva tokens exclusivos (sin hex/rgb; la regla html no introduce color/radio/borde/transición) | REQ-14-03 |
| Conserva las reglas `::-webkit-scrollbar` (width 10px, thumb/track con tokens) | REQ-14-04 |
| `scrollbar-gutter` vive solo en layout.css (recorrido recursivo de src/; sin scripts ni módulos de cliente) | REQ-14-05 |

## 4. Evidencia del ciclo rojo/verde

**ROJO** — `node --test tests/fix-navbar-jump.test.mjs` (antes de implementar;
solo existía el test):

```
not ok 1 - REQ-14-01/02: layout.css declara scrollbar-gutter stable en el selector html
not ok 2 - REQ-14-01/design.md: la reserva no usa la alternativa descartada overflow-y: scroll
ok 3 - REQ-14-03: layout.css no supera las 100 líneas tras la regla
not ok 4 - REQ-14-03: layout.css conserva el uso exclusivo de tokens tras la regla
ok 5 - REQ-14-04: layout.css conserva las reglas ::-webkit-scrollbar existentes
not ok 6 - REQ-14-05: la reserva del hueco vive solo en layout.css, sin scripts ni módulos de cliente
# pass 2
# fail 4
```

Los 4 fallos son exactamente los que dependen de la regla ausente (vía
`htmlRule`): la regla `html { }` no existía. Los 2 verdes son los invariantes
(≤100 líneas y `::-webkit-scrollbar` conservadas) que la implementación debía
mantener. Nota: el helper `listFiles` del test 6 tuvo un bug de resolución de
URL (base sin `/` final trataba `components` como archivo) corregido en el
propio test antes de la implementación; tras el fix el rojo fue limpio.

**VERDE** — tras añadir la regla a layout.css:

```
ok 1 - REQ-14-01/02: layout.css declara scrollbar-gutter stable en el selector html
ok 2 - REQ-14-01/design.md: la reserva no usa la alternativa descartada overflow-y: scroll
ok 3 - REQ-14-03: layout.css no supera las 100 líneas tras la regla
ok 4 - REQ-14-03: layout.css conserva el uso exclusivo de tokens tras la regla
ok 5 - REQ-14-04: layout.css conserva las reglas ::-webkit-scrollbar existentes
ok 6 - REQ-14-05: la reserva del hueco vive solo en layout.css, sin scripts ni módulos de cliente
# pass 6
# fail 0
```

**Suite completa** — `./init.sh` (formato, tests 100%, build):

```
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 5. Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json) | REQ cubiertos | Test |
|--------------------------------|---------------|------|
| layout.css declara en el selector html `scrollbar-gutter` con valor `stable` | REQ-14-01, 14-02, 14-03 | tests 1-2 |
| layout.css no supera 100 líneas y mantiene uso exclusivo de tokens | REQ-14-03, REQ-08-06 | tests 3-4 |
| conserva las reglas `::-webkit-scrollbar` existentes | REQ-14-04 | test 5 |
| reserva solo en layout.css sin scripts ni módulos de cliente nuevos | REQ-14-05 | test 6 |
| suite completa en verde | require_tests_to_close | `./init.sh` ✔ |

## 6. Alcance / fuera de alcance

- Dentro: `src/styles/layout.css` (+6 líneas: comentario + regla; 75 totales)
  y `tests/fix-navbar-jump.test.mjs` (nuevo).
- Fuera (no tocado): `Layout.astro`, `src/pages`, JS de runtime, tokens,
  `overflow-y: scroll`, feature 10 (in_progress) y cualquier otro cambio.

## 7. Verificación visual (regresión UI)

Cambio CSS-only de reserva de hueco; el comportamiento visual en navegadores
sin soporte es idéntico al actual (REQ-14-04). La suite y el build verifican
el resto; el reviewer puede comprobar con `pnpm dev` que el ancho se mantiene
al navegar entre páginas de alturas distintas (portada ↔ /about).