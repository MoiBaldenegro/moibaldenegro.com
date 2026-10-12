# Review — feature 83

**Veredicto:** APPROVED

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x] `about-timeline.astro` y `about-skills.astro` solo importan `../../styles/about-timeline.css` / `about-skills.css` (REQ-83-13).
- C2 (frontmatter solo imports y datos): [x] `src/pages/about.astro:1-16` sin `.map(`/`.filter(`; pasa `about.experience` y `about.skills` tal cual (l.25-26). Los `.map` del marcado son de plantilla, no de frontmatter.
- C3 (datos vía repositorio): [x] `AboutRepository().getProfile()`; los componentes reciben props tipadas (`AboutExperience`, `AboutSkillArea`).
- C4 (solo tokens): [x] sin hex/rgb/rgba en las dos hojas; todos los tokens usados existen en `tokens.css` (`--color-accent-hover` l.28, `--color-glow` l.35, `--radius-thumb` l.71, etc.); margin/padding/gap siempre con `--gap-card`/calc/0; `tokens.css` intacto (97 líneas).
- C5 (<= 100 líneas): [x] about.astro 31, about-timeline.astro 36, about-skills.astro 26, about-timeline.css 86, about-skills.css 56, test 100.
- C6 (sin dependencias nuevas): [x] sin JS de runtime ni paquetes.
- C7 (`./init.sh` verde): [x] ejecutado por el reviewer: formato, tests al 100 % y build OK.
- C8 (desktop y móvil correctos): [x] revisadas las capturas `progress/research/about83/about83-1280.png` y `about83-375.png`: línea vertical con marcadores de acento a 1280, una columna sin línea a 375, sin desbordamiento; CDP documentado (scrollWidth === clientWidth a 375).
- C9 (estado del backlog): [x] la 83 está `in_progress` (la pasa a `done` el líder tras este APPROVED); su dependencia 82 está en `done`. Las 84/85/86 quedan fuera del alcance de esta revisión.
- C10 (progress al día, sin temporales): [x] `progress/current.md` documenta la sesión; no hay restos de debug.

## Verificaciones pedidas
- TDD: `progress/impl_83.md` documenta el rojo 6/6 antes de crear los componentes y las hojas, y también el rojo de la versión compactada del test. Después, verde 6/6 y suite 879/879 (REQ-83-17).
- Coherencia acceptance↔REQ: los 6 criterios de `feature_list.json` (id 83) mapean 1:1 con los grupos de trazabilidad de `requirements.md` (01/02, 03-06, 07-09, 10-12, 13-15, 16-18).
- Puestos 2–4: `src/data/about.json` l.37/47/56 traen solo duración ("1 año 2 meses", "3 años 5 meses", "1 año 4 meses"). El period se pinta tal cual en `span.about-timeline__period` y no se derivan fechas (D3). El test exige que los únicos años de la sección sean 2023 y 2025.
- Accesibilidad: un solo h1 (hero). Debajo, h2 «Experiencia» / «Stack y habilidades», h3 por puesto y por área, sin saltos (lo comprueba el test REQ-83-16). Las secciones usan `aria-labelledby`, la etiqueta «Resultado:» es texto real en `<strong>` y los marcadores son `::before` decorativos. Contrastes >= 7:1 documentados.
- Responsive: rejilla del stack con `auto-fit minmax(min(100%,260px),1fr)` y 3 columnas a partir de 900 px. La línea del timeline solo aparece desde 769 px. `prefers-reduced-motion` anula las transiciones en las dos hojas.
- Coherencia con la 82: títulos en peso 800, tarjetas con `--color-surface`/`--radius-card`/`--shadow-card-rest` iguales a las de las cifras, píldoras con `--radius-pill` como el handle y acento violeta compartido. En la captura a 1280 el conjunto se ve uniforme.
- Privacidad: busqué «mc.moisesm16» en todo el repo (sin node_modules/.git/dist). Solo aparece en las notas de `progress/review_80.md`/`81`/`82`, que dicen que no está. Todas las coincidencias de «647» son benignas: los recuentos «647/647» (`progress/history.md:1460`, `progress/impl_43.md:26`, `progress/review_43.md:28`), `L64755` en `progress/research/nodejs-compat-prerender-workerd.md`, coordenadas de path en `public/assets/svg/sprite.svg` y las citas de reviews anteriores. Ningún teléfono ni correo personal. El test también aplica los regex de correo y teléfono al HTML de /about.

## Observaciones (no bloqueantes)
1. `src/styles/about-timeline.css:76-79` usa px literales (12px, +6px, -7px) para el tamaño y la posición del marcador. Es geometría, no espaciado/color/radio, y REQ-83-14 no lo cubre. Se acepta.
2. `font-size`/`font-weight` llevan valores literales porque `tokens.css` no tiene tokens de escala tipográfica. Es el mismo criterio que se aprobó en la 82 (la acceptance lo limita a «fuentes» = `font-family`, que usa `var(--font-sans)`).
3. A partir de 900 px se fijan 3 columnas (REQ-83-12 pide «al menos dos»). Cumple el requisito.

## Cambios requeridos (si aplica)
Ninguno.
