# Ancho de lectura full-width del detalle de post — ciclo 33

> Fecha: 2026-08-14. Rol: spec_author. Petición del humano tras la feature 40
> (post-readability): "no compa lo volvieron a poner muy angosto". El humano
> rechaza la columna de lectura de `max-inline-size: 70ch` que la feature 40
> aplicó sobre `section.post__body` y ordena que el contenido del detalle
> vuelva a ocupar el ancho completo de la página (como pedía la feature 39,
> REQ-39-01). Las mejoras de legibilidad que NO estrechan se conservan.
> Documenta qué se revierte exactamente, qué se conserva, la decisión
> estructural (clase `post__body`), el trade-off acatando la decisión humana
> y los cambios de tests autorizados. No implementa nada.

## 1. Qué es y qué toca

- Petición: `src/pages/posts/[id].astro` + `src/styles/post-readability.css`
  (feature 40, ciclo 32). La feature 40 envolvió el `<Content />` en
  `<section class="post__body">` y declaró en la hoja nueva:
  `max-inline-size: 70ch; margin-inline: auto` (medida óptima 45-75ch de la
  investigación) sobre el cuerpo de lectura, junto con mejoras tipográficas.
- Estado en disco verificado:
  - `src/pages/posts/[id].astro` (52 líneas): `article.post__content` >
    `section.post__body` > `<Content />`; importa post.css,
    post-header.css y post-readability.css (en ese orden).
  - `src/styles/post-readability.css` (44 líneas): `.post__body` con
    `max-inline-size: 70ch; margin-inline: auto; font-size:
    clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)`; `.post__content p` con
    `text-wrap: pretty`, `letter-spacing: 0.01em`, `margin-block-end: 1lh`;
    `.post__content h1,h2,h3` con `text-wrap: balance`; h2 1.75rem con
    márgenes lh; h3 1.4rem con márgenes lh; media query 768px (h2 1.4rem,
    h3 1.2rem).
  - `src/styles/post.css` (100 líneas, intacto): `.post__content` SIN
    max-width (REQ-39-01); `.post` con `var(--container-max)`.
  - `tests/post-readability.test.mjs` (211 líneas): REQ-40-01..12; el test
    REQ-40-02 asertúa `max-inline-size: 70ch` + `margin-inline: auto` en
    `.post__body`; REQ-40-12 asertúa `.post__content` sin max-width.
  - `tests/post-header.test.mjs` (REQ-39-01..09), `tests/post-page-styles.test.mjs`
    (REQ-26-02..07), `tests/view-transitions.test.mjs` (REQ-24-03/05),
    `tests/design-tokens.test.mjs`: contratos que NO se tocan.

## 2. Reafirmación del problema y decisión del humano

El humano pidió en la feature 39 que el contenido ocupara "el mismo ancho de
la página" (REQ-39-01: `.post__content` sin max-width, fijado por
`tests/post-header.test.mjs`). En el ciclo 32 pidió mejoras de lectura
("la fuente se ve muy pequeña") y la feature 40 resolvió la tensión acotando
SOLO la columna de texto a 70ch (research
`legibilidad-detalle-post-ciclo32.md` §3, opción A). El resultado visual en
ultrawide — columna de ~70ch centrada con aire a los lados — es percibido
por el humano como "otra vez muy angosto" y lo rechaza.

**Decisión: la decisión del humano manda.** El contenido del detalle de posts
vuelve a ocupar el ancho completo de la página (ancho del contenedor
`min(var(--container-max), 95%)` = 1500px). Se elimina TODA acotación de
medida (`max-inline-size` / `max-width`) de la capa de lectura. Las mejoras
tipográficas que NO estrechan se conservan íntegras.

## 3. Qué se revierte y qué se conserva (cambios concretos)

### 3.1 Se revierte (el rechazo del humano)

- `src/styles/post-readability.css`, regla `.post__body`: se ELIMINAN
  `max-inline-size: 70ch;` y `margin-inline: auto;`. La regla queda solo con
  el tamaño de fuente fluido:
  `.post__body { font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem); }`
- `tests/post-readability.test.mjs`, test REQ-40-02: deja de verificar 70ch
  y pasa a verificar la AUSENCIA de acotación (ver §5).

### 3.2 Se conserva (mejoras de legibilidad que no estrechan)

| Mejora (feature 40) | ¿Tiene sentido a ancho completo? | Decisión |
|---------------------|----------------------------------|----------|
| `font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` (17→19px) | Sí: responde a la queja original "la fuente se ve muy pequeña"; independiente del ancho (WCAG 1.4.4, rem). | CONSERVAR (REQ-41-03) |
| `text-wrap: pretty` en `p` | Sí: evita huérfanas en la última línea de CUALQUIER párrafo; a líneas largas reduce el efecto visual pero el mecanismo sigue activo y es mejora progresiva (FF degrada en silencio). | CONSERVAR (REQ-41-04) |
| `margin-block-end: 1lh` en `p` | Sí: ritmo vertical atado al line-height; independiente del ancho. | CONSERVAR (REQ-41-05) |
| `letter-spacing: 0.01em` en `p` | Sí: confort de tema oscuro; independiente del ancho. | CONSERVAR (REQ-41-06) |
| `text-wrap: balance` en `h1-h3` | Sí: equilibra títulos de 2+ líneas; en una sola línea no tiene costo; seguro ~92%. | CONSERVAR (REQ-41-07) |
| h2 1.75rem / h3 1.4rem + márgenes en `lh` | Sí: jerarquía y ritmo; independientes del ancho. | CONSERVAR (REQ-41-08) |
| Media query 768px (h2 1.4rem / h3 1.2rem) | Sí: responsive tipográfico; independiente del ancho. | CONSERVAR (REQ-41-09) |
| `section.post__body` envolviendo el `<Content />` | Sí: contenedor semántico/estructural del body; sin medida no acota nada. | CONSERVAR (REQ-41-02) |
| Orden de imports (post.css → post-header.css → post-readability.css) | Sí: fija la cascada de los overrides tipográficos. | CONSERVAR (REQ-40-01, test intacto) |

### 3.3 Archivos afectados (estado final esperado)

- `src/styles/post-readability.css`: se eliminan 2 líneas (`max-inline-size`
  y `margin-inline`) y se actualiza el comentario de cabecera y el de la
  regla (de "medida óptima" a "ancho completo del contenedor, sin acotación").
  La hoja queda en ~40 líneas (≤100 ✓).
- `src/pages/posts/[id].astro`: SIN cambios (el markup `post__body` se
  conserva; los pares `title-${entry.id}`/`img-${entry.id}` de REQ-24-03/05
  intactos; 52 líneas ≤100 ✓).
- `tests/post-readability.test.mjs`: actualización autorizada y listada
  (§5). El resto de tests del arnés NO se tocan.
- `src/styles/post.css`, `src/styles/post-header.css`,
  `src/styles/tokens.css`: SIN cambios (87 líneas, REQ-26-07/39-09/40-11).

## 4. Decisión estructural: ¿conservar `post__body` o eliminar la clase?

Dos opciones barajadas:

**Opción A (ELEGIDA): conservar `section.post__body` como contenedor
tipográfico SIN acotación.** El markup queda igual; la clase pasa a
representar únicamente el contenedor del cuerpo de lectura con su
tipografía (`font-size` fluido). Cambio mínimo: 2 líneas de CSS eliminadas.
REQ-40-01 se conserva literal (la sección envuelve el Content), REQ-39-08
(`main.post` / `article.post__content`) intacto, y el test REQ-40-01 no se
toca. La sección `<section>` ya existía como elemento semántico antes de la
40 (solo se le añadió la clase); conservarla no añade markup nuevo.

**Opción B (descartada): eliminar `post__body` y mover la tipografía de
vuelta a `.post__content`.** Más limpia en teoría (una clase menos), pero:
(1) toca `[id].astro` (quitar la clase) y reescribe los selectores de
post-readability.css (`.post__body` → `.post__content`), además de
actualizar el test REQ-40-01 y su comentario — tres artefactos más en
riesgo para un resultado visual idéntico; (2) el `font-size` en
`.post__content` colisionaría semánticamente con el scoping tipográfico ya
existente en post.css, aumentando la superficie de conflictos de cascada;
(3) el `section` queda sin clase, perdiendo el ancla estructural para
futuros ajustes del body. El coste no compensa el beneficio: la feature 41
es una corrección de rechazo, no un refactor.

Decisión final: **Opción A**. REQ-40-01 (markup) y REQ-40-12 (post.css sin
max-width) se conservan; REQ-40-02 (70ch) se reemplaza por el requisito de
ancho completo; el guard de no-acotación se refuerza para cubrir la hoja
completa.

## 5. Cambios de test AUTORIZADOS (listados en la spec de la 41)

`tests/post-readability.test.mjs` (feature 40, test-first) se actualiza
ÚNICAMENTE en lo que fija la medida; el resto de aserciones se conserva:

1. **Test REQ-40-02 (cambia)**: pasa de verificar
   `max-inline-size: 70ch` + `margin-inline: auto` a verificar la AUSENCIA
   de acotación: la regla `.post__body` NO declara `max-width` ni
   `max-inline-size` (y conserva `font-size: clamp(...)`, que ya cubre el
   test REQ-40-03 intacto). Mensaje del assert actualizado al nuevo
   contrato (REQ-41-01).
2. **Test REQ-40-12 (se refuerza, sigue en verde)**: mantiene su aserción
   original (`.post__content` sin max-width + contenedor con
   `var(--container-max)`) y añade el guard de coherencia: NINGUNA regla de
   `post-readability.css` declara `max-width` ni `max-inline-size` (la
   medida ya no vive en ninguna capa — REQ-41-01/13).
3. **Comentario de cabecera del archivo**: se actualiza para reflejar el
   contrato del ciclo 33 (la medida se elimina; las mejoras tipográficas se
   conservan) sin tocar el resto del cuerpo.
4. **Tests REQ-40-01, 03..11 y el test de convención de `[id].astro`**: NO
   cambian (markup, tipografía, hoja ≤100 líneas sin hex/rgba, tokens.css
   87 líneas: todo sigue aplicando).

Tests de contrato que NO se modifican y deben seguir en verde:
`tests/post-header.test.mjs` (REQ-39-01..09: `.post__content` sin max-width
en post.css — post.css no se toca), `tests/post-page-styles.test.mjs`
(REQ-26-02..07), `tests/view-transitions.test.mjs` (REQ-24-03/05),
`tests/design-tokens.test.mjs`.

## 6. Trade-off (documentado, acatando la decisión humana)

- La investigación del ciclo 32 (`legibilidad-detalle-post-ciclo32.md` §2)
  concluyó que el factor dominante de la legibilidad es la medida: a ancho
  completo (~1500px) las líneas alcanzan ~140-190 caracteres, entre 2 y 4×
  el óptimo 45-75ch (66ch ideal, tope WCAG AAA 80ch). La feature 40 resolvió
  eso con 70ch; el humano la rechaza por estética ("muy angosto").
- **El humano prioriza el ancho completo (lenguaje visual del sitio,
  REQ-39-01) sobre la medida óptima de línea. Se acata: la columna de
  lectura NO acota el ancho.**
- Mitigaciones que se conservan para compensar: cuerpo fluido 17→19px
  (respuesta directa a "fuente muy pequeña"), `text-wrap: pretty` (evita
  huérfanas en líneas largas), `letter-spacing: 0.01em` (confort en oscuro),
  ritmo vertical 1lh, jerarquía escalada y media query 768px. El line-height
  1.7 de post.css (WCAG 1.4.12) se mantiene. Ninguna de estas mejoras
  estrecha el contenido.
- Riesgo residual documentado: en pantallas ultrawide el texto queda a
  líneas muy largas; si el humano lo percibe de nuevo como problema de
  lectura, la decisión será suya (columna más ancha tipo 1100px, o volver a
  una medida). Esta feature NO reintroduce ninguna acotación por cuenta
  propia.
- Verificación visual recomendada al implementer/reviewer: Chrome y Firefox
  en desktop (~1500px) y móvil (≤768px): el párrafo del artículo debe
  ocupar el mismo ancho que el header hero (ambos full-width).

## 7. Granularidad: UNA feature (41)

Criterio del rol: "Simple (un cambio, un archivo) = 1". El cambio efectivo
es eliminar la acotación de medida en `src/styles/post-readability.css`
(más la actualización autorizada del test que la fija). Las mejoras
tipográficas no se reimplementan: se conservan. Es una corrección unitaria
de rechazo → **una sola feature** `post-reading-width-restore` (id 41),
spec EARS + design.md (toca UI → design.md obligatorio), `depends_on: []`
(la 40 está done; no hay dependencia pendiente).

## 8. Riesgos

1. **Cascada/regresión de la medida**: si el implementador deja cualquier
   `max-width`/`max-inline-size` en post-readability.css (p. ej. en
   comentario o en otra regla), el guard reforzado REQ-40-12/REQ-41-01
   fallará: el test es la red de seguridad del rechazo.
2. **Tests de la 40**: la actualización está acotada a los 2 tests que fijan
   la medida (REQ-40-02 y el refuerzo de REQ-40-12); cualquier cambio fuera
   de esa lista rompe el espíritu de la autorización y debe revertirse.
3. **View transitions**: el markup no cambia → pares `title-${entry.id}` /
   `img-${entry.id}` intactos (REQ-24-03/05).
4. **100 líneas**: post-readability.css queda en ~40 líneas; post.css se
   queda en 100 (no se toca); tokens.css en 87 (no se toca).
5. **Percepción del humano**: esta feature cumple el rechazo literal (ancho
   completo); si la legibilidad de líneas largas vuelve a quejarse, es un
   problema NUEVO para el humano decidir, no una regresión.
