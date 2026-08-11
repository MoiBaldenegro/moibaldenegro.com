# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

**feature 17 `article-card-images`** — Imagen de artículo consistente en las cards de latest-articles.
- **Inicio:** 2026-08-11 · implementer
- **Estado:** `in_progress` (test-first en curso; el cierre lo decide el líder tras el reviewer)
- **Plan:**
  - Escribir PRIMERO `tests/article-card-images.test.mjs` contra REQ-17-01..09 (inspección de componente y hoja, sin build) y capturarlo en ROJO.
  - `src/components/latest-articles.astro`: clase `latest-articles__image` en el `<img>` (REQ-17-01), `alt={post.title}` (REQ-17-06) y `loading="lazy"` (REQ-17-07). Sin lógica (solo imports + interpolación).
  - `src/styles/latest-articles.css`: regla `.latest-articles__image` (~10 líneas) con `width: 100%` (REQ-17-02), `aspect-ratio: 16 / 9` (REQ-17-03, valor propio justificado en design.md, NO token), `object-fit: cover` (REQ-17-04), `display: block` + `margin: var(--gap-card) 0` (Decisión 4), `border-radius: var(--radius-card)` + `border: 1px solid var(--color-border)` (REQ-17-05). Sin hex/rgba sueltos; hoja ≤100 líneas (REQ-17-08).
  - NO tocar `tokens.css` (REQ-17-09: conserva 96 líneas), dominio, motor GOL ni features 14-16.
  - Verificar: suite completa EN SECUENCIA (`node --test "tests/**/*.test.mjs"`), check-format, audit-design-tokens, build e `./init.sh`; en `dist/index.html` la clase, `alt` ("Agilismo, diseño y fragilidad"), `loading="lazy"` y la regla CSS con tokens.
  - Informe `progress/impl_17_article-card-images.md` con evidencia rojo/verde.
- **Ejecutado (2026-08-11):** ROJO 7 fail / 4 pass (REQ-17-01/06/07 fallan contra el `<img>` sin clase/alt/loading; REQ-17-02/03/04/05 + Decisión 4 + REQ-17-08(regla) fallan porque la regla `.latest-articles__image` no existe; los 4 pass son invariantes preexistentes: límites de línea y tokens.css intacto) → implementación: `<img class="latest-articles__image" src={`/assets/content/${post.img}`} alt={post.title} loading="lazy"/>` en `latest-articles.astro` (REQ-17-01/06/07, sin lógica) y regla `.latest-articles__image` en `latest-articles.css` (+13 líneas → 75 total, ≤100): `display: block`, `width: 100%`, `aspect-ratio: 16 / 9` (valor propio, design.md), `object-fit: cover`, `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border)`, `margin: var(--gap-card) 0` → VERDE 11/11.
- **Verificación final:** suite completa 144/144 ✔ (secuencial: `node --test "tests/**/*.test.mjs"`) · `node scripts/check-format.mjs` ✔ · `node scripts/audit-design-tokens.mjs` ✔ · `pnpm build` ✔ · `./init.sh` → "El entorno está perfecto". `dist/index.html`: `<img class="latest-articles__image" src="/assets/content/arch00.webp" alt="Agilismo, diseño y fragilidad" loading="lazy">`; bundle CSS: `latest-articles__image{aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius-card);border:1px solid var(--color-border);width:100%;margin:var(--gap-card) 0;display:block}`. `tokens.css` intacto (96 líneas, REQ-17-09).
- **Informe:** `progress/impl_17_article-card-images.md` (ciclo rojo/verde con salidas, cobertura REQ 1-9, archivos tocados y verificación final).

### Coordinación del líder — feature 16 gol-performance (2026-08-11)

**Petición del usuario:** el fondo GOL con `opacity: var(--opacity-hero)` en `.hero-background` provoca lag en la portada (confirmado por él con Lighthouse: al meter el opacity, cae el rendimiento). Le gusta el look; hay que eliminar el lag.
**Decisiones con el usuario:** (1) el lag es sobre todo en la portada; (2) acepta pausar el autómata a ~10-15 gen/seg; (3) todo se canaliza por la feature (spec + tests), sin ediciones manuales.
**Plan:** spec_author (alta feature 16 gol-performance con spec/design/research) → implementer TDD (ImageData/putImageData, shouldTick puro, canvas a media res, will-change en .hero-background, evaluar .hero-noise) → reviewer → cierre. Estado actual del working tree: hero-section.css:22 ya tiene `opacity: var(--opacity-hero)` (estado canónico Decisión 6).

### Análisis spec_author (sesión 2026-08-11) — gol-performance

- **Análisis en curso:** eliminar el lag del fondo GOL con opacity en el hero (features 14/15; estado canónico hero-section.css:22 con `opacity: var(--opacity-hero)`).
- **Plan:**
  - Verificar diagnóstico en disco: driver 91 líneas con ~8.640 fillRect/frame + stepGrid por frame + 1 gen/frame (60 gen/seg); capas full-screen semitransparentes sobre el canvas en `/` (.hero-background 100vh @0.80, .hero-noise @0.03, .hero-gradient animado).
  - Decidir direcciones: ImageData/putImageData (1 write/frame), throttle 10-15 gen/seg con shouldTick puro + TICK_INTERVAL_MS = 80 (constante interna, NO token CSS), RENDER_SCALE 2 (4× menos píxeles), will-change: opacity en .hero-background, integración de .hero-noise como primer background de .hero-background con color-mix sobre --color-text; motor feature 14 intacto; extracción a gol-render.ts si el driver supera 100 líneas.
  - Verificar compatibilidad con tests existentes (REQ-03-02 no exige .hero-noise; test Ronda 2 exige background: shorthand con gradiente y var(--color-hero-*): se conserva como segundo layer).
  - Alta única feature 16 (las dos mitades del arreglo —driver y capas CSS— optimizan el mismo pipeline; ninguna es valiosa sola).
- **Resultado:** feature 16 `gol-performance` dada de alta en `feature_list.json` con status `pending`. Spec creada: `specs/16_gol-performance/requirements.md` (REQ-16-01..10) + `design.md` (toca UI/presentación: capas y composición del hero). Análisis completo en `progress/research/gol-performance.md`. `node scripts/check-format.mjs` en verde tras el alta y JSON válido.

**Nota de alcance:** `src/content/architecture/00-agilismo.md` (img → arch00.webp) y `public/assets/content/` son ediciones concurrentes del USUARIO (contenido del sitio, mtime 11:01), ajenas a la feature 16. No se revierten; la suite pasa 133/133 con ellas. El reviewer debe tratarlas como externas y no bloquear por ello.

### Coordinación del líder — feature 17 article-card-images (2026-08-11)

**Petición del usuario:** "si agregué imagen válida en el post, mete feature para que estas cards tengan siempre consistencia con la imagen porque salió una imagen gigante".
**Estado detectado:** `src/components/latest-articles.astro:16` renderiza `<img src="/assets/content/${post.img}">` SIN clase ni reglas CSS en `src/styles/latest-articles.css` → la imagen sale a tamaño natural (gigante). El usuario añadió `arch00.webp` (validado) y `public/assets/content/`.
**Plan:** spec_author (alta feature con spec/design) → implementer TDD (CSS de imagen de card con tokens: ancho 100%, aspect-ratio, object-fit, radio; clase en el componente) → reviewer → cierre.

### Análisis spec_author (sesión 2026-08-11) — article-card-images

- **Análisis en curso:** consistencia de la imagen en las cards de latest-articles (la imagen sale gigante a tamaño natural: `<img>` sin clase ni reglas CSS).
- **Plan:**
  - Verificar diagnóstico en disco: `latest-articles.astro:16` sin clase/alt/loading; `latest-articles.css` (62 líneas) sin regla para la imagen; tokens disponibles en `tokens.css` (96 líneas); dominio Post ya valida `img` (feature 7).
  - Decidir: clase BEM `latest-articles__image` + regla única en la hoja existente (width 100%, aspect-ratio 16:9, object-fit cover, display block, border-radius/border/margin por tokens `--radius-card`/`--color-border`/`--gap-card`); `alt={post.title}` sin tocar el dominio; `loading="lazy"`; **sin tokens nuevos** (tokens.css 96/100; 16:9 = valor propio del componente justificado en design.md).
  - Alta única feature 17 (el diagnóstico apunta a CSS + clase; una sola petición, sin capa de datos que tocar).
- **Resultado:** feature 17 `article-card-images` dada de alta en `feature_list.json` con status `pending`. Spec creada: `specs/17_article-card-images/requirements.md` (REQ-17-01..09) + `design.md` (toca UI/presentación: estilos de imagen de card, tokens, responsive). Análisis completo en `progress/research/article-card-images.md`. `node scripts/check-format.mjs` en verde tras el alta y JSON válido.

### Investigación en curso

**Tema:** Hack The Box API `connection/status` y endpoint de progreso de usuario.
- **Inicio:** 2026-08-11 · explorer
- **Estado:** `done`
- **Salida:** `progress/research/htb-api-connection-status.md`
