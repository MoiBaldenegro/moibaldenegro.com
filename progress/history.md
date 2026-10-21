# Bitácora de sesiones

> Append-only. Al cerrar una sesión, mueve el resumen de `progress/current.md`
> al final de este archivo y deja `current.md` solo con la plantilla.

## Sesiones

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
