# Review — feature 69

**Veredicto:** APPROVED

Feature: hero-profile-image-mobile. Spec: `specs/69_hero-profile-image-mobile/requirements.md` y `design.md`. Informe: `progress/impl_69.md`.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x]. Solo se tocan `src/styles/profile-card.css` y `src/styles/hero-section.css`. `new-hero.astro` no cambia.
- C2 (sin lógica JS en la UI): [x]. Cero JavaScript; solo CSS.
- C3 (los componentes no leen JSON directamente): [x]. No hay cambios en datos ni componentes.
- C4 (tokens, sin valores sueltos): [x]. `height: auto`, `aspect-ratio: 16 / 9` y `1 / 1` (profile-card.css, dentro de los `@media` ≤1200/≤768) y `minmax(140px, auto)` / `minmax(190px, auto)` (hero-section.css L51 y L54) no son colores, espaciados, radios ni sombras. El px de las filas ya existía antes del cambio. Hay precedente de `aspect-ratio` literal en article.css y post.css. El test REQ-69-10 lo cubre. tokens.css sigue en 97 líneas, así que REQ-69-11 no aplica.
- C5 (máximo de 100 líneas): [x]. profile-card.css tiene 74 líneas, hero-section.css 55 y tests/hero-profile-image-mobile.test.mjs 57.
- C6 (sin dependencias nuevas): [x].
- C7 (datos válidos y tipados): [x]. No se tocan.
- C8 (errores nombrados en los repositorios): [x]. No se tocan.
- C9 (`./init.sh` en verde): [x]. Lo ejecutó el reviewer y quedó en verde: entorno, formato, tests al 100% y build OK.
- C10 (página correcta en desktop y móvil): [x]. Revisé a ojo `progress/research/hero69/hero69-after-375.png` y `hero69-after-1024.png`. La foto se ve completa con el username y el badge encima. El h1 y la descripción caben en la tarjeta. A 1024 px las hero-cards empiezan debajo del perfil. La tabla CDP de impl_69.md cubre REQ-69-02..09 a 320, 375, 768, 1024 y 1280: la foto mide ≥240 px, la img cubre el contenedor (algo mayor por el `scale(1.02)` preexistente), 0 hero-cards encima del perfil, elementFromPoint del badge cae en `.profile-username`, a 1280 px las medidas siguen en 493×352 / 502×359 y las hero-cards conservan sus medidas.
- C11 (estado de la feature en feature_list.json): [x]. La feature está `in_progress` y pasará a `done` al cerrar. Su dependencia, la 68, está en `done`.
- C12 (progress/current.md e history.md al día): [x].
- C13 (sin temporales, debug ni TODOs): [x]. Los comentarios añadidos en el CSS tienen contexto (feature 69).

## Test-first (REQ-69-12)
`progress/impl_69.md` documenta el rojo previo: 2 pass / 2 fail. Fallaban los dos tests REQ-69-01 porque `.profile-image` no tenía regla en ≤1200 px y `grid-auto-rows` era fijo. Tras el cambio quedó en verde: 4/4, suite 799/799 y `./init.sh` en verde. Lo confirmé con mi propia ejecución de `./init.sh`.

## Observaciones (no bloqueantes)
- REQ-69-02..09 se verifican con medición en navegador y no con tests automáticos. Así lo prevé la acceptance de feature_list.json.
- Hay un solapamiento preexistente entre el icono y el título de algunas hero-cards a 1024 px («ACTIONS», «TWITCH»). Queda fuera de alcance porque las cards conservan 149×140. Puede ser una feature futura vía spec_author.

## Cambios requeridos (si aplica)
Ninguno.
