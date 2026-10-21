# Análisis — feature 112 hero-rich-card-logos

Petición humana (2026-10-20, secuencia de 7 tareas): las cards personalizadas del hero (hoy solo HTB, kind htb) conservan su diseño propio encima (estadísticas, elementos interactivos), pero llevan debajo el mismo logo con el efecto de hover de las cards normales, como fondo tenue; usar el symbol `htb` (cubo) en la posición del icono principal y además `htb-wordmark` (logo con letras) para embellecerla.

## Estado actual (lectura del árbol)

- `src/components/hero-cards/htb-card.astro` (34 líneas): header + `.hero-card__body` (z-index 5, isla `HtbStadistics server:defer`) + `a.card-link` opcional (z-index 6). Sin `.card-icon` ni `.card-backdrop`.
- `src/components/hero-card.astro`: `.card-backdrop` (si backgroundIcon, con data-backdrop-size) antes de `.card-icon` (svg 28x28 con `<use href>`), luego `.card-corner` y `.card-link`.
- `src/domain/repositories/hero-cards-parse.ts` (71 líneas): `parseRichCard` solo lee id, kind, title, colorToken, showOnMobile, href; ignora icon/backgroundIcon/backgroundIconSize (observación (ao) de la 108). `readSpriteRef` admite solo `cornerIcon | backgroundIcon` (hero-cards-fields-parse.ts, 75 líneas).
- `HeroRichCard` (src/domain/entities/hero-card.ts, 60 líneas) no tiene campos de logo.
- Efecto de hover: `.hero-card:hover .card-icon svg { rotate(2deg) scale(var(--icon-scale) * 1.12) }` en hero-card.css (99 líneas, no puede crecer). La card HTB ya lleva la clase `.hero-card`: el mismo selector le aplica sin CSS nuevo.
- Geometría del icono por token en hero-card.css; `htb` solo declara `--card-bg`. Los campos rotate/scale/iconWidth del JSON no se usan en el marcado (la geometría la da el CSS), así que la rica no necesita leerlos.
- `.card-backdrop` (hero-card-accents.css, 65 líneas): opacidad 0.06, anclado abajo-izquierda (109), ratio por symbol; falta el ratio de `htb-wordmark`.
- Sprite (solo lectura, verificado): `#htb` viewBox 0 0 1024 791.27002 (relleno #9FEF00); `#htb-wordmark` viewBox 0 0 300 58.8 (#9FEF00 y #FFFFFF). Ambos existen.
- Tokens: `--color-marca-htb #1A2332`, `--color-marca-htb-accent #9FEF00`.
- Peso actual de dist/client/index.html ~39 895 B (umbral REQ-47-06 < 40 000). Dos bloques nuevos (div + svg + use) suman ~250-320 B: es probable rebasar 40 000.

## Propuesta (una feature: datos + UI acoplados y pequeños)

1. Datos: `HeroRichCard` gana `icon?`, `backgroundIcon?`, `backgroundIconSize?` (ausente = sin clave); `parseRichCard` los lee con `readSpriteRef` (ampliado a `icon`) y `readBackdropSize`, con el mismo HeroCardsDataError. JSON: la card htb declara `icon #htb`, `backgroundIcon #htb-wordmark`, `backgroundIconSize sm`.
2. UI sin duplicar: componente compartido `src/components/hero-card-art.astro` (backdrop + icono) usado por hero-card.astro y htb-card.astro; el HTML de las cards de icono queda idéntico.
3. CSS mínimo: en htb-card.css, geometría del cubo por token htb, opacidad tenue del `.card-icon` de la rica y pointer-events none; en hero-card-accents.css, ratio 300 / 58.8 de htb-wordmark.

## Valores por defecto (revisables)

- Cubo `#htb` en `.card-icon` con la posición y la transformación de las normales; en la rica `opacity: 0.16`; `--icon-width 150px`, `--icon-rotation -8deg`, `--icon-scale 6` (> 1200 px) y `--icon-scale 3` (<= 1200 px); en <= 768 px el 110px !important heredado.
- Wordmark `#htb-wordmark` como `.card-backdrop` tamaño `sm` (left 16px/10px, width 60 %, abajo-izquierda) con la opacidad común 0.06: queda a la izquierda y no se apila con el cubo (abajo-derecha). Alternativa: `md` (todo el ancho).
- Umbral de peso: si el build alcanza 40 000 B, el umbral de REQ-47-06 pasa a 42 000 B (tope de la regla REQ-96-07, aprobación humana «queda aprobado subir lo permitido de lineas de codigo para la portada») con la nota «Ajuste feature 112 (precedente REQ-43-06)»; si alcanza 42 000 B, blocked.

## Riesgos

- Contraste: texto blanco y verde (#9FEF00) sobre el compuesto. Estimación con el cubo al 0.16 sobre #1A2332: fondo ~rgb(47,68,42), blanco ~10:1, verde ~7:1. Se mide por CDP en reposo y en hover (filter contrast(1.4)).
- `.card-icon` es absoluto inset 0: sin pointer-events none podría interceptar clics; `.hero-card__body` (5) y `.card-link` (6) deben seguir encima.
- Tests heredados que fijan el marcado de htb-card.astro o hero-card.astro, el shape de HeroRichCard/parseRichCard, la card htb del JSON o el umbral de 40 000 B (posibles: hero-card-registry, htb-hero-card, hero-cards-repository, hero-card-kinds-domain, hero-backdrop-size, hero-cards-links-xlink, hero-backdrop-bottom-left, hero-cards-links-new-tab, search-index-lazy-load): ajuste con «Ajuste feature 112 (precedente REQ-43-06)».
- Límite de 100 líneas: hero-card.css (99) no se toca; el resto tiene margen.
- Ajeno: public/assets/svg/sprite.svg, src/content/posts/systems-design/*.md, tests/hack-the-box-sprite.test.mjs.
