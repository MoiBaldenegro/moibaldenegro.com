# Diseño — game-of-life-removal

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? El layout único y el
  fondo del hero de la portada. El canvas del Juego de la Vida se renderiza
  hoy comentado en `Layout.astro` (`<!-- <GameOfLifeBackground /> -->`, el
  import sigue presente) y `--opacity-hero`/`--opacity-gol`/`--size-gol-cell`
  viven en `tokens.css`.
- ¿Estado actual y estado deseado? Actual: código GOL completo presente pero
  inactivo (componente comentado; `opacity: var(--opacity-hero)` comentado en
  hero-section.css → el hero ya renderiza a opacidad plena). Deseado: cero
  rastro del fondo GOL en `src/`, `tests/` y docs del kit; el hero conserva
  exactamente el aspecto visible actual (gradiente a opacidad plena, grano
  integrado en `.hero-background`, glow animado).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--opacity-gol` | 0.15 | SE ELIMINA — opacidad del canvas GOL (feature 15) |
| `--size-gol-cell` | 6px | SE ELIMINA — tamaño de celda del canvas GOL (feature 15) |
| `--opacity-hero` | 0.80 | SE ELIMINA — su único propósito era el hero translúcido sobre el canvas GOL; hoy inactivo (comentado) |
| (resto de tokens) | intactos | el hero y el layout conservan sus tokens actuales |

Ningún token nuevo se añade. `tokens.css` pasa de 96 a ~89 líneas.

## Decisiones y constraints

- Decisión 1 (eliminación total): el usuario DESCARTÓ el fondo GOL del
  proyecto (2026-08-12); no es "desactivado" sino ELIMINADO. Se borran los 4
  archivos de código, la hoja, los tokens, los 3 tests (features 14-16) y el
  import/comentario de `Layout.astro`. Dejar el import comentado "por si
  acaso" sería deuda muerta y contradiría la decisión.
- Decisión 2 (`--opacity-hero`): verificado en disco que su única función era
  la translucidez del hero sobre el canvas GOL (Decisión 6, feature 15) y que
  hoy está comentado en `hero-section.css` (líneas 28-29). Se elimina; sin
  GOL el hero queda a opacidad plena, que ES el aspecto actual visible y
  aprobado → el look no cambia.
- Decisión 3 (hero-section.css): solo se limpian los comentarios muertos
  (menciones a GOL/Decisión 6/REQ-16-05/06 y el bloque comentado de
  opacity/will-change). La regla `.hero-background` permanece intacta:
  `tests/hero-section-styles.test.mjs` exige el selector (REQ-03-02).
- Decisión 4 (docs): `docs/architecture.md` (líneas 15 y 56) menciona
  `GameOfLifeBackground` como ejemplo de componente; se alinea con la
  realidad (precedente feature 23). El kit prohíbe el token 'hero'
  (REQ-01-05) → los reemplazos no pueden contener "hero" (descartados
  "NewHero"/"HeroCard"); se usan `LatestArticles` y `HtbStadistics`.
- Decisión 5 (historial): las features 14-16 permanecen `done` en el backlog
  y sus specs/artefactos (specs/14-16, progress/impl_*, review_*, research/)
  son bitácora permanente e inamovible; esta feature documenta que revoca su
  código por decisión de usuario.
- Decisión 6 (test nuevo): `tests/game-of-life-removal.test.mjs` verifica la
  ausencia (rutas de los archivos eliminados, tokens, import en layout, docs);
  por eso contiene las cadenas GOL — el acceptance acota el grep a `src/`
  (0 resultados) y aclara que en `tests/` solo ese archivo las menciona.
- Restricción del proyecto aplicable: ≤100 líneas por archivo, tokens y
  estilos separados, kit de integridad (REQ-01-05), un solo layout.

## Alternativa descartada

- Alternativa considerada: conservar el código GOL desactivado (import
  comentado como hoy) y mantener `--opacity-hero` "por si se retoma".
- Motivo del descarte: la decisión del usuario es de ELIMINACIÓN definitiva;
  código muerto y tokens sin uso violan el espíritu de las reglas del
  proyecto (limpieza de código muerto, tokens) y ensucian el arnés.