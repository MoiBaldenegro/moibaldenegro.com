# Research — article-card-images (feature 17)

> Análisis del spec_author (2026-08-11). Petición del usuario: "si agregué
> imagen válida en el post, mete feature para que estas cards tengan siempre
> consistencia con la imagen, porque salió una imagen gigante".

## 1. Problema (reafirmado)

El usuario añadió una imagen real (`arch00.webp` en `public/assets/content/`,
mtime 11:01, edición concurrente ya documentada) al frontmatter del artículo
`src/content/architecture/00-agilismo.md` (`img: arch00.webp`). La card de
`src/components/latest-articles.astro:16` renderiza
`<img src={/assets/content/${post.img}} alt=""/>` **sin clase, sin width/height,
sin reglas CSS**: la imagen se muestra a tamaño natural (gigante) y rompe la
consistencia de las cards de la sección de artículos de la portada.

## 2. Alcance

- **Toca:** `src/components/latest-articles.astro` (añadir clase BEM + `alt` +
  `loading` al `<img>`) y `src/styles/latest-articles.css` (una regla para la
  imagen, solo tokens, ≤100 líneas).
- **NO toca:** dominio `Post` (entidad/repositorio, feature 7), schema de
  contenido (`src/content.config.ts`), artículos ni imágenes (datos del
  usuario), `src/styles/tokens.css` (decisión 3, se protege con REQ-17-09).

## 3. Evidencia en disco

- `latest-articles.astro:16` — `<img src={`/assets/content/${post.img}`} alt=""/>` sin clase ni atributos de rendimiento.
- `latest-articles.css` (62 líneas) — BEM `latest-articles__*`, solo tokens, media query móvil al final; **cero reglas para la imagen**.
- `tokens.css` (96 líneas) — grupos: color (fondo/superficie/texto/borde/acento/marca/hero/perfil), radio, espaciado, contenedor, sombra, transición, tipografía, opacidad, size. **No hay grupo `aspect`/`ratio`.**
- Entidad `Post` (feature 7, aprobada): `img: string` readonly; el schema valida `img: z.string()` y `PostsRepository` lanza `PostsDataError` si falta (no hay fallo silencioso).
- `public/assets/content/arch00.webp` existe (imagen válida del usuario).
- Test existente `tests/articles-ui-refactor.test.mjs` (REQ-10-03): exige que color/border/border-radius/transition usen `var()` y que la hoja consuma los 8 tokens del design.md de la feature 10 (`--color-surface`, `--color-text`, `--color-text-secondary`, `--color-border`, `--color-accent`, `--radius-card`, `--gap-card`, `--transition-default`). La regla nueva usa 3 de esos tokens → sin regresión.

## 4. Decisiones

1. **Enfoque: solo CSS + clase (una feature).** El problema es puramente
   presentacional: la imagen carece de reglas. Una clase BEM
   `latest-articles__image` + una regla en la hoja existente resuelve la
   consistencia. No hay capa de datos que tocar (img ya está validado por la
   feature 7) → complejidad simple, una sola feature (la petición es una sola
   cosa: que la imagen sea consistente en las cards).
2. **Dimensiones uniformes:** `width: 100%` (ancho del contenido de la card) +
   `aspect-ratio: 16 / 9` (altura derivada del ancho → todas las cards con la
   misma proporción, sin importar la imagen natural) + `object-fit: cover`
   (recorta el excedente sin deformar). Sin aspect-ratio las alturas de card
   dependerían de cada imagen; sin cover la imagen se deformaría.
3. **`aspect-ratio: 16 / 9` como valor propio del componente, NO token.** La
   regla 6 de `docs/architecture.md` ("Tokens, no valores sueltos") cubre
   colores, espaciados, radios, sombras y tipografías; la proporción de aspecto
   es una característica de layout de esta card concreta, no un valor recurrente
   del sistema (nada más en el sitio usa aspect-ratio). Además `tokens.css`
   está en 96/100 líneas y el precedente de la feature 16 es no crecer sin
   necesidad: un token de grupo `aspect` para un único uso engordaría el archivo
   y quedaría sin consumidores. Queda documentado en `design.md` y verificado
   por test (REQ-17-03, REQ-17-09: tokens.css intacto).
4. **Radio, borde y margen con tokens existentes:** `border-radius:
   var(--radius-card)` (22px, el mismo de la card) y `border: 1px solid
   var(--color-border)` (el mismo borde de la card) → la imagen es un "panel
   dentro del panel" con el mismo lenguaje visual; `margin: var(--gap-card) 0`
   para el ritmo vertical. Cero tokens nuevos. (Alternativa de radio menor con
   token nuevo `--radius-image` descartada: engorda tokens.css y rompe la
   coherencia con la card.)
5. **Alt sin tocar el dominio:** el dominio Post no tiene `alt`; añadirlo
   exigiría schema + entidad + repositorio + migrar los frontmatters (otra
   feature, scope de dominio). Para una cubierta de artículo el texto
   alternativo correcto es el título → `alt={post.title}` en el componente
   (interpola un campo existente, sin lógica: cumple "Lógica separada de la
   UI"). Si el usuario quiere alt propios por artículo, se abre feature aparte.
6. **`loading="lazy"`:** la sección está bajo el hero; diferir la carga de las
   imágenes fuera del viewport inicial es rendimiento (en línea con la
   optimización de la feature 16). Atributo HTML nativo, sin JS de runtime
   (regla "Estático por defecto" intacta).
7. **`display: block`:** elimina el hueco de línea base de las imágenes
   inline (baseline descender) que descolocaría la alineación con `width: 100%`.
8. **Responsive:** la imagen escala con el ancho de la card (`width: 100%` +
   `aspect-ratio`) en todos los breakpoints; la regla no necesita media query
   propia (la media query móvil existente de la hoja queda al final, sin
   cambios).

## 5. Riesgos y trabas

- `tokens.css` en 96/100 líneas → no se toca (REQ-17-09 lo protege).
- `latest-articles.css` en 62 líneas: la regla nueva (~10 líneas) deja margen
  amplio hasta 100 (REQ-17-08).
- El test existente de la feature 10 exige `var()` en border/border-radius →
  la regla nueva los usa por token (decisión 4); no rompe el contrato.
- `scripts/audit-design-tokens.mjs` solo vigila colores (hex/rgba); el test de
  esta feature verifica además radios/valores para no depender solo del guardián.
- La edición concurrente del usuario (imagen + frontmatter) es externa y ya
  validada; la feature no la toca.

## 6. Trazabilidad REQ → acceptance

| REQ | Qué verifica | Acceptance |
|-----|--------------|------------|
| REQ-17-01 | Clase `latest-articles__image` en el `<img>` | 1, 2 |
| REQ-17-02 | `width: 100%` en la hoja | 1, 3 |
| REQ-17-03 | `aspect-ratio: 16 / 9` (valor propio, no token) | 1, 3, 5 |
| REQ-17-04 | `object-fit: cover` (recorte sin deformar) | 1, 3 |
| REQ-17-05 | Radio/borde/margen por tokens `--radius-card`, `--color-border`, `--gap-card` | 1, 4 |
| REQ-17-06 | `alt` = título del artículo | 1, 2 |
| REQ-17-07 | `loading="lazy"` | 1, 2 |
| REQ-17-08 | Hoja ≤100 líneas, solo tokens, sin hex/rgba | 1, 4 |
| REQ-17-09 | tokens.css sin cambios (96 líneas, sin grupo aspect) | 1, 5 |

## 7. Resultado

Feature 17 `article-card-images` dada de alta (`status: pending`), spec
`specs/17_article-card-images/` (requirements.md + design.md — toca UI) y
`check-format.mjs` en verde.
