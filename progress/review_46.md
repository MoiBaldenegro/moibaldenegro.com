# Review — feature 46 (ronda 2)

**Veredicto:** APPROVED

Alcance de la ronda 2: los tres cambios requeridos en la ronda 1, comprobados uno a uno, y una búsqueda de regresiones. Los cambios de otras features ya aprobadas que también están en el working tree no se han vuelto a revisar.

Verificación ejecutada: `./init.sh` terminó con exit 0 (harness, formato, tests y build en verde). `pnpm test` dio 672/672 con exit 0.

## Cambios de la ronda 1, punto por punto
1. **Las aserciones de escape ya comprueban la salida real.** Resuelto.
   - `tests/search-dedicated-view.test.mjs:119-125` (REQ-03-07) llama a `searchIndexJson([post], [])` con un post cuyo título es `'a </script> b'` y exige que la salida no contenga `</script`. Las líneas 120-121 documentan el ajuste con el precedente REQ-43-06.
   - `tests/search-landing-live-transition.test.mjs:200-204` (REQ-05-04) hace la misma comprobación sobre la salida real y documenta el ajuste en las líneas 200-201.
   - He repetido la mutación: quité el `.replace(...)` de `src/domain/search/index-json.ts:17` y ejecuté los dos archivos de test. Resultado: pass 43, fail 2, así que las dos aserciones ahora sí protegen el escape. Restauré el archivo y `cmp` confirma que es idéntico a la copia previa.
2. **Comentarios del frontmatter actualizados.** Resuelto. `src/pages/index.astro:16-18` y `src/pages/search.astro:10-12` ya no dicen que la página use `JSON.stringify` ni que escape por su cuenta: remiten a `searchIndexJson`. Ninguna de las dos páginas contiene ya el literal `<\/script`, por lo que ningún test depende de un comentario.
3. **Re-verificación.** Hecha. `./init.sh` está en verde, `pnpm test` da 672/672 y `progress/impl_46.md` registra la sección «Ronda 2».

## Regresiones
No hay. El dominio `src/domain/search/index-json.ts` no ha cambiado respecto a lo revisado en la ronda 1. Las páginas siguen sirviendo el script `application/json` `#search-index` `is:inline` con `set:html={indexJson}`. El build se completa.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>`): [x]
- C2 (frontmatter solo importa y pasa datos): [x]
- C3 (datos vía repositorio): [x]
- C4 (tokens): [x]  no aplica, no hay CSS
- C5 (100 líneas máx.): [x]  index.astro 34, search.astro 24, index-json.ts 18 (los dos archivos de test heredados ya superaban ese tamaño antes de esta feature y quedan fuera del alcance)
- C6 (sin dependencias externas): [x]
- C7 (`./init.sh` verde): [x]
- C8 (sin temporales, debug ni TODOs sin contexto): [x]  los comentarios obsoletos están corregidos
- Tests de la feature y heredados sin debilitar: [x]  la mutación lo demuestra

## Cambios requeridos
Ninguno.
