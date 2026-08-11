# Informe de implementación — feature 17 article-card-images

- **Feature:** 17 — article-card-images ("Imagen de artículo consistente en las cards de latest-articles")
- **Implementer:** agente implementador
- **Fecha:** 2026-08-11
- **Spec:** `specs/17_article-card-images/requirements.md` (REQ-17-01..09) + `specs/17_article-card-images/design.md` (Decisiones 1-7)
- **Análisis previo:** `progress/research/article-card-images.md`
- **Estado en `feature_list.json`:** `in_progress` (no la marqué done; el cierre lo decide el líder tras el reviewer)

## 1. Ciclo rojo/verde (test-first, OBLIGATORIO)

### ROJO — `node --test tests/article-card-images.test.mjs` (antes de implementar)

Escribí PRIMERO `tests/article-card-images.test.mjs` contra la spec (REQ-17-01..09)
y el design.md (Decisiones 4 y 5). Salida capturada (extracto de los 7 fallos):

```
# Subtest: REQ-17-01: el <img> de la card lleva la clase latest-articles__image y referencia post.img
not ok 1 - REQ-17-01: el <img> de la card lleva la clase latest-articles__image y referencia post.img
  error: 'el <img> no lleva la clase latest-articles__image (REQ-17-01)'
  actual: '<img src={`/assets/content/${post.img}`} alt=""/>'
# Subtest: REQ-17-06: el <img> declara alt interpolado con el título del artículo
not ok 2 - REQ-17-06: el <img> declara alt interpolado con el título del artículo
  error: 'el <img> no usa alt={post.title} (REQ-17-06)'
# Subtest: REQ-17-07: el <img> declara loading="lazy" para diferir la carga
not ok 3 - REQ-17-07: el <img> declara loading="lazy" para diferir la carga
  error: 'el <img> no declara loading="lazy" (REQ-17-07)'
# Subtest: REQ-17-02/03/04: la regla limita al ancho, fija proporción 16:9 y recorta con cover
not ok 4 - REQ-17-02/03/04: la regla limita al ancho, fija proporción 16:9 y recorta con cover
  error: 'latest-articles.css no declara la regla .latest-articles__image (REQ-17-01/02)'
# Subtest: REQ-17-05: radio, borde y margen de la imagen desde los tokens del diseño
not ok 5 - REQ-17-05: radio, borde y margen de la imagen desde los tokens del diseño
  error: 'latest-articles.css no declara la regla .latest-articles__image (REQ-17-01/02)'
# Subtest: Decisión 4 (design.md): la regla declara display block (sin hueco de línea base)
not ok 6 - Decisión 4 (design.md): la regla declara display block (sin hueco de línea base)
  error: 'latest-articles.css no declara la regla .latest-articles__image (REQ-17-01/02)'
# Subtest: REQ-17-08: la regla de la imagen no introduce colores sueltos (solo tokens)
not ok 7 - REQ-17-08: la regla de la imagen no introduce colores sueltos (solo tokens)
  error: 'latest-articles.css no declara la regla .latest-articles__image (REQ-17-01/02)'
...
1..11
# tests 11
# pass 4
# fail 7
```

7/11 tests en rojo (4 pass son invariantes preexistentes: límite de 100 líneas de
la hoja, REQ-17-09 tokens.css intacto y la convención del componente): el `<img>`
no tiene clase/alt/loading y la regla `.latest-articles__image` no existe.

### VERDE (implementación)

1. `src/components/latest-articles.astro:16` →
   `<img class="latest-articles__image" src={`/assets/content/${post.img}`} alt={post.title} loading="lazy"/>`
   (REQ-17-01, REQ-17-06, REQ-17-07; el frontmatter sigue siendo solo imports +
   interpolación, sin lógica).
2. `src/styles/latest-articles.css` → regla `.latest-articles__image` (Decisión 1:
   mismo archivo de la feature 10, +13 líneas → 75 total).
3. Test de la feature: **11/11 ✔**:

```
1..11
# tests 11
# pass 11
# fail 0
```

## 2. Archivos tocados y por qué

| Archivo | Por qué |
|---------|---------|
| `src/components/latest-articles.astro` (1 línea modificada, 25 total) | REQ-17-01/06/07: clase BEM `latest-articles__image` en el `<img>`, `alt={post.title}` (Decisión 5: el título es el texto alternativo de una cubierta; sin tocar el dominio) y `loading="lazy"` (Decisión 6: atributo HTML nativo, la sección está bajo el hero). |
| `src/styles/latest-articles.css` (regla nueva, 75 líneas total) | REQ-17-02/03/04/05/08: la imagen es un bloque uniforme — `display: block` (Decisión 4, elimina el hueco de línea base), `width: 100%` (REQ-17-02), `aspect-ratio: 16 / 9` (REQ-17-03, valor propio del componente justificado en design.md, NO token), `object-fit: cover` (REQ-17-04), `border-radius: var(--radius-card)` + `border: 1px solid var(--color-border)` (REQ-17-05, lenguaje visual de `.latest-articles__card`: panel dentro del panel), `margin: var(--gap-card) 0` (REQ-17-05/Decisión 4). |
| `tests/article-card-images.test.mjs` (nuevo, 217 líneas) | Test-first: verifica REQ-17-01..09 + Decisión 4 del design.md y las convenciones (componente ≤100 líneas, sin lógica, sin estilos embebidos). Inspección de archivos sin build (patrón de features previas). |
| `feature_list.json` | Solo `status` de la feature 17: `pending` → `in_progress`. |
| `progress/current.md`, `progress/impl_17_article-card-images.md` | Bitácora e informe de sesión (regla anti-silencio). |

NO toqué: `src/styles/tokens.css` (REQ-17-09, conserva 96 líneas), dominio
(`post.ts`/`posts-repository.ts`), `src/content.config.ts`, artículos ni
`public/assets/content/` (datos del usuario), motor GOL ni features 14-16, ni
tests de features previas.

## 3. Cobertura REQ por REQ

| REQ | Qué exige | Cómo se cumple | Verificado por |
|-----|-----------|----------------|----------------|
| REQ-17-01 | `<img>` con clase `latest-articles__image` referenciando `post.img` | `class="latest-articles__image"` + `src={`/assets/content/${post.img}`}` | Test (extrae la etiqueta `<img>` y asevera clase + `post.img`) + `dist/index.html` |
| REQ-17-02 | `width: 100%` | `width: 100%` en `.latest-articles__image` | Test (regex sobre la regla) + bundle CSS |
| REQ-17-03 | Proporción fija 16:9 | `aspect-ratio: 16 / 9` (valor propio, no token — design.md) | Test + bundle CSS `aspect-ratio:16/9` |
| REQ-17-04 | Recorte sin deformar | `object-fit: cover` | Test + bundle CSS |
| REQ-17-05 | Radio/borde/margen por tokens | `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border)`, `margin: var(--gap-card) 0` | Test (regex sobre la regla) + bundle CSS |
| REQ-17-06 | `alt` = título del artículo | `alt={post.title}` | Test + `dist/index.html` (`alt="Agilismo, diseño y fragilidad"`) |
| REQ-17-07 | Carga diferida | `loading="lazy"` | Test + `dist/index.html` |
| REQ-17-08 | Hoja ≤100 líneas y sin colores sueltos | 75/100 líneas; la regla y la hoja no contienen hex/rgb()/rgba() | Test (conteo `wc -l` y regex hex/rgba sobre la regla y la hoja) + `audit-design-tokens.mjs` |
| REQ-17-09 | tokens.css sin cambios | 96 líneas exactas, sin tokens `--aspect-`/`--ratio-`/`--radius-image` | Test + verificación de que el archivo no se tocó |

## 4. Desviaciones justificadas

Ninguna. La implementación sigue exactamente el design.md (Decisiones 1-7):
regla única en la hoja existente, sin archivos nuevos, sin tokens nuevos, `alt`
desde el título (Decisión 5), `loading="lazy"` (Decisión 6) y sin cambios en la
media query móvil existente (Decisión 7). El test añade un aserto de `display:
block` (Decisión 4 del design.md), que no es un REQ pero sí una decisión de
diseño documentada; el resto de asertos mapean 1:1 a los REQ.

## 5. Verificación final

- Suite completa EN SECUENCIA `node --test "tests/**/*.test.mjs"` → **144/144 ✔** (133 previos + 11 nuevos; `# pass 144`, `# fail 0`).
- `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.
- `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
- `pnpm build` → `2 page(s) built in 756ms` · `Complete!`.
- `./init.sh` (Git Bash) → todas las comprobaciones ✔:

```
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

- **Verificación en `dist/` (build real, REQ-17-01/06/07 + CSS):**

```
$ grep -o '<img class="latest-articles__image"[^>]*>' dist/index.html
<img class="latest-articles__image" src="/assets/content/arch00.webp" alt="Agilismo, diseño y fragilidad" loading="lazy">

$ grep -o 'latest-articles__image{[^}]*}' dist/_astro/*.css
latest-articles__image{aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius-card);border:1px solid var(--color-border);width:100%;margin:var(--gap-card) 0;display:block}
```

La imagen real del usuario (`arch00.webp`, edición concurrente) se renderiza con
la clase, el `alt` con el título real ("Agilismo, diseño y fragilidad"),
`loading="lazy"` y la regla CSS con los tokens — ya no sale a tamaño natural.

## 6. Resultado final

`./init.sh` → **"El entorno está perfecto"** (formato ✔, 144/144 tests ✔, build ✔).
Feature 17 implementada en verde, sin tocar dominio ni tokens. Listo para que el
líder lance al reviewer.
