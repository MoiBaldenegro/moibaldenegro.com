# Diseño — Pin de longitud garantizada con re-medición vigilada y distancia observable (feature 34)

## Contexto visual

- Sección afectada: "Últimos artículos" de la portada (`/`), sección fijada
  full-bleed con pin + scrub de ScrollTrigger (features 29-33, done).
- Estado actual: tras la 33 (`start: 'top top'` + spacer acotado) el hueco
  gigante desapareció pero la pista NO se traslada al hacer scroll
  vertical (reporte verbatim: "ya se fue el espacio pero el scroll
  horizontal no funciona"). Causa raíz en
  `progress/research/gsap-horizontal-cards.md` (sección "Por qué el
  horizontal no se mueve..."): `distance()` vale 0 al construir el tween
  (medición única previa al layout asentado) y con `end: '+=0'` el pin
  queda de longitud cero — sin spacer y sin movimiento; sin
  `invalidateOnRefresh` el 0 queda congelado aunque el layout asiente
  después. Retorno temprano y nodo equivocado descartados con evidencia.
- Estado deseado: al avanzar el scroll vertical durante el pin, la pista
  se traslada horizontalmente el recorrido real medido contra el
  viewport, de lado a lado y a la vista; el pin siempre tiene longitud
  mayor que cero ligada a la distancia medida; la distancia queda
  expuesta como atributo en la sección + marca en consola para
  verificarla en DevTools. Sin spacer gigante; enganche visible `top
  top`; centrado vertical; 3 cards con pares; live-search,
  reduced-motion y degradado sin JS intactos. En móvil (≤768px) el gesto
  vertical conduce igual.

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

- Decisión 1 (nunca un pin de longitud cero, REQ-34-01, REQ-34-04): el
  módulo solo construye el trigger con distancia medida mayor que cero;
  si la medición inicial da 0, difiere la construcción y reintenta de
  forma vigilada (tras asentar el layout), sin bucles de refresh. Así
  `end: '+=0'` deja de ser un estado construible.
- Decisión 2 (re-medición vigilada tras asentar, REQ-34-02): al
  asentarse el layout tras la carga, el módulo re-mide la distancia y
  sincroniza el fin del pin con el valor medido; el refresco sigue
  acotado (sin `invalidateOnRefresh` incondicional ni `refresh()`
  encadenado, lección de la 32) y `x` queda sincronizado con el `end`
  medido en lugar de congelarse en el valor inicial.
- Decisión 3 (movimiento proporcional al recorrido medido, REQ-34-03):
  durante el pin, el progreso vertical conduce la traslación horizontal
  hasta el recorrido medido (lógica pura testeable + configuración que
  lo garantiza).
- Decisión 4 (distancia observable, REQ-34-11): la sección expone la
  distancia medida como atributo (`data-pin-distance`) y el módulo
  emite una marca en consola al construir y al re-medir; el humano
  verifica en DevTools sin instrumentación adicional (protocolo en el
  research).
- Decisión 5 (lo ganado se conserva, REQ-34-05, REQ-34-06, REQ-34-07,
  REQ-34-08, REQ-34-09, REQ-34-10): espaciado acotado + refresco
  vigilado de la 32, enganche visible `top top` de la 33, centrado
  vertical de la 31, full-bleed lado a lado de la 30, scroll-driven de
  la 29, 3 cards con pares `title-<id>` / `img-<id>`, convivencia
  live-search (`data-landing-sections`), registro en `astro:page-load`
  con limpieza de triggers, `prefers-reduced-motion` y degradado sin JS.
- Decisión 6 (tests siguen a la presentación real, REQ-34-12): los
  tests que fijan el cableado anterior (p. ej. el patrón exacto de
  `end` en `pin-visible-start.test.mjs`) actualizan sus aserciones al
  nuevo cableado con la justificación en el encabezado (precedente
  REQ-43-06).
- Decisión 7: la hoja solo usa tokens de `tokens.css` (REQ-34-13).
- Restricción aplicable: ≤100 líneas por archivo (REQ-34-14;
  `latest-articles-scroll.ts` en 85/100 y `latest-articles.css` en
  94/100: compactar antes de pedir `blocked`; el repositorio
  `posts-repository.ts` en 100/100 no se toca; estilos fuera del
  `.astro`; lógica en módulo `.ts`).
- Nota de verificación (no es feature): el dev server corre en
  http://localhost:4321 con HMR; el humano debe recargar duro
  (Ctrl+Shift+R) tras el fix para descartar caché.

## Alternativa descartada

- Alternativa considerada: devolver `invalidateOnRefresh: true` para
  que ScrollTrigger re-evalúe los valores funcionales en cada refresh.
- Motivo del descarte: fue la causa contributiva de la regresión de la
  31 (recálculos encadenados con imágenes lazy que desestabilizan el
  spacer y congelan el scroll); la 32 lo quitó a propósito. La
  re-medición debe ser vigilada (una vez tras asentar + reintento
  acotado ante el 0), no incondicional.
