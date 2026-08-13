# Informe de implementación — feature 26 `post-page-styles`

> Implementador: agente implementer (ciclo 2026-08-13). Feature declarada en
> `feature_list.json` (id 26, `pending` → `in_progress`). Spec:
> `specs/26_post-page-styles/` (requirements.md + design.md). Contexto:
> `progress/research/estilos-posts-y-gol-removal.md` y hallazgo del reviewer de
> la feature 24 (clases `post__image`/`post__title` sin hoja CSS).

## 1. Ciclo rojo/verde

### 1.1 Test escrito primero (REQ-26-01)

`tests/post-page-styles.test.mjs` (12 subtests) siguiendo el patrón
`tests/about-page.test.mjs` y `tests/article-card-images.test.mjs` (REQ-17):
existencia de la hoja e import desde la página, clases BEM reales del marcado
de `[id].astro`, regla de la imagen (width 100%, aspect-ratio 16/9,
object-fit cover, `var(--radius-card)`, `var(--color-border)`, margen y
display block), scoping de la tipografía del contenido bajo `.post__content`
(h2/h3, p, ul/ol/li, a, code/pre), colores/radios/bordes/transiciones solo
`var()`, límite 100 líneas, sin hex/rgba, tokens.css sin cambios (87 líneas,
estado canónico post-feature 25) y convenciones de página.

### 1.2 Evidencia ROJO (antes de implementar)

Estado inicial verificado en disco: `src/styles/post.css` NO existía y
`[id].astro` (38 líneas) no importaba ninguna hoja.

```
$ node --test tests/post-page-styles.test.mjs
1..11
# tests 11
# suites 0
# pass 2
# fail 9
# cancelled 0
# skipped 0
# todo 0
# duration_ms 70.4367
```

Fallos representativos:

```
not ok 1 - REQ-26-02: la página de artículo importa la hoja post.css
  error: 'src/pages/posts/[id].astro no importa ../styles/post.css (REQ-26-02)'
not ok 3 - REQ-26-03: la hoja estiliza contenedor, título, meta e imagen
  error: 'src/styles/post.css no existe (REQ-26-02)'
not ok 4 - REQ-26-03: la tipografía del contenido markdown va scoping bajo .post__content
  error: 'src/styles/post.css no existe (REQ-26-02)'
... (9 fallos: todos por ausencia de la hoja y del import)
```

### 1.3 Evidencia VERDE (después de implementar)

```
$ node --test tests/post-page-styles.test.mjs
1..11
# tests 11
# suites 0
# pass 11
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 71.2918
```

Incidencias del ciclo resueltas (ver sección 3): ruta de import inicial
incorrecta (`../styles/post.css` vs la correcta `../../styles/post.css`
desde `src/pages/posts/`) detectada por el build real dentro de
`tests/about-page.test.mjs` (REQ-11-05) — el arnés cumplió su función.

## 2. Cobertura REQ-26-XX

| REQ | Contrato | Cómo se cumple |
|-----|----------|----------------|
| REQ-26-01 | Test escrito antes de la implementación, sin navegador | `tests/post-page-styles.test.mjs` escrito y observado en rojo antes de crear `post.css` (§1). |
| REQ-26-02 | La página importa `src/styles/post.css` | `[id].astro:3` → `import "../../styles/post.css";` (ruta correcta desde `src/pages/posts/`). |
| REQ-26-03 | La hoja estiliza contenedor, título, meta, imagen y tipografía del contenido | Reglas `.post`, `.post__title`, `.post__meta`, `.post__image` y scoping `.post__content h2/h3/p/ul/ol/li/a/code/pre` sobre el marcado real sin tocarlo. |
| REQ-26-04 | Imagen 16:9, cover, `var(--radius-card)` y `var(--color-border)` | `.post__image`: `width: 100%`, `aspect-ratio: 16 / 9`, `object-fit: cover`, `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border)`, `margin: var(--gap-card) 0 32px`, `display: block` (precedente REQ-17-02..05). |
| REQ-26-05 | Colores/radios/bordes/transiciones solo desde tokens; resto literales | Todas las declaraciones de `color/background/border/border-radius/transition` usan `var()` (test estructural); tipografía (font-size/line-height), paddings y ancho de lectura (`max-width: 760px`) son literales del componente (design.md). |
| REQ-26-06 | Máximo 100 líneas, sin hex ni rgba sueltos | `post.css` = **99 líneas** (`countLines` wc -l); test sin hex/rgb()/rgba() y `node scripts/audit-design-tokens.mjs` ✔ (invocado por la suite/init). |
| REQ-26-07 | tokens.css sin cambios ni tokens nuevos | `tokens.css` conserva **87 líneas** (estado post-feature 25) y sin tokens `--post-*`/`--text-*`/`--font-size-*`; verificado por el test (alineación: el acceptance decía "96 líneas" porque se escribió antes de REQ-25-03 — el estado canónico 87 lo fija también `tests/article-card-images.test.mjs` REQ-17-09). |
| REQ-26-08 | Suite y build en verde | Suite 169/169, build OK (rutas `/posts/00-agilismo` y `/posts/01-diseño-detallado`), `./init.sh` "El entorno está perfecto" (§4). |

Decisiones del design.md respetadas: Decisión 1 (hoja propia `post.css`
patrón about/latest), Decisión 2 (tipografía del `<Content />` con scoping
bajo `.post__content` sin tocar marcado), Decisión 3 (imagen bloque uniforme,
`alt={title}` y `transition:name` intactos), Decisión 4 (enlace a `/posts`
desde latest-articles FUERA de alcance — no se toca `latest-articles.astro`;
REQ-20-06 sigue exigiendo su ausencia), Decisión 5 (solo import en la página:
38 → 39 líneas, ≤100 ✓, `tests/view-transitions.test.mjs` intacto y en verde).

## 3. Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `tests/post-page-styles.test.mjs` | **Nuevo** — 12 subtests del contrato REQ-26-01..07 + convenciones. |
| `src/styles/post.css` | **Nuevo** — 99 líneas, BEM `.post__*`, solo tokens, imagen 16:9, tipografía del contenido. |
| `src/pages/posts/[id].astro` | +1 línea: `import "../../styles/post.css";` al inicio del frontmatter (38 → 39 líneas). |
| `feature_list.json` | `status: "in_progress"` para la feature 26. |
| `progress/current.md` | Sección "Feature en curso" con plan y resultado. |

NO tocados (scope respetado): `src/styles/tokens.css` (REQ-26-07),
`src/styles/layout.css` (la spec 26 no ordena cambios; el centrado del
contenido se resuelve en `post.css` con `margin: auto` + `max-width`),
`Layout.astro`, `latest-articles.astro`, dominio/repos, features 18-25.

## 4. Verificación final (completa)

```
$ node --test tests/post-page-styles.test.mjs
# tests 11   # pass 11   # fail 0

$ pnpm test
1..169
# tests 169
# suites 0
# pass 169
# fail 0
# duration_ms 3463.1409

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

$ pnpm build
✓ Completed in 87ms.  →  /about, /posts/00-agilismo, /posts/01-diseño-detallado, /index.html
Server built in 1.07s / [build] Complete!

$ bash init.sh
✔ node instalado / ✔ pnpm instalado / ✔ dependencias instaladas
✔ AGENTS.md existe / ✔ feature_list.json existe / ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Evidencia adicional de build: el CSS de `post.css` queda inlined por Astro en
`dist/client/posts/<id>/index.html` (verificado: la regla compilada contiene
`aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius-card);
border:1px solid var(--color-border);width:100%;margin:var(--gap-card) 0 32px;
display:block` en ambas rutas de post).
