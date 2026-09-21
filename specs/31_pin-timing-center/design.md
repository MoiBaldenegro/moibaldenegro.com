# Diseño — Enganche temprano y centrado vertical del pin (feature 31)

## Contexto visual

- Sección afectada: "Últimos artículos" de la portada (`/`), sección fijada
  full-bleed con pin + scrub de ScrollTrigger (features 29-30, done).
- Estado actual: el trigger fija con `start: 'top center'`, de modo que al
  empezar el recorrido horizontal la pista ocupa la mitad inferior del
  viewport (cards abajo, casi fuera de vista) y entre la salida del hero y el
  enganche tardío queda la página en blanco mientras el resto sigue en
  scroll Y.
- Estado deseado: el pin se activa ANTES (enganche temprano, pista ya visible
  al empezar el recorrido) y la pista queda CENTRADA verticalmente en el
  viewport durante todo el recorrido horizontal, sin hueco en blanco entre el
  hero y la animación. El mecanismo scroll-driven (pin + scrub, `ease: none`,
  `invalidateOnRefresh`, `refresh()`, full-bleed de lado a lado) se conserva;
  solo cambian el `start`/`end` del trigger y el posicionamiento vertical de
  la sección fijada. En móvil el gesto vertical conduce igual; sin JS o con
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

- Decisión 1 (enganche temprano, solo timing): el `start` del trigger se
  adelanta respecto a `'top center'` (la sección se fija con la pista ya
  visible) y el `end` se recalcula en coherencia (`+=distance()`); el pin +
  scrub (`ease: none`, `invalidateOnRefresh`, `refresh()`), el registro en
  `astro:page-load` con limpieza y `distance()` contra el viewport se
  conservan sin JS nuevo ni dependencias nuevas (REQ-31-01, REQ-31-02,
  REQ-31-04).
- Decisión 2 (pista centrada durante el pin, solo posicionamiento): la sección
  fijada centra la pista verticalmente en el viewport (altura de viewport con
  flex + centrado) durante todo el recorrido horizontal; la salida full-bleed
  (`100vw` + `margin-inline: calc(50% - 50vw)`) se conserva y el cambio es
  solo vertical (REQ-31-01, REQ-31-03).
- Decisión 3 (sin hueco en blanco): con el enganche temprano + la pista
  centrada, al irse el hero la sección ya está fijada y protagonista, y al
  agotarse el recorrido libera y la página continúa; el hero conserva su
  desplazamiento normal y la sección sigue dentro de `data-landing-sections`
  con `refresh()` al restaurar el live-search (REQ-31-02, REQ-31-04,
  REQ-31-08).
- Decisión 4 (movimiento reducido y sin JS): con `prefers-reduced-motion` se
  omite la animación y el contenido queda estático y visible; sin JavaScript
  las 3 cards se muestran sin animación (REQ-31-05, REQ-31-06).
- Decisión 5: se conservan las 3 cards con sus pares de transición
  `title-<id>` / `img-<id>` y los estilos solo usan tokens (REQ-31-07,
  REQ-31-09).
- Restricción aplicable: ≤100 líneas por archivo (REQ-31-10;
  `latest-articles.css` en 86/100 y `latest-articles-scroll.ts` en 70/100:
  compactar reglas existentes antes de pedir `blocked`; el repositorio
  `posts-repository.ts` en 100/100 no se toca; estilos fuera del `.astro`;
  lógica en módulo `.ts`).

## Alternativa descartada

- Alternativa considerada: fijar también el hero dentro del pin o alargar el
  recorrido (`end`) para compensar el enganche tardío.
- Motivo del descarte: el humano pide que el hero se vaya con el scroll
  normal (D13) y que las cards queden centradas desde el inicio; alargar el
  recorrido sin adelantar el `start` mantendría las cards abajo y el hueco en
  blanco. El fix es timing + centrado, no más recorrido.
