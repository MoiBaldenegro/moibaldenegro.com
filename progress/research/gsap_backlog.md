# Análisis de backlog — GSAP + scroll horizontal fijado de «Últimos artículos» (spec_author)

Fecha: 2026-10-09 · Rol: spec_author · Features creadas: 70, 71, 72 (pending).
Base técnica: `progress/research/gsap_horizontal_scroll.md` (explorer, leído entero).

## 1. Problema (reformulado)

El humano autoriza GSAP para que, **solo en escritorio**, las 3 cards de los 3 posts más
recientes de la portada se recorran en horizontal: al llegar a la sección la card 1 está centrada
como hoy, las cards 2 y 3 esperan fuera de la vista a la derecha; la sección se fija (pin) y el
scroll vertical (scrub, ~100vh por card que pasa) las desplaza a la izquierda; la última queda
centrada, se libera el pin y la página sigue. En móvil/tablet, con `prefers-reduced-motion: reduce`
o sin JS, el layout actual (apiladas). «Probemos y si funciona bien lo dejamos.»

Alcance: portada (`src/pages/index.astro`, sección `.latest-articles`). Fuera: posts, búsqueda,
about, 404, hero, HTB.

## 2. Qué toca

| Capa | Archivo | Feature |
|------|---------|---------|
| Dependencias | `package.json`, `pnpm-lock.yaml`, `docs/dependencies.md` | 70 |
| Dominio puro | `src/domain/latest-horizontal.ts` (nuevo, sin gsap) | 71 |
| UI/cliente | `src/components/latest-horizontal/latest-horizontal.{astro,ts}` (nuevos) | 72 |
| Estilos | `src/styles/latest-horizontal.css` (nuevo) | 72 |
| Página | `src/pages/index.astro` (monta el componente; 26 líneas) | 72 |
| Tests | `tests/gsap-dependency-approval.test.mjs`, `tests/latest-horizontal-geometry.test.mjs`, `tests/latest-articles-horizontal-scroll.test.mjs` | 70-72 |

**No se tocan** `latest-articles.astro` (REQ-30-15 prohíbe `<script>` en él; test en
`tests/home-latest-articles-limit.test.mjs:307`) ni `latest-articles.css` (98 líneas con conteo
fijado en `tests/home-latest-articles-limit.test.mjs` y REQ-30-08 «sin cambios»). Por eso el efecto
vive en un componente hermano que localiza la sección por clase; los estilos van a una hoja nueva.

## 3. Descomposición (complejidad compleja → 3 features)

1. **70 `gsap-dependency-approval`** (sin UI): alta de gsap con versión exacta (3.15.0 según el
   informe; el implementer confirma con `npm view gsap version`), lockfile, entrada `### gsap` con
   `approved: 2026-10-09`, líneas extra `licencia` (Standard 'no charge' de Webflow, **NO OSI**) y
   `alcance` (solo portada, gsap + ScrollTrigger), nota en «Aprobaciones de cambio de versión».
   El parser de `validate-dependencies.mjs` acepta claves extra en minúsculas (`/^-\s*([a-z]+)\s*:/`).
   Ningún archivo de src/ importa gsap todavía: el build no cambia.
2. **71 `latest-horizontal-geometry`** (sin UI): funciones puras `trackTravel`, `pinScrollLength`,
   `trackOffset`, `cardCenterX`, `focusScrollTarget` con guardas (n<2, no finitos, ≤0). Testeable con
   node:test por type stripping (precedente `code-copy-button.test.mjs`). Independiente de la 70.
3. **72 `latest-articles-horizontal-scroll`** (UI, design.md): el efecto. Depende de 70 y 71.

Orden: 70 → 71 → 72 (la base primero). 71 no depende de 70 (no importa gsap).

## 4. Decisiones tomadas (revisables por el humano)

- **Corte de escritorio `min-width: 1201px`**: el sitio usa 768 y 1200 como cortes; ≤1200 es el
  diseño de tablet del hero (features 51, 69). El líder propuso «p. ej. 1025»; 1201 encaja con los
  breakpoints existentes y excluye tablets táctiles (barra de direcciones, `ignoreMobileResize`).
  Las verificaciones pedidas (1280, 1440) quedan dentro.
- **Versión exacta sin `^`** en package.json, por la petición de «versión exacta».
- **Presupuesto de peso**: 51200 B gzip (medido 45 073 B de GSAP + ScrollTrigger en el informe §1).
- **Aviso de copyright**: la licencia prohíbe quitarlo → REQ-72-24 exige que el chunk lo conserve
  (sirve además como marcador para el test «GSAP solo en la portada»).

## 5. Hallazgos y riesgos

- **H1 (para el humano): la card no cabe en el viewport.** A 1280 px la imagen de la card mide
  1149×646 (impl_65.md) y, sumando título, meta, descripción, tags y padding, la card supera ~900 px
  frente a 800 px de viewport (900 a 1440 px con card de 1368 px de ancho). Fijada «tal cual», nunca
  se leería entera. La spec (REQ-72-08) conserva el aspecto (marcado, colores, tipografía, 16:9) y
  **solo reduce el ancho** en modo horizontal hasta que card + encabezado quepan. Si el humano
  prefiere otra solución (p. ej. ocultar la descripción en modo horizontal), se enmienda la 72.
- **H2: restauración de scroll con ClientRouter** (informe §4): Astro restaura `scrollY` antes de
  `astro:page-load`; el pin-spacer aún no existe. Mitigación hipotética + verificación CDP (REQ-72-20).
- **H3: búsqueda en vivo** oculta `.home__landing`; al reaparecer hay que refrescar ScrollTrigger
  (REQ-72-21).
- **H4: header sticky** solo durante el primer viewport (impl_61); `start` se decide midiendo.
- **H5: licencia no OSI**: queda registrada explícitamente en `docs/dependencies.md` (REQ-70-04).
- **H6: CSP**: sin `eval`/`new Function` en GSAP 3.15; `style.cssText` depende de
  `style-src 'unsafe-inline'` vigente. El test REQ-64-05/06 debe seguir verde sin cambios.
- **H7: `transition:name`** en imagen y título de la card transformada: verificar clic en la card 3
  con el pin activo (REQ-72-28).
- **H8: «Estático por defecto»** (architecture.md regla 9): el JS de runtime queda justificado por
  la autorización humana y limitado a la portada (REQ-72-22).

## 6. Tests existentes posiblemente afectados

- `tests/dependencies-registry.test.mjs` («las 4 aprobadas»): comprueba inclusión, sigue verde con 5.
- `tests/astro-security-upgrade.test.mjs`, `tests/workers-types-upgrade.test.mjs`: leen bloques por
  nombre; la nota nueva de gsap no debe contener la cadena «subir @cloudflare/workers-types» ni
  romper el corte por `###`.
- `tests/csp-enforce.test.mjs` REQ-64-05/06: recorre los bundles; debe seguir verde.
- Ninguno fija el contenido de `index.astro`; si alguno se ve afectado, nota con precedente REQ-43-06.

## 7. Specs

- `specs/70_gsap-dependency-approval/requirements.md`
- `specs/71_latest-horizontal-geometry/requirements.md`
- `specs/72_latest-articles-horizontal-scroll/requirements.md` y `design.md`
