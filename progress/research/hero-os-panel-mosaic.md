# Análisis — Mosaico del hero estilo panel de sistema operativo (feature 99 hero-os-panel-mosaic)

Fecha: 2026-10-16. Autor: spec_author. Captura: `C:/Users/Moises/Desktop/acomodo.PNG`.

## Notas humanas (literales, 2026-10-16)

1. «no necesariamente tienen que estar alineadas las cards, de echo al contrario si todas tienen patrones diferentes mejor por que queremos similar el menu panel como de un sistema operativo sabes?»
2. «lo importante es que cada una de las que quedan grande sea la que tiene mas relevancia sea una tecnologia mas pro».

## Qué pide, en mis palabras

- Romper la alineación de columnas del mosaico de la 98: cada par de filas con un patrón de anchos distinto, como los tiles de un menú de inicio, y las cards grandes sin quedar una encima de otra.
- Las cards grandes deben ser las tecnologías más relevantes del perfil; redes y herramientas de apoyo, pequeñas.
- Corregir el logo de CLOUDFLARE, que hoy se ve cortado («CLOU»).

## Lo que muestra la captura (estado de la 98)

- Filas 5-6: REACT 5x2 + RUST. Filas 7-8: TS, CSS, AWS, CLAUDE CODE (doble, cols 7-10), NESTJS. Filas 9-10: CLOUDFLARE, CLAUDE, BUN, YOUTUBE (doble, cols 7-10), GITHUB. Las dobles caen siempre en el 4.º hueco (`ROW_WIDTHS = [2, 2, 2, 4, 2]` en `src/domain/hero-grid-layout.ts`), por eso las columnas quedan alineadas.
- CLOUDFLARE: el símbolo `#cloudflare` (viewBox 512x76, nube + texto) a `--icon-width: 34px` y scale 5 desborda por la derecha; REQ-98-31 solo exigía la nube.

## Relevancia (fuente: `src/data/about.json`)

- Subtítulo del perfil / headline: Senior Software Engineer • Systems Architect • **Node.js • NestJS • TypeScript** • Clean Architecture • DDD • AWS • Cloudflare Workers • OWASP Top 10 • Rust • WebAssembly.
- Núcleo: Node.js, NestJS, TypeScript, AWS, Cloudflare Workers, Rust. Apoyo: React (frontend), HTML, CSS, Bun, Claude, Claude Code. Redes: YouTube, GitHub.
- El mosaico de 10 filas tiene sitio para 3 grandes (más HTB) sin huecos: elegidas NODE JS, NESTJS y TYPESCRIPT (las tres primeras). AWS, Cloudflare y Rust quedan pequeñas pero arriba, junto al perfil.

## Decisión (detalle en `specs/99_hero-os-panel-mosaic/design.md`)

- Se mantiene «5 cards por fila inferior con 1 doble» (98, no revocado) y se alterna la posición de la doble: `4-2-2-2-2` / `2-2-4-2-2`. Zona superior `[5x4, 2x2, 2x2, 2x2, 5x2]` con la grande a la derecha (cols 8-12). Resultado en escalera: grandes en cols 8-12 → 1-4 → 5-8.
- Campo booleano `featured` en el JSON (default false): los huecos grandes se llenan con las `featured` en orden del JSON y los pequeños con el resto (tech y después redes). Error de build si el número de `featured` no cuadra con los huecos grandes o si una red es `featured`.
- Sin CSS nuevo de spans (ya existen 2/4/5 y 2/4). Sin `style=`, sin JS de cliente, determinista.
- Alternativa (tile de 2 filas de alto) descartada por defecto: rompe el «5 por fila» de la 98.

## Qué toca

- Datos: `src/data/hero-cards.json` (orden, `featured`, iconWidth de las cards que cambian de tamaño y de cloudflare).
- Dominio: `src/domain/entities/hero-card.ts` (`featured`), `src/domain/repositories/hero-cards-parse.ts` (92 líneas; default y validación), `src/domain/hero-grid-layout.ts` (89 líneas; plantilla con huecos grandes y colas).
- Estilos: `src/styles/hero-card.css` (98 líneas; bases de icono y ajustes por tramo).
- Tests (nota «Ajuste feature 99 (precedente REQ-43-06)»): `hero-mosaic-layout`, `hero-cards-unique-tech`, `hero-cards-icon-fit`, `hero-card-kinds-domain` y los que fijen orden o celdas.

## Riesgos y trabas

- Límite de 100 líneas en `hero-card.css` (98) y `hero-grid-layout.ts` (89): compactar ajustes por tramo y, si hace falta, sacar las plantillas a `src/domain/hero-grid-template.ts`.
- Iconos de NODE JS (5x2), NESTJS y TYPESCRIPT (4x2) crecen; REACT, CLAUDE CODE y YOUTUBE (2x2) encogen: hay que medirlos con CDP a 375/800/1024/1280/1600 (criterios 97/98: centro dentro y ≥ 40 % de área; sin tapar el título en los de bajo contraste).
- En ≤ 1200 px los spans se anulan (6 columnas / 1 columna): solo cambia el orden de las cards; el scroll horizontal del header a 800 px es de la 93 (blocked), fuera de alcance.
- Verificación: Chrome headless + CDP con los scripts base del scratchpad (`cdp98.mjs`, `cdpbase.mjs`); capturas en `progress/research/hero99/`.
