# Research — `text-wrap: pretty` / `balance` para legibilidad tipográfica (post.css)

> Investigación del explorer (2026-08-14). Tema: aplicación de `text-wrap`
> a `src/styles/post.css` (contenido markdown de artículos) en sitio Astro
> estático prerender (workerd/Cloudflare). Fuentes primarias: MDN, W3C CSS
> Text 4, caniuse, Chrome for Developers, mdn/browser-compat-data.

## Resumen ejecutivo

1. `text-wrap: pretty` y `text-wrap: balance` son valores de CSS Text Level 4
   (shorthand de `text-wrap-mode` + `text-wrap-style`); `pretty` minimiza
   orphans en párrafos con un algoritmo más lento, `balance` iguala el ancho de
   líneas en bloques cortos (títulos), con límite de 6 líneas (Chromium) / 10
   (Firefox).
2. Soporte 2026: `balance` es seguro en Chrome/Edge 114+, Firefox 121+,
   Safari 17.5+ (~92% uso global); `pretty` **no existe en Firefox** (ni en
   2026) y llega a Safari recién en 26.0+ (~85%); ambos degradan con
   seguridad a wrapping normal (mejora progresiva, no rompe nada).
3. `pretty` tiene costo de layout documentado (MDN: "negative effect on
   performance"): se aplica a párrafos del cuerpo del artículo, nunca a todo
   el documento; en SSR/prerender no hay ninguna interacción (propiedad
   puramente de layout del navegador, sin JS).
4. Recomendación concreta para este repo: `text-wrap: balance` en
   `.post__content h1,h2,h3` y `text-wrap: pretty` solo en
   `.post__content p`; no aplicar a `ul/ol/li/pre`; sin `@supports` necesario
   (degradación silenciosa), sin tokens nuevos (no afecta la auditoría de
   hex/rgba).
5. Complementos de legibilidad a considerar: `hyphens: auto` (requiere
   `lang="es"`), `overflow-wrap: break-word` (URLs largas) y opcional
   `hyphenate-limit-chars`; `text-size-adjust` y `font-size-adjust` son
   periféricos aquí.

---

## 1. ¿Qué hacen `pretty` y `balance` exactamente?

### 1.1 `text-wrap: balance`

Equilibra el número de caracteres por línea: "Text is wrapped in a way that
best balances the number of characters on each line, enhancing layout quality
and legibility". Es caro computacionalmente, por eso la spec/MDN lo limitan a
bloques de texto de pocas líneas: "this value is only supported for blocks of
text spanning a limited number of lines (six or less for Chromium and ten or
less for Firefox)".
Fuente: MDN `text-wrap` — https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap

Técnica del navegador (Chromium): búsqueda binaria del menor ancho que no
añade líneas, partiendo del 80% del ancho medio de línea.
Fuente: Chrome for Developers, "CSS text-wrap: balance" (2023) —
https://developer.chrome.com/docs/css-ui/css-text-wrap-balance

### 1.2 `text-wrap: pretty`

Mismo comportamiento que `wrap` pero con algoritmo más lento que favorece la
calidad de layout: "the user agent will use a slower algorithm that favors
better layout over speed. This is intended for body copy where good typography
is favored over performance (for example, when the number of orphans should be
kept to a minimum)".
Fuente: MDN `text-wrap` — https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap

Precisión importante (Chrome blog, 2023):
- **Solo evita orphans, NO widows**: "`pretty` only handles orphans, not
  widows" (orphan = palabra suelta al final de un párrafo; widow = palabra
  suelta al inicio del siguiente bloque/página).
- También ajusta la guionización si aparecen líneas guionizadas consecutivas
  al final del párrafo, y ajusta el texto justificado.
- Es distinto de la propiedad CSS `orphans` (que aplica a fragmentación en
  multi-columna, no a párrafos).
Fuente: Chrome for Developers blog, "CSS text-wrap: pretty" (2023) —
https://developer.chrome.com/blog/css-text-wrap-pretty/
Definición de widows/orphans: Google Fonts glossary —
https://fonts.google.com/knowledge/glossary/widows_orphans

### 1.3 Nota

El shorthand `text-wrap` es la suma de `text-wrap-mode` (wrap/nowrap) +
`text-wrap-style` (auto/balance/stable/pretty). La spec define además el
valor `avoid-orphans`, que "is not yet supported in any browser" (2026).
Fuentes: MDN `text-wrap` y MDN `text-wrap-style` —
https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style
Spec normativa: CSS Text Module Level 4 — https://drafts.csswg.org/css-text-4/

## 2. Soporte real de navegadores en 2026 y degradación

### 2.1 `text-wrap: balance`

| Navegador | Soporte | Notas |
|---|---|---|
| Chrome/Edge | 114+ | 114–129 parcial, 130+ completo |
| Firefox | 121+ | |
| Safari / iOS | 17.5+ | |
| Uso global | **91.63%** | StatCounter julio 2026 |

Fuente: caniuse "CSS text-wrap: balance" — https://caniuse.com/css-text-wrap-balance
El shorthand completo es Baseline 2024 (marzo 2024) según MDN.

### 2.2 `text-wrap: pretty`

| Navegador | Soporte | Notas |
|---|---|---|
| Chrome/Edge | 117+ | Opera 103+ |
| Firefox | **NO soportado** | caniuse: ❌ incluso 152–156; BCD: `version_added: false` |
| Safari / iOS | **26.0+** | Safari 18.7 y anteriores: ❌ |
| Uso global | **85.21%** | StatCounter julio 2026 |

Fuentes:
- caniuse "CSS property: text-wrap: pretty" — https://caniuse.com/mdn-css_properties_text-wrap_pretty
- mdn/browser-compat-data, `css.properties.text-wrap-style.pretty` (firefox: false,
  safari: 26) — https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-wrap-style.json
- Longhand `text-wrap-style`: Chrome 130+, Firefox 124+, Safari 17.5+
  (mismo archivo BCD).

### 2.3 Degradación (mejora progresiva, NO rompe)

CSS ignora declaraciones con valores desconocidos (regla estándar de manejo
de errores del CSS Syntax spec): un navegador sin soporte descarta
`text-wrap: pretty` y conserva el comportamiento por defecto (`wrap` normal,
valor inicial `auto`). No hay polyfill ni `@supports` obligatorio: la
degradación es silenciosa y el layout resultante es exactamente el actual.
Fuente: CSS Syntax Module Level 3 (declaraciones inválidas se descartan) —
https://drafts.csswg.org/css-syntax/ ; valor inicial `auto` — MDN `text-wrap-style`
https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style

**Implicación para este proyecto:** en Firefox (~3% global, 100% del público
sin efecto de `pretty`) los párrafos se verán como hoy; en Safari < 26,
igual. Nada se rompe.

## 3. Rendimiento y SSR/Astro

### 3.1 Rendimiento conocido

- `balance`: "Because counting characters and balancing them across multiple
  lines is computationally expensive" → limitado a ≤6 líneas (Chromium) / ≤10
  (Firefox); con ese límite "this value's impact on performance is
  negligible" (MDN).
- `pretty`: "Note that `pretty` has a negative effect on performance, so it
  should be only used for longer blocks of text when the layout is more
  important than speed" (MDN `text-wrap` y `text-wrap-style`).
- Recomendación explícita de Chrome: "It is not a good idea to apply
  text-wrap balancing to your entire design. It's a wasted request... and may
  impact page render speed" — el anti-patrón es `* { text-wrap: balance }`.
- Diseño del algoritmo de `pretty`: design doc de Koji Ishii (Chromium) —
  https://docs.google.com/document/d/1jJFD8nAUuiUX6ArFZQqQo8yTsvg8IuAq7oFrNQxPeqI/edit
  (enlazado desde el blog de Chrome; no revisado en profundidad por
  limitación del buscador — ver pendientes).

Fuentes: MDN https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap ;
Chrome "CSS text-wrap: balance" https://developer.chrome.com/docs/css-ui/css-text-wrap-balance

**Conclusión práctica:** `pretty` debe ir SOLO en párrafos de artículo
(bloques largos de body copy), no en todo el documento ni en elementos
cortos (li, caption). `balance` solo en títulos/bloques cortos.

### 3.2 SSR / Astro / workerd

`text-wrap` controla soft line breaks en el layout del navegador; es CSS
declarativo puro, sin API de runtime ni JS. **No encontré ninguna interacción
documentada con SSR/prerender** (ni en MDN ni en los artículos de Chrome) —
es esperable: no hay nada que ejecutar en servidor. Para este sitio:
- El prerender (workerd/Cloudflare) sirve HTML+CSS estáticos; el navegador
  aplica el wrapping en layout. Cero JS, cero hidratación, cero re-balanceo
  post-hidratación (a diferencia de las soluciones JS tipo balance-text).
- Ventaja explícita frente a JS (Chrome): "you don't need to wait and time
  text wrap balancing with font loading, like you may be doing with
  JavaScript today. The browser takes care of it!" — el navegador re-balancea
  cuando cargan las fuentes.
- Único costo: el reflow al primer layout en clientes con soporte (layout
  del navegador, no del servidor).

## 4. Buenas prácticas para aplicar (selectores y combinación)

Fuente principal: Chrome "CSS text-wrap: balance" y blog "CSS text-wrap:
pretty" (Adam Argyle, Chrome team):
1. **`balance` solo en títulos** (el caso de uso primario):
   ```
   h1, h2, h3, h4, h5, h6, blockquote { text-wrap: balance; }
   ```
2. **Nunca `* { text-wrap: balance }`** — request desperdiciado + riesgo de
   render lento.
3. **`pretty` en párrafos** — uso personal recomendado por el autor:
   "I personally use `balance` for headlines and `pretty` for paragraphs."
4. **`balance` requiere una restricción de ancho** para tener efecto
   (`max-inline-size`); con texto que no envuelve no hace nada.
5. Precauciones documentadas:
   - `balance` **no cambia el ancho del elemento**: en títulos dentro de
     tarjetas con borde/sombra puede verse "desbalanceado" el contenedor.
   - Conflicto con `white-space: nowrap` (hay que hacer `white-space: unset`).
   - `pretty` no aplica a `contenteditable` (para eso está `stable`).
   - Límite de líneas: si un título ocupa >6 líneas (Chromium), `balance` se
     ignora (cae a auto) — irrelevante en títulos de este sitio.
6. No hace falta `@supports (text-wrap: ...)`: la degradación es silenciosa.
   Si se quiere explicitar la intención, un comentario en CSS basta.

## 5. Propiedades relacionadas de legibilidad tipográfica

Las 3 más relevantes para artículos largos (este repo):

1. **`hyphens: auto`** — guioniza según diccionarios del idioma; REQUIERE el
   atributo `lang` en el HTML (en este sitio, `lang="es"` en `Layout.astro`;
   sin lang no guioniza). Complementa a `pretty` (que ajusta la guionización
   del final de párrafo). Mejora la lectura en columnas estrechas y evita
   "ríos" de texto justificado.
   Fuente: MDN `hyphens` — https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens
2. **`overflow-wrap: break-word`** — rompe palabras/URLs largas que no caben
   en la línea (a diferencia de `word-break`, solo rompe si la palabra no
   entra entera). Evita desbordes en artículos con URLs/código largo.
   Fuente: MDN `overflow-wrap` — https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap
3. **`hyphenate-limit-chars`** — control fino de guionización (mín. longitud
   de palabra, chars antes/después del guion); evita guiones feos con
   `hyphens: auto`. Consultar su tabla de soporte en MDN antes de usarla.
   Fuente: MDN `hyphenate-limit-chars` —
   https://developer.mozilla.org/en-US/docs/Web/CSS/hyphenate-limit-chars

Periféricas (mencionadas, no recomendadas para este cambio):
- `font-size-adjust` — normaliza x-height/cap-height entre fuentes de
  fallback (útil si Inter falla); usar `from-font` evita adivinar números.
  Fuente: MDN `font-size-adjust` — https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust
- `text-size-adjust` — inflación de texto en móviles; marcada experimental en
  MDN y con prefijo `-webkit-`; irrelevante para un layout responsive ya
  definido. Fuente: MDN `text-size-adjust` —
  https://developer.mozilla.org/en-US/docs/Web/CSS/text-size-adjust

## 6. Recomendaciones concretas para este proyecto

Contexto verificado en disco: `src/styles/post.css` (100 líneas) estiliza
`.post__content p, h2, h3, ul/ol, li, a, code, pre`; tokens en
`src/styles/tokens.css`; auditoría (`scripts/audit-design-tokens.mjs`) solo
prohíbe hex/rgba sueltos — `text-wrap` no es un valor de color, no toca
tokens ni la auditoría. Sitio estático prerender en workerd, sin JS.

1. **En `post.css`, dentro del scoping `.post__content`:**
   - Títulos (balance):
     ```css
     .post__content h1, .post__content h2, .post__content h3 {
       text-wrap: balance;
     }
     ```
     (h2/h3 ya existen; h1 por robustez ante markdown con h1. Límite ≤6/10
     líneas no es problema: títulos de 1.3–2.2rem.)
   - Párrafos (pretty), SOLO p:
     ```css
     .post__content p {
       text-wrap: pretty;
     }
     ```
   - **NO** aplicar a `ul/ol/li` (elementos cortos; costo por elemento sin
     beneficio tipográfico), ni a `pre`/`code` (no aplica), ni a `*`.
2. **Degradación:** ninguna acción extra. Firefox/Safari<26 ignoran `pretty`
   → wrapping normal (estado actual). Mejora progresiva pura.
3. **No hace falta `@supports`, polyfill, ni JS.** El prerender de Astro
   queda intacto; no hay interacción SSR conocida (ver §3.2).
4. **Opcional recomendado (separado de este cambio):** `.post__content`
   actualmente hereda el ancho del contenedor (`.post` hasta
   `--container-max: 1500px`). `balance`/`pretty` funcionan igual, pero una
   medida de ~65–75ch en el contenido mejora la lectura de artículos largos
   (los ejemplos oficiales de `balance` usan `max-inline-size: 50ch`).
5. **Opcional de legibilidad:** `hyphens: auto` en `.post__content p` (y
   `hyphenate-limit-chars` si se quiere control) requiere verificar que
   `Layout.astro` declara `lang="es"` — sin `lang`, los navegadores no
   guionizan (MDN `hyphens`).
6. **Verificación:** tras aplicar, `./init.sh` en verde y revisión visual en
   Chrome (balance en títulos), Firefox (párrafos = línea de base, sin
   orphans ya que Firefox no soporta pretty) y Safari 26 (ambos).

## Fuentes

- MDN `text-wrap` (shorthand) — https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
- MDN `text-wrap-style` — https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style
- MDN `text-wrap-mode` — https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-mode
- caniuse `css-text-wrap-balance` — https://caniuse.com/css-text-wrap-balance
- caniuse `mdn-css_properties_text-wrap_pretty` — https://caniuse.com/mdn-css_properties_text-wrap_pretty
- mdn/browser-compat-data `text-wrap-style.json` —
  https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/text-wrap-style.json
- Chrome for Developers, "CSS text-wrap: balance" (2023) —
  https://developer.chrome.com/docs/css-ui/css-text-wrap-balance
- Chrome for Developers blog, "CSS text-wrap: pretty" (2023) —
  https://developer.chrome.com/blog/css-text-wrap-pretty/
- Design doc Chromium (Koji Ishii) — https://docs.google.com/document/d/1jJFD8nAUuiUX6ArFZQqQo8yTsvg8IuAq7oFrNQxPeqI/edit
- CSS Text Module Level 4 (W3C) — https://drafts.csswg.org/css-text-4/
- CSS Syntax Module Level 3 (manejo de declaraciones inválidas) — https://drafts.csswg.org/css-syntax/
- MDN `hyphens` — https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens
- MDN `overflow-wrap` — https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap
- MDN `hyphenate-limit-chars` — https://developer.mozilla.org/en-US/docs/Web/CSS/hyphenate-limit-chars
- MDN `font-size-adjust` — https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust
- MDN `text-size-adjust` — https://developer.mozilla.org/en-US/docs/Web/CSS/text-size-adjust
- Google Fonts glossary, Widows & Orphans — https://fonts.google.com/knowledge/glossary/widows_orphans

## Pendientes (fuera de alcance de esta sesión)

- Revisar el design doc de Chromium para cuantificar el costo de `pretty`
  (medidas concretas de rendimiento) si el implementer lo necesita.
- Verificar el atributo `lang` en `src/layouts/Layout.astro` antes de
  proponer `hyphens: auto`.
- La medida (`ch`) del contenido del artículo como mejora separada de
  legibilidad.
