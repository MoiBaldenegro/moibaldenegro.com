# Implementación — feature 88 hero-profile-mask

## Rojo (REQ-88-06)

- `node --test tests/hero-profile-mask.test.mjs` antes de tocar estilos, marcado y datos: pass 0, fail 5.

## Cambios

- `src/styles/profile-card.css`: `.profile-image img` con `mask-image: linear-gradient(to bottom, var(--color-surface) 55%, transparent)` (solo cuenta el alfa); se elimina la regla `.profile-overlay`; `.profile-username` con `font-family: var(--font-mono)`.
- `src/components/new-hero/new-hero.astro`: fuera el `div.profile-overlay`.
- `src/data/hero.json`: descripción con segmentos del headline y skills de `about.json`, sin «&» (se escapa a `&amp;` y rompía REQ-11-05 en /about).
- `tests/hero-profile-repository.test.mjs`: REQ-31 fija la nueva descripción (REQ-88-07, precedente REQ-43-06).
- Tamaños de la imagen intactos (REQ-69-08); los tokens `--color-overlay-*` quedan definidos en tokens.css (no se toca su conteo de líneas).

## Verificación

- `./init.sh` en verde (formato, tests al 100%, build).
- Captura a 1280×900 en `progress/research/hero88/hero88-1280.png`: la foto se funde con el fondo de la tarjeta y la píldora queda nítida.

## Ampliación: «que se vea completa la foto» (REQ-88-09/10/11)

- Rojo: los 3 tests nuevos fallaban (pass 5, fail 3) antes de tocar estilos y marcado.
- `.profile-image` va en absolute arriba de la tarjeta en escritorio y la img usa su proporción real (952 / 960) sin `scale`: se ve la foto entera. En <=1200 px vuelve a relative con las proporciones de la feature 69 (img al 100% de alto).
- `.profile-content` alineado abajo (flex-end) sobre el desvanecido; la píldora pasa a `.profile-content` encima del h1; h1 `clamp(2rem, 2.4vw, 3rem)`, descripción a 0.95rem y máscara `50% → transparent 92%`.
- Capturas a 1280×900, 1600×1000 y 1000×1300 en `progress/research/hero88/`. A 1000 px (tablet) la foto conserva el recorte 16:9 de la feature 69.
- Nota: el preview bloquea `dist/` en Windows y `pnpm build` falla con EBUSY; hay que detenerlo antes de compilar.

## Ajuste: píldora fuera de la cara en escritorio grande

- Feedback humano: en escritorio grande la píldora caía sobre la cara («en el cuello al menos pero no en la cara»).
- Píldora más pequeña (padding 5px 12px, 0.8rem, badge de 16 px, margen inferior de 10 px), padding inferior de `.profile-content` a 18 px y h1 con tope de 2.4rem (a 1920 px el nombre se partía en dos líneas y empujaba la píldora hacia arriba).
- Capturas a 1280, 1600 y 1920 en `progress/research/hero88/`: la píldora queda en el cuello en los tres.

## Ajuste: el nombre ya no se parte en escritorio (REQ-88-12)

- Feedback humano con captura: en escritorio grande el nombre volvía a dos líneas y subía la píldora a la cara.
- Rojo: el test REQ-88-12 fallaba (pass 8, fail 1) antes del cambio.
- Medido en Chrome headless: «Moisés Baldenegro Melendez» en Geist Pixel Circle mide ≈13,5 em. `.profile-content` pasa a `container-type: inline-size` y el h1 a `font-size: min(2.4rem, 6.8cqi)`: ocupa como mucho ~92 % del ancho del bloque, independiente del viewport o del tamaño de fuente del navegador. En <=768 px sigue el 2rem de la feature 69.
- Capturas a 1440, 1920 y 2560 en `progress/research/hero88/`: nombre en una línea y píldora en el cuello.
