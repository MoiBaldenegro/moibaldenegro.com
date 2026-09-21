# Diseño — Animación horizontal gobernada por el scroll con GSAP ScrollTrigger (feature 29)

## Contexto visual

- Sección afectada: "Últimos artículos" de la portada (`/`), componente
  `LatestArticles` — hoy una lista vertical con las 3 cards más recientes
  (feature 28), cada card con imagen 16:9, título, meta, descripción y tags.
- Estado actual: lista vertical estática de 3 cards con pares de transición
  `title-<id>` / `img-<id>`.
- Estado deseado: la sección se fija al entrar en vista y el scroll vertical del
  usuario conduce la traslación horizontal de la pista de las 3 cards (patrón
  pin + scrub de ScrollTrigger). NO es un carrusel navegable ni una animación
  de entrada: la experiencia es scroll-driven — sin scroll no hay movimiento.
  En móvil el gesto vertical conduce igual; sin JS o con movimiento reducido,
  las 3 cards quedan visibles en disposición estática.

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
| `--container-max` | 1500px | Ancho de la sección |

## Decisiones y constraints

- Decisión 1 (corrección del humano 2026-09-21): ScrollTrigger es el núcleo de
  la feature. Vive dentro del paquete `gsap` ya dado de alta en la feature 28
  (`docs/dependencies.md` `### gsap`, scope `dependencies`): sin dependencia
  nueva y sin cambio al registro.
- Decisión 2 (pin + scrub): al entrar la sección en vista se fija (pin) durante
  un recorrido de scroll vertical y el progreso de ese recorrido se mapea a la
  traslación horizontal de la pista (scrub); al agotarse el recorrido la sección
  se libera y la página continúa (REQ-29-01, REQ-29-04).
- Decisión 3 (convivencia live-search): la sección animada vive dentro de
  `data-landing-sections`; con consulta activa el panel de resultados la oculta
  (contrato features 5/10 intacto) y al vaciar se restaura con
  `ScrollTrigger.refresh()`; la sección animada nunca rompe el modo resultados
  (REQ-29-08).
- Decisión 4 (ClientRouter): el módulo cliente `.ts` registra la creación y el
  refresco de la animación como listener de `astro:page-load` (feature 10), con
  limpieza de triggers previos para no duplicar pins entre visitas (REQ-29-03).
- Decisión 5 (movimiento reducido y sin JS): con `prefers-reduced-motion` se
  omite la animación y el contenido queda estático y visible; sin JavaScript las
  3 cards se muestran sin animación (REQ-29-05, REQ-29-06).
- Decisión 6: se conservan los pares de transición `title-<id>` / `img-<id>`
  (REQ-29-07, feature 36) y los estilos solo usan tokens (REQ-29-09).
- Restricción aplicable: ≤100 líneas por archivo (REQ-29-10;
  `latest-articles.css` está en 97/100: compactar reglas existentes antes de
  pedir `blocked`; el repositorio `posts-repository.ts` en 100/100 no se toca;
  estilos fuera del `.astro`; lógica en módulo `.ts`).

## Alternativa descartada

- Alternativa considerada: carrusel navegable con scroll nativo + `scroll-snap`
  y animación de entrada con GSAP core (sin ScrollTrigger).
- Motivo del descarte: corrección explícita del humano — "no es un carrusel
  atento como tal, es animación pero con el scroll"; la experiencia
  scroll-driven (pin + scrub) es muy diferente a un carrusel navegable o a una
  animación de entrada.
