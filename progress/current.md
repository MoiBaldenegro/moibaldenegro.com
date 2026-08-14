# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- Feature 44 performance-jank-reduction: IN_PROGRESS (inicio 2026-08-14). Reducir
  el jank de scroll y navegación reportado por el humano ("se nota un lagueo"):
  navbar sin blur (color-mix 92% sobre --color-background), hovers de cards solo
  transform + border-color, `transition:animate="none"` en `<html>` del layout,
  slot `head` + preload de la imagen del post con fetchpriority="high".
  Feature 43 ya está done y sus cambios (preload hero, persist, copia oculta)
  son la base estable sobre la que se trabaja.

### Plan

- Leer spec/design/análisis y archivos implicados (Layout.astro, [id].astro,
  layout.css, hero-card.css, latest-articles.css) — hecho.
- Escribir tests/performance-jank-cycle36.test.mjs contra REQ-44-01..08
  (test-first) y observar el rojo.
- Implementar: transition:animate + slot head en Layout.astro; preload con
  slot="head" en [id].astro; quitar backdrop-filter y fondo color-mix en
  layout.css; hovers baratos en hero-card.css y latest-articles.css.
- Verificar: suite completa (node --test "tests/**/*.test.mjs"), ./init.sh,
  node scripts/audit-design-tokens.mjs y el HTML del build (dist/).
- Dejar feature_list.json con la 44 en in_progress (sin marcar done) e informe
  en progress/impl_44_performance-jank-reduction.md.