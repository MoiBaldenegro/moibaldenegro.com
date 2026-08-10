# CHECKPOINTS — Criterios objetivos de "estado final correcto"

> Auto-evaluación antes de dar una tarea por terminada. Si algo de aquí no se
> cumple, la tarea NO está `done`.

## Arquitectura (docs/architecture.md)

- [ ] Los estilos están separados de la UI; ningún componente del stack
      contiene estilos embebidos (`<style>` o equivalente).
- [ ] No hay lógica en archivos de UI; el frontmatter/script de los componentes
      solo importa y pasa datos.
- [ ] Ningún componente lee JSON directamente: todo pasa por los repositorios
      del dominio.
- [ ] Colores, espaciados, radios y sombras vienen de los tokens del diseño del
      proyecto; no hay valores hardcodeados.
- [ ] Ningún archivo del proyecto supera las 100 líneas (o hay discusión
      registrada con estado `blocked`).
- [ ] No se añadieron dependencias externas sin discusión previa.

## Datos

- [ ] Los datos del dominio (`src/data/*.json` o equivalente del stack) son
      válidos y sus entidades los tipan.
- [ ] Los repositorios validan y lanzan errores nombrados (`*Error`), sin
      fallos silenciosos.

## Verificación

- [ ] `./init.sh` termina en verde (entorno, formato, tests al 100%, build).
- [ ] La UI se ve correcta en desktop y móvil (breakpoint del stack) sin
      errores en consola.

## Harness

- [ ] `feature_list.json` tiene la tarea en `done` (y ninguna otra a medias).
- [ ] `progress/current.md` documenta la sesión y `progress/history.md` está
      al día.
- [ ] No quedan archivos temporales, `print()` de debug ni TODOs sin contexto.