# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- (ninguna en implementación; la 10 sigue en blocked por decisión humana)
- Análisis en curso: 4 mejoras post-auditoría (anclas tapadas por el header a 320 px, botón
  de copiar que se desplaza con el scroll del pre, theme_color blanco del manifest, CSP en
  Report-Only).

### Plan

- spec_author: analizar las 4 mejoras en progress/research/post_audit_backlog.md.
- Alta de las features 61-64 (bugs primero: 61 header, 62 code-copy; luego 63 theme-color y
  64 CSP obligatoria) con su spec en specs/<NN>_<slug>/.
- Validar con node scripts/check-format.mjs y ./init.sh.

### Bitácora

- spec_author 2026-10-09: análisis en progress/research/post_audit_backlog.md (inventario de
  recursos del build para la CSP incluido).
- Alta en feature_list.json (pending, sin depends_on): 61 header-anchor-offset-mobile,
  62 code-copy-fixed-corner, 63 theme-color-dark, 64 csp-enforce.
- Specs creadas: specs/61_header-anchor-offset-mobile/ (requirements + design),
  specs/62_code-copy-fixed-corner/ (requirements + design), specs/63_theme-color-dark/
  (requirements + design), specs/64_csp-enforce/requirements.md.
- Dudas para el humano: 61 asume header sticky en móvil con token medido; 64 requiere confirmar
  si Cloudflare inyecta scripts en el borde (Web Analytics) — sin red en esta sesión.
