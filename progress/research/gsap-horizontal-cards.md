# Análisis — Animación horizontal gobernada por el scroll con GSAP ScrollTrigger (main page)

> Requerimiento bruto del humano: "se acaba de autorizar el uso de la libreria GSAP
> para la pagina principal y hacerla mas atractiva las cards de los articulos en la
> main page se limitara a mostrar solo las 3 mas recientes y se le pondra scroll en
> Horizontal con GSAP". Decisiones humanas asumidas como contrato: GSAP autorizada
> solo para `src/pages/index.astro` (materializar en `docs/dependencies.md` + instalar
> vía pnpm en la primera feature); la main page muestra SOLO los 3 artículos más
> recientes en orden descendente por fecha reutilizando el orden del dominio;
> animación horizontal con GSAP para esas cards.
>
> CORRECCIÓN DE RUMBO del humano (2026-09-21, verbatim): "No es un carrusel atento
> como tal, es animacion pero con el scroll ojo con eso es IMPORTANTE por que es muy
> diferente la experiencia del usuario". Interpretación obligatoria: la feature 29 NO
> es un carrusel con scroll-snap ni una animación de entrada. Es una animación
> horizontal GOBERNADA POR EL SCROLL: el scroll vertical del usuario conduce la
> traslación horizontal de la pista de las 3 cards recientes con GSAP ScrollTrigger
> (patrón pin + scrub). Experiencia scroll-driven, no carrusel navegable.

## Qué es y alcance

- Convertir la sección "Últimos artículos" de la portada (`LatestArticles`, renderizada
  en `src/pages/index.astro`) en una sección fijada cuya pista de las 3 cards más
  recientes se traslada horizontalmente gobernada por el scroll vertical (pin + scrub
  de ScrollTrigger), haciéndolas más atractivas.
- Fuera de alcance: resto de páginas (`/search`, `/posts/[id]`, `/<término>`), resaltado
  del término, toggle grid/lista, cambios en el dominio de búsqueda (features 2-7).

## Qué toca

- Capas y archivos:
  - `package.json` + `docs/dependencies.md`: alta de `gsap` (scope `dependencies`,
    ya cerrada en la feature 28 — `### gsap`, `^3.15.0`). ScrollTrigger vive DENTRO
    del paquete `gsap` (`gsap/ScrollTrigger`): sin dependencia nueva, sin cambio al
    registro.
  - `src/components/latest-articles.astro` (34/100 líneas): limitar a 3 posts (ya
    hecho en la 28 con `.slice(0, 3)`) y marcado de sección fijable + pista;
    frontmatter solo imports + paso de datos (regla 8).
  - `src/styles/latest-articles.css` (97/100 líneas — margen de 3 líneas): disposición
    de pista horizontal para el recorrido del scrub, solo tokens. Compactar reglas
    existentes antes de pedir `blocked`.
  - Módulo cliente `.ts` nuevo (p. ej. `src/components/latest-articles-scroll.ts` o
    en `src/domain/` según decida el implementer): importa `gsap` + `ScrollTrigger`,
    crea el tween horizontal con pin + scrub, respeta `prefers-reduced-motion`,
    registra en `astro:page-load` con limpieza de triggers previos.
  - `src/domain/repositories/posts-repository.ts` (100/100 líneas — SIN margen): NO se
    toca; el orden descendente `byCreatedDesc` se reutiliza tal cual.
- Rutas: solo `/` (`src/pages/index.astro`, 36/100 líneas). `index.astro` ya embebe el
  índice de búsqueda y monta `SearchLive`; la sección animada convive dentro de
  `data-landing-sections` (el live search la oculta/muestra — sin cambios a ese contrato).
- Contratos a conservar: pares de transición `title-<id>` / `img-<id>` (REQ-24-03/05,
  feature 36), init en `astro:page-load` (feature 10, ClientRouter), `aria-current` del
  navbar y `scrollbar-gutter` (features 13-15, 8, 14) intactos.

## Investigación mínima (GSAP ScrollTrigger + Astro)

- GSAP 3.x (`gsap`, core) es una librería de animación por JS con licencia gratuita;
  `ScrollTrigger` es un plugin del MISMO paquete (`gsap/ScrollTrigger`), sin dependencia
  extra: se importa desde el `gsap` ya instalado en la feature 28. No requiere framework
  ni build especial: Astro/Vite lo empaqueta desde npm.
- Patrón pin + scrub: al entrar la sección en vista se fija (`pin: true`) durante un
  recorrido de scroll vertical y el progreso de ese recorrido se mapea 1:1 a la
  traslación horizontal de la pista (`scrub: true`); al agotarse el recorrido la sección
  se libera y la página continúa. El usuario conduce la animación con su scroll: si no
  hace scroll, no hay movimiento.
- Re-init con ClientRouter: cada navegación re-ejecuta el listener `astro:page-load`
  (feature 10); el módulo debe matar los triggers previos (`ScrollTrigger.getAll()` +
  `kill()`) antes de recrearlos para no duplicar pins entre visitas.

## Decisiones

- D1 (npm, no CDN): GSAP se instala vía `pnpm add gsap` y se importa desde el módulo
  cliente (cerrado en la feature 28). Descartado el `<script src="cdn">`: no queda
  registrado en `package.json`, el validador `validate-dependencies.mjs` no lo audita,
  rompe el build offline y la política "sin dependencias externas sin registro".
- D2 (CORREGIDA 2026-09-21 — ScrollTrigger es el núcleo): la decisión anterior ("core
  sin ScrollTrigger, carrusel con snap") queda INVERTIDA por la corrección verbatim del
  humano. La base funcional es el pin + scrub de ScrollTrigger: el scroll vertical
  conduce la pista horizontal. El carrusel navegable con scroll-snap + animación de
  entrada pasa a ser la alternativa descartada (ver design.md de la 29). Sin JS la
  sección degrada a las 3 cards visibles en disposición estática: ScrollTrigger solo
  mejora, nunca es requisito para ver el contenido.
- D3 (excepción a estático por defecto): el JS de runtime queda justificado y
  documentado en la spec (precedentes features 4/5/24): animación scroll-driven no
  trivial + degradado declarado.
- D4 (movimiento reducido): con `prefers-reduced-motion: reduce` el módulo omite la
  animación ScrollTrigger y muestra el contenido estático visible (accesibilidad).
- D5 (degradado sin JS): sin JavaScript la portada muestra las 3 cards visibles sin
  animación; ScrollTrigger solo mejora, nunca es requisito para ver el contenido.
- D6 (límite a 3 en presentación, no en dominio): `PostsRepository.getPosts()` ya ordena
  descendente por fecha española (`byCreatedDesc`); la selección de los 3 primeros vive
  en la capa de presentación (componente + helper `.ts` si hace falta), sin tocar el
  repositorio (100/100) ni el esquema.
- D7 (sin design.md en la feature 28): la 28 es alta de dependencia + selección de
  datos (no cambia estilos ni layout); el `design.md` vive solo en la 29, que sí toca
  presentación.
- D8 (re-init en navegación): el script de la sección se registra en
  `astro:page-load` (precedente feature 10), no con init directo, por el ClientRouter;
  incluye limpieza de triggers previos para no acumular pins entre visitas.
- D9 (convivencia live-search): la sección animada vive dentro de `data-landing-sections`;
  con consulta activa el panel `SearchLive` la oculta (modo resultados intacto, contrato
  features 5/10 sin cambios); al vaciar la consulta se restaura y el trigger se refresca
  (`ScrollTrigger.refresh()`) en el re-init. La sección animada nunca rompe el modo
  resultados.
- D10 (mobile ≤768px): el gesto vertical sigue conduciendo la pista (touch); la pista
  conserva el responsive existente y ningún overlay bloquea el scroll vertical. Con
  movimiento reducido o viewport que no admita el recorrido, contenido estático visible.

## Riesgos y trabas

- R1 (presupuesto de líneas): `latest-articles.css` está en 97/100 y
  `posts-repository.ts` en 100/100. El implementer compacta reglas existentes antes de
  pedir `blocked`; el repositorio NO se toca en este ciclo. Si la pista no cabe en
  ≤100 líneas, la feature pasa a `blocked` con justificación (regla 12).
- R2 (live search): el panel `SearchLive` oculta `data-landing-sections` al buscar; el
  trigger debe refrescarse al restaurar (listener `astro:page-load` + `refresh()`; no se
  cambia el contrato de la feature 10). La sección animada no rompe el modo resultados.
- R3 (validador de dependencias): `check-format.mjs` falla si `package.json` declara
  `gsap` sin entrada `### gsap` aprobada; resuelto en la feature 28 (done): la 29 no
  añade dependencias porque ScrollTrigger es parte del paquete `gsap`.
- R4 (mobile ≤768px): el recorrido del pin debe medirse sin bloquear el scroll vertical
  táctil; sin overlay que capture el gesto. Con `prefers-reduced-motion`, estático.
- R5 (pins duplicados con ClientRouter): sin limpieza de triggers previos, cada visita
  a `/` acumularía un pin; el módulo mata los triggers existentes antes de recrearlos.

## Descomposición (complejidad media → 2 features)

- Feature 28 `gsap-setup-recent-limit` (base, depende de nada, DONE): entrada `### gsap`
  en `docs/dependencies.md` + `pnpm add gsap` + portada limitada a los 3 más recientes.
- Feature 29 `horizontal-scroll-gsap-cards` (UI, `depends_on: [28]`, PENDING
  re-especificada 2026-09-21): sección fijada con pista horizontal conducida por el
  scroll vertical vía gsap + ScrollTrigger (pin + scrub) + `prefers-reduced-motion` +
  degradado sin JS (3 cards visibles) + pares de transición + convivencia live-search +
  re-init `astro:page-load` con limpieza de triggers. NO es carrusel navegable ni
  animación de entrada.
