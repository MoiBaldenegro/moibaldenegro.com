# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- Feature en curso: 21 — related-posts-list

### Plan

- Verificar que las features 19 y 20 están en done (botón Siguiente + datos related)
- Escribir primero los tests de REQ-21-01..07 y observarlos en rojo
- Implementar sección Recomendados en [id].astro + estilos en post-next.css (sin tocar post.css)
- Dejar `./init.sh` en verde y documentar la evidencia en `progress/impl_21.md`

### Bitácora

- Features 19 y 20 verificadas en `done` en `feature_list.json`
- Feature 21 cambiada a `in_progress` en `feature_list.json`
- Tests `tests/related-posts-list.test.mjs` (REQ-21-01..07) escritos primero y observados en rojo: 6/8 en fallo (evidencia en `progress/impl_21.md`)
- Implementado: sección Recomendados en `[id].astro` (72 líneas) + extensión de `post-next.css` (71 líneas); `post.css` intacto en 100 líneas
- `./init.sh` en verde (formato OK, tests 488/488, build OK); informe en `progress/impl_21.md`
- Review `progress/review_21.md` con veredicto APPROVED (verificado en disco, sin cambios requeridos)
- Cierre: feature 21 marcada `done` en `feature_list.json` (conservada en el array); `./init.sh` re-verificado en verde al cierre
