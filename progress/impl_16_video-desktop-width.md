# Implementación — feature 16 video-desktop-width

> Fecha: 2026-08-20. Implementer. Spec: `specs/16_video-desktop-width/`
> (requirements.md REQ-16-01..09 + design.md). Research:
> `progress/research/video-desktop-width.md`.

## Resumen

El video embebido del cuerpo del artículo (02-principios.md) era full-width
(~1400px en desktop). Se añade una media query de escritorio
`@media (min-width: 769px)` al final de `src/styles/article.css` que acota el
contenedor a `max-width: var(--video-max-width)` y lo centra con
`margin: var(--gap-card) auto`. En ≤768px la regla base no cambia
(`width: 100%; max-width: 100%; margin: var(--gap-card)` → full-width, REQ-11
intactos). Token nuevo `--video-max-width: 640px` en tokens.css (grupo
Contenedor, 91→93 líneas).

## Cambios en disco

| Archivo | Cambio |
|---------|--------|
| `tests/video-desktop-width.test.mjs` | NUEVO — test de inspección REQ-16-01..09 (patrón de article-iframe-styles) |
| `src/styles/article.css` | MQ `@media (min-width: 769px)` al final (después de la regla base), override solo de `max-width` y `margin`; 19→29 líneas |
| `src/styles/tokens.css` | Token `--video-max-width: 640px` + comentario justificativo en el grupo Contenedor; 91→93 líneas |
| `tests/article-card-images.test.mjs` | REQ-17-09: aserción 91→93 + justificación REQ-43-06 en encabezado |
| `tests/post-page-styles.test.mjs` | REQ-26-07: aserción 91→93 + justificación REQ-43-06 en encabezado |
| `tests/post-header.test.mjs` | REQ-39-09: aserción 91→93 + justificación REQ-43-06 en encabezado |
| `tests/post-readability.test.mjs` | REQ-40-11: aserción 91→93 + justificación REQ-43-06 en encabezado |
| `tests/post-header-horizontal.test.mjs` | REQ-42-09: aserción 91→93 + justificación REQ-43-06 en encabezado |

Fuera de alcance (respetado): `post.css` (100 líneas exactas, REQ-26-06),
`Layout.astro`, `src/pages/posts/[id].astro`, features 14/15, sin JS.

## Ciclo rojo/verde (evidencia)

### ROJO — test-first, antes de implementar

`node --test tests/video-desktop-width.test.mjs` (solo el test nuevo):

```
# tests 7
# pass 2
# fail 5
```

Fallos esperados contra la spec (el código no existía):

- `REQ-16-01` — `article.css no declara @media (min-width: 769px) ...`
- `REQ-16-02/05` — `article.css no declara @media (min-width: 769px) (REQ-16-01)`
  (el helper desktopMediaQueryBlock falla: no hay MQ)
- `REQ-16-01/06` — `no se encuentra la media query de escritorio (REQ-16-01)`
- `REQ-16-04` — `tokens.css no declara --video-max-width: 640px ...`
- `REQ-16-09` — `tests/article-card-images.test.mjs no actualiza la aserción
  de líneas de tokens.css a 93 ...`

Pasaban ya en rojo (contrato base intacto, esperado por el diseño):
`REQ-16-03/06` (regla base conserva width/max-width/margin) y `REQ-16-07`
(article.css ≤100 líneas).

### VERDE — tras implementar

`node --test tests/video-desktop-width.test.mjs tests/article-iframe-styles.test.mjs`:

```
# tests 16
# pass 16
# fail 0
```

Los 7 tests de la feature 16 y los 9 tests REQ-11 (contrato de la feature 11
sin ajustes, como previó el research D4) en verde.

Ajuste propio del test durante el verde: la aserción REQ-16-05 usaba un
lookahead negativo (`max-width\s*:\s*(?!var\()`) que el motor de regex resuelve
de forma ambigua (el `\s*` puede retroceder y dejar el lookahead en un espacio,
haciendo el negativo trivialmente verdadero). Se sustituyó por detección de
valores sueltos (`max-width\s*:\s*\d+(\.\d+)?(px|rem|em|%)` y lo mismo para
margin) — más robusto y con la misma intención REQ-16-05 (solo tokens).

### Suite completa

`./init.sh`:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json) | REQ | Test |
|--------------------------------|-----|------|
| MQ min-width 769px + max-width var(--video-max-width) + margin var(--gap-card) auto | REQ-16-01/02/05 | video-desktop-width REQ-16-01, REQ-16-02/05 |
| Regla base conserva width 100%, max-width 100%, margin var(--gap-card) (≤768px full-width) | REQ-16-03/06 | REQ-16-03/06, REQ-16-01/06 (orden MQ después de la base) |
| Token --video-max-width: 640px en tokens.css | REQ-16-04 | REQ-16-04 |
| article.css ≤100 líneas, MQ solo tokens | REQ-16-05/07 | REQ-16-02/05, REQ-16-07 |
| 5 tests de conteo de tokens.css actualizados a 93 con justificación | REQ-16-09 | REQ-16-09 |
| Suite completa en verde | — | ./init.sh |

## Notas para el reviewer

- La MQ es aditiva y va DESPUÉS de la regla base: el regex `containerRule()` de
  tests/article-iframe-styles.test.mjs captura la primera ocurrencia y sigue
  verde sin cambios (D4 del research).
- Breakpoint 769px complementa los `max-width: 768px` existentes
  (layout.css/post.css/search-results.css): sin solapamiento ni hueco.
- `margin: var(--gap-card) auto` conserva el gap vertical y centra en
  horizontal; `auto` no es un valor auditado por audit-design-tokens.mjs.
- Sin JS, sin cambios en post.css (100 líneas exactas), Layout.astro ni
  `[id].astro` (article.css ya se importa desde la feature 11).