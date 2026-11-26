# Memoria de moibaldenegro.com

Decisiones, convenciones y aprendizajes que cualquier agente futuro debe conocer.
Agrega entradas cortas y fechadas; no borres las de otros salvo que ya no sean ciertas.

## 2026-11-26

- Los proyectos destacados de `/whoami` viven en `src/data/about.json` (`projects[]`) y los renderiza `src/components/about/about-projects.astro` vía `AboutRepository`. Para añadir/quitar proyectos se edita solo ese JSON (test: `tests/about-projects.test.mjs`).
- `pnpm build` exige la variable pública `IN_MAINTENANCE` (env schema de Astro). Sin `.env`, usar `IN_MAINTENANCE=false pnpm build`. No es secreto.
- `tests/mxvi-foundation.test.mjs` fallaba en Windows: el manifiesto MXVI guarda hashes LF y rutas POSIX, pero el checkout trae CRLF y `\`. Ya normaliza ambos antes de comparar; no tocar la copia `src/styles/mxvi/` a mano.
