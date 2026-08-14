# Legibilidad del detalle de post — ciclo 32

> Fecha: 2026-08-14. Rol: spec_author. Petición del humano sobre
> `src/pages/posts/[id].astro` y sus hojas: "el contenido está bien así, pero
> hazle mejoras para lectura. Creo que hay una prop pretty o algo así,
> investígala. Buenas prácticas para mejorar la lectura. Siento que en desktop
> la fuente está muy pequeña." Documenta la decisión de diseño, la resolución
> de la tensión con REQ-39-01, los valores concretos, el impacto en tests y
> los riesgos. No implementa nada.

## 1. Qué es y qué toca

- Ruta: `src/pages/posts/[id].astro` (51 líneas, features 36 + 39):
  `main.post` > `header.post__hero` (img.post__image con
  `transition:name=img-${entry.id}` + `.post__hero-copy` con
  `h1.post__title` con `title-${entry.id}` y `p.post__meta`) +
  `article.post__content` > `section` con `<Content />`.
- Estilos: `src/styles/post.css` (100 líneas exactas, features 26 + 39 —
  `.post` con `min(var(--container-max), 95%)`; `.post__content` SIN
  max-width por decisión humana REQ-39-01; tipografía del markdown scoping
  `.post__content`), `src/styles/post-header.css` (48 líneas, feature 39) y
  `src/styles/tokens.css` (87 líneas, estado canónico REQ-26-07/39-09).
- Tests que fijan contratos: `tests/post-header.test.mjs` (REQ-39-01..09),
  `tests/post-page-styles.test.mjs` (REQ-26-02..07),
  `tests/view-transitions.test.mjs` (REQ-24-03/05),
  `tests/design-tokens.test.mjs` (REQ-02-01..05).
- Auditoría de tokens: `scripts/audit-design-tokens.mjs` recorre todas las
  hojas de `src/styles/` (menos tokens.css) y solo prohíbe hex/rgba sueltos;
  los literales de tipografía/layout (rem/ch/lh/em) NO son colores: no la
  disparan (precedente REQ-26-05: "tipografía/layout literales del
  componente").

## 2. Reafirmación del problema y evidencia (resumen de los 2 research)

El humano percibe "la fuente muy pequeña" en desktop y pide mejoras de
lectura con la "prop pretty" (`text-wrap: pretty`). Los explorers concluyen:

1. **La causa dominante NO es el tamaño, es la medida**: el contenedor
   `min(1500px, 95%)` produce líneas de ~140-190 caracteres en desktop —
   entre 2 y 4× el óptimo de 45-75ch (66ch ideal, tope WCAG AAA 80ch).
   Fuente: `progress/research/legibilidad-contenido-articulos.md` §3.
2. **El tamaño sí importa**: 16px es el mínimo; lectura larga pide 18-20px
   (NYT 18px, Medium 21px; Rello et al. CHI 2016: 18pt/24px mejora
   comprensión). Recomendación: `clamp()` fluido con rem.
3. **`text-wrap: pretty`** (CSS Text 4): evita huérfanas en párrafos;
   Chrome/Edge 117+, Safari 26+, NO Firefox (degradación silenciosa por
   descarte de declaración inválida — mejora progresiva, sin `@supports`
   necesario, sin interacción con SSR/prerender). `text-wrap: balance`
   (seguro ~92%: Chrome 114+, FF 121+, Safari 17.5+) para títulos.
   Fuente: `progress/research/text-wrap-pretty-legibilidad.md`.
4. **line-height 1.7 actual ya es correcto** (rango 1.5-1.8; oscuro
   1.65-1.75) — mantener unitless (WCAG 1.4.12).
5. **Espaciado de párrafo**: atarlo al ritmo tipográfico con `1lh` o
   ~1.5em (hoy `margin: 0 0 16px`).
6. **Contraste NO es el problema**: `#b8b8c5`/`#070716` = 10.18:1 (AA/AAA
   con holgura). **Letter-spacing** +0.01-0.02em en cuerpo como confort de
   tema oscuro (fuentes Mantlr/Smashing, 2025-2026).
7. **Unidades relativas** (rem/ch/lh) para WCAG 1.4.4 (zoom 200%) y 1.4.12
   (text spacing): nunca px fijos para medida ni espaciado de bloque.

## 3. Tensión de diseño: REQ-39-01 (ancho completo) vs. legibilidad

El humano pidió en la feature 39 "el contenido ocupa el mismo ancho de la
página" (REQ-39-01, fijado por `tests/post-header.test.mjs`: la regla
`.post__content` NO debe declarar `max-width`). Ahora pide mejoras de
lectura y nota la fuente pequeña. El research demuestra que el factor
dominante es la línea de ~140-190 caracteres.

**Decisión (opción A del research del ciclo 31, ejecutada ahora):** se
conserva el ancho completo ESTRUCTURAL (contenedor `.post`, header hero
`.post__hero` y la regla `.post__content` intactos — REQ-39-01 se respeta
literalmente, cero cambios de tests existentes) y se acota **solo la columna
de texto de lectura** a `70ch` con `margin-inline: auto`. La columna es el
`<section>` que envuelve `<Content />`, que recibe la clase BEM nueva
`post__body`.

- Por qué 70ch: dentro del rango óptimo 45-75ch, cerca del ideal 66ch,
  bajo el tope WCAG AAA 80ch; `ch` escala con la fuente (zoom y
  preferencias del usuario).
- Por qué en `post__body` y no en `.post__content`: REQ-39-01 y su test
  fijan el full-width en `.post__content`; poner la medida en un elemento
  hijo preserva ese contrato al pie de la letra y mantiene el espíritu de
  la petición anterior (el header y el layout siguen full-width; solo el
  texto de lectura se centra en su medida óptima).
- Trade-off residual: en pantallas ultrawide, el texto se centra en una
  columna de ~70ch con aire a los lados (espacio "vacío" a ambos lados del
  artículo). Es el patrón editorial estándar (NYT/Medium) y el precio
  correcto por la legibilidad; el hero y las cards del sitio siguen
  full-width, así que el sitio no pierde su lenguaje visual ancho.

## 4. Propuesta de diseño concreta (valores exactos)

Nueva hoja `src/styles/post-readability.css` (importada por `[id].astro`
DESPUÉS de `post.css` y `post-header.css` — el orden de import determina la
cascada: a igual especificidad gana la última hoja; necesario para que los
overrides `margin-block-end`, `font-size` y `margin-block` de h2/h3
prevalezcan sobre post.css sin tocar esa hoja).

```css
/* Medida y tamaño de cuerpo de la columna de lectura */
.post__body {
  max-inline-size: 70ch;      /* medida óptima 45-75ch (66 ideal) */
  margin-inline: auto;        /* columna centrada dentro del full-width */
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem); /* 17→19px */
}

/* Párrafos: pretty + espaciado al ritmo + confort en oscuro */
.post__content p {
  text-wrap: pretty;          /* Chrome/Edge 117+, Safari 26+; FF: degrada */
  letter-spacing: 0.01em;     /* tema oscuro (Mantlr/Smashing) */
  margin-block-end: 1lh;      /* ≈32px a 19px/1.7 (hoy 16px fijos) */
}

/* Encabezados: balance + jerarquía escalada */
.post__content h1,
.post__content h2,
.post__content h3 {
  text-wrap: balance;         /* seguro ~92% */
}

.post__content h2 {
  font-size: 1.75rem;         /* hoy 1.6rem */
  margin-block: 1.5lh 0.5lh;  /* hoy 40px 0 12px (ritmo vertical) */
}

.post__content h3 {
  font-size: 1.4rem;          /* hoy 1.3rem */
  margin-block: 1.25lh 0.375lh;
}

@media (max-width: 768px) {
  .post__content h2 { font-size: 1.4rem; }  /* hoy 1.35rem */
  .post__content h3 { font-size: 1.2rem; }
}
```

Notas de la propuesta:

- **Sin tokens nuevos**: todos los valores son literales de tipografía/layout
  con unidades relativas (rem/ch/lh/em) — el precedente REQ-26-05 permite
  literales tipográficos en la hoja del componente; la auditoría solo
  prohíbe hex/rgba. tokens.css permanece en 87 líneas (REQ-26-07/39-09). La
  alternativa de tokens `--font-size-body`/`--measure-reading` se descarta:
  el grupo `--reading-` y `--font-size-` están explícitamente prohibidos por
  REQ-26-07 (alternativa descartada del design de la 26) y supondrían
  actualizar tests autorizados sin valor real (un solo consumidor).
- **`pretty` solo en `p`** (nunca ul/ol/li/pre/`*` — costo de layout por
  elemento sin beneficio tipográfico); `balance` solo en encabezados
  (límite ≤6 líneas Chromium irrelevante aquí). Sin `@supports`: la
  degradación es silenciosa (declaraciones inválidas se descartan) y el
  layout en Firefox/Safari<26 queda como hoy.
- **line-height 1.7 se mantiene** en post.css (unitless, ya óptimo).
- **`hyphens: auto` queda FUERA**: no se justifica el texto (sin
  `text-align: justify`) y añadiría dependencia del diccionario del
  navegador; documentado como mejora futura.
- **Markup**: el `<section>` del Content pasa a `<section class="post__body">`
  (una línea; [id].astro pasa de 51 a 52 líneas). El primer `<h1>` y el
  primer `<img>` de la página no cambian → REQ-24-03/05 intactos.
- **post.css y post-header.css NO se tocan** (100 y 48 líneas; cero riesgo
  sobre REQ-26-02..07 y REQ-39-01..09).
- Estimación de la hoja nueva: ~30 líneas (≤100 ✓).

## 5. Análisis de tests

### 5.1 Tests EXISTENTES: ninguno se modifica (verificado regla a regla)

- `tests/post-header.test.mjs`:
  - REQ-39-01: asertúa que la regla `.post__content` de post.css NO declara
    `max-width`. La medida vive en `.post__body` (regla nueva en otra hoja):
    la regla `.post__content` de post.css queda intacta → pasa.
  - REQ-39-02/03/04/05: marcado del header y reglas de post-header.css
    intactos → pasan.
  - REQ-39-06: `[id].astro` conserva los imports de post.css y
    post-header.css; ambas hojas no se tocan (≤100) → pasa.
  - REQ-39-07: la media query de post.css con `.post__title` se conserva;
    la media query nueva de post-readability.css es adicional → pasa.
  - REQ-39-08/09: `main.post`/`article.post__content` intactos; tokens.css
    en 87 líneas; ninguna de las hojas tocadas gana hex/rgba → pasan.
- `tests/post-page-styles.test.mjs` (REQ-26-02..07): post.css y tokens.css
  intactos; [id].astro conserva el import de post.css y las clases del
  contrato; la página sigue ≤100 líneas → pasa.
- `tests/view-transitions.test.mjs` (REQ-24-01/03/05): primer `<h1>` y
  primer `<img>` de [id].astro intactos con sus pares `entry.id`; la página
  sigue ≤100 líneas, sin `<style>`, con prerender y Layout → pasa.
- `tests/design-tokens.test.mjs`: tokens.css intacto → pasa.

### 5.2 Test NUEVO autorizado (test-first)

`tests/post-readability.test.mjs` (REQ-40-01..12), patrón de inspección
estática del arnés (node:test, sin navegador): verifica el import y el
marcado `post__body` (REQ-40-01), la medida `max-inline-size: 70ch` +
`margin-inline: auto` (REQ-40-02), el `font-size: clamp(...)` con rem
(REQ-40-03), las propiedades del párrafo `pretty`/`0.01em`/`1lh`
(REQ-40-04/05/06), `balance` y tamaños 1.75rem/1.4rem de h2/h3
(REQ-40-07/08), la media query 768px (REQ-40-09), la hoja ≤100 líneas sin
hex/rgba (REQ-40-10/11), tokens.css en 87 líneas sin tokens de los grupos
prohibidos (REQ-40-11), y el guard de la tensión: `.post__content` sigue
sin `max-width` (REQ-40-12).

## 6. Granularidad: UNA feature (40 post-readability)

Criterio del rol: "Media (2-3 archivos o datos + UI) = 2 separando capa de
datos vs UI/dominio". Aquí NO hay capa de datos ni de dominio: los seis
ajustes (medida, tamaño, pretty/balance, espaciado, letter-spacing, escala
de encabezados) son una única intervención presentacional sobre la misma
ruta, la misma hoja nueva y el mismo test nuevo. Separarlos en varias
features fragmentaría un cambio tipográfico unitario sin beneficio
(no hay hitos de datos verificables intermedios). Precedente: feature 39
(ancho + header en una sola feature). Por eso: **una sola feature**
`post-readability` (id 40), spec EARS + design.md (toca UI → design.md
obligatorio), `depends_on: []` (la 39 está done).

## 7. Archivos esperados tras la implementación

- `src/pages/posts/[id].astro`: `section class="post__body"` + import de
  post-readability.css (~52 líneas).
- `src/styles/post-readability.css` (nuevo): propuesta del §4 (~30 líneas).
- `tests/post-readability.test.mjs` (nuevo): contrato REQ-40-01..12.
- Sin cambios: `post.css`, `post-header.css`, `tokens.css`, cards, resto de
  tests existentes.

## 8. Riesgos

1. **Cascada**: si el import de post-readability.css no va DESPUÉS de
   post.css, los overrides (margin-block-end, h2/h3 font-size y margins) no
   ganan a igual especificidad. El test debe fijar el orden de imports.
2. **Firefox**: `pretty` no existe → párrafos como hoy (degradación
   silenciosa, mejora progresiva). `balance` sí existe (121+). Nada se
   rompe; verificación visual recomendada en Chrome y Firefox.
3. **View transitions**: no se añaden imágenes/encabezados antes del primer
   h1/img → pares `title-${entry.id}`/`img-${entry.id}` intactos.
4. **100 líneas**: post.css está en 100; por eso la capa de lectura va en
   hoja nueva (precedente post-header.css), no se toca post.css.
5. **Interpretación del "ancho completo"**: riesgo de que el humano perciba
   la columna de 70ch como "otra vez delgado". Mitigación documentada en
   §3: el header, el layout y las cards siguen full-width; solo el texto
   de lectura adopta su medida óptima (patrón editorial estándar). Si el
   humano prefiere una columna más ancha, el parámetro es un solo valor
   (`70ch` → p. ej. `75ch`).
