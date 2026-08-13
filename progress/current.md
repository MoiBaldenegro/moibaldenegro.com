# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

**26 — post-page-styles** — CERRADA (status `done` en `feature_list.json`,
2026-08-13). `progress/review_26_post-page-styles.md` con Veredicto APPROVED
verificado en disco; `node scripts/check-format.mjs` en verde tras el cambio.
Resumen del ciclo en `progress/impl_26_post-page-styles.md` y en
`progress/history.md` (Sesión 2026-08-13):

- `src/styles/post.css` nueva (99 líneas, BEM `.post__*`, solo tokens):
  contenedor, título, meta, imagen 16:9 (precedente REQ-17) y tipografía del
  markdown bajo `.post__content`; consume los 10 tokens de la tabla del design.
- `[id].astro` (38 → 39): solo `import "../../styles/post.css";` (incidencia
  de ruta `../` resuelta en el ciclo, detectada por REQ-11-05).
- Sin cambios en tokens.css (87 líneas, REQ-26-07), layout.css, Layout.astro
  ni latest-articles (enlace /posts FUERA, REQ-20-06).
- ROJO 2/11 → VERDE 11/11 en `tests/post-page-styles.test.mjs`; suite
  169/169, build OK, `./init.sh` "El entorno está perfecto".

**Estado final del backlog: 0 pendientes, 0 in_progress, 0 blocked — features
1-26 `done` conservadas en el array.** Pendiente real del líder: decidir si
abre re-review de features 19/21 por el fix de adapter (`nodejs_compat` +
`prerenderEnvironment: 'node'`) documentado en el ciclo 18-24. No hay
features nuevas canalizadas; si el usuario pide la reincorporación del enlace
a `/posts` desde `latest-articles.astro`, será feature propia (decisión
documentada en `specs/26_post-page-styles/design.md`, Decisión 4).

### Última sesión

**2026-08-13 — features 25 y 26 cerradas (GOL eliminado + hoja post.css).**
Ver `progress/history.md` (Sesiones 2026-08-13). `./init.sh` en "El entorno
está perfecto" (suite 169/169, build OK).