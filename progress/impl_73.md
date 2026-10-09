# Informe de implementación — feature 73 latest-horizontal-compact-sticky

Implementado por el líder en rol de implementer (autorización humana; subagente implementer no
disponible). Feedback humano sobre la 72: «las cards tienen un espacio gigante», «un saltito al
llegar en "Últimos artículos»»; y después: «metamos 2 para que ocupen todo el ancho y que al
final queden las últimas 2 (la 2 y la 3)».

## Ciclo rojo/verde (REQ-73-34)

- Test nuevo tests/latest-horizontal-compact-sticky.test.mjs (92 líneas) escrito primero.
- ROJO: pass 1 / fail 4. Solo pasaba REQ-73-33/34 (LATEST_POSTS_LIMIT = 3 y líneas).
- VERDE: 5/5. Suite completa 822/822; ./init.sh en verde.
- Tests legacy ajustados (precedente REQ-43-06, nota «Ajuste feature 73»):
  - tests/latest-horizontal-geometry.test.mjs (71): se reescribe con las firmas nuevas
    (W, G, n) y conserva la intención de REQ-71.
  - tests/latest-articles-horizontal-scroll.test.mjs (72): sin pin ni anticipatePin y con un
    mínimo de 3 cards.

## Cambios

- src/domain/latest-horizontal.ts (54 líneas), funciones puras:
  - pairCardWidth = min((C − G)/2, L).
  - pairInset = max(0, (V − 2W − G)/2).
  - trackTravel = pinScrollLength = (n − 2)(W + G); scroll 1:1.
  - trackOffset = −clamp01(p) · travel.
  - cardLeftX.
  - focusScrollTarget con k = index − 1 acotado a [0, n − 2].
  - Con entradas inválidas o n < 3 devuelven 0 (o start).
- src/styles/latest-horizontal.css (39 líneas):
  - Custom properties --latest-card-width = min(((min(container, 95%) − gap)/2), límite por alto
    de la 72) y --latest-pair-inset.
  - Sección con sticky top 0, min-height 100vh, overflow clip y
    clip-path inset(0 var(--latest-pair-inset)).
  - Encabezado de ancho 2W + G, centrado.
  - Track flex con gap var(--gap-card).
  - Card flex 0 0 W; solo la primera lleva margin-inline-start: inset.
- src/components/latest-horizontal/latest-horizontal.ts (81 líneas):
  - Sin pin ni anticipatePin. El efecto crea `div.latest-articles--horizontal-pin`, lo inserta
    antes de la sección y mueve la sección dentro.
  - Alto del envoltorio = alto de la sección + recorrido, fijado al crear y en cada
    `refreshInit` (no en onRefresh).
  - ScrollTrigger solo hace scrub de x: trigger el envoltorio, start 'top top' y
    end '+=' + pinScrollLength.
  - W se mide con getBoundingClientRect y G con columnGap, en funciones para invalidateOnRefresh.
  - Mínimo 3 cards.
  - La limpieza quita el listener de refreshInit, el de foco y el observer, devuelve la sección a
    su sitio (wrapper.replaceWith(section)) y quita la clase.
- Sin cambios: index.astro, el componente .astro, latest-articles.*, LATEST_POSTS_LIMIT = 3
  (ampliar a 4 o más es una decisión futura del humano).

## Verificación real: Chrome headless + CDP sobre astro preview

### Geometría del par (REQ-73-10..17)

| viewport | V | W | G | inset | p | x (esperado) | cards [left-right-bottom] | márgenes sin card |
|---|---|---|---|---|---|---|---|---|
| 1280×800 | 1270 | 596,25 | 14 | 31,75 | 0 | 0 (0) | 31.8-628 · 642-1238.3 · 1252.3-1848.5 · bottom 709 | sí |
| 1280×800 | | | | | 0,5 | −305,13 (−305,13) | | sí |
| 1280×800 | | | | | 1 | −610,25 (−610,25) | −578.5-17.8 · 31.8-628 · 642-1238.3 | sí |
| 1440×900 | 1430 | 672,25 | 14 | 35,75 | 0 | 0 | 35.8-708 · 722-1394.3 · bottom 723 | sí |
| 1440×900 | | | | | 1 | −686,25 (−686,25) | card 2 left 35.8 · card 3 right 1394.3 | sí |
| 1600×700 (W limitada por alto) | 1590 | 447,11 | 14 | 340,89 | 0 | 0 | 340.9-788 · 802-1249.1: márgenes iguales (340,9) | sí |

- El h2 queda alineado con la card 1 (left = inset) y mide 2W + G: 1206,5, 1358,5 y 908,2.
- La card y el encabezado caben: bottom 709 < 800, 723 < 900 y 686 < 700.
- Envoltorio: 1, pin-spacer: 0. Alto 1410 = 800 + 610 a 1280 y 1586 = 900 + 686 tras un
  resize a 1440.

### Scroll REAL con rueda (REQ-73-23/24), 1280×800

Eventos Input.dispatchMouseEvent mouseWheel desde 600 px antes del envoltorio:
- bajando: 20 × deltaY 40 (cada 30 ms), 12 × 100 (16 ms) y 8 × 240 (8 ms, ráfaga rápida);
- subiendo: −240, −100 y −40.

Se registró el top del h2 con requestAnimationFrame en cada frame:
- 247 frames, scroll de 0 a 1825;
- desviación máxima del h2 durante el tramo fijado: 0 px;
- retrocesos entre frames al entrar o salir: 0.

El salto de la 72 no se reproducía con scrollTo programático. Ahora no aparece ni con rueda real,
porque el fijado es position: sticky (compositor) y no un cambio a fixed desde JS. No se pudo
comparar con producción porque allí no está desplegada la 72.

### Apilado (REQ-73-26), comparado con la misma página sin JS

| caso | envoltorio | pin-spacer | clase | padre de la sección | cards | igual que sin JS |
|---|---|---|---|---|---|---|
| 1024×800 | 0 | 0 | no | home__landing | 963×767, 963×767, 963×742 @25 | sí |
| 375×800 | 0 | 0 | no | home__landing | 347×562, 347×562, 347×476 @9 | sí |
| 1280×800 con reduced motion | 0 | 0 | no | home__landing | 1207×904, 1207×904, 1207×879 @32 | sí |

### Reversión (REQ-73-25)

- Resize de 1280 a 1024: envoltorio 0, sin clase, la sección vuelve a ser hija de .home__landing
  entre .new-hero y la isla HTB y no tiene atributo style. El track queda con `style=""`
  (atributo vacío, sin declaraciones).
- Al volver a 1280 se recrea un único envoltorio de 1410.
- En astro:before-swap (portada → About), leído tras nuestro destroy: envoltorio 0, sin clase,
  padre .home__landing y style null.

### Ida y vuelta, teclado, búsqueda y clic

- Ida y vuelta portada → About → atrás (REQ-73-27), dos ciclos:
  - scrollY 1825 → 1825 y 1725 → 1725, iguales a history.state.scrollY;
  - un envoltorio y 0 pin-spacer.
- Teclado (REQ-73-28): con Tab real, la card 1 queda en 31.8-628 y las cards 2 y 3 en
  642-1238.3. Las tres quedan completas, dentro del viewport y del par.
- Búsqueda en vivo (REQ-73-29): «solid» oculta la portada. Al vaciarla el envoltorio queda en
  top 1215 y alto 1410, idénticos a una carga limpia.
- Clic en la card 3 con p=1 (REQ-73-30): navega a /posts/01-procesos-memoria/. Único error de
  consola: la violación CSP preexistente del script «data:application/javascript,» del router
  de Astro, que también ocurre sin el efecto y en producción. Es la feature 74, ya en el backlog.

### CSP y peso (REQ-73-31)

- Portada en carga directa: 0 violaciones.
- Chunk latest-horizontal.*.js: 115 695 B, 45 059 B gzip (≤ 51 200), con 3 avisos @license.
- Los tests de build de la 72 siguen en verde.

### Capturas

progress/research/gsap73/:
- h73-1280x800-p0/p0.5/p1, h73-1440x900-p0/p0.5/p1 y h73-1600x700-p0;
- h73-stacked-1024, h73-stacked-375 y h73-stacked-1280-rm;
- h73-focus-1/2/3 y h73-click-post (.png).
