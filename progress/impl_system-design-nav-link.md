# Implementación — feature 93 system-design-nav-link (ronda 1 BLOCKED por REQ-93-09 antigua; ronda 2 BLOCKED por REQ-93-14)

Fecha: 2026-10-14. Implementer. Sin commits y sin subagentes. Estado en `feature_list.json`: **blocked**.
(La ronda 1 queda abajo como historial con los REQ de la spec anterior; la ronda 2, al final, usa REQ-93-01..19.)

## Resumen

- Test nuevo: `tests/system-design-nav-link.test.mjs` (REQ-93-01/02/03/04/05/06/11/12).
- Código: una línea en `src/layouts/Layout.astro` (79 líneas), dentro de `.site-menu` y justo tras Arquitectura:
  `<a aria-current={Astro.url.pathname === '/diseno-de-sistemas' || Astro.url.pathname === '/diseno-de-sistemas/' ? 'page' : undefined} href="/diseno-de-sistemas">Diseño de sistemas</a>`
- Test heredado reapuntado: `tests/mobile-hamburger-menu.test.mjs` (REQ-79-01/02/03) contaba exactamente 3
  `aria-current` en el `<nav>` y un orden del panel sin el enlace nuevo. Pasa a 4 y el orden incluye
  `href="/diseno-de-sistemas"` tras Arquitectura. Lleva una nota que cita REQ-93-13 y el precedente REQ-43-06.
  Era imprescindible porque REQ-93-01/02 obligan a añadir ese cuarto `aria-current`.
- No se ha tocado: layout.css, site-menu.css, `tests/geist-pixel-extend.test.mjs`, ningún CSS de src/styles y ningún
  archivo de src/content/posts.
- En el repo no había código ni tests con «System Design» o `/system-design`, así que no había nada que ajustar.

## Ciclo rojo/verde

Rojo, antes de tocar Layout.astro (`node --test tests/system-design-nav-link.test.mjs`):

```
✖ REQ-93-01: .site-menu incluye Diseño de sistemas a /diseno-de-sistemas justo tras Arquitectura
✖ REQ-93-02/03: aria-current compara con /diseno-de-sistemas y /diseno-de-sistemas/ y degrada a undefined
✔ REQ-93-04: /diseno-de-sistemas es una ruta de término 200 con estado sin resultados
✔ REQ-93-05: se conservan el logo, About, Arquitectura, @moibaldenegro y la barra de búsqueda
✖ REQ-93-06/12: sin <style>, sin clase ni style propios, sin CSS nuevo y Layout.astro <= 100 líneas
✔ REQ-93-11: el frontmatter de src/content/posts no cambia frente a HEAD
ℹ tests 6  ℹ pass 3  ℹ fail 3
```

REQ-93-04/05/11 ya pasan antes del cambio, y es lo esperado: son guardas de regresión (la ruta de término ya existe por
la feature 08, y lo que se comprueba es que se conserva y que no se cambia nada).

Primer `./init.sh` tras el cambio: falla `tests/mobile-hamburger-menu.test.mjs:27` (`4 !== 3`, recuento de aria-current).
Se reapunta como se explica arriba.

Verde: `./init.sh` → `✔ formato`, `✔ tests al 100% (node:test)`, `✔ build de producción`,
`✔ El entorno está perfecto.` `pnpm test`: `tests 973, pass 973, fail 0`.

## Verificación en navegador (Chrome headless + CDP, DPR 1, fuentes cargadas)

Servidor: ya había un `astro dev` corriendo en localhost:4321 (pid 34400, ~3 h de uptime) cuando lancé
`astro dev --background`, que respondió «already running». No lo arranqué yo, así que **no lo paré**: el líder decide.
Script ad hoc en el scratchpad de la sesión, fuera del repo. Chrome se cerró con `proc.kill()`.

### REQ-93-04: GET /diseno-de-sistemas

- curl: `/diseno-de-sistemas` → 200 y `/diseno-de-sistemas/` → 200.
- Navegador a 1280: title «Búsqueda: diseno-de-sistemas», h1 «Búsqueda por término», `[data-search-empty]` visible
  con «No se encontraron resultados para 'diseno-de-sistemas'» y «Limpiar búsqueda», lista oculta, status
  `Sin resultados para "diseno-de-sistemas"`. Sin errores ni excepciones en consola.
- `aria-current="page"` en `/diseno-de-sistemas` y en `/diseno-de-sistemas/`; no aparece en `/` ni en `/arquitectura`.
- Tipografía del enlace: Geist Pixel (heredada).

### REQ-93-07: altura del header de escritorio. CUMPLE

| Ancho | header.site-navbar |
|------:|------:|
| 800 | 65 px |
| 1000 | 65 px |
| 1280 | 65 px |

### REQ-93-08: desborde entre 769 y 900 px. NO CUMPLE

En `/`, con los mismos valores en `/posts/00-agilismo/`:

| Ancho | scrollWidth / clientWidth del header (feature) | Alto del enlace (líneas) | HEAD sin enlace |
|------:|------:|------:|------:|
| 769 | **851 / 759** (+92) | 57 px (3 líneas) | 759 / 759 |
| 770 | **851 / 760** | 57 px (3) | 760 / 760 |
| 800 | **851 / 790** | 57 px (3) | 790 / 790 |
| 820 | **852 / 810** | 57 px (3) | 810 / 810 |
| 850 | **853 / 840** | 57 px (3) | 840 / 840 |
| 875 | 865 / 865 | 57 px (3) | 865 / 865 |
| 900 | 890 / 890 | 38 px (2 líneas) | 890 / 890 |
| 1000 | 990 / 990 | 19 px (1) | — |
| 1280 | 1270 / 1270 | 19 px (1) | — |

Además, entre 769 y 850 px el documento gana scroll horizontal (`documentElement.scrollWidth` 851 a 853 frente a un
viewport de 769 a 850), y la barra de búsqueda queda recortada por la derecha. En la captura a 769 px se ve
«Diseño / de / sistemas» en tres líneas dentro del header de 65 px. La altura no cambia porque el header es fijo,
pero el texto envuelve y el header desborda.

### REQ-93-10: móvil a 375 px. CUMPLE

Con el menú cerrado: header de 65 px y sin scroll horizontal (375/375). Con el menú abierto (`aria-expanded="true"`):
panel 375/375, documento 375/375, enlace «Diseño de sistemas» en una línea (356 x 44 px, de x=9 a x=366). Orden:
About, Arquitectura, Diseño de sistemas, @moibaldenegro.

## Bloqueo (REQ-93-09)

El enlace nuevo hace que el header desborde en horizontal entre 769 y unos 860 px, y que la etiqueta se parta en 2 o 3
líneas hasta unos 950 px. Siguiendo REQ-93-09 y la orden del líder, **paro**: no toco layout.css ni site-menu.css, no
recorto la etiqueta y no reapunto geist-pixel-extend. Hace falta una decisión humana. Opciones sin evaluar, solo para
informar:

- (a) Etiqueta más corta, por ejemplo «Sistemas». Cambia REQ-93-01.
- (b) Subir el punto de corte del menú hamburguesa de 768 px a unos 900 px. Toca site-menu.css y layout.css, que están
  congelados.
- (c) `white-space: nowrap` o un gap menor en `.site-menu`. Toca CSS congelado y sola no arregla el desborde.

El cambio sigue en el árbol de trabajo (Layout.astro, test nuevo y test heredado reapuntado), con `./init.sh` en verde.
Para revertirlo basta con quitar esa línea de Layout.astro y los dos cambios de tests.

Archivos: `src/layouts/Layout.astro`, `tests/system-design-nav-link.test.mjs`, `tests/mobile-hamburger-menu.test.mjs`,
`feature_list.json` (status blocked), `progress/current.md`.

---

# Ronda 2 (spec REQ-93-01..19, desbloqueo 2): BLOCKED por REQ-93-14

Fecha: 2026-10-14. Implementer. Sin commits y sin subagentes. Estado en `feature_list.json`: **blocked**.

## Cambios en el árbol

- `tests/system-design-nav-link.test.mjs` reescrito contra REQ-93-01..19 (8 tests, 91 líneas). Comprueba:
  - el enlace va justo tras Arquitectura con `aria-label="Diseño de sistemas"` (REQ-93-01/10);
  - el patrón de `aria-current` (02/03);
  - que el nav se conserva (05);
  - el contenido exacto `Diseño<span class="site-menu__label-rest"> de sistemas</span>` (06);
  - que `src/styles/nav-label.css` tiene la regla `@media` y que Layout.astro lo importa (08/11);
  - que Layout.astro no tiene `<style>` ni `<script>` y mide 100 líneas o menos (11/17);
  - el tag en el artículo 05, al menos un artículo con el tag (sin número exacto) y `statusForTermPath` 200 (04/15);
  - que `git diff HEAD` de `src/content/posts` solo toca ese archivo y solo añade el tag en la línea `tags` (16).

  Se quitan los tests de la ronda 1 que ya no aplican: estado sin resultados, «sin CSS nuevo» y frontmatter intacto.
- `src/layouts/Layout.astro` (80 líneas): `import "../styles/nav-label.css";` tras typography.css, y el enlace
  `<a aria-current={…} aria-label="Diseño de sistemas" href="/diseno-de-sistemas">Diseño<span class="site-menu__label-rest"> de sistemas</span></a>`.
- `src/styles/nav-label.css` (nuevo, 6 líneas): `@media (max-width: 969px) { .site-menu__label-rest { display: none; } }`.
- `src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md`: solo se añade ` #diseno-de-sistemas`
  al final del valor de `tags` (diff de una línea).
- `tests/mobile-hamburger-menu.test.mjs`: se mantiene el reapunte de la ronda 1, con la nota corregida a REQ-93-18
  (precedente REQ-43-06).
- Sin tocar: layout.css, site-menu.css y `tests/geist-pixel-extend.test.mjs`.

## Breakpoint confirmado: 970 px (CSS `max-width: 969px`)

Con el breakpoint inicial de 959 px, a 960 px la etiqueta completa medía 133 x 38 px: **2 líneas**. Medido el texto
completo a 970, 980, 990 y 1000 px: 1 línea (139 x 19 px) en todos. Según design.md, se sube al menor múltiplo de 10
que cabe, **970 px**. Los REQ-93-07/08 se leen como «>= 970 px» y «<= 969 px». El test y el CSS usan 969px.

## Ciclo rojo/verde

Rojo 1. Test nuevo antes de tocar código; Layout.astro tenía el enlace de la ronda 1, sin aria-label ni span:

```
✖ REQ-93-01: .site-menu incluye el enlace a /diseno-de-sistemas con aria-label justo tras Arquitectura
✔ REQ-93-02/03: aria-current compara con /diseno-de-sistemas y /diseno-de-sistemas/ y degrada a undefined
✔ REQ-93-05: se conservan el logo, About, Arquitectura, @moibaldenegro y la barra de búsqueda
✖ REQ-93-06/10: contenido Diseño + span .site-menu__label-rest « de sistemas» y nombre accesible estable
✖ REQ-93-08/11: nav-label.css oculta .site-menu__label-rest a <= 959 px, sin JS y <= 100 líneas
✔ REQ-93-11/17: Layout.astro sin <style> ni <script> y con 100 líneas o menos
✖ REQ-93-04/15: el artículo 05 lleva #diseno-de-sistemas y la ruta de término responde 200
✔ REQ-93-16: en src/content/posts solo cambia la línea tags del artículo 05 (se añade el tag)
ℹ tests 8  ℹ pass 4  ℹ fail 4
```

Los que pasan son guardas: 02/03 y 05 ya los cumplía la línea de la ronda 1; 11/17 y 16 son de regresión.

Rojo 2. Test reapuntado a 969px tras la medición, con el CSS todavía en 959px:

```
✖ REQ-93-08/11: nav-label.css oculta .site-menu__label-rest a <= 969 px (breakpoint confirmado por medición: a 960 px se parte), sin JS y <= 100 líneas
ℹ tests 8  ℹ pass 7  ℹ fail 1
```

Verde. `./init.sh` da `✔ formato`, `✔ tests al 100% (node:test)`, `✔ build de producción` y `✔ El entorno está perfecto.`
`pnpm test`: `tests 975, pass 975, fail 0`.

## Verificación en navegador (Chrome headless + CDP, DPR 1, fuentes cargadas)

El dev server de localhost:4321 ya estaba corriendo y no lo arranqué yo, así que **no lo paré**. Usé un script ad hoc en el
scratchpad de la sesión, fuera del repo, y cerré Chrome al terminar.

### REQ-93-04: /diseno-de-sistemas

- curl `/diseno-de-sistemas` devuelve 200.
- En el navegador a 1280 px: title «Búsqueda: diseno-de-sistemas», status `1 resultado para "diseno-de-sistemas"`, lista
  visible con 1 artículo («Diseño Arquitectónico vs. Diseño Detallado») y estado vacío oculto. Consola sin errores ni
  excepciones.
- `aria-current="page"` aparece en `/diseno-de-sistemas` y en `/diseno-de-sistemas/`, y no aparece en `/` ni en `/arquitectura`.

### Tabla de mediciones (`/`; `/posts/00-agilismo/` da los mismos valores)

| Ancho | Header alto | Header scrollW / clientW | Documento scrollW / clientW | Texto visible | Enlace (w x h, líneas) | Nombre accesible |
|------:|------:|------:|------:|------|------|------|
| 375 (menú cerrado) | 65 | 375 / 375 | 375 / 375 | — | — | — |
| 375 (menú abierto) | — | panel 375 / 375 | 375 / 375 | Diseño | 356 x 44, 1 | Diseño de sistemas |
| 769 | 65 | **837 / 759 (+78)** | **837 / 759** | Diseño | 49 x 19, 1 | Diseño de sistemas |
| 800 | 65 | **838 / 790 (+48)** | **838 / 790** | Diseño | 49 x 19, 1 | Diseño de sistemas |
| 820 | 65 | **838 / 810** | **838 / 810** | Diseño | 49 x 19, 1 | — |
| 840 | 65 | **839 / 830** | **839 / 830** | Diseño | 49 x 19, 1 | — |
| 848 | 65 | **839 / 838** | **839 / 838** | Diseño | 49 x 19, 1 | — |
| 850 | 65 | 840 / 840 | 840 / 840 | Diseño | 49 x 19, 1 | Diseño de sistemas |
| 900 | 65 | 890 / 890 | 890 / 890 | Diseño | 49 x 19, 1 | Diseño de sistemas |
| 959 | 65 | 949 / 949 | 949 / 949 | Diseño | 49 x 19, 1 | Diseño de sistemas |
| 960 | 65 | 950 / 950 | 950 / 950 | Diseño (con 959px: «Diseño de sistemas» en 2 líneas, 133 x 38) | 49 x 19, 1 | Diseño de sistemas |
| 969 | 65 | 959 / 959 | 959 / 959 | Diseño | 49 x 19, 1 | Diseño de sistemas |
| 970 | 65 | 960 / 960 | 960 / 960 | Diseño de sistemas | 139 x 19, 1 | Diseño de sistemas |
| 1000 | 65 | 990 / 990 | 990 / 990 | Diseño de sistemas | 139 x 19, 1 | Diseño de sistemas |
| 1280 | 65 | 1270 / 1270 | 1270 / 1270 | Diseño de sistemas | 139 x 19, 1 | Diseño de sistemas |

El nombre accesible sale del árbol de accesibilidad de CDP (`Accessibility.getFullAXTree`). Menú móvil a 375 px con
`aria-expanded="true"`: orden About, Arquitectura, Diseño, @moibaldenegro. El enlace va de x=9 a x=366 y ni el panel ni el
documento tienen scroll horizontal.

### Cumplimiento

- Cumplen: REQ-93-01..06, 07 (>= 970 px), 08 (<= 969 px), 09, 10, 11, 12 (65 px a 800/1000/1280), 15, 16, 17, 18 y 19.
- **No cumple REQ-93-13** entre **769 y 849 px**. Aun con la etiqueta «Diseño» (1 línea, 49 px), el header y el documento
  desbordan en horizontal hasta 78 px. Desde 850 px, y a 375 px, no hay desborde.

## Bloqueo (REQ-93-14)

Causa, medida a 769 px comparando con y sin el enlace (lo quité del DOM en el navegador): el `<nav>` mide 721 px. Su
contenido ocupa 727 px sin el enlace y 818 px con él, 91 px más (gap de 42 px + 49 px del enlace). Sin el enlace, el padding
del header absorbe esos 6 px de exceso y no desborda (759/759); con el enlace desborda 78 px. La etiqueta corta ya va en una
línea, así que desde nav-label.css no se puede recortar más sin quitar el enlace. Según REQ-93-14 y la orden del líder,
**paro**: hace falta una decisión humana. Opciones, sin evaluar, solo como información:

- (a) Subir el corte del menú hamburguesa de 768 px a unos 850 px. Toca site-menu.css y layout.css, que están congelados,
  y habría que reapuntar los tests con REQ-93-18.
- (b) Reducir el gap del nav o el ancho de la barra de búsqueda (240 px) entre 769 y 849 px. También es CSS congelado (o
  search-bar.css).
- (c) Ocultar el enlace entero entre 769 y 849 px desde nav-label.css. Se pierde el atajo en esa franja y contradice
  REQ-93-01/07.

El cambio sigue en el árbol de trabajo (Layout.astro, nav-label.css, artículo 05 y los dos tests) con `./init.sh` en verde.
