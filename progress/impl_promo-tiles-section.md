# Informe de implementación — feature 4 `promo-tiles-section`

- **Feature**: id 4 — `promo-tiles-section` (Sección promocional 2x2 estilo Apple tras las cards de artículos).
- **Spec**: `specs/04_promo-tiles-section/requirements.md` (REQ-04-01..21) y `specs/04_promo-tiles-section/design.md`.
- **Análisis**: `progress/research/promo-tiles-section.md`.
- **Sesión**: 2026-11-02 — implementer (TDD: tests en rojo → código → suite en verde → regresión visual).
- **Estado**: implementada y verificada; `status: "in_progress"`. **No** se marca `done` (pendiente del APPROVED del reviewer).

---

## 1. Qué se ha hecho

Sección estática nueva en la home, dentro de `.home__landing` y justo después de `<LatestHorizontal />`:
cuadrícula 2x2 (1 columna en <=768 px) de cuatro cuadros (youtube-kernel, mfinance, new-relic, tomatesoft)
con h3, subtítulo, enlace primario relleno azul, enlace secundario contorneado e imagen `pic01..04.webp`.

- **Datos**: `src/data/promo-tiles.json` con los textos, tonos, enlaces y alts exactos de design.md.
- **Dominio**: entidad `PromoTile` (readonly), `PromoTilesRepository` (loader inyectable `() => string`,
  default con import con atributo, mismo patrón que `about-repository.ts`) y parseo en el módulo hermano
  `promo-tiles-parse.ts` (`PromoTilesDataError`; los mensajes nombran `promo-tiles.json`, `tiles[<i>]` y el
  campo; hrefs válidos solo si empiezan por `/` o `https://`). El parseo construye objetos nuevos con
  exactamente los 8 campos (descarta claves sobrantes).
- **Helper**: `src/domain/promo-tiles.ts` → `linkAttrs(href)`: `{ target: '_blank', rel: 'noopener noreferrer' }`
  para `https://`, `{}` para el resto.
- **UI**: `src/components/promo-tiles/promo-tiles.astro` (sin `<script>` ni `<style>`; frontmatter solo con
  imports y la llamada al repositorio), `section[aria-labelledby]` + `h2.visually-hidden` "Proyectos y contenido".
- **Estilos**: `src/styles/promo-tiles.css` (medidas de design.md; fondo por `[data-tone]`; máscara con la
  palabra clave `black`; hover del secundario a `--color-promo-cta` con texto blanco, contraste 4,6:1).
- **Tokens**: 8 tokens nuevos en `tokens.css`, dos por línea. Para quedar en 100 líneas se compactaron a una
  línea los comentarios de `--radius-thumb` y de la tarjeta de perfil (mismo contenido informativo, sin
  cambiar ningún valor).

## 2. Archivos tocados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `src/data/promo-tiles.json` | nuevo | 44 |
| `src/domain/entities/promo-tile.ts` | nuevo | 19 |
| `src/domain/repositories/promo-tiles-repository.ts` | nuevo | 44 |
| `src/domain/repositories/promo-tiles-parse.ts` | nuevo | 64 |
| `src/domain/promo-tiles.ts` | nuevo | 12 |
| `src/components/promo-tiles/promo-tiles.astro` | nuevo | 26 |
| `src/styles/promo-tiles.css` | nuevo | 98 |
| `src/styles/tokens.css` | 8 tokens + 2 comentarios compactados | 100 |
| `src/pages/home.astro` | import + `<PromoTiles />` tras `<LatestHorizontal />` | 28 |
| `tests/promo-tiles-section.test.mjs` | nuevo (REQ-04-01..07, 13) | 82 |
| `tests/promo-tiles-section-ui.test.mjs` | nuevo (REQ-04-08..20) | 87 |
| `feature_list.json` | feature 4 → `in_progress` | — |
| `progress/current.md` | plan y bitácora | — |

`public/assets/pic01..04.webp` siguen sin trackear en git: deben entrar en el commit de la feature.

## 3. Evidencia rojo / verde

### Rojo (tests escritos antes que el código)

`node --test tests/promo-tiles-section.test.mjs tests/promo-tiles-section-ui.test.mjs`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\repositories\promo-tiles-repository.ts'
✖ REQ-04-08: home.astro importa PromoTiles y lo renderiza justo tras <LatestHorizontal />
✖ REQ-04-09/10/14/19: estructura del componente, imagen y sin script ni style   (ENOENT promo-tiles.astro)
✖ REQ-04-11/12/15/16/17: promo-tiles.css usa los tokens de la sección          (ENOENT promo-tiles.css)
✖ REQ-04-15/18/20: tokens nuevos, audit de colores en verde y archivos <=100 líneas (color-promo-youtube)
✖ tests\promo-tiles-section.test.mjs
ℹ tests 5   ℹ pass 0   ℹ fail 5
```

### Verde

```
✔ REQ-04-08 … ✔ REQ-04-09/10/14/19 … ✔ REQ-04-11/12/15/16/17 … ✔ REQ-04-15/18/20
✔ REQ-04-01/02 … ✔ REQ-04-03/04 … ✔ REQ-04-05 … ✔ REQ-04-06 … ✔ REQ-04-07 … ✔ REQ-04-13
ℹ tests 10  ℹ pass 10  ℹ fail 0
pnpm test → ℹ tests 41  ℹ pass 41  ℹ fail 0
node scripts/audit-design-tokens.mjs → AUDIT ✔ ningún color fuera de tokens.css en src/styles
```

`./init.sh`:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

El HTML generado (`dist/client/home/index.html`) contiene la sección con los cuatro cuadros; los `https://`
llevan `target="_blank" rel="noopener noreferrer"` y los `/about` no llevan ninguno.

## 4. Regresión visual (REQ-04-21)

Chrome headless (CDP) sobre el build (`dist/client` servido en local), `/home`, tras hacer scroll por la página:

| Viewport | Columnas | scrollWidth / clientWidth | Cuadros (x, ancho, alto) | Imágenes |
|----------|----------|---------------------------|--------------------------|----------|
| 375 | 1 (`355px`) | 375 / 375 | x=10, w=355, h=500-527, apilados con gap 10 | 4/4 cargadas, 312 px |
| 768 | 1 (`748px`) | 768 / 768 | x=10, w=748, h=539, apilados con gap 10 | 4/4 cargadas, 360 px |
| 1280 | 2 (`620px 620px`) | 1270 / 1270 | (10, 640) × 2 filas, w=620, h=655 | 4/4 cargadas, 440 px |

- La sección empieza exactamente donde acaba `.latest-articles` (sin solapamiento); sin desbordamiento horizontal.
- Fondos calculados: rgb(14,14,16), rgb(13,26,29), rgb(14,11,34), rgb(11,9,9) = los 4 tokens.
- Consola: **ningún error de la sección**. Solo hubo dos 404 ajenos a la feature: `/_server-islands/HtbStadistics`
  (es un artefacto del servidor estático usado, que no ejecuta el worker) y `/assets/content/api-auth.webp`
  (ya pasaba antes: el post `07-auth-api-design.md` apunta a una imagen que no existe; queda fuera de alcance).
- Capturas revisadas a 375 y 1280 px: textos centrados, botones píldora, imagen con fundido superior.
- El dev server de 4321 lo arrancó el humano fuera de `--background` y servía un marcado antiguo, así que
  no se usó ni se paró.
