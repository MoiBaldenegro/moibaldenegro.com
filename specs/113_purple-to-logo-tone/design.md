# Diseño — feature 113 purple-to-logo-tone

## Contexto visual

- Afecta a todo el sitio vía tokens: acento de enlaces, navbar activa y subrayado, foco visible, skip link, kicker y badges del post-header, botones CV de about y footer, timeline, búsqueda, 404, gradiente y glow del hero, del post-header, de about-hero y del footer, scrollbar y card CSS del hero.
- Actual: violeta azulado saturado (#7d68ff, hue 248, sat 100 %). Deseado: familia ciruela del logotipo (#6C387A, hue 287,3, sat 37,1 %, muestreado del webp con Chrome headless + canvas; ver progress/research/purple-to-logo-tone.md).

## Tokens usados

| Token | Antes | Después | Uso / contraste |
|-------|-------|---------|-----------------|
| `--color-accent` | #7d68ff | #B37AC2 (logo a L 62 %) | Texto/foco: 6,17:1 fondo, 5,84:1 superficie, 4,40:1 hero-top |
| `--color-accent-hover` | #9a89ff | #C396CF (logo a L 70 %) | Hover: 8,17:1 fondo, 5,83:1 hero-top |
| `--color-hero-top` | #25144f | #3C1F44 (logo a L 19,4 %) | Arranque de gradientes |
| `--color-hero-mid` | #0b0818 | #150A18 (hue 287,1, L 6,7 %; ajuste: #140A16 daba hue 290 y violaba REQ-113-06) | Tramo medio de gradientes |
| `--color-glow` | rgba(120, 70, 255, 0.25) | rgba(108, 56, 122, 0.35) | Glows (alfa subida porque el logo es más oscuro) |
| `--color-scrollbar-thumb` | #4732a5 | #6C387A (logo exacto) | 2,34:1 sobre el track |
| `--color-marca-css` | #6E29C8 | #6C387A (logo exacto) | Fondo de la card CSS; blanco 8,45:1 |

## Decisiones y constraints

- Decisión 1: mismo hue y saturación del logo, solo varía la luminosidad; el tono exacto (2,36:1 sobre el fondo) se usa solo como relleno, nunca para texto ni foco.
- Decisión 2: `--color-marca-css` también pasa al logo («todos los tokens»); la marca CSS no tiene morado fijo (logo clásico azul, comunitario #663399). Revisable.
- Decisión 3: `.skip-link` pasa a texto `--color-background` (6,17:1); hoy blanco sobre acento da 3,97:1 y con el nuevo acento 3,24:1.
- Decisión 4: los azul marino de hue 240 (fondo, superficie, hero-bottom, navbar, track, texto secundario, THEME_COLOR y manifest) no son morados y se quedan.
- Excepción: el `#639` del símbolo `css` de `public/assets/svg/sprite.svg` (ajeno, marca oficial) queda fuera; el detector no escanea `public/` ni `src/content/`.
- Restricciones: tokens.css en 99 líneas (solo cambian valores), sin dependencias, ≤100 líneas por archivo, sin hardcodeados.

## Alternativa descartada

- Alternativa: acento = #6C387A exacto. Motivo: 2,36:1 sobre el fondo, no AA para texto ni 3:1 para foco.
- Alternativa: un token nuevo `--color-accent-strong` para el skip link. Motivo: obliga a pasar de 99 líneas; basta con texto oscuro.
