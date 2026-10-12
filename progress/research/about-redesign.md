# Análisis: rediseño completo de /about + CV en PDF generado en build (features 80-84)

Fecha: 2026-10-12. Autor: spec_author. Fuentes: `progress/research/about-cv.md` (CV, fuente
primaria, prevalece), `progress/research/about-moises-baldenegro.md` (investigación pública),
`src/pages/about.astro`, `src/styles/about.css`, `src/data/hero.json`, `src/layouts/Layout.astro`,
`src/domain/seo/sitemap.ts`, `astro.config.mjs`, `docs/dependencies.md`, tests que leen /about.

## 1. Problema

La página /about actual solo pinta nombre, handle, la línea de tecnologías de hero.json y la
descripción del sitio. El humano quiere una página "increíble", profesional, que presuma la
experiencia: hero con foto enmarcada y botón "Descargar CV", cifras, timeline de 4 puestos, stack
por área, proyectos y contenido verificados, formación/certificaciones/idiomas y el lema.

Historial de decisiones sobre el CV (coordinador, 2026-10-12):
1. Pedido inicial: `<a download>` a `/assets/cv/moises-baldenegro-cv.pdf` aportado por el humano.
2. Primer cambio: sin PDF del humano; ruta HTML /cv con `window.print()`. DESCARTADO por el 3.
3. Segundo cambio (VIGENTE): el humano aprueba **pdf-lib 1.17.1 exacta** (MIT, JS puro, apto para
   el prerender en workerd; nota PENDIENTE en `docs/dependencies.md`). Un endpoint prerenderizado
   `src/pages/cv.pdf.ts` genera `/cv.pdf` en build desde el MISMO repositorio (about.json +
   hero.json). El hero enlaza `<a href="/cv.pdf" download>` → **cero JS de runtime**. No existe
   página /cv ni `window.print`, ni referencia alguna a `/assets/cv/`.

## 2. Qué toca

| Capa | Archivos |
|------|----------|
| Datos | `src/data/about.json` (nuevo). `hero.json` NO cambia (nombre, handle, foto, línea de enfoque) |
| Dominio | `src/domain/entities/about-profile.ts`, `src/domain/repositories/about-repository.ts` (+ `about-parse.ts`), `src/domain/about-links.ts`; CV: `src/domain/cv/win-ansi.ts`, `text-wrap.ts`, `cv-layout.ts` (+ `cv-sections.ts`), `cv-pdf.ts` (único módulo que importa pdf-lib) |
| Rutas | `src/pages/about.astro` (reescrita), `src/pages/cv.pdf.ts` (endpoint prerenderizado) |
| Componentes | `src/components/about/*.astro` |
| Estilos | `about.css` (carcasa), `about-hero.css`, `about-stats.css`, `about-timeline.css`, `about-skills.css`, `about-projects.css`, `about-credentials.css` |
| Dependencias | `package.json` + lockfile (`pdf-lib` 1.17.1 exacta) y entrada `### pdf-lib` en `docs/dependencies.md` |

## 3. Restricciones y hallazgos

- H1 Tests vigentes que leen about.astro: REQ-11-02 (título "About — moisesbaldenegro.com"),
  REQ-11-03 (`HeroProfileRepository`, `getProfile()`, `profile.name/username/description`
  interpolados, sin `profile.verified`), REQ-11-04 (about.css ≤100, sin hex/rgb, usa los 8 tokens
  `--color-background --color-text --color-text-secondary --color-border --color-surface
  --radius-card --gap-card --container-max`), REQ-39-05 (literal
  `<p class="about__intro">{SITE_DESCRIPTION}</p>` en about.astro, un solo h1). Decisión: el
  rediseño los conserva SIN tocarlos (la línea de enfoque de hero.json se muestra en el hero; el
  `about__intro` pasa por slot a la sección Contenido en la 84).
- H2 NO existe modo claro en el sitio: tokens.css solo define la paleta oscura (feature 63) y no
  hay `prefers-color-scheme` en src/. "Claro/oscuro con los tokens existentes" se cumple usando
  SOLO tokens: si un tema claro llega por tokens, /about lo hereda. No se crea tema claro aquí.
- H3 tokens.css queda en 97 líneas (tests REQ-17-09, REQ-39-09, REQ-77-01, mobile-hamburger):
  ninguna feature añade tokens.
- H4 WinAnsi: las StandardFonts de pdf-lib (Helvetica) codifican en WinAnsi: acentos, ñ, `–`, `•`
  y `|` sí; emojis (🦀 de hero.json) y otros símbolos NO (pdf-lib lanza al codificar). Decisión:
  función pura `toWinAnsi` que elimina caracteres fuera de WinAnsi y colapsa espacios, aplicada a
  todo texto antes de dibujarlo, más un test de que los textos del CV de about.json ya son WinAnsi
  (datos limpios; el PDF no usa la línea de enfoque de hero.json).
- H5 pdf-lib comprime los content streams (FlateDecode) y escribe el texto como cadenas hex
  WinAnsi: los tests buscan el nombre / teléfono / correo descomprimiendo con `node:zlib` y
  decodificando las cadenas, y además validan la maqueta pura (`cv-layout.ts`) antes del render.
- H6 Contraste: texto blanco sobre `--color-accent` (#7d68ff) ≈3,97:1 (< 4,5:1). Decisión: CTA de
  contorno (texto `--color-text` sobre fondo oscuro, borde `--color-accent`). Texto en
  `--color-accent` sobre `--color-background` ≈5,0:1 y sobre `--color-surface` ≈4,7:1.
- H7 /cv.pdf no es una página HTML: no entra en el sitemap (sitemap.ts no cambia) ni lleva meta
  robots; el `.pdf` es un recurso descargable enlazado desde /about. El catch-all
  `[...term].astro` no lo intercepta (ruta explícita prerenderizada con extensión).
- H8 Foto: `/assets/moises-hero.jpg` 952×960: recorte con `aspect-ratio: 1` y `object-fit: cover`,
  atributos width/height intrínsecos para evitar CLS.
- H9 Sprite: `public/assets/svg/sprite.svg` ya tiene `github`, `linkedin` y `youtube`.
- H10 Espaciado: el único token de espacio es `--gap-card`; las hojas nuevas expresan
  margin/padding/gap como `var(--gap-card)` o `calc(var(--gap-card) * n)` (o 0/auto).
- H11 Privacidad: ningún teléfono ni correo personal (ni en la página ni en el PDF); excluidos
  Salud Digna, Cinnamon, "neww relic", el canal @moisesbaldenegro1546 y "Lamar University" (el CV
  dice Universidad LAMAR, prevalece). Guard por test sobre datos, componentes, HTML y PDF.
- H12 Determinismo del build: pdf-lib fija CreationDate/ModDate a "ahora"; el adaptador fija
  ambas fechas a un valor constante para que dos builds den bytes idénticos.

## 4. Contenido canónico de src/data/about.json (feature 80)

- headline: `Senior Software Engineer | Backend & Node.js Developer | Systems Architect`
- location: `Guadalajara, Jalisco, México`
- photoAlt: `Retrato de Moisés Baldenegro Melendez`
- summary: `Ingeniero de Software Senior y Arquitecto de Sistemas con más de 6 años de experiencia
  en backend con Node.js, NestJS y TypeScript. Diseño arquitecturas escalables con Clean
  Architecture, DDD y microservicios, con seguridad desde el diseño (OWASP Top 10), Docker, CI/CD
  y nube (AWS, Cloudflare Workers).`
- links (id, label, href): github `GitHub` https://github.com/MoiBaldenegro · linkedin `LinkedIn`
  https://www.linkedin.com/in/moibaldenegro/ · youtube `YouTube`
  https://www.youtube.com/@moibaldenegro · site `Sitio web` https://moisesbaldenegro.com
- stats (value, label): `+6` años de experiencia · `4` roles en 4 organizaciones · `Sep 2025`
  sistema multiplataforma en producción · `3` certificaciones
- experience (role, organization, place, period, highlights[], result?):
  1. Líder de Desarrollo & Arquitecto de Software — Taquerías MG — Guadalajara, Jalisco —
     `sep 2023 – presente` — 5 logros del CV — result: `Sistema en producción en septiembre de
     2025: optimizó procesos administrativos y aumentó márgenes al eliminar la dependencia de
     proveedores externos.`
  2. Desarrollador Web Multiplataforma — Kellogg's Company — Mazatlán, Sinaloa — `1 año 2 meses`
     — 2 logros
  3. Coordinador de Academia & Profesor de Asignatura — Universidad Estatal de Sonora (UES) —
     Navojoa, Sonora — `3 años 5 meses` — 1 logro
  4. Ingeniero de Prueba Eléctrica y NPI — Winchester Interconnect — Nogales, Sonora —
     `1 año 4 meses` — 1 logro
  Los puestos 2-4 llevan duración, nunca fechas inventadas.
- skills (area, items[]): los 6 grupos del CV; "Lenguajes y runtimes" añade Rust y WebAssembly y
  "Cloud, DevOps y contenedores" añade Azure (declarados por el autor en hero.json y GitHub).
- projects (name, description, href): Raúl (https://github.com/MoiBaldenegro/raul-framework),
  mouter-router (https://www.npmjs.com/package/mouter-router), MFinance
  (https://github.com/MoiBaldenegro/mfinance), Testimo
  (https://github.com/MoiBaldenegro/cubepath-cms-hackaton), Harness Kit
  (https://github.com/MoiBaldenegro/harness-engineering).
- content (title, description, href): Blog de arquitectura y sistemas operativos (`/`) · Curso de
  Rust desde Cero en YouTube (https://www.youtube.com/@moibaldenegro).
- education: Ingeniería en Ciberseguridad y Telecomunicaciones — Universidad LAMAR, Campus
  Chapultepec, Guadalajara, Jalisco (sin fechas).
- certifications (name, issuer): las 3 del CV.
- languages (name, level): Español `Nativo` · Inglés `Intermedio (B1–B2, técnico)`.
- philosophy: motto `Deterministic Engineering in an Agentic World`; text `Uso la IA para
  construir software, pero con procesos verificables: specs primero, tests antes que el código y
  una feature a la vez.`

## 5. Contenido del PDF (feature 81)

A4 (595.28 × 841.89 pt), márgenes 48 pt, Helvetica / Helvetica-Bold (StandardFonts, sin incrustar
fuentes), texto negro y gris. Orden: nombre (hero.json) · titular · ubicación · contacto (Sitio
web, LinkedIn, GitHub como URL visibles) · Perfil (summary) · Experiencia (4 puestos con periodo,
logros con `•` y resultado) · Habilidades (área: items) · Educación · Certificaciones · Idiomas.
Sin foto, sin proyectos ni contenido (el PDF es el CV). Máximo 2 páginas.

## 6. Descomposición (compleja → 5 features, base primero)

| id | name | depends_on | Entregable |
|----|------|-----------|------------|
| 80 | about-data-repository | — | about.json + entidad + repositorio con errores nombrados + guard de privacidad. Sin UI |
| 81 | cv-pdf-endpoint | 80 | pdf-lib 1.17.1 + registro; maqueta pura + adaptador + endpoint prerenderizado /cv.pdf. Sin UI |
| 82 | about-hero-stats | 80, 81 | Carcasa de /about + hero (foto enmarcada, h1, titular, ubicación, bio, enlaces, `<a href="/cv.pdf" download>`) + cifras |
| 83 | about-experience-skills | 82 | Timeline de 4 puestos + stack por área |
| 84 | about-projects-credentials | 83 | Proyectos, contenido (about__intro por slot), formación/certificaciones/idiomas y filosofía |

/cv.pdf va antes del hero para que el enlace nunca apunte a un recurso inexistente. 83 y 84
dependen de la anterior porque todas reescriben about.astro (≤100 líneas, sin conflictos).

## 7. Riesgos

- R1 about.astro > 100 líneas: cada sección es un componente; la página solo compone.
- R2 Repositorio o maqueta > 100 líneas: se dividen en módulos hermanos.
- R3 PDF > 2 páginas: se ajusta tamaño de fuente/interlineado (mín. 9 pt), sin recortar contenido.
- R4 pdf-lib en workerd: aprobado como compatible por el humano; si `astro build` fallara en el
  prerender, se para y se documenta (no se cambia `prerenderEnvironment`).
- R5 Duplicación hero.json/about.json: nombre, handle y foto SOLO viven en hero.json.
