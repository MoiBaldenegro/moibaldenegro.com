# Informe de implementación — feature 41 `post-reading-width-restore`

> Fecha: 2026-08-14. Rol: implementer. Ciclo 33.
> Rechazo del humano a la feature 40: "no compa lo volvieron a poner muy
> angosto" → el cuerpo del detalle vuelve al ancho completo del contenedor;
> las mejoras tipográficas de la 40 se conservan.

## Alcance (cambio mínimo, según spec y design.md)

| Archivo | Cambio |
|---------|--------|
| `src/styles/post-readability.css` | Se ELIMINAN `max-inline-size: 70ch` y `margin-inline: auto` de `.post__body` (REQ-41-01/02). Se conservan TODAS las reglas tipográficas: `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)`, `text-wrap: pretty` + `margin-block-end: 1lh` + `letter-spacing: 0.01em` en p, `text-wrap: balance` en h1-h3, h2 1.75rem / h3 1.4rem con márgenes en lh y media query 768px (REQ-41-03..09). Comentarios actualizados al contrato del ciclo 33 (sin mencionar la medida; el guard del test no descarta comentarios). Hoja final: 42 líneas (≤100 ✓) y sin hex/rgba (REQ-41-11). |
| `tests/post-readability.test.mjs` | Actualización AUTORIZADA por la spec (REQ-41-10, design.md §Cambios de test autorizados): (1) test REQ-40-02 pasa de verificar `max-inline-size: 70ch` + `margin-inline: auto` a verificar la AUSENCIA de `max-width`/`max-inline-size` en `.post__body`; (2) test REQ-40-12 conserva su aserción original y se refuerza con el guard de que NINGUNA regla de post-readability.css declara `max-width`/`max-inline-size` (el patrón distingue declaraciones de propiedad del contexto `@media (max-width: 768px)` de REQ-40-09; no descarta comentarios — research §8 riesgo 1); (3) comentario de cabecera actualizado al contrato del ciclo 33. REQ-40-01, 03..11 y convenciones SIN cambios. |
| `src/pages/posts/[id].astro` | SIN cambios (verificado: `section.post__body` envuelve el `<Content />`, REQ-41-02; imports y pares transition intactos). |
| `src/styles/post.css`, `post-header.css`, `tokens.css` | SIN cambios (REQ-41-13: `.post__content` conserva el ancho completo sin max-width; tokens.css en 87 líneas, REQ-41-12). |

## Ciclo rojo (test-first, evidencia)

Antes de tocar la hoja, se actualizó el test autorizado y se ejecutó
`node --test tests/post-readability.test.mjs`:

```
not ok 3 - REQ-40-02/REQ-41-01: .post__body no acota el ancho (medida 70ch eliminada)
  error: '.post__body declara max-inline-size (REQ-41-01): la columna de lectura debe
  ocupar el ancho completo del contenedor'
  actual: |-
      max-inline-size: 70ch;
      margin-inline: auto;
      font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
not ok 12 - REQ-40-12/REQ-41-13: .post__content conserva el ancho completo y ninguna regla de la hoja de lectura acota el ancho
  error: 'post-readability.css declara max-width o max-inline-size en alguna regla (REQ-41-01)'
# tests 13
# pass 11
# fail 2
```

El rojo queda acotado a las 2 aserciones de la medida; las aserciones
tipográficas (REQ-40-03..09) pasan ya en rojo, confirmando que el contrato
conservado se mantiene.

## Ciclo verde (evidencia)

Tras eliminar la acotación en `post-readability.css` (`.post__body` queda solo
con `font-size: clamp(...)`):

1. Test de la feature — `node --test tests/post-readability.test.mjs`:

```
ok 3 - REQ-40-02/REQ-41-01: .post__body no acota el ancho (medida 70ch eliminada)
ok 12 - REQ-40-12/REQ-41-13: .post__content conserva el ancho completo y ninguna regla de la hoja de lectura acota el ancho
# tests 13
# pass 13
# fail 0
```

2. Suite completa — `node --test "tests/**/*.test.mjs"`:

```
1..246
# tests 246
# pass 246
# fail 0
```

3. Auditoría de tokens — `node scripts/audit-design-tokens.mjs`:

```
AUDIT ✔ ningún color fuera de tokens.css en src/styles
```

4. Harness completo — `./init.sh`:

```
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Verificación en el build (dist/)

El sitio compila a SSR (dist/client + dist/server). En la página renderizada
`dist/client/posts/00-agilismo/index.html`:

- `<section class="post__body">`, `<header class="post__hero">` y
  `<article class="post__content">` presentes (markup intacto, REQ-41-02).
- CSS inline de la página: `.post__body{font-size:clamp(1.0625rem,1rem + .3vw,1.1875rem)}`
  — sin `max-inline-size`, sin `max-width`, sin `70ch` (0 ocurrencias de
  `70ch`/`max-inline-size` en la página).
- `.post__content{font-family:var(--font-sans)}` — sin max-width (REQ-41-13):
  el cuerpo ocupa el ancho completo del contenedor `width:min(var(--container-max), 95%)`.
- Header hero intacto: `.post__hero{...background:linear-gradient(160deg, var(--color-hero-top)...}`.

El cuerpo del artículo ocupa el mismo ancho que el header hero (ambos
full-width), que es exactamente la decisión del humano.

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature 41) | REQ | Evidencia |
|---|---|---|
| `.post__body` sin max-width/max-inline-size; cuerpo a ancho completo | REQ-41-01/02/13 | CSS hoja + test verde + build |
| Test actualizado (REQ-40-02 → ausencia; REQ-40-12 reforzado; resto intacto) | REQ-41-10 | tests/post-readability.test.mjs |
| clamp 1.0625–1.1875rem | REQ-41-03 | test REQ-40-03 verde |
| pretty / 1lh / 0.01em | REQ-41-04/05/06 | test REQ-40-04/05/06 verde |
| balance / 1.75rem / 1.4rem / MQ 768px | REQ-41-07/08/09 | tests REQ-40-07/08/09 verde |
| ≤100 líneas, sin hex/rgba; tokens.css 87 líneas | REQ-41-11/12 | test REQ-40-10/11 verde + audit |
| post-header / post-page-styles / view-transitions / design-tokens sin modificar y en verde | REQ-41-13 | suite 246/246 |

## Estado del harness

- `feature_list.json`: feature 41 en `status: "in_progress"` (NO marcada done;
  se cerrará solo con `progress/review_41_*.md` APPROVED).
- `progress/current.md`: documentada la sesión (feature, plan, resultado).
- Sin dependencias nuevas, sin JS de runtime, sin tocar `dist/` a mano.
