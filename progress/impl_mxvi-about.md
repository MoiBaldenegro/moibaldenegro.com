# Implementación — feature 13 `mxvi-about`

Cuarta fase del refactor del sitio al design system MXVI: la página about usa las clases
`.mx-*`. Spec: `specs/13_mxvi-about/requirements.md` (REQ-13-01..13) y `design.md`. Fecha: 2026-11-11.

## 1. Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `tests/mxvi-about.test.mjs` | Nuevo, escrito antes del código: 7 tests para REQ-13-01..12 |
| `tests/square-corners-sitewide.test.mjs` | Cita y callout desde `mxvi/components/molecules/content.css`; línea base de radios 19 en 7 hojas |
| `src/pages/about.astro` | Contenedor `mx-container mx-stack about`; nombre `mx-profile-hero__name`; intro `mx-text mx-text--lead` |
| `src/components/about/about-hero.astro` | `mx-profile-hero` con `mx-photo`, `__handle`, redes `mx-social-list--inline` + `mx-button`, CV `mx-button--accent` |
| `about-stats.astro` | `mx-stats` / `mx-stat` |
| `about-timeline.astro` | `mx-section`, `mx-heading--lg`, `mx-timeline`, `mx-timeline-item`, `mx-card`, `mx-badge`, `mx-callout` |
| `about-skills.astro` | `mx-card-grid`, `mx-group-card`, `mx-chip-list` / `mx-chip` |
| `about-projects.astro`, `about-content.astro` | `mx-card-grid` (`--2` en contenido), `mx-project-card` |
| `about-credentials.astro` | `mx-group-card__title--accent`, `mx-entry-list` |
| `about-philosophy.astro` | `mx-quote` |
| `src/styles/about.css` | Solo el relleno vertical de la página |
| 6 hojas | Eliminadas: about-hero, about-stats, about-timeline, about-skills, about-projects, about-credentials |

## 2. Correcciones subidas al design system (`aaf91f4`)

Handle de texto del encabezado de perfil (`.mx-profile-hero__handle`), redes centradas en
pantallas estrechas, títulos de sección sin margen extra dentro de `.mx-section` y con
espaciado de -0.01em, medida de 70ch en `.mx-text--lead`.

## 3. Rojo y verde

`node --test` antes del código: 8 fallos. Después: `./init.sh` en verde (112/112, build OK).

## 4. Regresión visual (REQ-13-13)

24 capturas contra la línea base: 0 % salvo about a 1440 y 1024 px con 0.001–0.002 %
(80 px del subrayado del enlace activo del header), la misma variación que da la línea base
contra sí misma.
