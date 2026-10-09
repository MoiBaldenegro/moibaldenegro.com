# Review — feature 39

**Veredicto:** APPROVED

Feature 39 `single-h1-headings` (spec: `specs/39_single-h1-headings/requirements.md` + `design.md`).
Implementer: el líder en rol de implementer (autorización humana explícita); revisada con el mismo rigor.
No tiene `depends_on`, así que no se saltó ninguna dependencia pendiente.

## Requisitos
- REQ-39-01 [x] `grep -rn "^# " src/content/posts` no devuelve nada; el test (`tests/single-h1-headings.test.mjs:35-40`)
  recorre todos los posts e ignora los bloques cercados ``` / ~~~ (`proseLines`, líneas 26-33).
- REQ-39-02 [x] El diff de `src/content/posts` cambia solo la línea `# NN. …` → `## NN. …` en los 7 posts
  (00-agilismo:16, 01-diseño_detallado:15, 02-principios:15, 04-ciclo…:14, 05-diseno…:15, os/00-prueba-os:20,
  os/01-procesos-memoria:18), con el mismo texto. La línea de `03-principios_solid.md` que aparece en el diff es de la feature 33.
- REQ-39-03/04 [x] El test de build (líneas 53-71) cuenta exactamente un `<h1` en cada `posts/*/index.html` (exige >= 8 páginas) y en `about/index.html`.
- REQ-39-05 [x] `src/pages/about.astro:21` contiene `<p class="about__intro">{SITE_DESCRIPTION}</p>`. El texto es idéntico al del h1 anterior
  (`src/domain/seo/head.ts:7-8`) y resuelve la observación 1 de `progress/review_35.md` (una sola fuente para ese texto).
- REQ-39-06 [x] `src/styles/about.css:41-47`: el color usa `var(--color-text-secondary)`, la fuente `var(--font-sans)` y el margen `var(--gap-card)`.
  El tamaño de 1.2rem está dentro del rango 1.15-1.25rem que pide design.md. No hay color hardcodeado.
- REQ-39-07 [x] `progress/impl_39.md` documenta el rojo antes de tocar el código (pass 1 / fail 4: REQ-01, 02, 05/06 y 03/04 en rojo)
  y el verde al final (5/5; suite 621/621).
- REQ-39-08 [x] about.astro 24, about.css 52 y el test 80 líneas; los markdown son contenido y no cambian su longitud.
- REQ-39-09 [x] He ejecutado `./init.sh` en esta revisión: entorno, formato, tests al 100% y build, todo en verde.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x]
- C2 El frontmatter solo hace imports y paso de datos (about.astro): [x]
- C3 Datos vía repositorio (`HeroProfileRepository`; `SITE_DESCRIPTION` es una constante de dominio, no JSON): [x]
- C4 Solo tokens para colores y espaciados en la regla nueva: [x]
- C5 Ningún archivo tocado supera 100 líneas: [x]
- C6 Sin dependencias externas nuevas: [x]
- C7 `./init.sh` en verde: [x]
- C8 Se ve bien en desktop y en móvil: [ ]  ← Razón: el reviewer no lo inspeccionó en el navegador. No bloquea: el cambio visual se limita a un párrafo con tokens.
- C9 Feature en `done` en feature_list.json: [ ]  ← Razón: sigue en `in_progress`; la cierra el líder tras esta aprobación.
- C10 Sin temporales, debug ni TODOs: [x] (el test borra su outDir temporal en el `finally`).

## Observaciones (no bloqueantes)
1. En el diff de `about.astro`, el cambio de `<main class="about">` a `<div class="about">` y el `description=` vienen de las features 35/38, ya aprobadas. No se re-revisan.
2. El test REQ-39-01 solo detecta los bloques cercados que empiezan la línea con ``` o ~~~. Basta para el contenido actual.

## Cambios requeridos (si aplica)
Ninguno.
