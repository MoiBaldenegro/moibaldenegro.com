# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

**27 — htb-api-graceful-degradation** — CERRADA (status `done` en
`feature_list.json`, 2026-08-13). `./init.sh` en "El entorno está perfecto"
(suite 177/177, build OK, formato OK). Resumen del ciclo en
`progress/impl_27_htb-api-graceful-degradation.md`:

- Test nuevo red-first `tests/htb-api-graceful-degradation.test.mjs` (8 tests,
  ROJO 1/8 → VERDE 8/8): REQ-27-01..06 (éxito → perfil; 5 modos de fallo →
  null), REQ-27-09 (getProfile sigue lanzando), REQ-27-07/10 estructural.
- `htb-profile-repository.ts` (95 → 100 líneas): `getProfileOrNull()` añadido
  (delega en getProfile + try/catch → null); `getProfile()` intacto; cabecera
  comprimida 3→1 y una línea en blanco eliminada.
- `htb-stadistics.astro` (39 → 40): obtiene el perfil con `getProfileOrNull()` y
  condiciona la sección con `{profile && ...}` (sin if/try/for/function ni
  console.*). La isla ya no puede responder 500 por datos de HTB (REQ-27-10).
- `tests/htb-stadistics-section.test.mjs`: ÚNICA aserción actualizada
  `/getProfile\(\)/` → `/getProfileOrNull\(\)/` (Decisión 5 del design);
  `tests/htb-profile-repository.test.mjs` sin tocar; entidad, tokens.css,
  htb-stadistics.css e index.astro sin cambios.
- Sin desviaciones de la spec (REQ-27-01..10, Decisiones 1-6 del design.md).
- Resolución CHANGES_REQUESTED: delta de `astro.config.mjs` (mtime 10:26,
  edición del humano lider, no de agentes) DOCUMENTADO Y CONSERVADO por
  decision explicita del humano — fijado por `tests/astro-config-dev-workaround.test.mjs` (4/4 verde).

**Estado final del backlog: 0 pendientes, 0 in_progress, 0 blocked — features
1-27 `done` conservadas en el array.** Pendiente real del líder: decidir si
abre re-review de features 19/21 por el fix de adapter (`nodejs_compat` +
`prerenderEnvironment: 'node'`) documentado en el ciclo 18-24. No hay
features nuevas canalizadas; si el usuario pide la reincorporación del enlace
a `/posts` desde `latest-articles.astro`, será feature propia (decisión
documentada en `specs/26_post-page-styles/design.md`, Decisión 4).

### Última sesión

**2026-08-13 — feature 27 cerrada (degradación elegante de la sección HTB).**
Ver `progress/history.md` (Sesiones 2026-08-13). `./init.sh` en "El entorno
está perfecto" (suite 177/177, build OK).