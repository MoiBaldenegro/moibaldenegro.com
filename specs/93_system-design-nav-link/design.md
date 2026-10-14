# Diseño — Atajo de diseño de sistemas en el navbar (feature 93)

## Contexto visual

- Header `header.site-navbar` de `src/layouts/Layout.astro`, menú `#site-menu` (`.site-menu`).
- Estado deseado: logo, About, Arquitectura, Diseño de sistemas, @moibaldenegro, SearchBar.
- Etiqueta visible «Diseño de sistemas» desde 960 px y «Diseño» a 959 px o menos, lo que incluye la
  franja 769-959 px y el menú móvil/hamburguesa (<= 768 px). URL `/diseno-de-sistemas` (español ASCII).
- Decisión humana 2026-10-14: «metele un articulo para que no salga ninguna coincidencia pues, y si
  desborda la etiqueta en mobile, en mobile dejalo en "diseño" nada mas solo en mobile».

## Marcado (Layout.astro, una sola línea)

```astro
<a aria-current={…/diseno-de-sistemas…} aria-label="Diseño de sistemas" href="/diseno-de-sistemas">Diseño<span class="site-menu__label-rest"> de sistemas</span></a>
```

- El `aria-label` fija el nombre accesible en «Diseño de sistemas» en todos los anchos (con
  `display: none` el span sale del árbol de accesibilidad). El texto visible «Diseño» está contenido en
  el nombre accesible (WCAG 2.5.3, label in name).
- El espacio inicial va dentro del span para que «Diseño» no deje un espacio colgante.

## CSS (archivo nuevo `src/styles/nav-label.css`, importado en Layout.astro)

```css
@media (max-width: 959px) { .site-menu__label-rest { display: none; } }
```

- Sin tokens nuevos: no hay color, espaciado, radio ni sombra; el breakpoint es literal como los 768/769 px
  existentes. Tipografía Geist Pixel y estilo `aria-current` heredados (typography.css y layout.css).
- No se tocan layout.css ni site-menu.css (congelados en tests/geist-pixel-extend.test.mjs). Si fuese
  imprescindible, ajuste con nota (REQ-93-18, precedente REQ-43-06).
- Sin JavaScript ni dependencias.

## Breakpoint (959/960 px) a partir de las mediciones

| Ancho | Con «Diseño de sistemas» (impl) |
|------:|------|
| 769-850 | desborde (+92 a +13 px), 3 líneas |
| 875 | sin desborde, 3 líneas |
| 900 | sin desborde, 2 líneas |
| ~950 | todavía 2 líneas (estimación del implementer) |
| 1000 / 1280 | 1 línea, sin desborde |

- 960 px es el primer múltiplo de 10 px por encima de la franja en la que la etiqueta se parte. El
  implementer **confirma** midiendo a 960 px que el enlace mide una línea (unos 19 px) y que no hay
  desborde. Si a 960 px aún se parte, sube el breakpoint al menor múltiplo de 10 px en que mida una línea
  (tope 1000 px, ya medido en una línea), actualiza el CSS y anota el valor final en el informe. Los REQ
  con 959/960 se leen con ese valor confirmado.
- A <= 959 px se mide «Diseño» a 769, 800, 850, 900 y 959 px: header sin desborde (scrollWidth <=
  clientWidth) y documento sin scroll horizontal. Si desborda, se para (REQ-93-14).

## Contenido

- Se añade `#diseno-de-sistemas` al final del campo `tags` de
  `src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md`. Nada más cambia.
- El post muestra un chip de tag más en su cabecera y en las tarjetas que pintan tags (esperado).

## Alternativas descartadas

- Etiqueta corta solo en <= 768 px: no resuelve el desborde de 769-875 px ni las 2-3 líneas hasta ~950 px.
- Subir el corte del menú hamburguesa a ~900 px: toca CSS congelado y cambia el header de tablet.
- Dos spans (corto y largo) con aria-hidden: más marcado para el mismo resultado.
- «Sistemas» como etiqueta corta: el humano pidió literalmente «Diseño».
