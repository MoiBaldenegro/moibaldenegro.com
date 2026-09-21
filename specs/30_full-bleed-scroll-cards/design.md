# Diseño — Sección full-bleed con recorrido de lado a lado (feature 30)

## Contexto visual

- Sección afectada: "Últimos artículos" de la portada (`/`), componente
  `LatestArticles` con pin + scrub de ScrollTrigger (feature 29, done).
- Estado actual: la sección fijada vive dentro de la columna de contenido
  (`width: min(var(--container-max), 95%)`); el hero se va con el scroll y la
  pista queda "pegada" dentro de la caja, con sensación de scroll interno.
- Estado deseado: la sección fijada rompe el container y ocupa todo el ancho
  del viewport, de borde a borde; las 3 cards recientes atraviesan la web
  completa de un lado al otro conducidas por el scroll vertical, con el hero
  desplazándose con el flujo normal. En móvil el gesto vertical conduce igual;
  sin JS o con movimiento reducido, las 3 cards quedan visibles en disposición
  estática full-bleed.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--container-max` | 1500px | Referencia de la columna que la sección abandona |
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

- Decisión 1 (salida del container solo con CSS): la sección declara ancho de
  viewport (`100vw`) con `margin-inline: calc(50% - 50vw)` y `max-width: none`,
  sin mover marcado entre componentes ni tocar `src/pages/index.astro`; el hero
  y el resto de secciones conservan su columna (REQ-30-01, REQ-30-03).
- Decisión 2 (recorrido viewport): la pista se dimensiona contra el viewport y
  el módulo recalcula `distance()` contra su ancho; el pin + scrub (`ease:
  none`, `invalidateOnRefresh`, `refresh()`) se conserva sin JS nuevo ni
  dependencias nuevas (REQ-30-02, REQ-30-08).
- Decisión 3 (convivencia live-search y ClientRouter): la sección sigue dentro
  de `data-landing-sections` y el registro en `astro:page-load` con limpieza de
  triggers previos queda intacto (REQ-30-07).
- Decisión 4 (movimiento reducido y sin JS): con `prefers-reduced-motion` se
  omite la animación y el contenido queda estático y visible; sin JavaScript
  las 3 cards se muestran sin animación (REQ-30-04, REQ-30-05).
- Decisión 5: se conservan las 3 cards con sus pares de transición
  `title-<id>` / `img-<id>` y los estilos solo usan tokens (REQ-30-06,
  REQ-30-09).
- Restricción aplicable: ≤100 líneas por archivo (REQ-30-10;
  `latest-articles.css` en 83/100 y `latest-articles-scroll.ts` en 65/100:
  compactar reglas existentes antes de pedir `blocked`; el repositorio
  `posts-repository.ts` en 100/100 no se toca; estilos fuera del `.astro`;
  lógica en módulo `.ts`).

## Alternativa descartada

- Alternativa considerada: mover la sección fuera del `div` de landing en
  `index.astro` o fijar también el hero dentro del pin.
- Motivo del descarte: rompería la convivencia con el live-search (la sección
  debe seguir dentro de `data-landing-sections`) y el humano pide que el hero
  se vaya con el scroll normal; la salida solo con CSS logra el full-bleed sin
  tocar el marcado ni el flujo de la página.
