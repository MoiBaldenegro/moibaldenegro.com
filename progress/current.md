# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

_Fix puntual (sin feature_list.json en este repo): content-config — crear `src/content.config.ts` y quitar console.log de latest-articles.astro._

### Plan

- Confirmar causa raíz: no existe `src/content.config.ts` en Astro 7 → `getCollection('architecture')` recibe `never` (ts2769). ✔
- ROJO: ejecutar `pnpm build` y capturar el error. ✔
- Crear `src/content.config.ts` con colección `architecture` (Zod, frontmatter real de `00-agilismo.md`). ✔
- Quitar `console.log(arch_articles)` de `src/components/latest-articles.astro`. ✔
- VERDE: ejecutar `pnpm build` y verificar que pasa sin errores. ✔
- Escribir `progress/impl_content-config.md` con evidencia rojo/verde. ✔

### Observaciones

- Astro 7.2.0: `legacy.collectionsBackwardsCompat: false` por defecto → la colección necesita loader `glob()` de `astro/loaders` para poblarse en runtime (sin loader el sync la omite y el build avisa "collection does not exist or is empty"). Desviación documentada en el informe.
- Existe `src/config.ts` con definición de colecciones en ubicación NO reconocida por Astro (código muerto, no importado). FUERA DE ALCANCE: no se tocó, solo documentado en el informe.
- `./init.sh` completo fallará por piezas del harness ajenas (sin feature_list.json, sin scripts/check-format.mjs, sin script test) — conocido, fuera de responsabilidad; verificación de sesión = `pnpm build`.

### Bitácora

- 2026-08-10: ROJO capturado (`The collection "architecture" does not exist or is empty` + `[]`). Implementado `src/content.config.ts` (con loader glob) y eliminado console.log. VERDE confirmado: build completo sin warnings; `dist/index.html` renderiza el artículo con tags `#arquitectura #agilismo #software-design`. Informe escrito en `progress/impl_content-config.md`.

### Estado: LISTO PARA REVISIÓN (no marcar done; el reviewer decide).
