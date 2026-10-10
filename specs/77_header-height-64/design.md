# Diseño — Header de escritorio a 64 px (feature 77 header-height-64)

## Contexto visual

- Barra sticky compartida `.site-navbar` (src/layouts/Layout.astro, src/styles/layout.css y search-bar.css): logo 72×25, enlaces About, Arquitectura, @moibaldenegro y buscador de 240 px a la derecha.
- Estado actual: en escritorio (>768 px) el nav mide 74 px (min-height: var(--header-height)) y la barra 75 px con el borde; scroll-padding-top de 74 px.
- Estado deseado (humano): barra más fina, nav de 64 px y barra de 65 px, todo el contenido centrado verticalmente sin desbordar; scroll-padding-top de 64 px. Móvil (≤768 px) idéntico al actual.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--header-height` | 74px → **64px** | min-height del nav y scroll-padding-top de escritorio |
| `--header-height-mobile` | 170px (sin cambios) | scroll-padding-top en ≤768 px (feature 61) |
| `--gap-card` | 14px (sin cambios) | padding-block del nav en ≤768 px (feature 61) |
| `--color-border-strong` | sin cambios | borde inferior de 1 px de la barra |

## Decisiones y constraints

- Decisión 1 (enmendada, review_77 ronda 1): el alto se cambia solo con el valor del token existente; min-height y scroll-padding-top ya lo consumen, sin tokens nuevos y tokens.css se queda en 97 líneas (los tests de conteo no cambian). search-bar.css no se toca. layout.css sí recibe una regla: al final del archivo, junto a las demás media queries, `@media (min-width: 769px) { .site-navbar a img { display: block; } }` (REQ-77-15). Motivo medido: el logo 72×25, inline y alineado a la línea de base, quedaba 2 px por encima del centro del nav (ya pasaba con 74 px) e incumplía REQ-77-06 (±1 px). Se acota a >768 px porque en móvil bajaba el header de 375 px de 165 a 162 px (REQ-77-10, REQ-77-16). Medido después: logo, enlaces y buscador centrados (0 px) a 1280 y 1440 y móvil idéntico.
- Decisión 2: el centrado vertical lo sigue dando `display: flex; align-items: center` del nav. Presupuesto de altura: input del buscador ≈ 41 px (10 + 10 de padding, ~19 de línea y 2 de borde), logo 25 px y enlaces ~19 px, todos < 64 px, con ~11 px de aire por lado para el subrayado (bottom −6 px) y el anillo de foco (2 + 2 px).
- Decisión 3: en ≤768 px el nav se envuelve en dos filas (~165 px con el padding de la 61), por encima de los 64 px del min-height, así que el alto móvil no cambia; --header-height-mobile y padding-block se quedan como están.
- Decisión 4: la sección horizontal de la portada (features 72-76) usa sticky con top 0 y no lee el token; el documento sube 10 px en escritorio. Los tests de la 72-76 no miden posiciones del DOM (1215 en latest-cards-entrance es un argumento de una función pura), así que no se tocan.
- Decisión 5 (enmienda, review_77 ronda 1): scroll-padding-top sigue en var(--header-height) (64 px) y el header mide 65 px por su borde de 1 px, así que el destino de un ancla puede quedar 1 px bajo ese borde (#contenido a 1440: top 64 frente a bottom 65; ya pasaba con 74/75). REQ-77-09 se mide contra el borde inferior del nav (o del header con 1 px de tolerancia). Se descarta `calc(var(--header-height) + 1px)`: reescribiría REQ-77-08 y REQ-51/61-03 y añadiría un px escrito a mano; el destino (`<main>`) no tiene fondo ni borde y el impacto visual es nulo.
- Ajuste de test (precedente REQ-43-06): REQ-51-01 de tests/header-mobile-reflow.test.mjs pasa de 74px a 64px con nota en el encabezado. Test nuevo tests/header-height-64.test.mjs, test-first.
- Verificación real: Chrome headless + CDP sobre `astro preview` a 1280×800, 1440×900 y 375×812, midiendo el alto de .site-navbar, scrollHeight/clientHeight del nav, los centros verticales (logo, enlaces e input), un ancla (#contenido y un encabezado de post) y el alto móvil antes/después; capturas antes/después en el informe. Se mide además a 800 px para documentar si el nav se envuelve por encima de 768 px (riesgo preexistente, fuera de alcance).
- Restricciones: sin dependencias, ≤100 líneas por archivo, estilos solo en src/styles, solo tokens, cero JavaScript nuevo.

## Alternativa descartada

- Alternativa considerada: token nuevo (p. ej. --header-height-desktop: 64px) conservando --header-height en 74px.
- Motivo del descarte: duplica el concepto y deja un token muerto; el token existente representa exactamente el alto de escritorio.
- Alternativa considerada: reducir el padding del input del buscador para ganar aire.
- Motivo del descarte: no hace falta (cabe con margen) y cambiaría el aspecto del buscador, que el humano no pidió tocar.
