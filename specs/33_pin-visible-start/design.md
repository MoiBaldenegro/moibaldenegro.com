# Diseño — Pin visible a viewport completo con recorrido horizontal a la vista (feature 33)

## Contexto visual

- Sección afectada: "Últimos artículos" de la portada (`/`), sección fijada
  full-bleed con pin + scrub de ScrollTrigger (features 29-32, done).
- Estado actual: tras la 32 el módulo conserva `start: 'top bottom'` con
  `pin: true` (`latest-articles-scroll.ts` línea 75/77): la sección queda
  FIJADA FUERA DE VISTA (bajo el pliegue) durante todo el recorrido y el
  scrub mueve la pista en invisible; el usuario atraviesa el pin en blanco
  ("espacio gigante sin contenido + scroll roto"). La 32 acotó el spacer y
  vigiló el refresh sin mover el enganche: por eso no se vio ningún cambio
  (causa raíz en `progress/research/gsap-horizontal-cards.md`, sección de
  persistencia tras la 32).
- Estado deseado: el pin engancha con la sección VISIBLE llenando el
  viewport (`start: 'top top'` con `min-height: 100vh` ya existente): el
  hero se va con scroll normal, la sección entra en vista con scroll normal,
  y el recorrido horizontal lado a lado se ve de principio a fin. Sin
  blancos antes, durante ni después del pin; scroll vertical normal fuera
  del pin. En móvil (≤768px) el gesto vertical conduce igual; sin JS o con
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

- Decisión 1 (enganche visible, solo el `start`): el trigger declara el
  inicio que garantiza la sección visible llenando el viewport al fijar
  (p. ej. `'top top'` con el `min-height: 100vh` existente); la premisa
  invertida de la 31 ('top bottom' = temprano pero invisible) queda
  corregida sin tocar el resto del mecanismo pin + scrub (REQ-33-01,
  REQ-33-02).
- Decisión 2 (recorrido visible sin blancos): la pista se traslada de lado
  a lado a la vista durante el pin; el hero conserva su desplazamiento
  normal y la página continúa normal al liberar, sin huecos en blanco
  antes, durante ni después (REQ-33-03, REQ-33-04, REQ-33-05, REQ-33-06,
  REQ-33-07).
- Decisión 3 (lo ganado se conserva): espaciado acotado y refresco vigilado
  de la 32, full-bleed lado a lado de la 30, centrado vertical de la 31,
  3 cards con pares `title-<id>` / `img-<id>`, convivencia live-search
  (`data-landing-sections`), registro en `astro:page-load` con limpieza de
  triggers, `prefers-reduced-motion` y degradado sin JS intactos
  (REQ-33-08, REQ-33-09, REQ-33-10, REQ-33-11).
- Decisión 4 (tests siguen a la presentación real): los tests de la 31
  (`pin-timing-center.test.mjs`, exige 'top bottom' y prohíbe 'top center')
  y de la 32 (`pin-spacer-scroll-fix.test.mjs` línea 128, exige
  'top bottom') actualizan sus aserciones al inicio visible con la
  justificación en el encabezado (precedente REQ-43-06) (REQ-33-12).
- Decisión 5: la hoja solo usa tokens de `tokens.css` (REQ-33-13).
- Restricción aplicable: ≤100 líneas por archivo (REQ-33-14;
  `latest-articles-scroll.ts` en 85/100 y `latest-articles.css` en 94/100:
  compactar antes de pedir `blocked`; el repositorio
  `posts-repository.ts` en 100/100 no se toca; estilos fuera del `.astro`;
  lógica en módulo `.ts`).
- Nota de verificación (no es feature): el dev server corre en
  http://localhost:4321 con HMR; el humano debe recargar duro
  (Ctrl+Shift+R) tras el fix para descartar caché.

## Alternativa descartada

- Alternativa considerada: mantener `'top bottom'` y compensar con
  `pinSpacing: false`, `end` más corto o altura de sección menor para
  reducir el blanco sin mover el enganche.
- Motivo del descarte: el problema no es cuánto spacer hay sino DÓNDE se
  fija la sección — fuera de vista; ningún recorte del recorrido vuelve
  visible un pin que engancha bajo el pliegue. Solo el inicio visible
  (`'top top'`) elimina la causa raíz.
