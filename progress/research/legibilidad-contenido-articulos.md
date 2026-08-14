# Legibilidad de contenido de artículos largos — mejores prácticas 2025-2026

> Fecha: 2026-08-14. Rol: explorer. Petición del líder: investigar las mejores
> prácticas actuales de legibilidad tipográfica para artículos largos y responder
> 6 preguntas concretas. Contexto: sitio Astro oscuro; `.post__content` a ancho
> completo del contenedor (1500px, decisión del humano, feature 39); párrafos con
> font-size heredada (~16px); `line-height: 1.7`; `--color-text: #ffffff`,
> `--color-text-secondary: #b8b8c5` sobre `--color-background: #070716`. El humano
> reporta "en desktop la fuente se ve muy pequeña".

## Resumen ejecutivo (5 líneas)

1. El tamaño es el problema real: 16px es el mínimo absoluto, pero lectura larga
   pide 18-20px (NYT 18px, Medium 21px; estudio eye-tracking de Rello et al. CHI
   2016: 18pt/24px mejora lectura y comprensión significativamente).
2. La causa estructural es la medida: el contenedor de 1500px produce líneas de
   ~140-190 caracteres; lo óptimo son 45-75ch (66ch ideal, tope WCAG AAA 80ch),
   aplicable con `max-width: ~70ch` sobre el texto, no sobre todo el layout.
3. `line-height: 1.7` ya está dentro de lo recomendado (1.5-1.8, sube con líneas
   largas); mantener unitless y, si se fija la medida a ~65-70ch, puede bajar a
   1.6-1.7 sin perder nada.
4. El contraste NO es el problema: `#b8b8c5` sobre `#070716` = 10.18:1 (AA 4.5:1 y
   AAA 7:1 con holgura); el gris secundario cumple con margen; lo que se percibe
   como "ilegible" es tamaño + línea larga, no color.
5. Las 5 prácticas de mayor impacto: subir el cuerpo a 18-19px con `clamp()`/rem,
   acotar la medida a ~65-75ch, mantener line-height 1.6-1.7 unitless, espaciado de
   párrafo atado al line-height (`1lh` o ~1.5em) y `text-wrap: pretty` como
   mejora progresiva contra líneas huérfanas.

---

## 1. Tamaño de fuente base para contenido largo en desktop

**Rango recomendado: 16px mínimo, 18-20px para lectura larga.**

- 16px (1rem) es el mínimo establecido: es el default del navegador, el umbral del
  audit "Document uses legible font sizes" de Lighthouse y el punto donde iOS deja
  de auto-zoomear inputs. Fuentes: [Greadme, 2025](https://www.greadme.com/blog/seo/best-font-sizes-for-readability-complete-guide), [Made Good Designs, 2026](https://madegooddesigns.com/web-font-size-guide/).
- Para artículos/lectura sostenida, 17-18px es lo común y 18-20px lo recomendado:
  "editorial long-form 18 to 20px reads better" ([Digital Heroes, 2026](https://digitalheroesco.com/journal/modular-type-scale-guide/)); el Nielsen Norman Group reporta ~10% de mejora en scan speed con 18-20px en páginas informativas ([Agentys, 2026](https://www.agentys.io/en/blog/taille-police-interligne-optimal)).
- Estudio eye-tracking con 104 participantes (Wikipedia, Arial, 6 tamaños): la
  legibilidad y la comprensión mejoran significativamente hasta 18pt (24px);
  recomiendan 18pt para texto de lectura en web — muy por encima de las viejas
  recomendaciones de 10-14px ([Rello, Pielot & Marcos, CHI 2016](https://pielot.org/pubs/Rello2016-Fontsize.pdf)).
- Tamaños reales de sitios de lectura (lista verificable de una auditoría
  tipográfica de 2026): **Medium 21px, NYT 18px, CNN 18px, SitePoint 18px,
  BBC 16px, MDN 16px** ([hackmd: Establishing a typographic system, 2026](https://hackmd.io/@alexmwalker/Hk4j7wT_8)). El NYT concreta: cuerpo Imperial Text **18px, line-height 1.55**
  ([appsthatdeliver](https://www.appsthatdeliver.com/fonts/what-font-does-the-new-york-times-use/)). BBC GEL: Body Copy desktop **16/22** (16px con line-height 22px ≈ 1.375; su guía
  pide ≤60 caracteres por línea y tamaños mínimos de 13px para contenido)
  ([BBC GEL Typography](https://www.bbc.co.uk/gel/features/typography),
  [BBC minimum text size](https://www.bbc.co.uk/accessibility/forproducts/guides/html/minimum-text-size/)).

**Qué dice WCAG sobre tamaño:** no exige un mínimo de px, pero sí dos cosas
relacionadas:
- SC 1.4.4 Resize Text (AA): el texto debe poder escalarse **200% sin pérdida de
  contenido o funcionalidad**; se cumple usando unidades relativas (rem/em) y no
  bloqueando zoom. La técnica C20 pide además columnas relativas para que las
  líneas promedien ≤80 caracteres ([W3C Understanding 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text)).
- SC 1.4.3 Contraste (AA): 4.5:1 texto normal; 3:1 texto grande (≥24px o ≥18.66px
  bold) ([W3C Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)).

## 2. Line-height

**Rango recomendado: 1.5-1.8 para párrafos; sube a medida que crece la línea.**

- MDN: "Use a minimum value of 1.5 for line-height for main paragraph content"
  ([MDN line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height)).
- web.dev: "Shorter lines of text can have larger line-height values. But if you
  use large line-height values for long lines of text, it's hard for the reader's
  eye to move from the end of one line to the start of the next"; ejemplo canónico
  `max-inline-size: 66ch; line-height: 1.65` ([web.dev Typography](https://web.dev/learn/design/typography)).
- Regla práctica: 40-50 caracteres → 1.4-1.5; 70-80 caracteres → 1.6-1.8; 16px a
  65ch → 1.6 como punto de partida ([UDT, 2026](https://ultimatedesigntools.com/blog/how-to-calculate-line-height/)); "60-80 caracteres con line-height 1.5-1.6" en desktop
  ([Pimp my Type](https://pimpmytype.com/line-length-line-height/)).
- En temas oscuros se recomienda algo más de aire: 1.65-1.75 en vez de 1.5-1.6,
  porque la densidad visual se siente mayor ([Mantlr, 2026](https://mantlr.com/blog/dark-mode-design-guide-color-typography-accessibility)).
- WCAG SC 1.4.12 Text Spacing (AA): el contenido no debe romperse si el usuario
  fuerza `line-height ≥ 1.5` y espaciado tras párrafo ≥ 2× el tamaño de fuente —
  esto exige **valores unitless** y márgenes (no `<br/>`) ([W3C Understanding 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing), [WCAG 2.2](https://www.w3.org/TR/WCAG22/)).

**Sí cambia con el tamaño de fuente y el ancho de línea:** líneas más anchas
necesitan más interlineado; titulares grandes usan 1.1-1.3; texto pequeño/UI usa
más aire.

## 3. Ancho de línea (measure)

**Rango óptimo: 45-75 caracteres por línea; 66 ideal; tope WCAG 80.**

- Bringhurst (Elements of Typographic Style): "anything from 45 to 75 characters
  is widely regarded as a satisfactory length of line… the 66-character line is
  widely regarded as ideal" ([Google Fonts: Understanding measure](https://fonts.google.com/knowledge/using_type/understanding_measure_line_length), [webtypography.net 2.1.2](https://webtypography.net/2.1.2), [web.dev](https://web.dev/learn/design/typography)).
- Baymard (estudio de usabilidad, 2022): 50-75 caracteres es el óptimo; con líneas
  más cortas el lector comete más errores al saltar de línea ([Baymard](https://baymard.com/blog/line-length-readability)). Material Design: 40-60.
- Por qué: bajo 45 caracteres el ojo salta demasiado seguido y pierde continuidad;
  sobre 75, el barrido de retorno (fin de línea → inicio de la siguiente) se vuelve
  erróneo y fatigoso ([Agentys, 2026](https://www.agentys.io/en/blog/taille-police-interligne-optimal)).

**Cómo expresarlo en CSS moderno:**
- Con `ch` (ancho del glifo "0" de la fuente actual): escala con el tamaño de
  fuente, así que respeta zoom y preferencias del usuario; web.dev recomienda no
  usar px fijos para la medida ([web.dev](https://web.dev/learn/design/typography)).
  Patrón base: `max-width: 65ch` o `max-inline-size: 66ch`.
- Combinación con contenedores fluidos: `max-width: clamp(45ch, min(90vw, 65ch), 75ch)`
  ([OpenReplay, 2025](https://blog.openreplay.com/controlling-line-length-css-readability/)) o
  `width: clamp(min(93.75vw, 50ch), 70vw, 75ch)` ([CSS-Tricks, 2025](https://css-tricks.com/setting-line-length-in-css-and-fitting-text-to-a-container/)).
- WCAG 1.4.8 (nivel AAA, no obligatorio): máximo 80 caracteres por línea
  ([CSS-Tricks](https://css-tricks.com/setting-line-length-in-css-and-fitting-text-to-a-container/) citando WCAG).

**Situación del repo:** `.post__content` sin tope dentro de `min(1500px, 95%)`.
Estimación: a 16px con ancho medio de carácter ~0.5em, una línea de ~1425px
ronda los **140-190 caracteres** — entre 2 y 4 veces el óptimo, y muy por encima
del tope de 80. Esto explica la queja de legibilidad en desktop mucho más que el
tamaño. El research previo de la feature 39 ya documentó este trade-off
(`rediseno-detalle-post-ciclo31.md` §2, opción A) con líneas de "hasta ~140
caracteres".

## 4. Espaciado entre párrafos y márgenes verticales

- La guía clásica: el espacio entre párrafos debe relacionarse con el leading
  (line-height) para mantener ritmo vertical; p. ej. texto a 12px/1.5 → líneas de
  18px → margen entre bloques de 18px ([webtypography.net 2.2.2](https://webtypography.net/2.2.2)).
- Unidad CSS nueva `lh` (1lh = alto de una línea del elemento actual; soporte
  >94%): `p { margin-block: 1lh }` ata el espaciado al ritmo de la tipografía de
  forma robusta ([WebKit: line-height units, 2025](https://webkit.org/blog/16831/line-height-units/)).
- Rangos de la práctica: 1em-1.5em entre párrafos es lo habitual ([theiku, 2026](https://www.theiku.com/blog/typography-best-practices-for-the-modern-web/)); Typeset.us usa 1.5rem ([Typeset.us](https://typeset.us/reading-lab)).
- WCAG 1.4.12 exige que el layout aguante espaciado tras párrafo de 2× el tamaño
  de fuente: usar `margin`, nunca líneas en blanco ni alturas fijas
  ([W3C Understanding 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing)).
- Ritmo vertical (baseline grid): margen inferior del encabezado claramente menor
  que el superior para que el título "conecte" con su texto; múltiplos del
  line-height base ([Better Web Type: Rhythm](https://betterwebtype.com/rhythm-in-web-typography/)).
- Longitud de párrafo en pantalla: 2-4 líneas en desktop (6 máximo móvil), bloques
  densos desalientan la lectura ([ux-republic, 2025](https://www.ux-republic.com/en/best-practices-for-creating-editorial-content-on-the-web/)). Es contenido/redacción, no CSS: los
  autores deben partir párrafos largos.

## 5. Contraste y tema oscuro

- WCAG AA (SC 1.4.3): **4.5:1** texto normal; 3:1 texto grande (≥24px o ≥18.66px
  bold) ([W3C Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)). AAA: 7:1 para texto normal.
- **Cálculo aproximado del secundario del repo** (fórmula de luminancia relativa
  WCAG, verificada con node): `#b8b8c5` (184,184,197) sobre `#070716` (7,7,22) →
  **10.18:1**. Cumple AA y AAA con margen amplio. En superficie `#101018` → 9.65:1.
  El blanco `#ffffff` sobre `#070716` → 19.98:1. El acento `#7d68ff` sobre fondo →
  5.04:1 (AA normal, holgado). **Conclusión: el contraste del sitio no es el
  problema; el gris secundario es válido incluso para texto normal.**
- Cuidados específicos de fondos oscuros (estas fuentes, 2024-2026):
  - El blanco puro puede causar halación (halo/bleed) en usuarios con astigmatismo;
    Material Design recomienda `rgba(255,255,255,.87)` para texto primario y
    Material/Apple recomiendan gris oscuro (no negro puro) de fondo
    ([ColorFYI](https://colorfyi.com/blog/dark-mode-colors/), [Spell UI, 2026](https://spell.sh/blog/dark-mode-design-guide), [Mantlr, 2026](https://mantlr.com/blog/dark-mode-design-guide-color-typography-accessibility)).
  - La matemática WCAG 2.x no modela bien el confort percibido en modo oscuro; se
    recomienda validar también con APCA (Advanced Perceptual Contrast Algorithm)
    ([Mantlr](https://mantlr.com/blog/dark-mode-design-guide-color-typography-accessibility), [Smashing Magazine, 2025](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/)).
  - El fallo típico en dark mode no es el fondo base sino el texto secundario sobre
    superficies elevadas y los placeholders; hay que testear cada par
    (texto × superficie) ([Theme & Color, 2025](https://themeandcolor.com/blog/accessible-dark-mode-color-palette)).
  - Ajustes de tipografía en oscuro: +0.01-0.02em de letter-spacing en cuerpo y
    line-height 1.65-1.75 (el texto claro "se esparce" ópticamente y rinde más
    fino) ([Mantlr](https://mantlr.com/blog/dark-mode-design-guide-color-typography-accessibility)).
  - Andrew Somers (coautor de APCA) critica el gris sobre blanco de Medium en light
    mode; en dark mode pide evitar texto "blanco sucio" automático — el gris debe
    elegirse deliberadamente y mantener ≥4.5:1 ([Tangled Web, 2023](https://tangledweb.xyz/small-text-is-mediums-large-fail-b39589f5fae0)).

## 6. Otras prácticas de lectura

- **`text-wrap: pretty`**: algoritmo de wrap que favorece la tipografía sobre la
  velocidad; evita líneas finales huérfanas (palabra sola) y, según el motor, mejora
  el rag y evita ríos; pensado para párrafos. Soporte: Chrome/Edge 117+, Safari TP
  216+; en Firefox NO (sept 2025). Es una mejora progresiva: declararla no rompe
  nada donde no hay soporte ([MDN text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap), [WebKit, 2025](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/), [LogRocket, 2025](https://blog.logrocket.com/css-text-wrap-balance-vs-text-wrap-pretty/)).
- **`text-wrap: balance`**: equilibra la longitud de las líneas; solo tiene sentido
  en bloques cortos (≤6 líneas en Chromium, ≤10 en Firefox); uso típico: titulares
  y captions ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap), [WebKit](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)).
- **Huérfanas/viudas**: huérfana = palabra sola al final del párrafo; viuda = palabra
  sola al inicio. `text-wrap: pretty` mitiga huérfanas; no hay solución CSS amplia
  para viudas (la propiedad `orphans`/`widows` aplica a saltos de página/columna)
  ([Chrome for Developers, 2023](https://developer.chrome.com/blog/css-text-wrap-pretty), [LogRocket](https://blog.logrocket.com/css-text-wrap-balance-vs-text-wrap-pretty/)).
- **`hyphens`**: `auto` solo funciona con `lang` correctamente declarado y
  diccionario del navegador; en web la guía general es evitar la justificación
  (`text-align: justify`) — crea "ríos" de blancos — y, si no se justifica, la
  necesidad de guiones es mínima ([MDN hyphens](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/hyphens), [Better Web Type](https://betterwebtype.com/rhythm-in-web-typography/), [theiku](https://www.theiku.com/blog/typography-best-practices-for-the-modern-web/)).
- **`ch` para ancho, `rem` para tamaños, `lh` para espaciado**: unidades relativas
  que respetan zoom/preferencias del usuario (WCAG 1.4.4/1.4.12)
  ([web.dev](https://web.dev/learn/design/typography), [WebKit lh](https://webkit.org/blog/16831/line-height-units/)).
- **`clamp()` fluido** para tamaños: p. ej. `font-size: clamp(1rem, .9375rem + .4vw, 1.1875rem)`
  para que el cuerpo respire entre 16 y 19px sin saltos de breakpoint
  ([Digital Heroes, 2026](https://digitalheroesco.com/journal/modular-type-scale-guide/)).
- **Sin dependencias**: ninguna de estas prácticas requiere JS ni librerías; todo
  es CSS nativo (compatible con la regla del proyecto).

### Top 5 prácticas de mayor impacto (para este repo)

1. **Subir el cuerpo del artículo a 18-19px** (`clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)`
   o `1.125rem` fijo) con unidad relativa — ataca directamente "se ve muy pequeña".
2. **Acotar la medida del texto a ~65-75ch** (`max-width: 70ch` sobre el contenido
   del artículo, o `clamp(45ch, min(90vw, 65ch), 75ch)`) — el contenedor de 1500px
   produce líneas de 140-190 caracteres, el factor dominante del problema.
3. **Mantener `line-height: 1.7` (unitless)** — dentro del rango 1.5-1.8 y
   coherente con líneas largas; con medida ya acotada, 1.6-1.7 sigue siendo óptimo;
   nunca unidades fijas (WCAG 1.4.12).
4. **Espaciado de párrafo atado al ritmo**: pasar de `margin: 0 0 16px` a
   `margin-block-end: 1lh` (≈30px con 18px/1.7) o `~1.5em`, y márgenes de
   encabezado asimétricos (más arriba que abajo).
5. **`text-wrap: pretty` en párrafos + `text-wrap: balance` en títulos**, como
   mejora progresiva sin coste de mantenimiento; y mantener el contraste actual
   (10.18:1 del secundario — ya cumple; opcionalmente rebajar el blanco puro a
   `rgba(255,255,255,.87)` por confort en oscuro, sin tocar los tokens si no se
   quiere).

---

## Recomendaciones concretas adaptadas al proyecto

Respetando la decisión humana de ancho completo (feature 39, REQ-39-01) y la regla
de no añadir tokens nuevos sin discusión (tokens.css en 87 líneas, REQ-26-07), las
opciones van de menor a mayor intervención:

- **A. Mínima (solo texto):** declarar en `.post__content p` (y listas) un tamaño
  `font-size: clamp(1.0625rem, 1rem + .3vw, 1.1875rem)` (~17-19px), mantener
  `line-height: 1.7` unitless, `text-wrap: pretty`, y `max-width: 70ch` en el
  bloque de texto del artículo (`article` interno o una clase nueva). El contenedor
  de 1500px y el header hero quedan intactos: solo la columna de lectura se acota.
- **B. Media:** además de A, subir ligeramente h2/h3 (1.6rem → ~1.75rem y 1.3rem →
  ~1.4rem) para que la jerarquía acompañe al cuerpo más grande, y espaciado de
  párrafo con `1lh` (~30px en vez de 16px).
- **C. Estructural (requiere decisión del humano):** si el humano quiere conservar
  literalmente "el ancho completo" también para el texto, documentar el trade-off
  con estos datos (líneas de ~140-190 caracteres ≈ 2-4× el óptimo de 45-75ch) y
  ofrecer alternativas (columna central de ~1100px con el resto del contenido en
  full-bleed, o dos columnas en desktop). Esta opción es la que realmente resuelve
  la queja de legibilidad en desktop.

Notas de implementación: usar unidades relativas (rem/ch/lh) para WCAG 1.4.4 y
1.4.12; `max-inline-size` sobre `max-width` para robustez con vertical writing;
verificar `lang="es"` en el documento si se activa `hyphens: auto` (por defecto,
mantener `hyphens: none` o `manual` — el español sin justificar no lo necesita).

### Fuentes clave (orden de prioridad: primarias primero)

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/ — SC 1.4.3 (4.5:1), 1.4.4 (200%), 1.4.12 (spacing)
- W3C Understanding 1.4.3: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
- W3C Understanding 1.4.4: https://www.w3.org/WAI/WCAG22/Understanding/resize-text
- W3C Understanding 1.4.12: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing
- MDN line-height: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height
- MDN text-wrap: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap
- MDN hyphens: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/hyphens
- web.dev Learn Design — Typography: https://web.dev/learn/design/typography
- Google Fonts Knowledge — Understanding measure: https://fonts.google.com/knowledge/using_type/understanding_measure_line_length
- webtypography.net 2.1.2 (measure) y 2.2.2 (leading/rhythm): https://webtypography.net/2.1.2 · https://webtypography.net/2.2.2
- Baymard — Optimal Line Length: https://baymard.com/blog/line-length-readability
- CSS-Tricks — Setting Line Length (2025): https://css-tricks.com/setting-line-length-in-css-and-fitting-text-to-a-container/
- OpenReplay — Controlling Line Length (2025): https://blog.openreplay.com/controlling-line-length-css-readability/
- Pimp my Type — Line length & line height: https://pimpmytype.com/line-length-line-height/
- Rello, Pielot & Marcos (CHI 2016) — Make It Big!: https://pielot.org/pubs/Rello2016-Fontsize.pdf
- Agentys — Optimal Font Size and Line Height (2026): https://www.agentys.io/en/blog/taille-police-interligne-optimal
- UDT — How to Calculate Line Height (2026): https://ultimatedesigntools.com/blog/how-to-calculate-line-height/
- WebKit — text-wrap pretty (2025): https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/
- WebKit — line-height units (2025): https://webkit.org/blog/16831/line-height-units/
- Chrome for Developers — text-wrap: pretty (2023): https://developer.chrome.com/blog/css-text-wrap-pretty
- LogRocket — balance vs pretty (2025): https://blog.logrocket.com/css-text-wrap-balance-vs-text-wrap-pretty/
- Smashing Magazine — Inclusive Dark Mode (2025): https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/
- Mantlr — Dark Mode Design Guide (2026): https://mantlr.com/blog/dark-mode-design-guide-color-typography-accessibility
- ColorFYI — Dark Mode Colors: https://colorfyi.com/blog/dark-mode-colors/
- Theme & Color — Accessible Dark Palette (2025): https://themeandcolor.com/blog/accessible-dark-mode-color-palette
- Tangled Web — Small Text is Medium's Large Fail: https://tangledweb.xyz/small-text-is-mediums-large-fail-b39589f5fae0
- BBC GEL Typography: https://www.bbc.co.uk/gel/features/typography
- BBC minimum text size: https://www.bbc.co.uk/accessibility/forproducts/guides/html/minimum-text-size/
- HackMD — Establishing a typographic system (tamaños reales Medium/NYT/BBC): https://hackmd.io/@alexmwalker/Hk4j7wT_8
- Better Web Type — Rhythm: https://betterwebtype.com/rhythm-in-web-typography/
- ux-republic — editorial content (2025): https://www.ux-republic.com/en/best-practices-for-creating-editorial-content-on-the-web/

### Pendientes detectados (fuera de alcance de esta sesión)

- Verificar con APCA (no solo WCAG) los pares actuales del sitio si se decide
  pulir el modo oscuro (Smashing/Mantlr lo recomiendan).
- Decidir con el humano si la columna de lectura debe acotarse (opción C) o si el
  full-width se conserva a toda costa (opción A/B).
- No se encontró una fuente primaria con cifra exacta del ancho medio de carácter
  de Inter para convertir px→ch; las estimaciones (~0.5em) provienen de la
  práctica general ([webtypography.net 2.1.2](https://webtypography.net/2.1.2)) y
  conviene validarlas en el navegador con la fuente real.
