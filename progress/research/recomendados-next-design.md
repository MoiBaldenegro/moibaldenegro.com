# Análisis — Recomendados que no se renderizan + botón/lista fuera del design system

> Reporte bruto del humano: "La lista de recomendados no se renderiza chécalo,
> y el botón de siguiente tanto como la lista de recomendados sigue el design
> system o alinea diseño que ya tenemos".
> Fecha: 2026-09-17. Rol: spec_author (solo research + alta en backlog, sin código).

## Problema en palabras propias y alcance

El detalle `/posts/[id]` tiene dos piezas de recomendación editorial manual
(features 18-21, done): el botón "Siguiente artículo" (hacia `post.next`) y la
sección "Recomendados" (lista hacia `post.related`). Ambas se renderizan con
condicionales `{post.next && ...}` / `{post.related && ...}` en
`src/pages/posts/[id].astro` (72 líneas). El humano reporta dos cosas: (1) la
lista no se ve, y (2) ni el botón ni la lista se sienten parte del diseño
existente. Alcance: solo el detalle `/posts/[id]`, la curaduría `next`/`related`
de la colección `architecture` y la hoja `src/styles/post-next.css`
(71 líneas). Sin JS (enlaces estáticos prerendered), sin dependencias, solo
tokens existentes. Feature 10 en `in_progress`: no se toca.

## Causa raíz del no-render (verificada en disco)

La omisión es por diseño de la feature 21, no un bug de render: la vista
omite la sección cuando `related` es nulo (REQ-21-02), y solo el último
artículo declara `related`:

| Artículo | `next` | `related` | Qué ve el lector |
|----------|--------|-----------|------------------|
| 00-agilismo.md | `/posts/01-diseño-detallado` | — (nulo) | botón SÍ, lista NO |
| 01-diseño_detallado.md | `/posts/02-principios-del-diseno-de-software` | — (nulo) | botón SÍ, lista NO |
| 02-principios.md | `/posts/03-principios solid` | — (nulo) | botón SÍ, lista NO |
| 03-principios_solid.md | — (nulo) | `[/posts/00-agilismo, /posts/01-diseño-detallado]` | botón NO, lista SÍ |

El research `recommended-list.md` (D5) decidió curaduría mínima: solo el
último artículo declara `related` ("el caso que motiva el requerimiento").
Consecuencia directa: si el humano prueba en 00/01/02 —los tres primeros
artículos de la cadena— la lista "no se renderiza" por construcción. Y en 03
no hay botón. Cada página muestra como máximo una de las dos piezas, nunca
contexto completo. Hay dos lecturas posibles y ambas piden backlog: (a) el
humano esperaba recomendados en todos los artículos (curaduría incompleta),
o (b) esperaba que la lista apareciera aunque `related` sea nulo (fallback).
Se resuelve con curaduría complementaria en 00/01/02 (opción a, conserva el
diseño condicional REQ-21-02 sin redefinirlo) — decisión D3 de este informe.

## Diagnóstico de hrefs rotos (grep + lectura de frontmatter)

Aunque la pieza se renderice, los destinos NO coinciden con los `entry.id`
reales del glob. La ruta es `/posts/[id]` con `id = entry.id` (nombre de
fichero sin extensión, verificado en `getStaticPaths` de `[id].astro`: el mapa
es `postById.get(entry.id)` y `params: { id: entry.id }`). Comparativa
href declarado vs id real:

| Origen | href declarado | `entry.id` real (fichero) | Veredicto |
|--------|---------------|---------------------------|-----------|
| 00 `next` | `/posts/01-diseño-detallado` (guion) | `01-diseño_detallado` (guion-bajo, fichero `01-diseño_detallado.md`) | ROTO: guion vs guion-bajo → 404 |
| 01 `next` | `/posts/02-principios-del-diseno-de-software` | `02-principios` (fichero `02-principios.md`; el valor declarado es el `slug` del frontmatter, no el id) | ROTO: slug vs id → 404 |
| 02 `next` | `/posts/03-principios solid` (espacio literal) | `03-principios_solid` (guion-bajo + sin espacio) | ROTO: espacio sin encodear + guion-bajo → 404 |
| 03 `related[0]` | `/posts/00-agilismo` | `00-agilismo` | OK |
| 03 `related[1]` | `/posts/01-diseño-detallado` (guion) | `01-diseño_detallado` (guion-bajo) | ROTO: igual que el caso 00 → 404 |

El validador `expectNext`/`expectRelated` de `posts-repository.ts` (líneas
77-91) solo comprueba formato `/posts/.+`: deja pasar cualquier destino
inexistente (riesgo R2 ya asumido en `next-post-recommendation.md`). Resultado:
4 de 5 hrefs curados llevan a 404 aunque el botón/lista se pinten. La feature
de datos debe fijar los 5 valores exactos a `/posts/<entry.id>` en los
acceptance y auditar integridad referencial (todo `next`/`related` apunta a un
id existente), sin añadir validación de existencia al repositorio (está en
98/100 líneas: no hay margen para una segunda pasada).

## Defecto de contenido: la lista muestra el href crudo

`[id].astro` (líneas 63-67) pinta cada recomendado como
`<a href={href}>{href}</a>`: el texto visible es la ruta (`/posts/00-agilismo`)
en vez del título del artículo. Ningún item del design system muestra rutas
crudas: `item-html.ts` (feature 9) pinta título + miniatura + meta + tags, y el
héroe del detalle pinta título/autor/readtime. Resolver el título exige leer la
colección (o el repositorio) desde la vista; por regla 8 de arquitectura el
frontmatter solo hace imports y paso de datos, así que la resolución vive en un
módulo `.ts` nuevo (el repositorio no puede crecer: 98/100 líneas) que la vista
importa. Sin JS de runtime: todo resuelto en build (prerender).

## Qué significa "seguir el design system" aquí

Concreto, archivo por archivo (nada de "se ve mejor"):

1. **Solo tokens de `tokens.css`** (regla 6): `post-next.css` ya usa solo
   tokens, pero el botón combina `background: var(--color-accent)` con
   `color: var(--color-surface)` (texto oscuro `#101018` sobre violeta) y
   `border-radius: var(--radius-card)` (22px, radio de tarjeta aplicado a un
   botón). El lenguaje de botones existente es `search-results.css`:
   superficie + borde `var(--color-border)` + texto claro + radio de tarjeta
   solo en contenedores, píldora (`--radius-pill`) en tags. El botón debe
   hablar ese idioma.
2. **Lenguaje de lista de la feature 9** (`search-results.css`, modo lista):
   filas en columna separadas por hairline `var(--color-border)`, hover con
   wash `var(--color-surface)` y subrayado del título, tipografía
   `--font-sans`, meta en `--color-text-secondary`. La lista actual
   (`.post__related-list`) es una columna con `gap` sin hairlines, sin wash y
   con enlaces en `--color-accent` subrayados solo en hover: no comparte
   ningún patrón con el modo lista canónico.
3. **Encabezado y jerarquía del detalle** (`post.css`, 100/100 sin tocar):
   títulos en `--color-text`, meta en `--color-text-secondary`. El
   `.post__related-title` ya usa `--color-text`, pero sin tamaño/peso
   declarado: hereda el del navegador. Debe fijar escala con valores del
   sistema (sin px sueltos: la escala existente vive en `post.css` /
   `search-results.css`, p. ej. `1.35rem` del heading de resultados).
4. **Responsive 768px** (convención): ya existe en ambas piezas; se conserva.

## Riesgos y trabas

- `[id].astro` 72/100 y `post-next.css` 71/100: hay margen (~28 líneas) para
  títulos + reestilado sin superar el techo; si el reestilado no cabe, se
  compacta antes de pedir `blocked` (precedente features 18/20).
- `posts-repository.ts` 98/100 y `post.ts` 26: la feature de datos NO toca
  repositorio ni entidad (solo frontmatter `*.md`, fuera del conteo de 100
  líneas de `src/`), así que no hay riesgo de techo en datos.
- `post.css` 100/100: no se toca (la alineación vive en `post-next.css`).
- Ambigüedad resuelta por decisión documentada (D3): curaduría
  complementaria en 00/01/02 en vez de fallback automático; el fallback
  cambiaría el contrato REQ-21-02 y merece discusión separada si el humano lo
  pide tras ver la curaduría completa.

## Descomposición

| Complejidad | Features | Criterio |
|-------------|----------|----------|
| Media (contenido + UI) | **2** | Separar curaduría de datos vs. presentación, patrón 18/19 y 20/21 |

- **22 `next-related-hrefs-fix`** (base, primero): corrige los 5 hrefs a
  `/posts/<entry.id>` reales + declara `related` complementario en 00/01/02.
  Sin UI (sin `design.md`). `depends_on: []`.
- **23 `related-titles-design-align`** (presentación): la lista muestra el
  título de cada recomendado (módulo `.ts` nuevo, la vista solo importa) +
  botón y lista alineados al lenguaje de `search-results.css`/`post.css` con
  solo tokens. Con `design.md` (toca UI). `depends_on: [22]` (los títulos se
  resuelven sobre hrefs ya íntegros).
- Cada una independiente y testeable con `node:test` (inspección + unidad).
  `status: pending` en ambas; ninguna requiere dependencias externas ni supera
  100 líneas, así que ninguna va `blocked`.
