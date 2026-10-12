# Review — feature 82

**Veredicto:** APPROVED

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `.astro` con `<style>`: [x]
  - Las hojas son `about.css`, `about-hero.css` y `about-stats.css`.
  - Cada componente importa la suya: `about-hero.astro:4` y `about-stats.astro:3`.
- C2 Frontmatter solo con imports y datos: [x]
  - `about.astro:1-14` solo tiene imports, dos `getProfile()` y `prerender`.
  - El `.map` está en el cuerpo de los componentes, igual que en el resto del sitio.
  - `heroLinks` vive en el dominio (`src/domain/about-links.ts`).
- C3 Datos vía repositorio: [x]
  - Se usan `HeroProfileRepository` y `AboutRepository`.
  - Ningún import de `src/data`.
- C4 Solo tokens: [x]
  - Las hojas nuevas no tienen hex, `rgb()` ni `rgba()`.
  - Color, fondo, radio, sombra, transición y familia tipográfica usan siempre `var(--…)`.
  - Todo margin, padding y gap usa `--gap-card`, `calc()` sobre ella o `0`.
  - Sin `prefers-color-scheme`.
  - `tokens.css` sigue con 97 líneas y sin diff.
- C5 Archivos de 100 líneas o menos: [x]
  - Líneas por archivo: 27, 45, 21, 34, 93, 42 y el test 99.
- C6 Sin dependencias nuevas: [x]
  - pdf-lib pertenece a la 81.
  - Esta feature no añade JS ni `<script>`.
- C7 Datos válidos y errores nombrados: [x]
  - La 82 no los toca. Ya se cubrieron en la 80.
- C8 `./init.sh` en verde: [x]
  - Ejecutado por el reviewer: entorno, formato, tests al 100% y build en verde.
- C9 Se ve bien en desktop y en móvil: [x]
  - Capturas revisadas: `progress/research/about82/about82-1280.png` y `about82-375.png`.
  - A 1280 la foto está a la izquierda y las 4 cifras van en una fila.
  - A 375 todo se apila centrado, las cifras van en 2×2 y no hay desbordamiento.
  - Las medidas CDP del informe cumplen REQ-82-18/19/20.
- C10 feature_list y progress: [x]
  - La 82 está `in_progress` y `current.md` está al día.
  - El líder la pasa a done tras este APPROVED.
  - Las features 85 y 86 están fuera de alcance.
- C11 Sin temporales, debug ni TODOs: [x]

## Verificaciones específicas
- Descargar CV:
  - `about-hero.astro:42` tiene `<a class="about-hero__cv" href="/cv.pdf" download="moises-baldenegro-cv.pdf">`.
  - El HTML construido (`dist/client/about/index.html`) tiene un solo ancla con ese `download`.
  - No hay ninguna referencia a `/assets/cv/`.
- Accesibilidad:
  - El HTML construido tiene un único `<h1 id="about-name">` dentro de `section.about-hero[aria-labelledby=about-name]`.
  - La foto lleva `alt={about.photoAlt}` («Retrato de Moisés Baldenegro Melendez») con width 952 y height 960.
  - Los iconos llevan `aria-hidden` y `focusable="false"`, más el texto « (sitio externo)» en visually-hidden.
  - El h2 «Cifras destacadas» es visually-hidden.
  - El CTA tiene `:focus-visible`.
  - Contraste medido: 4.77:1 como mínimo (valor de cifra) y todo lo demás ≥ 8.28:1. Cumple REQ-82-21.
- Privacidad:
  - Hice un grep de «mc.moisesm16» en todo el repo (sin node_modules): solo aparece en las notas de `progress/review_80.md` y `review_81.md`, que dicen que no aparece. No es un dato.
  - Coincidencias de «647», todas benignas:
    - el recuento de suite «647/647» en `history.md:1460`, `impl_43.md:26` y `review_43.md:28`;
    - `L64755` en `research/nodejs-compat-prerender-workerd.md`;
    - coordenadas de `public/assets/svg/sprite.svg`, que ya existían;
    - menciones en las reviews 80 y 81.
  - Ningún teléfono ni correo personal.
  - El HTML de /about tiene 0 coincidencias.
- TDD:
  - `impl_82.md` documenta el rojo (7/7 fail) antes de crear `src/components/about/` y las hojas.
  - Tras ajustar el test, repitió el rojo de la versión definitiva (6/6 fail) con los archivos apartados.
  - Después, verde 6/6 y suite 873/873.
- Compatibilidad:
  - `tests/about-page.test.mjs` y `tests/single-h1-headings.test.mjs` sin diff respecto a HEAD, y en verde.
  - La sección `<p class="about__intro">{SITE_DESCRIPTION}</p>` se conserva (`about.astro:23-25`).
- Dependencias: las features 80 y 81 están en `done`.

## Decisión D-h1 (validada)
- El conflicto es real: `tests/single-h1-headings.test.mjs:52` exige que el código fuente de `about.astro` tenga exactamente un `<h1`.
- La solución cumple las dos cosas: la página declara el h1 con `slot="name"` y el hero lo coloca con `<slot name="name" />` (`about-hero.astro:26`).
- El HTML resultante coincide con el marcado de design.md.
- REQ-82-04 se da por cumplido, porque el h1 se renderiza dentro del hero.
- REQ-82-02 también: `profile.name` llega al hero por el slot.

## Observaciones no bloqueantes (para spec_author)
1. `specs/82_about-hero-stats/requirements.md:5`: el índice de trazabilidad no coincide con `feature_list.json`.
   - El índice dice «REQ-82-08/09/10/11→3, REQ-82-12/13→4».
   - Los acceptance 3 y 4 son «REQ-82-08/09/10» y «REQ-82-11/12/13».
   - Todos los REQ están cubiertos. Conviene alinear la cabecera.
2. REQ-82-14 dice «tipografía solo con var()», pero tokens.css solo define `--font-sans`.
   - Las hojas usan valores literales de font-size, font-weight y letter-spacing, como el resto del sitio.
   - El acceptance lo limita a font-family, y así se cumple.
   - Conviene precisar la redacción del REQ en futuras specs.

## Cambios requeridos (si aplica)
Ninguno.
