# Diseño — article-card-images

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La sección de artículos de la portada (`src/components/latest-articles.astro`): cada card (`latest-articles__card`) muestra la imagen del artículo entre la descripción y los tags.
- ¿Estado actual y estado deseado? Actual: `<img src={`/assets/content/${post.img}`} alt=""/>` sin clase ni reglas → la imagen sale a tamaño natural (gigante; caso real: `arch00.webp` en `00-agilismo.md`). Deseado: la imagen es un bloque uniforme en todas las cards — ancho del contenido, proporción fija 16:9, recorte `cover`, radio/borde/margen coherentes con la card, `alt` desde el título y carga diferida.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-card` | de tokens.css (22px) | Radio de la imagen = radio de la card (panel dentro del panel) |
| `--color-border` | de tokens.css | Borde de la imagen = borde de la card |
| `--gap-card` | de tokens.css (14px) | Margen vertical de la imagen para el ritmo de la card |

> **No se añaden tokens.** `aspect-ratio: 16 / 9` es un valor propio del
> componente, no un token: la regla "Tokens, no valores sueltos"
> (`docs/architecture.md` §6) cubre colores, espaciados, radios, sombras y
> tipografías; la proporción de aspecto es una característica de layout de esta
> card concreta, no un valor recurrente del sistema. `tokens.css` está en 96
> líneas (límite 100, regla 12) y el precedente de la feature 16 es no crecer
> sin necesidad: un grupo `aspect` para un único uso engordaría el archivo y
> dejaría un token sin consumidores. El valor queda documentado aquí y
> verificado por test (REQ-17-03, REQ-17-09).

## Decisiones y constraints

- Decisión 1 (enfoque): el arreglo es presentacional — clase BEM nueva `latest-articles__image` en el `<img>` del componente + una regla en la hoja existente. Sin archivos nuevos (la hoja está a 62/100 líneas; la regla nueva ≈10 líneas).
- Decisión 2 (dimensiones uniformes): `width: 100%` (ancho del contenido de la card) + `aspect-ratio: 16 / 9` (altura derivada del ancho → todas las cards con la misma proporción) + `object-fit: cover` (recorta sin deformar). Sin aspect-ratio las cards tendrían alturas dispares según la imagen natural; sin cover la imagen se deformaría.
- Decisión 3 (coherencia con la card): `border-radius: var(--radius-card)` y `border: 1px solid var(--color-border)` — exactamente el lenguaje visual de `.latest-articles__card`; la imagen es un panel dentro del panel. Alternativa descartada: radio menor con token nuevo `--radius-image` (engorda tokens.css y rompe la coherencia).
- Decisión 4 (layout de la imagen): `display: block` (elimina el hueco de línea base de las imágenes inline) y `margin: var(--gap-card) 0` (ritmo vertical con el token de espaciado existente).
- Decisión 5 (accesibilidad sin tocar el dominio): el `alt` sale del título del artículo (`alt={post.title}`) — para una cubierta el título es el texto alternativo correcto y el campo ya existe en la entidad `Post` (feature 7); no se añade `alt` al dominio (schema + entidad + repositorio + migración de frontmatters sería otra feature de dominio y no aporta a la consistencia visual). El componente solo interpola datos existentes (regla "Lógica separada de la UI").
- Decisión 6 (rendimiento): `loading="lazy"` en el `<img>` — la sección está bajo el hero; diferir la carga de las imágenes fuera del viewport inicial, en línea con la optimización de la feature 16. Atributo HTML nativo, sin JS de runtime (regla "Estático por defecto").
- Decisión 7 (responsive): la imagen escala con el ancho de la card (`width: 100%` + `aspect-ratio`) en todos los breakpoints; no requiere regla en la media query móvil (la media query existente de la hoja queda al final, sin cambios).
- Restricciones del proyecto aplicables: tokens (no valores sueltos — radio/borde/margen por token, 16/9 justificado), ≤100 líneas por archivo (hoja a 62 + ~10 = margen seguro; tokens.css intacto), estilos separados de la UI (regla en `latest-articles.css`), sin dependencias, estático por defecto (`loading` es atributo HTML, no JS).

## Alternativa descartada

- Alternativa considerada: añadir el campo `alt` a la entidad `Post` y al schema de contenido (`src/content.config.ts`) para textos alternativos propios por artículo.
- Motivo del descarte: es un cambio de dominio (schema + entidad + repositorio + migración de todos los frontmatters de la colección) que no resuelve la consistencia visual pedida ("la imagen gigante"); el título del artículo es el texto alternativo correcto de una cubierta. Si el usuario quiere `alt` personalizados por artículo, se abre otra feature de dominio aparte.
