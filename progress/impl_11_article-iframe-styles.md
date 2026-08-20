# Informe de implementación — feature 11 article-iframe-styles

> Implementer. Fecha: 2026-08-20.
> Spec: `specs/11_article-iframe-styles/requirements.md` (REQ-11-01..09) + `design.md`.
> Causa raíz: `progress/research/iframe-video-styles.md` (article.css solo
> importado en `index.astro`, destino equivocado; la página de detalle no lo
> importaba).

## 1. Alcance implementado

1. `src/pages/posts/[id].astro`: import aditivo `../../styles/article.css`
   (REQ-11-01). Los imports existentes de `post.css`/`post-header.css`/
   `post-readability.css` y sus aserciones REQ-26-02 no cambian (Decisión 4
   del design.md).
2. `src/pages/index.astro`: retirado `import "../styles/article.css"` (CSS
   muerto en la portada, REQ-11-08).
3. `src/styles/article.css` (25 → 18 líneas):
   - Scoping bajo `.post__content .video-container` (REQ-11-02/04, Decisión 2).
   - Contenedor: `width: 100%`, `aspect-ratio: 16 / 9`, `overflow: hidden`,
     `border-radius: var(--radius-card)`, `margin: var(--gap-card)`
     (REQ-11-02/05; tokens del design.md).
   - Iframe: `display: block`, `width: 100%`, `height: 100%`, `border: 0`;
     sin `min-height` (REQ-11-06) y sin `border-radius` numérico (Decisión 3:
     el contenedor con `overflow: hidden` recorta las esquinas).
   - Eliminadas las clases muertas `.article` y `.prose` (REQ-11-07).
   - Sin hex/rgb()/rgba() ni radios sueltos; 18 líneas (≤100, REQ-11-09).
4. `tests/article-iframe-styles.test.mjs` (9 tests de inspección node:test,
   patrón de `tests/post-page-styles.test.mjs`): REQ-11-01..09 + convenciones
   (≤100 líneas de la página, sin `<style>` embebido, imports de post.css
   conservados). Sin JS de runtime (estático por defecto).

## 2. Ciclo rojo/verde (TDD)

### ROJO — tests escritos ANTES de implementar

```
$ node --test tests/article-iframe-styles.test.mjs
not ok 1 - REQ-11-01: la página de detalle de artículo importa la hoja article.css
not ok 2 - REQ-11-08: la portada deja de importar la hoja article.css
not ok 3 - REQ-11-02/04: el contenedor del video va scoping bajo .post__content con ratio 16/9 y radio token
not ok 4 - REQ-11-03: el iframe declara display block, width 100% y height 100%
not ok 5 - REQ-11-06: el iframe omite min-height y border-radius numérico
not ok 6 - REQ-11-05/convención: article.css no contiene hex, rgb()/rgba() ni radios sueltos
not ok 7 - REQ-11-07: article.css elimina las clases muertas .article y .prose
ok 8 - REQ-11-09: article.css no supera las 100 líneas
ok 9 - Convención: la página de detalle conserva ≤100 líneas, sin estilos embebidos y con los imports de post.css
1..9
# tests 9
# pass 2
# fail 7
```

Nota: los 2 tests que ya pasaban en rojo (REQ-11-09 y la convención de la
página) verifican estados que el código actual ya cumplía (article.css tenía
25 líneas y `[id].astro` ya cumplía la convención).

### VERDE — después de implementar

```
$ node --test tests/article-iframe-styles.test.mjs
1..9
# tests 9
# pass 9
# fail 0
```

Ajuste durante el verde: el test de "radios sueltos" usaba un regex con
lookahead negativo ambiguo (`border-radius\s*:\s*(?!var\()` que casaba con
zero whitespace). Se sustituyó por extracción de todas las declaraciones
`border-radius` y aserción de `var(--` en cada una (más robusto; el resto de
tests no cambió).

## 3. Suite completa y arnés

Baseline pre-feature: **410 tests, 408 pass, 2 fail** (los 2 rojos
preexistentes de la navbar: `tests/architecture-nav-link.test.mjs` REQ-08-04
y `tests/layout-refactor.test.mjs` REQ-08-05 — regresión del enlace Home que
resuelve la feature 12 `restore-navbar-home-link`, fuera del alcance de la
feature 11; NO se tocó `Layout.astro`).

Post-feature:

```
$ pnpm test
1..419
# tests 419
# pass 417
# fail 2
not ok 14 - REQ-08-04: se conservan Home, About, @moibaldenegro y la barra de búsqueda
not ok 191 - REQ-08-05: la navbar compartida vive en el layout único
```

→ +9 tests (los de la feature 11), +9 verdes, y **exactamente los mismos 2
rojos preexistentes**: ningún fallo nuevo añadido.

```
$ ./init.sh
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✘ tests al 100% (node:test)     ← solo los 2 rojos preexistentes REQ-08-04/REQ-08-05 (feature 12)
✔ build de producción (pnpm build)
```

```
$ node scripts/audit-design-tokens.mjs
AUDIT ✔ ningún color fuera de tokens.css en src/styles
```

## 4. Verificación del build (regresión visual estática)

El build de Cloudflare (dist/client) fue inspeccionado:

- `dist/client/posts/02-principios-del-diseno-de-software/index.html` incluye
  las reglas finales (style block inline de la página):
  `.post__content .video-container{aspect-ratio:16/9;width:100%;max-width:100%;margin:var(--gap-card);border-radius:var(--radius-card);overflow:hidden}` y
  `.post__content .video-container iframe{border:0;width:100%;height:100%;display:block}`.
- `dist/client/index.html`: ningún style block contiene `video-container`
  (la única ocurrencia es el índice JSON embebido con los cuerpos de los
  artículos, REQ-05-04 — no es CSS).

## 5. Archivos tocados

| Archivo | Cambio |
|---|---|
| `tests/article-iframe-styles.test.mjs` | Nuevo (163 líneas, 9 tests REQ-11-01..09) |
| `src/styles/article.css` | Reescrita: 25 → 18 líneas; scoping `.post__content`, tokens, sin min-height/border-radius en iframe, sin `.article`/`.prose` |
| `src/pages/posts/[id].astro` | +1 import (`../../styles/article.css`, L5, aditivo) |
| `src/pages/index.astro` | −1 import (`../styles/article.css`, L10 eliminada) |
| `feature_list.json` | feature 11: `pending` → `in_progress` |

Líneas finales:

```
$ wc -l src/styles/article.css "src/pages/posts/[id].astro" src/pages/index.astro tests/article-iframe-styles.test.mjs
  18 src/styles/article.css
  54 src/pages/posts/[id].astro
  35 src/pages/index.astro
 163 tests/article-iframe-styles.test.mjs
```

## 6. Estado y fuera de alcance

- Feature 11 implementada y verificada. Suite en estado esperado: **417
  verdes + 2 rojos preexistentes documentados** (REQ-08-04/REQ-08-05, navbar,
  feature 12 `restore-navbar-home-link` — el líder confirmó que NO se
  arreglan aquí).
- `feature_list.json` conserva la feature 11 `in_progress` (el implementer no
  marca `done`; lo hará el líder tras el `APPROVED` del reviewer).
- Fuera de alcance (sin cambios): `post.css`/`post-header.css`/
  `post-readability.css` (REQ-26-02/06), `tokens.css` (91 líneas canónicas),
  `Layout.astro` (feature 12), feature 10 `client-init-on-navigation`.