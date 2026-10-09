# Review — feature 63

**Veredicto:** APPROVED

Feature 63 `theme-color-dark`, revisión de nivel 1, ronda 2. No tiene `depends_on`, así que no
se salta ninguna dependencia. Alcance revisado: `src/domain/seo/theme.ts` (5 líneas, nuevo),
`src/layouts/Layout.astro` (66), `public/site.webmanifest` y `tests/theme-color-dark.test.mjs`
(62, nuevo).

## Nota de la ronda 1 (CHANGES_REQUESTED)

Pedí dos cambios: (1) quitar del cambio de la 63 el diff ajeno en
`src/domain/search/normalize.ts:7` (`if (!text) return '';`); (2) documentar la sesión de la 63
en `progress/current.md`.

## Ronda 2

- Cambio 1: resuelto en cuanto al alcance. `progress/impl_63.md` («Ronda 2») y
  `progress/current.md` dicen que el implementer no escribió ese diff (edición externa,
  probablemente del humano), que queda excluido de la 63 y que se ha señalado al humano. Lo he
  comprobado: ningún archivo de la 63 importa `normalize.ts`, y el diff de la 63 (`git diff` de
  `Layout.astro`, `site.webmanifest`, más los dos archivos nuevos) no lo toca. **Condición:** el
  commit o cierre de la 63 no debe incluir `src/domain/search/normalize.ts`. Si el humano quiere
  conservar ese cambio, se tramita como feature propia con su test en rojo (ahora mismo ningún
  test de `tests/search-domain.test.mjs` cubre una entrada vacía).
- Cambio 2: resuelto. `progress/current.md` recoge la feature 63, la hora de inicio (09:41), el
  plan y la bitácora (rojo 0/5, verde 5/5, suite 766/766, ronda 1 y ronda 2).

## Cumplimiento de la spec (specs/63_theme-color-dark/)

- REQ-63-01/02: `theme.ts:5` `THEME_COLOR = '#070716'` es igual a `--color-background`. El
  manifest declara `theme_color` y `background_color` `#070716`.
- REQ-63-03/04: `Layout.astro` importa `THEME_COLOR` de `../domain/seo/theme.ts` y emite una sola
  `<meta name="theme-color" content={THEME_COLOR} />`, sin literal hexadecimal.
- REQ-63-05: el test de build cubre la portada, /about y un post. El build de `./init.sh` está OK.
- REQ-63-06: rojo previo documentado (pass 0 / fail 5) y luego verde.
- REQ-63-07: todos los archivos tienen 100 líneas o menos.
- REQ-63-08: `./init.sh` termina con EXIT=0 (entorno, formato, tests al 100 % y build).
  `node --test tests/theme-color-dark.test.mjs` da pass 5 / fail 0.

## Checkpoints
- C1 (arquitectura: sin `<style>`, frontmatter solo con imports, sin JSON directo, tokens,
  100 líneas o menos, sin dependencias): [x]
- C2 (datos válidos y tipados): [x]  (la feature no toca datos)
- C3 (`./init.sh` en verde): [x]
- C4 (correcto en desktop y móvil): [ ]  ← Falta la inspección visual (el reviewer no la hace).
  La meta en el HTML sí está verificada por el test de build. No bloquea.
- C5 (harness: una feature a la vez, `progress/current.md` al día, sin restos): [x]  (con la
  condición de excluir `normalize.ts` del cierre de la 63)

## Cambios requeridos
Ninguno para la feature 63. Pendiente para el humano: decidir qué hacer con el diff ajeno de
`src/domain/search/normalize.ts`.
