# Bitácora de sesiones

> Append-only. Al cerrar una sesión, mueve el resumen de `progress/current.md`
> al final de este archivo y deja `current.md` solo con la plantilla.

## Sesiones

- 2026-10-23 — Solicitud puntual: imágenes HTML centradas y responsive para posts; tests 20/20 y build correctos.

- 2026-10-21 — feature 1 `hero-grid-explicit-rows` + feature 2 `hero-row-new-tools`: fila nueva del hero con bash, webassembly, astro (grande), opencode y tauri.

## Sesión 2026-10-21 — Fila nueva de cards del hero (bash, webassembly, astro, opencode, tauri)

**Petición humana**: «En las cards del hero pon una nueva fila con los los sprites de bash, web
assembly, astro, opencode, y tauri, la card grande sera la de astro.»

**Arranque**: `feature_list.json` y `progress/` estaban ausentes (el commit `7697d5c cleaning` borró
el historial del arnés y todo `tests/`). Se regeneró el backlog limpio desde cero con el esqueleto
`{ project, description, rules, features }` (ids del ciclo arrancan en 1) y se restauraron las
plantillas de spec (`specs/_template/`). `specs/` del histórico no se recupera: el historial vive en
este archivo y en los artefactos permanentes.

### Feature 1 — `hero-grid-explicit-rows` (done, APPROVED)

Base de dominio y datos: las franjas del mosaico **se declaran en los datos** con el campo opcional
`row` (entero ≥ 1) de la tarjeta de icono. El reparto anterior (dos colas globales: `featured` → huecos
grandes, resto → pequeños, redes las últimas) **no podía expresar** la fila pedida: al añadir las 5
tarjetas al JSON, `bash` y `webassembly` caían en la franja anterior y la última mezclaba la fila
nueva con `youtube` y `github` (simulado en `progress/research/hero-fila-nueva-tools.md`).

- `src/domain/entities/hero-card.ts`: `HeroCard.row?: number`.
- `src/domain/repositories/hero-cards-fields-parse.ts` + `hero-cards-parse.ts`: lector `readRow()` con
  `HeroCardsDataError` (nombra `hero-cards.json` y el índice).
- `src/domain/hero-grid-layout.ts` (95 → 79 líneas) reparte en módulos hermanos:
  `hero-grid-rows.ts` (agrupación y validaciones de franja), `hero-grid-template.ts` (patrón por
  paridad de fila + `assignToSlots`) y `hero-grid-error.ts` (`HeroGridLayoutError` en módulo propio,
  re-exportado para no romper importadores). El placement físico (`place()`) quedó **intacto**.
- `src/data/hero-cards.json`: migración con `row` en las 10 tarjetas de las franjas inferiores **sin
  mover ninguna** (el mosaico visible no cambió; verificado con build comparativo byte a byte).
- Validaciones: zona superior incompleta o con ≠ 1 `featured`, franja con ≠ 5 tarjetas, franja con
  ≠ 1 `featured`, `social` fuera de la última franja y `social` con `featured` → `HeroGridLayoutError`.
- Artefactos: `specs/01_hero-grid-explicit-rows/{requirements,design}.md`, `progress/research/hero-fila-nueva-tools.md`,
  `progress/impl_hero-grid-explicit-rows.md`, `progress/review_hero-grid-explicit-rows.md` (APPROVED).

### Feature 2 — `hero-row-new-tools` (done, APPROVED)

La fila pedida, en datos + estilos (el dominio ya lo resolvió la feature 1).

- `src/data/hero-cards.json`: 5 tarjetas nuevas `bash`, `webassembly`, `astro`, `opencode`, `tauri`
  con `"row": 2`, `"featured"` solo en `astro`, `"showOnMobile": false` y su symbol del sprite; la
  franja de las redes sociales (`bun`, `claude`, `typescript`, `youtube`, `github`) pasa a `row: 3`
  para que sigan en la esquina inferior derecha.
- Resultado: franja 2 = `[bash, webassembly, ASTRO (4 col.), opencode, tauri]` (12 columnas, el
  grande en 3.ª posición, como en la petición); franja 3 = `[typescript (4 col.), bun, claude,
  youtube, github]` (el patrón alterno mueve `typescript` al 1.º hueco de su franja).
- `src/styles/tokens.css` (99 → 97 líneas): 5 tokens `--color-marca-bash|webassembly|astro|opencode|tauri`
  con el bloque de marcas compactado a dos por línea (sin crear un segundo archivo de tokens).
- `src/styles/hero-card-brands.css` (nueva, 24 líneas): las 5 reglas `[data-color-token]` (fondo de
  marca + geometría del icono) y el bloque `@media (max-width: 1200px)` con la escala reducida;
  importada por `src/components/hero-card.astro`.
- `public/assets/svg/sprite.svg` **sin tocar** (los 5 symbols ya existían).
- Regresión visual con Chrome headless (CDP) a 375/768/1024/1280 px: capturas en
  `progress/research/hero-row-new-tools/`. A 1280 px la franja sale completa (12 columnas, `solapes: []`,
  0 errores de consola); a ≤768 px la fila queda oculta por diseño (`showOnMobile: false`).
- Artefactos: `specs/02_hero-row-new-tools/{requirements,design}.md`, `progress/impl_hero-row-new-tools.md`,
  `progress/review_hero-row-new-tools.md` (APPROVED).

### Verificación de la sesión

`./init.sh` en verde (entorno, formato, suite 18/18, build). `scripts/audit-design-tokens.mjs` en
verde. Ningún archivo del proyecto por encima de 100 líneas. Ciclo rojo/verde documentado con la
salida real en ambos informes.

### Pendientes anotados (no bloquean)

- **H2 (review de la 2)**: `REQ-02-13` y el `acceptance` A8 hablan de «mostrar la fila nueva completa
  a 375 px y 768 px», lo que choca con `REQ-02-04` (`showOnMobile: false`) y con la regla del sitio
  `REQ-106-09`. La implementación resolvió el choque a favor del REQ (fila oculta en móvil).
  Conviene reescribir REQ-02-13 y A8 en un ciclo posterior.
- **H3 (review de la 2)**: el glifo de `astro` queda algo descentrado hacia la derecha dentro de su
  hueco grande (legible y coherente con el estilo del sitio, que hace sangrar los iconos por la
  derecha). Ajuste opcional en `src/styles/hero-card-brands.css` (`--icon-width` / `--icon-rotation`).
- **H5 (reviews de la 1 y la 2)**: `tests/harness-kit-integrity.test.mjs` ya no existe (lo borró el
  commit `cleaning`); `docs/verification.md:71` lo cita como el candado que rechaza vaciar `features`
  sin justificación. Conviene restaurarlo.
- **H6 (reviews)**: `CHECKPOINTS.md` y este `progress/history.md` estaban desactualizados; se
  refrescaron al cerrar la sesión.

## Sesión 2026-11-02 — Intercambio de posiciones en el hero (css/tauri, html/opencode, node/nestjs)

### Feature 3 — `hero-cards-swap-positions` (done, APPROVED)

- spec_author da de alta la feature 3. Spec: `specs/03_hero-cards-swap-positions/` (REQ-03-01..13).
- Test-first: actualizados `tests/hero-grid-explicit-rows.test.mjs` y `tests/hero-row-new-tools.test.mjs`
  y nuevo `tests/hero-cards-swap-positions.test.mjs`; rojo observado (8 fallos de 19).
- `src/data/hero-cards.json`: 3 intercambios (nestjs a la zona superior sin row, node/tauri/opencode a
  row 1, css/html a row 2); resto de propiedades conservadas. Sin cambios en motor, componentes ni CSS.
- Suite verde (25/25) y `./init.sh` en verde. Regresión visual (REQ-03-13) verificada por el reviewer.
- Artefactos: `progress/impl_3.md`, `progress/review_3.md` (APPROVED), `progress/research/hero-cards-swap-positions*`.
- Pendiente anotado (no bloquea): 404 de `/assets/content/api-auth.webp` en
  `src/content/posts/systems-design/07-auth-api-design.md` (commit previo `e8926ca`); conviene una tarea aparte.

## Sesión 2026-11-02 — Franja MXVI y sección promocional 2x2 (feature 4)

### Franja decorativa MXVI entre hero y artículos (sin feature en backlog)

- Se integraron `mxvi-m` (717x716), `mxvi-x` (805x716), `mxvi-v` (795x716) y `mxvi-i` (190x716); la I
  conserva sus dos colores y paths originales.
- `mxvi-logos-banner.astro` entre `NewHero` y `LatestArticles`: M-X-V-I con sus viewBox originales,
  filtro blanco atenuado y distribución 4 columnas / 2x2 en móvil (commit `5f12fbe`).

### Feature 4 — `promo-tiles-section` (done, APPROVED)

- spec_author da de alta la feature 4. Spec: `specs/04_promo-tiles-section/requirements.md`
  (REQ-04-01..21) y `design.md`; análisis en `progress/research/promo-tiles-section.md`.
- Test-first: `tests/promo-tiles-section.test.mjs` y `tests/promo-tiles-section-ui.test.mjs` (10 tests)
  escritos y vistos en rojo (0/5 pass antes del código).
- Implementado: `src/data/promo-tiles.json`, entidad `PromoTile`, `PromoTilesRepository` (parseo
  hermano, `PromoTilesDataError`, loader inyectable), helper `linkAttrs`, componente
  `src/components/promo-tiles/promo-tiles.astro`, `src/styles/promo-tiles.css` y 8 tokens nuevos
  (tokens.css compactado, <=100 líneas). Integrado tras `<LatestHorizontal />` en `home.astro`.
- `./init.sh` en verde (41/41 + build); regresión visual a 375/768/1280 px OK.
- Artefactos: `progress/impl_promo-tiles-section.md`, `progress/review_promo-tiles-section.md` (APPROVED).

## Sesión 2026-11-02 — Logos MXVI clicables: datos y repositorio (feature 5)

### Feature 5 — `mxvi-logos-links-data` (done, APPROVED)

- spec_author da de alta las features 5 y 6 (cinta azul MXVI). Spec: `specs/05_mxvi-logos-links-data/requirements.md`
  (REQ-05-01..14); análisis en `progress/research/mxvi-logos-band.md`.
- Test-first: `tests/mxvi-logos-data.test.mjs` escrito y visto en rojo (`ERR_MODULE_NOT_FOUND` del repositorio).
- Implementado: `src/data/mxvi-logos.json` (id, letter, viewBox, href, label), entidad `MxviLogo`,
  `mxvi-logos-parse.ts` con `MxviLogosDataError` y `MxviLogosRepository` con loader inyectable. Sin UI.
- 10/10 tests de la feature y `./init.sh` en verde.
- Artefactos: `progress/impl_mxvi-logos-links-data.md`, `progress/review_mxvi-logos-links-data.md` (APPROVED).

## Sesión 2026-11-02 — Cinta azul MXVI con logos clicables (feature 6)

### Feature 6 — `mxvi-logos-band` (done, APPROVED)

- Spec: `specs/06_mxvi-logos-band/` (REQ-06-01..20); análisis en `progress/research/mxvi-logos-band.md`.
- Test-first: `tests/mxvi-logos-banner.test.mjs` reescrito (8 tests) y visto en rojo (7 fail / 1 pass;
  REQ-06-14/15 ya se cumplía y queda como guarda de regresión).
- Implementado: `mxvi-logos-banner.astro` lee los logos desde `MxviLogosRepository`, cada svg dentro de un
  `<a>` con href/aria-label/target/rel; `mxvi-logos-banner.css` con cinta full-bleed (degradado lineal +
  resplandor radial), hover/focus-visible, reduced-motion y 2 columnas en móvil; 6 tokens nuevos en
  `tokens.css`, retirado `--opacity-logo-muted` (<=100 líneas).
- 8/8 tests de la feature, `pnpm test` 57/57, audit de tokens y `./init.sh` en verde. Regresión visual
  (REQ-06-20) verificada por el reviewer.
- Artefactos: `progress/impl_mxvi-logos-band.md`, `progress/review_mxvi-logos-band.md` (APPROVED),
  `progress/research/mxvi-logos-band-review/`.

## Sesión 2026-11-02 — La cinta MXVI usa la paleta morada del sitio (feature 7)

### Feature 7 — `mxvi-band-site-palette` (done, APPROVED)

- Corrección humana sobre la feature 6: la cinta copiaba el azul de Apple; se conserva el concepto con la paleta del sitio.
  Spec: `specs/07_mxvi-band-site-palette/` (REQ-07-01..15, requirements.md + design.md); análisis en
  `progress/research/mxvi-band-site-palette.md`.
- Test-first: `tests/mxvi-band-site-palette.test.mjs` escrito y visto en rojo (5/9 fallan). En
  `tests/mxvi-logos-banner.test.mjs` solo se retiraron las aserciones de tokens azules.
- Implementado: `src/styles/mxvi-logos-banner.css` con degradado hero-mid/hero-top/hero-mid, resplandor radial
  `--color-glow`, `border-block` con `--color-border` y halo `--color-accent` en hover/focus-visible (filter en la
  transición); eliminados los tokens `--color-mxvi-band-*` de `src/styles/tokens.css` (se conservan space/opacity).
- `./init.sh` en verde (66/66 tests, build OK). Revisión visual verificada por el reviewer.
- Artefactos: `progress/impl_mxvi-band-site-palette.md`, `progress/review_mxvi-band-site-palette.md` (APPROVED),
  `progress/research/mxvi-band-site-palette-review/`.

## Sesión 2026-11-02 — La cinta MXVI pasa debajo de los bloques de artículos (feature 8)

### Feature 8 — `mxvi-band-below-articles` (done, APPROVED)

- Petición humana: "pasa la cinta mejor abajo de los artículos". Spec: `specs/08_mxvi-band-below-articles/`
  (REQ-08-01..11, requirements.md + design.md); análisis en `progress/research/mxvi-band-below-articles.md`.
- Test-first: `tests/mxvi-band-below-articles.test.mjs` (orden, adyacencias, conteo, imports, líneas) visto en rojo
  (2 fallos de orden); aserción REQ-04-08 de `tests/promo-tiles-section-ui.test.mjs` ajustada a
  `<MxviLogosBanner/>` -> `<PromoTiles />` (REQ-08-09), vista en rojo.
- Implementado: `src/pages/home.astro` reordenado (NewHero, LatestArticles, LatestHorizontal, MxviLogosBanner,
  PromoTiles); componente, estilos y datos sin cambios.
- `./init.sh` en verde (71/71 tests, build OK). Revisión visual REQ-08-10 verificada por el reviewer.
- Artefactos: `progress/impl_mxvi-band-below-articles.md`, `progress/review_mxvi-band-below-articles.md` (APPROVED).

## Sesión 2026-11-02 — Todas las esquinas de la web pasan a rectas (feature 9)

### Feature 9 — `square-corners-sitewide` (done, APPROVED)

- Petición humana: cambiar todos los border-radius de la web a rectos para unificar el estilo. Spec:
  `specs/09_square-corners-sitewide/` (REQ-09-01..17, requirements.md + design.md); análisis en
  `progress/research/square-corners-sitewide.md`.
- Test-first: `tests/square-corners-sitewide.test.mjs` (8 tests, REQ-09-01..13 y 17) visto en rojo (6 fallos);
  `tests/article-images.test.mjs` y `tests/promo-tiles-section-ui.test.mjs` ajustados a `var(--radius-square)` (REQ-09-14).
- Implementado: `src/styles/tokens.css` sustituye `--radius-card`/`--radius-pill`/`--radius-thumb` por un único
  `--radius-square: 0`; las 61 declaraciones `*-radius` de 25 hojas de `src/styles` pasan a `var(--radius-square)`
  (50%, 0 literal, asimétricos y scrollbar incluidos); comentarios con tokens antiguos limpiados. `rx="1.5"` de
  `code-copy.ts` conservado (fuera de alcance).
- `./init.sh` en verde (79/79 tests, build OK). Revisión visual REQ-09-15/16 verificada.
- Artefactos: `progress/impl_square-corners-sitewide.md`, `progress/review_square-corners-sitewide.md` (APPROVED),
  `progress/research/square-corners-sitewide.md`.

## Sesión 2026-11-11 — El sitio incorpora las hojas de componentes del design system MXVI (feature 10)

### Feature 10 — `mxvi-foundation` (done, APPROVED)

- Petición humana: refactorizar moibaldenegro.com para usar mxvi.css (copia sincronizada, por fases, push a main).
  Spec: `specs/10_mxvi-foundation/` (REQ-10-01..11, requirements.md + design.md).
- Test-first: `tests/mxvi-foundation.test.mjs` (8 tests) visto en rojo (8 fallos).
- Implementado: `scripts/sync-mxvi.mjs` (stdlib) y copia en `src/styles/mxvi/` (components.css, 33 hojas,
  manifest.json con sha256, origen mxvi-design-system@5fd0c29); `Layout.astro` la importa. Sin cambio visual.
- `./init.sh` en verde (87/87 tests, build OK). Regresión visual: 0.000 % en 15 capturas.
- Artefactos: `progress/impl_mxvi-foundation.md`, `progress/review_mxvi-foundation.md` (APPROVED).

## Sesión 2026-11-11 — El chrome del sitio usa los componentes del design system MXVI (feature 11)

### Feature 11 — `mxvi-chrome` (done, APPROVED)

- Segunda fase del refactor a mxvi.css. Spec: `specs/11_mxvi-chrome/` (REQ-11-01..12).
- Test-first: `tests/mxvi-chrome.test.mjs` (9 tests) visto en rojo; contratos de features 9, 10 y
  promo-tiles ajustados.
- Implementado: la copia sincronizada incluye `base.css` (mxvi-design-system@a848482); header, menú
  móvil, búsqueda y footer con clases `.mx-*`; `.mx-visually-hidden`; cinco hojas antiguas eliminadas.
  Correcciones subidas al design system (menú móvil y botón del CV).
- `./init.sh` en verde. Regresión visual: peor diferencia 0.044 % (bordes del logo, proporción real).
- Artefactos: `progress/impl_mxvi-chrome.md`, `progress/review_mxvi-chrome.md` (APPROVED).

## Sesión 2026-11-11 — La home usa los componentes del design system MXVI (feature 12)

### Feature 12 — `mxvi-home` (done, APPROVED)

- Tercera fase del refactor a mxvi.css. Spec: `specs/12_mxvi-home/` (REQ-12-01..16).
- Test-first: `tests/mxvi-home.test.mjs` (9 tests) visto en rojo; contratos de features 2, 4, 6, 7 y 9
  apuntados a las hojas del design system.
- Implementado: hero Bento, perfil, tarjetas de marca, HTB, artículos, banda y promo con clases
  `.mx-*` (mxvi-design-system@b646f3b); once hojas eliminadas; GSAP del sitio con selectores mx-*.
- `./init.sh` en verde (105/105). Regresión visual: 0 % en 24 capturas; modo horizontal igual.
- Artefactos: `progress/impl_mxvi-home.md`, `progress/review_mxvi-home.md` (APPROVED).

## Sesión 2026-11-11 — La página about usa los componentes del design system MXVI (feature 13)

### Feature 13 — `mxvi-about` (done, APPROVED)

- Cuarta fase del refactor a mxvi.css. Spec: `specs/13_mxvi-about/` (REQ-13-01..13).
- Test-first: `tests/mxvi-about.test.mjs` (7 tests) visto en rojo; contrato de radios ajustado.
- Implementado: encabezado de perfil, cifras, experiencia, stack, proyectos, contenido, formación y
  filosofía con clases `.mx-*` (mxvi-design-system@aaf91f4); seis hojas eliminadas.
- `./init.sh` en verde (112/112). Regresión visual dentro del ruido de render.
- Petición humana recibida durante la feature: renombrar About a `whoami` (feature 14).
- Artefactos: `progress/impl_mxvi-about.md`, `progress/review_mxvi-about.md` (APPROVED).

## Sesión 2026-11-11 — La página About pasa a llamarse whoami (feature 14)

### Feature 14 — `whoami-page` (done, APPROVED)

- Petición humana: renombrar About a `whoami`, como el comando. Spec: `specs/14_whoami-page/` (REQ-14-01..12).
- Test-first: `tests/whoami-page.test.mjs` (6 tests) visto en rojo.
- Implementado: página en /whoami, enlaces del header y footer, 301 de /about y de la raíz,
  sitemap, JSON-LD y tarjetas promocionales.
- `./init.sh` en verde (118/118); redirecciones comprobadas en `astro preview`.
- Artefactos: `progress/impl_whoami-page.md`, `progress/review_whoami-page.md` (APPROVED).

## Sesión 2026-11-11 — Artículo, búsqueda y 404 usan los componentes del design system MXVI (feature 15)

### Feature 15 — `mxvi-article-search` (done, APPROVED)

- Quinta y última fase del refactor a mxvi.css. Spec: `specs/15_mxvi-article-search/` (REQ-15-01..13).
- Test-first: `tests/mxvi-article-search.test.mjs` (7 tests) visto en rojo; contratos ajustados.
- Implementado: cabecera, prosa, copiar código, siguiente y recomendados; búsqueda, resultados en
  vivo y 404 con clases `.mx-*` (mxvi-design-system@b8edcc7); siete hojas eliminadas, incluida
  typography.css.
- `./init.sh` en verde (125/125). Regresión visual: 0 % en 24 capturas y en los estados interactivos.
- El sitio queda con tokens.css, la copia mxvi/ y seis hojas propias de comportamiento o de página.
- Artefactos: `progress/impl_mxvi-article-search.md`, `progress/review_mxvi-article-search.md` (APPROVED).

## Sesión 2026-11-11 — Mantenimiento: resincronización con el design system MXVI

- El design system sumó piezas para apps (formularios, alertas, tabla, datos, segmentado; commits
  9ca3fc3 y 6280342, a raíz de WoW Armory). Copia resincronizada en `src/styles/mxvi/` (40 hojas).
- `tokens.css` define `--color-danger` y `--color-success` (paleta semántica de MXVI), que leen las
  hojas nuevas: REQ-10-08 lo detectó al sincronizar.
- `./init.sh` en verde. Regresión visual: 0 % en las 24 capturas (about 0.002 %, ruido conocido).
