# Review — feature 11

**Veredicto:** APPROVED

Revisado: 2026-08-20. Base: `specs/11_article-iframe-styles/requirements.md`
(REQ-11-01..09) + `design.md`, `progress/research/iframe-video-styles.md`,
`progress/impl_11_article-iframe-styles.md`, estado real en disco y ejecución
del arnés.

## Justificación por requisito

| REQ | Verificación en disco | Estado |
|-----|----------------------|--------|
| REQ-11-01 | `src/pages/posts/[id].astro` L5 importa `../../styles/article.css` (import aditivo; git diff = +1 línea, los imports de post.css/post-header.css/post-readability.css intactos, REQ-26-02) | ✔ |
| REQ-11-02 | `.post__content .video-container` (article.css L5-12): `width: 100%`, `aspect-ratio: 16 / 9`, `overflow: hidden`, `border-radius: var(--radius-card)` | ✔ |
| REQ-11-03 | `.post__content .video-container iframe` (L14-19): `display: block`, `width: 100%`, `height: 100%`, `border: 0` | ✔ |
| REQ-11-04 | Scoping `.post__content .video-container` — el cuerpo markdown renderiza bajo `.post__content` (verificado: 02-principios.md L37 `<div class="video-container">` dentro del cuerpo) | ✔ |
| REQ-11-05 | Solo tokens: `margin: var(--gap-card)`, `border-radius: var(--radius-card)` (ambos existen en tokens.css: 66/74). `node scripts/audit-design-tokens.mjs` → AUDIT ✔ | ✔ |
| REQ-11-06 | Sin `min-height` en la regla del iframe (git diff confirma la eliminación de `min-height: 500px`) | ✔ |
| REQ-11-07 | Sin `.article` ni `.prose` en article.css (git diff confirma la eliminación; grep en src/ = 0 usos) | ✔ |
| REQ-11-08 | `src/pages/index.astro`: import de article.css retirado (git diff = −1 línea). Build: `dist/client/index.html` sin CSS de video-container (única ocurrencia = índice JSON embebido con cuerpo escapado, REQ-05-04) | ✔ |
| REQ-11-09 | article.css = 18 líneas (≤100) | ✔ |

## Evidencia test-first (pregunta de revisión)

Sí. `progress/impl_11_article-iframe-styles.md` §2 documenta el ciclo:
ROJO antes de implementar (`node --test tests/article-iframe-styles.test.mjs`
→ 7 fail / 2 pass; los 2 pass pre-satisfechos son el límite de líneas y la
convención de página, ambos ya cumplidos por el estado previo) y VERDE tras
implementar (9/9 pass). El ajuste de un regex ambiguo del test durante el
verde está documentado (extracción de declaraciones `border-radius` con
aserción `var(--`). Verificado en disco que el estado pre-cambio fallaba
REQ-11-01/02/03/05/06/07/08 (falta de import, valores hardcodeados 12px/500px,
clases muertas, import en portada) — el rojo reportado es consistente.

Suite completa: 419 tests, 417 pass, 2 fail = exactamente los rojos
preexistentes REQ-08-04 (`tests/architecture-nav-link.test.mjs`) y REQ-08-05
(`tests/layout-refactor.test.mjs`) por el enlace Home del navbar — feature 12,
fuera de alcance. `Layout.astro` no está modificado (git status). Cero fallos
nuevos añadidos por la feature 11. Feature 11 `depends_on: []` → sin
dependencias pendientes.

`./init.sh`: entorno ✔, archivos ✔, formato ✔, build ✔; tests ✘ solo por los
2 rojos preexistentes de la navbar (causa documentada, no atribuible a esta
feature). Build inspeccionado: `dist/client/posts/02-principios-del-diseno-de-software/index.html`
contiene `.post__content .video-container{...border-radius:var(--radius-card);overflow:hidden}` y
`.post__content .video-container iframe{border:0;width:100%;height:100%;display:block}` — el
video del artículo 02 recibe los estilos.

## Cumplimiento de convenciones

- Estilos separados de la UI: CSS en `src/styles/article.css`, importado desde la página; sin `<style>` ni atributos style en `[id].astro`/`index.astro` ✔
- Tokens, no valores sueltos: sin hex/rgb()/rgba()/radios numéricos en article.css (test REQ-11-05/convención lo asercióna; audit de tokens ✔) ✔
- ≤100 líneas: article.css 18, `[id].astro` 54, index.astro 35. El test (163 líneas) sigue el precedente del repo de tests de inspección (post-page-styles 258, visual-polish 236, layout-refactor 196, architecture-nav-link 141) ✔
- Sin dependencias externas: node:test + node stdlib ✔
- Estático por defecto: cero JS añadido (solo CSS e imports) ✔
- BEM ligero: `.post__content .video-container` consistente con `.post` ✔
- Sin basura: grep de console.log/TODO/FIXME/debugger en archivos tocados = limpio ✔

## Alcance (nada fuera de límite)

| Archivo | Estado |
|---------|--------|
| `src/layouts/Layout.astro` | Sin cambios (48 líneas, sin enlace Home → los 2 rojos preexistentes siguen siendo de la feature 12) |
| `src/styles/post.css` (100), `post-header.css` (99), `post-readability.css` (41), `tokens.css` (91) | Sin cambios |
| Feature 10 (client-init-on-navigation) | Sin cambios (ningún componente search tocado) |
| Feature 12 | Solo artefactos de spec (`specs/12_restore-navbar-home-link/{requirements,design}.md`), sin código |
| `specs/11_article-iframe-styles/` | requirements.md (EARS, REQ-11-01..09) + design.md ✔ |

## Checkpoints
- C1: [x]
- C2: [x]
- C3: [x]
- C4: [x]
- C5: [x]
- C6: [x] (init.sh: todo ✔ salvo tests-100% por los 2 rojos preexistentes de la navbar, feature 12 — documentado, no atribuible a la feature 11)
- C7: [ ] (inspección visual en navegador — pendiente preexistente del arnés)
- C8: [ ] (feature_list.json `done` — el implementer conserva `in_progress` por protocolo; lo marca el líder tras el APPROVED)
- C9: [x]
- C10: [x]

## Cambios requeridos
Ninguno.