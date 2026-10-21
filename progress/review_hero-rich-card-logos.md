# Review — feature 112

**Veredicto:** APPROVED

Alcance revisado: solo la 112 (lista de `progress/impl_hero-rich-card-logos.md`). Quedan fuera por ser ajenos: `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md` y `tests/hack-the-box-sprite.test.mjs`. Ninguno de los tres tiene un mtime de esta sesión: sprite 2026-10-20 15:54, test HTB 2026-10-19, `hero-card.css` 2026-10-20 20:41 (cambio de la 111) y tokens 2026-10-19.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `.astro` con `<style>`: [x]. `hero-card-art.astro`, `hero-card.astro` y `htb-card.astro` no tienen `<style>`, `<script>` ni `style=`.
- C2 Sin lógica en la UI: [x]. El frontmatter de `hero-card-art.astro` solo importa y desestructura `card`. El condicional `{(card.icon || card.backgroundIcon) && ...}` de `htb-card.astro:24` es de plantilla.
- C3 Datos vía repositorio con validación: [x]. `parseRichCard` (`hero-cards-parse.ts:69-72`) reutiliza `readSpriteRef` (ampliado a `icon`, `hero-cards-fields-parse.ts:53`) y `readBackdropSize`, con `HeroCardsDataError` que nombra archivo, índice y campo. Los componentes reciben la entidad tipada (`HeroRichCard`, `hero-card.ts:56-60`, campos readonly y opcionales).
- C4 Tokens sin valores sueltos: [x]. No hay hex nuevos.
  - `opacity 0.16`, `150px`, `-8deg` y la escala son geometría y opacidad locales del logo, con el mismo criterio que 103/105/108/109 (design.md, «Tokens usados»).
  - El `margin-bottom` del wordmark va en % por ratio del viewBox.
- C5 Archivos de 100 líneas o menos: [x].
  - Archivos de la feature: `hero-card-art.astro` 31, `htb-card.css` 36, `hero-card-accents.css` 67, parse 75/75, entidad 64 y test nuevo 100.
  - Tests heredados ajustados: todos tienen 100 líneas o menos, salvo `htb-hero-card.test.mjs` y `search-index-lazy-load.test.mjs`. Los dos ya superaban las 100 líneas antes: el primero no crece (144) y el segundo solo gana la línea de la nota obligatoria (154 en HEAD, 155 ahora).
- C6 Sin dependencias nuevas ni JS de runtime: [x].
- C7 JSON válido y tipado: [x]. La card htb solo añade `icon #htb`, `backgroundIcon #htb-wordmark` y `backgroundIconSize sm` (`hero-cards.json:2`). El humano autorizó esos campos.
- C8 Test-first (rojo, luego verde): [x].
  - El informe anota el rojo de los 9 tests nuevos antes del código y el verde 9/9, con la suite en 1163/1163.
  - Guardó `icon-cards-baseline.html` (14 cards, 5 738 B) antes de tocar el código.
  - Explica dos correcciones del propio test hechas antes del verde (recorte a 100 líneas y anclas de orden).
  - Los tests heredados ajustados llevan la nota «Ajuste feature 112 (precedente REQ-43-06)».
- C9 Dependencias: [x]. La 112 no declara `depends_on`.
- C10 `./init.sh` verde: [x]. Lo ejecuté yo y salió con código 0, con entorno, formato, tests y build en verde.
- C11 La página se ve bien en desktop y móvil, sin errores de consola: [x]. Lo verifiqué por mi cuenta (ver abajo).

## Verificación independiente (Chrome headless + CDP)

- Script propio: `scratchpad/rev112/r.mjs`.
- Servidor: `astro preview` en :4731, ya parado. El `pnpm dev` de :4321 (PID 34400) no se tocó.
- Errores de consola, red y excepciones: 0.

Resultados a 375, 800, 1024, 1280 y 1600 px, en reposo y en hover:

- **Orden y capas.**
  - Orden DOM: `card-header`, `card-backdrop`, `card-icon`, `hero-card__body`.
  - z-index: backdrop 0 y body 5.
  - Opacidad: `.card-icon` 0.16 y backdrop 0.06.
  - `pointer-events: none` en `.card-icon`, en su svg y en `.card-backdrop`.
- **Hover del cubo (REQ-112-16).**
  - En reposo el transform es `matrix(2.9708, -0.4175…)` con escala 3 y `matrix(5.9416, -0.8350…)` con escala 6, es decir `rotate(-8deg) scale(s)`.
  - En hover pasa a `matrix(3.3580, 0.1173…)` y `matrix(6.7159, 0.2345…)`, que es exactamente `rotate(2deg) scale(s*1.12)`. Lo da la regla de `hero-card.css:52`, sin regla `:hover` nueva.
- **Clics.** `elementFromPoint` en 4 puntos del cuerpo devuelve siempre `.hero-card__body` o un descendiente (`htb-stadistics__empty`), nunca `.card-icon` ni `.card-backdrop`. La card no tiene `href`, así que no hay `a.card-link`.
- **Wordmark (REQ-112-19).** El borde inferior del `use` queda a 1.0 px del de la card en los 5 anchos, que es el borde de 1 px de la card. El solape con el título es 0.
- **375 px.** `scrollWidth` 365 frente a 375 de ancho, sin scroll horizontal. Con `overflow: hidden`, el cubo y el wordmark quedan recortados dentro de la card.
- **Contraste mínimo (reposo / hover).** Todos los valores superan 4.5:1 y coinciden con los del informe.

  | Ancho | Título | «Estadísticas no disponibles» |
  |---|---|---|
  | 375 | 13.11 / 19.01 | 7.45 / 13.07 |
  | 800 | 13.05 / 18.69 | 4.89 / 8.71 |
  | 1024 | 13.05 / 18.69 | 6.86 / 12.41 |
  | 1280-1600 | 12.76 / 18.43 | 6.86 / 12.41 |

- **Cards de icono byte a byte.** Comparé las 14 `article.hero-card` de `dist/client/index.html` con `progress/research/hero112/icon-cards-baseline.html` y son idénticas. El test de build también lo verifica.

## Valoración de los puntos pedidos

1. **Umbral de REQ-47-06 a 42 000 B: aceptado.**
   - Lo prevé REQ-112-25 de forma literal y lo respalda la aprobación humana del 2026-10-20, citada en `tests/search-index-lazy-load.test.mjs:97` con la nota de precedente.
   - El peso que medí es 40 211 B, dentro del rango anotado de 40 203-40 215 B. Quedan ~1 790 B de margen, y el test nuevo bloquea si se llega a 42 000 B.
   - Detalle menor del informe: dice «155 → 156 líneas» y en realidad pasa de 154 a 155. No bloquea.
2. **`margin-bottom: calc(-100% * 5.9 / 300)` del wordmark (`hero-card-accents.css:47`): aceptado.**
   - Lo prevé la Decisión 4 si el glifo no toca el borde.
   - Sin el margen, la distancia de 2.3-8.3 px incumplía REQ-112-19. Con él la medí en 1 px en los 5 anchos.
   - Sigue el precedente de anthropic-wordmark (105) y el selector solo casa con `#htb-wordmark`.
   - Queda acoplado al path del symbol, y eso ya está anotado en el informe.
3. **Cubo apenas visible y su caja solapando la del título a 800/1024: no bloquea.**
   - Medí el solape de cajas en 2 745 y 1 891 px² en reposo. Es la caja transformada de un svg al 0.16 que se pinta debajo del header (z 4), y el título mantiene ≥13:1 en reposo.
   - REQ-112-19 solo exige solape 0 con el wordmark.
   - En esas celdas (113-149 px de ancho), el cubo queda casi todo detrás del aviso del cuerpo y el wordmark mide 58-77 px de ancho. La decoración allí es casi imperceptible, pero las celdas son diminutas y los valores son los por defecto revisables de la spec.

## Valoración visual (capturas de `progress/research/hero112/` y las mías)

- **A 1280 y 1600** (la celda grande, que es el caso principal) el resultado cumple la petición. El cubo verde tenue gira en la esquina inferior derecha con el mismo efecto que las cards de icono. El wordmark «HACKTHEBOX» queda como marca de agua abajo a la izquierda. El contenido (título y estadísticas, también con la lista inyectada) sigue mandando. La card queda claramente más rica que el bloque vacío anterior.
- **A 375** también se lee bien: el cubo y el wordmark quedan proporcionados y recortados.
- **A 800 y 1024** la mejora casi no se nota.

## Observaciones (no bloquean; para el humano)

- Si se quiere más presencia del cubo en las celdas estrechas, se puede revisar `--icon-scale: 3` en `htb-card.css:27` o desplazar el cubo fuera del aviso en ≤ 1200 px. Es un valor por defecto revisable, en otra feature si el humano lo pide.
- El glifo del wordmark empieza en x = 18.4 de 300, así que con sm queda unos px a la derecha del `left`. Es coherente con la spec, que no pide compensarlo.

## Cambios requeridos (si aplica)

Ninguno.
