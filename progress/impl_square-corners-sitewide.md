# Implementación — feature 9 `square-corners-sitewide`

Todas las esquinas del sitio pasan a rectas con un único token de radio.
Spec: `specs/09_square-corners-sitewide/requirements.md` (REQ-09-01..17) y `design.md`.
Análisis: `progress/research/square-corners-sitewide.md`. Fecha: 2026-11-02.

## 1. Archivos tocados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `tests/square-corners-sitewide.test.mjs` | Nuevo, escrito antes del código: 8 tests (REQ-09-01..13 y 17) | 100 |
| `tests/article-images.test.mjs` | `--radius-card` pasa a `--radius-square` (REQ-09-14) | 30 |
| `tests/promo-tiles-section-ui.test.mjs` | Los dos `--radius-pill` y el `border-radius:\s*0` pasan a `var(--radius-square)` (REQ-09-14) | 87 |
| `src/styles/tokens.css` | `--radius-card`, `--radius-pill`, `--radius-thumb` y su comentario se sustituyen por `--radius-square: 0;` con un comentario de la feature | 97 (antes 99) |
| `src/styles/search-bar.css` | Comentario de cabecera: `radius-pill` pasa a `radius-square`. Los 2 radios pasan a `var(--radius-square)` | 90 |
| `src/styles/search-results.css` | Comentario de cabecera reescrito sin `--radius-thumb` (mismo número de líneas). Los 6 radios pasan a `var(--radius-square)` | 61 |
| 23 hojas más de `src/styles` | Solo se cambia el valor en la misma línea, por `var(--radius-square)`: about-credentials, about-hero, about-projects, about-skills, about-stats, about-timeline, about, article, code-copy, hero-card-link, hero-card, hero-section, htb-stadistics, latest-articles, layout, not-found, post-header, post-next, post, profile-card, promo-tiles, site-footer, site-menu | sin cambios |

Casos especiales que también se cambian, como pide la spec:
- `50%` en `.hero-card::after` (conserva el `radial-gradient`) y en `.verified`.
- El `0` literal de `.promo-tile`.
- Los radios asimétricos de `.about-philosophy__quote` y `.about-timeline__result`.
- `::-webkit-scrollbar-thumb`.

No se borra ninguna declaración: siguen siendo 61 en 25 hojas. Lo que queda fuera de alcance no se toca: `rx="1.5"` en code-copy.ts y los .astro, los .ts y los datos. Todos los archivos tienen 100 líneas o menos.

## 2. Evidencia del rojo (antes de tocar CSS y tokens)

`node --test tests/square-corners-sitewide.test.mjs tests/article-images.test.mjs tests/promo-tiles-section-ui.test.mjs`:

```
✖ article images are centered and responsive
✔ the systems design post uses semantic HTML figures
✔ REQ-04-08 (sustituido por REQ-08-09): home.astro importa PromoTiles ...
✔ REQ-04-09/10/14/19: estructura del componente, imagen y sin script ni style
✖ REQ-04-11/12/15/16/17: promo-tiles.css usa los tokens de la sección
✔ REQ-04-15/18/20: tokens nuevos, audit de colores en verde y archivos <=100 líneas
✖ REQ-09-01/02: tokens.css define solo --radius-square: 0
✖ REQ-09-03: src/ no referencia los tokens antiguos (comentarios incluidos)
✖ REQ-09-04/05: todo valor de radio en src/styles es exactamente var(--radius-square)
✖ REQ-09-06..10: reglas concretas usan var(--radius-square)
✔ REQ-09-11: ninguna hoja pierde declaraciones de radio (línea base 61 en 25 hojas)
✔ REQ-09-12: los .astro no declaran radios en <style> ni style=
✔ REQ-09-13: el icono SVG de code-copy.ts conserva rx="1.5"
✔ REQ-09-17: tokens.css, hojas con radio y tests tocados tienen <=100 líneas
ℹ tests 14
ℹ pass 8
ℹ fail 6
```

Los tests 11, 12, 13 y 17 ya pasan en rojo porque protegen cosas que no deben cambiar: el número de declaraciones, la ausencia de `<style>` en los .astro, el `rx` del icono y el límite de líneas.

## 3. Evidencia del verde

- `node --test` (suite completa): `ℹ tests 79`, `ℹ pass 79`, `ℹ fail 0`.
- `./init.sh`: todo ✔. Pasan las herramientas, el formato, `tests al 100% (node:test)` y `build de producción (pnpm build)`. Termina con «El entorno está perfecto». El audit de tokens (`scripts/audit-design-tokens.mjs`) se ejecuta dentro de promo-tiles-section-ui y queda en verde.

## 4. Revisión visual (REQ-09-15/16)

- Ya había un dev server en `localhost:4321`, arrancado por el humano en su terminal y no con `--background`. `astro dev logs` lo confirma. Por eso no se arrancó otro y **no se paró** ese.
- `/home`, `/about`, `/search` y `/posts/autenticacion-api-buenas-practicas` responden 200; `/404` responde 404 con su página, como debe.
- Se descargó el HTML y las hojas CSS y TS que sirve cada página. Hay 158 apariciones de `*radius:` y **todas** son `border-radius: var(--radius-square)`. `--radius-square: 0` está definido y quedan 0 referencias a `--radius-card`, `--radius-pill` o `--radius-thumb`.
- REQ-09-15, controles nativos: el input de búsqueda (`.search-bar__input`) y los botones `.search-bar__clear`, `.search-results__clear`, `.search-results__page-button`, `.site-menu__toggle` y `.code-copy` ya declaran `border-radius: var(--radius-square)` en su selector. No hace falta añadir ninguna declaración.
- Limitación: esta sesión no tiene un navegador controlable. No pude ver el render a 375, 768 y 1280 px ni la consola del navegador. Comprobé el CSS servido en lugar de mirar la página. Queda pendiente que el reviewer o el humano confirme a ojo el halo de `.hero-card::after` y el badge cuadrado `.verified`.

## 5. Notas

- La feature sigue en `in_progress`: `done` se marca tras el APPROVED del reviewer.
- `sed -i` dejó `post-readability.css` y `search-live.css` como modificados sin diff real. Se restauraron con `git checkout --`.
