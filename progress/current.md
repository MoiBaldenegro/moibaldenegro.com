# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- Feature en curso: 86 — geist-pixel-display (inicio 2026-10-12)

### Plan

- Plan: tests estáticos nuevos (tests/geist-pixel-display.test.mjs) para REQ-86-01..07/16 y ampliar tests/geist-font-build.test.mjs con REQ-86-08/09 (2 preloads); verlos en rojo y anotarlo en progress/impl_86.md.
- Registrar Geist Pixel Circle en astro.config.mjs, <Font> con preload en Layout.astro, token --font-display en tokens.css (sin cambiar sus 97 líneas) y regla h1, h2 en typography.css.
- Verificación real con Chrome headless + CDP sobre astro preview: font-family computado, overflow 375/1280, CLS, desborde del h1 del hero (ajuste en profile-card.css si hace falta).
- Capturas en progress/research/geist86/ (/, artículo, h2 más pequeño a 1280 y 375).
- ./init.sh en verde e informe progress/impl_86.md.

### Bitácora

- feature 86 pasada a in_progress; spec leída (requirements.md + design.md).
