# Diseño — Fix del pin-spacer gigante y del scroll congelado (feature 32)

## Contexto visual

- Sección afectada: "Últimos artículos" de la portada (`/`), sección fijada
  full-bleed con pin + scrub de ScrollTrigger (features 29-31, done).
- Estado actual: tras la 31 (`start: 'top bottom'` + sección con
  `min-height: 100vh` + flex centrado + `pinSpacing` por defecto) la portada
  muestra un hueco gigante vacío (pin-spacer de ~100vh + recorrido completo,
  fijado antes de que haya contenido visible) y el scroll vertical deja de
  funcionar (valores funcionales en `x`/`end` + `invalidateOnRefresh` +
  imágenes lazy + `refresh()` incondicional encadenan recálculos de
  `distance()`). La suite node:test sigue en verde porque solo inspecciona
  literales y funciones puras, sin medir layout en runtime.
- Estado deseado: el pin conserva el recorrido lado a lado con enganche
  temprano visible y pista centrada, pero su espaciado adicional queda acotado
  al recorrido real (sin hueco gigante) y el scroll vertical fluye sin bucles
  de refresco. En móvil el gesto vertical conduce igual; sin JS o con
  movimiento reducido, las 3 cards quedan visibles en disposición estática.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | #101018 | Fondo de la card |
| `--color-text` | #ffffff | Título y descripción |
| `--color-text-secondary` | #b8b8c5 | Meta autor y lectura |
| `--color-border` | rgba(255,255,255,.08) | Borde de card y pista |
| `--color-accent` | #7d68ff | Borde en hover |
| `--radius-card` | 22px | Radio de card |
| `--radius-pill` | 999px | Radio de tags |
| `--gap-card` | 14px | Espaciado de pista y cards |
| `--shadow-card-hover` | inset ... | Elevación en hover |
| `--transition-default` | .28s ... | Transiciones de hover |

## Decisiones y constraints

- Decisión 1 (spacer acotado al recorrido real, solo configuración del pin):
  el espaciado adicional que el pin inserta queda acotado al recorrido
  horizontal real de la pista (configuración del pin + `end` calculado contra
  el viewport); el enganche temprano visible y el centrado vertical de la 31
  se conservan (REQ-32-01, REQ-32-03).
- Decisión 2 (distancia estable y testeable): el módulo expone funciones puras
  que calculan y acotan la distancia y el `end`/espaciado del pin sin leer el
  layout, de modo que node:test atrapa la regresión (aserciones sobre la
  configuración del pin y sobre el acotado) sin necesidad de navegador
  (REQ-32-02, REQ-32-08).
- Decisión 3 (sin bucles de refresco): el refresco del trigger tras
  restaurar el modo landing o asentar el layout queda vigilado (sin
  `refresh()` incondicional en cada init ni recálculos encadenados por
  imágenes lazy); el scroll vertical sigue funcionando tras el pin
  (REQ-32-02).
- Decisión 4 (contratos intactos): 3 cards con pares `title-<id>` /
  `img-<id>`, convivencia live-search (`data-landing-sections`), registro en
  `astro:page-load` con limpieza de triggers, `prefers-reduced-motion`
  (estático visible) y degradado sin JS (3 cards visibles) intactos
  (REQ-32-04, REQ-32-05, REQ-32-06, REQ-32-07).
- Decisión 5: la hoja solo usa tokens de `tokens.css` (REQ-32-09).
- Restricción aplicable: ≤100 líneas por archivo (REQ-32-10;
  `latest-articles.css` en 94/100 y `latest-articles-scroll.ts` en 72/100:
  compactar reglas existentes antes de pedir `blocked`; el repositorio
  `posts-repository.ts` en 100/100 no se toca; estilos fuera del `.astro`;
  lógica en módulo `.ts`).

## Alternativa descartada

- Alternativa considerada: revertir la 31 (volver a `start: 'top center'` sin
  centrado) o desactivar el pin y dejar las cards en disposición estática.
- Motivo del descarte: el humano pidió el enganche temprano visible y el
  centrado vertical (contrato de la 31) y la travesía lado a lado de la 30;
  revertir reintroduciría las cards abajo y el hueco en blanco originales. El
  fix acota el spacer y estabiliza el refresco sin perder lo ganado.
