# Análisis — Lista de recomendados (`related`) en el detalle del post

> Requerimiento bruto del humano: "Ahora vamos agregar una más que será un array
> de url, que serán para renderizar una lista de recomendados por si es ya el
> último digamos y no hay un siguiente que tenga recomendaciones de a dónde ir a
> nuevos artículos o que sean complementarios al tema".

## Problema en palabras propias y alcance

El detalle de un artículo hoy solo recomienda "lo siguiente" (botón
`Siguiente artículo` hacia `post.next`, features 18-19). Cuando el lector llega
al **último artículo de la cadena** (`next` nulo) no hay ninguna recomendación
de a dónde ir, y tampoco existe forma de sugerir lecturas **complementarias al
tema** aunque sí haya siguiente. El humano pide un **array de urls** por
artículo para renderizar una **lista de recomendados** que cubra ambos casos.

Alcance: solo la colección `architecture` (la única con `next`), solo el
detalle `/posts/[id]`, curaduría manual en frontmatter (igual que `next`), sin
JS de runtime, sin dependencias, sin tokens nuevos.

## Estado actual (features 18-19, done)

| Capa | Archivo | Estado |
|------|---------|--------|
| Esquema | `src/content.config.ts` (31 líneas) | `next: z.string().optional()` (línea 27) |
| Entidad | `src/domain/entities/post.ts` (23 líneas) | `readonly next: string \| null` (línea 22) |
| Repositorio | `src/domain/repositories/posts-repository.ts` (99/100 líneas) | `expectNext` valida formato `/posts/<id>`, nulo si se omite (líneas 83-90) |
| Vista | `src/pages/posts/[id].astro` (60 líneas) | Pie `post__next` con enlace "Siguiente artículo", omitido si `next` nulo (líneas 54-58) |
| Estilos | `src/styles/post-next.css` (36 líneas) | Botón con solo tokens, responsive 768px |

Cadena curada: `00-agilismo → 01 → 02 → 03`, el último
(`03-principios_solid.md`) sin `next`. Specs: `specs/18_next-post-data/`,
`specs/19_next-post-button/`.

## Encaje del nuevo array

- **Nombre: `related`.** Corto, en inglés como `next`, y convencional para
  "artículos relacionados". La etiqueta visible en español es "Recomendados"
  (palabra del humano). Alternativa `recommended` descartada: más larga sin
  aportar precisión (D1).
- **Formato de cada item: `/posts/<id>`.** Idéntico al de `next` (mismo
  validador de ruta interna), reutiliza el contrato que el implementer y los
  tests ya conocen (D2).
- **Tipo: `z.array(z.string()).optional()` → `readonly string[] | null`.**
  Omitido = nulo (igual que `next`); declarado = arreglo no vacío de rutas
  válidas, cualquier otra cosa lanza `PostsDataError` (errores explícitos,
  sin fallos silenciosos) (D3).
- **Convivencia con `next`:** campos independientes en el mismo frontmatter.
  La vista muestra el botón de siguiente cuando hay `next` Y la lista cuando
  hay `related`; si coexisten, aparecen ambos (la lista complementa, no
  sustituye). Cuando `next` es nulo y hay `related`, la lista es la única
  recomendación: el caso "último artículo" del humano (D4).
- **Contenido mínimo:** el último artículo (`03`) declara `related` con al
  menos dos rutas (es el caso que motiva el requerimiento); el resto de
  artículos puede declarar `related` complementario sin obligación (D5).
- **Presentación:** sección bajo el contenido en `[id].astro` con encabezado
  "Recomendados" y enlaces a cada ruta; estilos extendiendo `post-next.css`
  (36 líneas, hay margen; `post.css` sigue en 100/100 y no se toca,
  precedente D4 de la feature 19); cero JS (enlace estático prerendered) (D6).

## Riesgos y trabas

- `posts-repository.ts` está en **99/100 líneas**: el nuevo validador
  `expectRelated` obliga a compactar para cerrar en ≤100 (misma nota que dejó
  la feature 18 en 96/100). No justifica `blocked` (hay margen compactando)
  pero el acceptance lo audita como REQ-20-07.
- `[id].astro` (60 líneas) y `post-next.css` (36 líneas) tienen margen
  suficiente; sin riesgo de límite.
- Ambigüedad resuelta por decisión documentada (no preguntada al humano por
  delegación explícita en el encargo: "nombre probable `related`/`recommended`",
  "probablemente 1-2"): nombre `related` (D1) y 2 features (datos +
  presentación, patrón 18/19).

## Descomposición

| Complejidad | Features | Criterio |
|-------------|----------|----------|
| Media (datos + UI) | **2** | Separar capa de datos vs. presentación, como 18/19 |

- **20 `related-posts-data`** (base, primero): esquema + entidad +
  repositorio + curaduría del último artículo. `depends_on: [18]`.
- **21 `related-posts-list`** (presentación): sección "Recomendados" en
  `[id].astro` + estilos. `depends_on: [19, 20]`.
- Cada una independiente y testeable con `node:test` (inspección + unidad).
  `status: pending` en ambas; nada requiere dependencias externas ni supera
  100 líneas con compactación, así que ninguna va `blocked`.
