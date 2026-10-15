# Diseño — 4 «Últimos artículos» con entrada y salida lateral de las cards (feature 95 home-latest-articles-five)

## Contexto visual

- Sección «Últimos artículos» de la portada (/): src/components/latest-articles.astro + latest-articles.css
  (apilado) y modo horizontal de latest-horizontal.css (features 72-76, >=1201 px sin reduced motion).
- Estado actual (HEAD): 3 cards. En el árbol quedó un intento a 5 (bloqueado por REQ-47-06).
- Estado deseado (decisión humana 2026-10-15): 4 cards y, en el layout apilado, cada card entra
  deslizándose desde un lado al aparecer y sale deslizándose hacia el otro al irse, ligado al scroll.
  El footer (feature 89) sigue con 3.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--gap-card` | 14px (sin cambios) | Gap entre cards y base de la distancia del desliz |
| `--container-max` | 1500px (sin cambios) | Ancho máximo de la sección |
| `--latest-slide-distance` (local, en .latest-articles) | `calc(4 * var(--gap-card))` = 56 px | Distancia del desliz lateral |

No se toca tokens.css (99 líneas fijadas por 4 tests): la distancia es una propiedad local derivada de un token.

## Hoja nueva src/styles/latest-cards-slide.css (importada por latest-horizontal.astro)

Esqueleto de referencia (el implementer lo ajusta, sin salirse de la spec):

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .home__landing { overflow-x: clip; }              /* sin scroll horizontal por el desliz */
    .latest-articles { --latest-slide-distance: calc(4 * var(--gap-card)); }
    .latest-articles__card {
      animation: latest-card-slide linear both;
      animation-timeline: view();                    /* SIEMPRE después del shorthand */
    }
    .latest-articles--horizontal .latest-articles__card { animation: none; }
    @keyframes latest-card-slide {
      entry 0%  { opacity: 0; transform: translateX(var(--latest-slide-distance)); }
      entry 40% { opacity: 1; transform: none; }
      exit 60%  { opacity: 1; transform: none; }
      exit 100% { opacity: 0; transform: translateX(calc(-1 * var(--latest-slide-distance))); }
    }
  }
}
```

## Geometría y comportamiento esperados

| Viewport | Layout | Esperado |
|----------|--------|----------|
| 375 px | Apilado, 1 columna | 4 cards; entran desde la derecha y salen hacia la izquierda; sin scroll horizontal |
| 768 / 1024 px | Apilado, 1 columna | Igual que 375 |
| 1280×800 con movimiento | Modo horizontal (par visible) | Sin animación CSS en las cards; entrada de la 75 + recorrido del track (n − 2)(W + G) = 2 × 615 ≈ 1230 px; al final, cards 3 y 4 |
| Cualquiera con reduced motion | Apilado | Sin animación: cards quietas, opacity 1 |
| Navegador sin animation-timeline | Apilado | Sin animación (fallback por @supports) |

## Decisiones y constraints

- D1 Límite 4 (`LATEST_POSTS_LIMIT = 4`), footer 3 (`FOOTER_LATEST_POSTS_LIMIT`). Se mantiene transition:name.
- D2 REQ-47-06: umbral = peso medido (4 cards + hoja nueva inline) + 3000 B, redondeado al millar
  superior (estimación ~47 000). Tope 48 000: por encima, blocked. El índice de búsqueda pesa ~39 KB,
  así que embebido seguiría disparando el test (propósito intacto).
- D3 Solo CSS, scroll-driven (`view()`), solo transform/opacity: corre en el compositor, sin jank,
  y los transforms no cuentan para CLS. Sin JS nuevo (latest-horizontal.ts ya mide 95/100 líneas).
- D4 Modo horizontal (>=1201 px): `animation: none` en las cards. Motivos: (a) una animación CSS de
  transform anula el transform en línea que GSAP pone a la primera y la última card (feature 76);
  (b) `view()` mide la posición de layout y no ve el desplazamiento del track por transform dentro
  de la sección sticky, así que no puede seguir el recorrido horizontal. Ahí el desliz lateral ya lo
  da el propio track (las cards entran por la derecha y salen por la izquierda) y la entrada vertical
  de la 75 se conserva: las dos animaciones no coinciden nunca en el mismo modo, no hay que fusionarlas.
- D5 Recorte en `.home__landing` (ancho completo) con `overflow-x: clip` y no en la sección: la sección
  mide lo mismo que las cards y recortarla cortaría la card y la sombra de hover. `clip` no crea
  contenedor de scroll, así que el sticky de la 73 sigue funcionando y overflow-y queda visible
  (la entrada de la 75 baja desde arriba).
- D6 reduced motion: el bloque entero va en `no-preference`; con `reduce` no existe la animación
  (no basta con la red de seguridad de layout.css, que solo acorta duraciones).
- Valores por defecto pendientes de validación humana: dirección (entra por la derecha y sale por la
  izquierda, como el modo horizontal), distancia 56 px, rangos entry 0–40 % / exit 60–100 %, activo
  también en móvil, sin animación nueva en el modo horizontal de escritorio.
- Restricciones: estático, sin dependencias, ≤100 líneas por archivo, estilos en src/styles, tokens.
  latest-articles.astro, latest-articles.css y latest-horizontal.css están congelados (REQ-87-06, REQ-72-01/02).

## Verificación medida en navegador (obligatoria; cifras en progress/impl_home-latest-articles-five.md)

Chrome headless: `"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new
--remote-debugging-port=<p> --user-data-dir=<tmp>` sobre `pnpm build` + `pnpm preview`. Script Node
(WebSocket nativo de Node 24 contra CDP, sin playwright) en el scratchpad, no en el repo.
`Emulation.setDeviceMetricsOverride` para el viewport y `Emulation.setEmulatedMedia` con
`prefers-reduced-motion: reduce` cuando toque.

1. 375 / 768 / 1024 / 1280: 4 `.latest-articles__card`; en 10 o más posiciones de scroll de arriba a
   abajo, `scrollWidth <= clientWidth`.
2. 375 / 768 con movimiento: cada card tiene una `CSSAnimation` `latest-card-slide` con
   `timeline instanceof ViewTimeline`; muestreo con `getComputedStyle(card).transform` y `opacity`:
   card asomando por abajo con translateX > 0 y opacity < 1, card centrada con matriz identidad y
   opacity 1, card saliendo por arriba con translateX < 0.
3. reduced motion a 375 y 1280: `card.getAnimations().length === 0`, transform `none`, opacity 1.
4. 1280×800 con movimiento: existe `.latest-articles--horizontal-pin`; las cards con
   `animation-name: none`; al final del tramo, cards 3 y 4 completas en el rect de la sección (±2 px).
5. CLS: `PerformanceObserver({ type: 'layout-shift', buffered: true })` sumando `value` sin
   `hadRecentInput` mientras se recorre la página; ≤ 0.1 a 375, 768 y 1280.
6. Footer con 3 `.site-footer__post` a 375, 768 y 1280.
7. Capturas PNG en progress/research/home95/ (375, 768 y 1280 a medio rango; 375 y 1280 con reduce).

## Alternativa descartada

- Desliz con JS (IntersectionObserver o un tween más en latest-horizontal.ts): JS nuevo de runtime y
  latest-horizontal.ts en 95/100 líneas. Descartado por la preferencia «solo CSS».
- Animación lateral también en el modo horizontal de escritorio: necesitaría JS (view() no ve el
  transform del track). Si el humano la quiere, sería otra feature.
- Quitar transition:name a las cards 4 y siguientes: rompe el contrato de view transitions y el
  marcado congelado. Descartado por el orquestador.
