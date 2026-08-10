# AGENTS.md — Mapa de navegación para agentes de IA

> Este archivo es el **punto de entrada** para cualquier agente que trabaje en este
> repositorio. NO es una biblia de reglas: es un **mapa**. Lee solo lo que
> necesites cuando lo necesites (divulgación progresiva).

---

## 1. Antes de empezar (obligatorio)

1. Ejecuta `./init.sh` y verifica que termina sin errores (entorno perfecto). Si
   falla, **para** y resuelve lo que reporta antes de tocar código.
2. Lee `progress/current.md` para entender en qué estado quedó la última sesión.
3. Lee `feature_list.json` y elige **una** tarea con estado `pending`. No
   trabajes en más de una a la vez.

## 2. Mapa del repositorio

| Archivo / carpetas           | Qué contiene                                              | Cuándo leerlo |
|------------------------------|-----------------------------------------------------------|---------------|
| `KICKOFF.md`                 | Prompt inicial para arrancar la secuencia de trabajo con el líder | Cuando inicies una sesión de trabajo |
| `feature_list.json`          | Lista de tareas con estado (pending / in_progress / done / blocked) y criterios de aceptación | Siempre, al empezar |
| `progress/current.md`        | Estado de la sesión actual                       | Siempre, al empezar |
| `progress/history.md`        | Bitácora append-only de sesiones anteriores     | Si necesitas contexto histórico |
| `docs/architecture.md`      | Qué significa "hacer un buen trabajo" en este proyecto | Antes de implementar |
| `docs/conventions.md`       | Reglas de estilo, nombres, estructura           | Antes de escribir código |
| `docs/verification.md`      | Cómo verificar que tu trabajo funciona          | Antes de declaran una tarea como `done` |
| `CHECKPOINTS.md`            | Criterios objetivos de "estado final correcto"  | Para auto-evaluarte |
| `.opencode/agents/` y `.claude/agents/` | Definiciones de los agentes (spec_author, leader, implementer, reviewer, explorer) | Si orquestas trabajo |
| `scripts/check-format.mjs`  | Valida el formato de `feature_list.json` y `progress/` | Invocado por `init.sh` |
| `specs/`                    | Spec de requisitos por feature: `specs/<NN>_<name>/requirements.md` (EARS estricto) y `design.md` (solo si toca UI) | Antes de implementar y al revisar |

> Nota: las carpetas del código de la aplicación (`src/`, `tests/`, `public/`,
> etc.) dependen del stack del proyecto destino; el mapa de carpetas está en
> `docs/architecture.md`.

## 3. Reglas duras (no negociables)

- **Una sola feature a la vez.** No mezcles cambios de varias tareas en la misma sesión.
- **Tests antes que el código (test-first/TDD).** Ningún código se escribe
  antes que su test: el cambio empieza escribiendo el test en rojo contra la spec
  (`design.md` si existe), lo observas en rojo y luego implementas hasta dejar la
  suite en verde al terminar.
- **No declares una tarea `done` sin pruebas verdes.** Ejecuta `./init.sh` y
  asegúrate de que el bloque de tests pasa al 100%.
- **Documenta lo que haces** en `progress/current.md` mientras trabajas, no al final.
- **Deja el repositorio limpio** antes de cerrar la sesión (ver §5).
- **Si no sabes algo, busca en `docs/`** antes de inventarlo.

## 4. Cómo elegir una tarea

```
1. Abre feature_list.json
2. Filtra por status == "pending"
3. Coge la de menor "id"
4. Cambia su status a "in_progress" y guarda
5. Anota en progress/current.md: feature, hora de inicio, plan breve
```

## 5. Cierre de sesión (lifecycle)

Antes de terminar:

1. Ejecuta `./init.sh` — todo verde.
2. Si la tarea está acabada: marca `status: "done"` en `feature_list.json`.
3. Mueve el resumen de `progress/current.md` al final de `progress/history.md`.
4. Vacía `progress/current.md` dejando solo la plantilla.
5. No dejes archivos temporales, ni `print()` de debug, ni TODOs sin contexto.
6. Los artefactos de sesión (`progress/impl_<feature>.md`,
   `progress/review_<feature>.md`, `progress/research/`) son **permanentes**:
   se quedan en el repo como bitácora. No se borran al cerrar.

## 6. Si te bloqueas

- Relee la sección relevante de `docs/`.
- Si la herramienta no hace lo que esperas, **no inventes un vía alternativa**:
  documenta el bloqueo en `progress/current.md` y para la sesión.

## 7. Convenciones del proyecto (resumen de `docs/architecture.md`)

- **Estilos separados de la UI.** Nunca estilos dentro de un componente del stack;
  el CSS/estilos van en el directorio de estilos del stack y el componente lo importa.
- **Lógica separada de la UI.** El frontmatter/script de un componente de UI solo
  hace imports y paso de datos. La lógica va en módulos del dominio o utilidades
  separadas (`.ts` según stack).
- **Tokens, no valores sueltos.** Colores, espaciados, radios y sombras solo desde
  las custom properties del token del diseño del proyecto. Prohibido hardcodear.
- **Datos vía repositorio.** Los componentes jamás leen JSON directamente: siempre
  vía los repositorios del dominio (que entregan entidades desde los datos).
- **Máx. 100 líneas por archivo.** Si es extremadamente necesario superarlas, se
  discute primero (estado `blocked`).
- **Sin dependencias externas.** Si una feature requiere una dependencia, primero
  se discute (estado `blocked`).
- **Estático por defecto.** Cero JavaScript de runtime salvo justificación.
- **Un solo layout.** El chrome compartido de la UI vive solo en un layout del
  proyecto. No crear layouts nuevos para variaciones menores.
- **Rutas explícitas.** Una página por archivo en `src/pages/` (o equivalente del
  stack), una URL por página.
- **Scripts del arnés en `scripts/`.** Se crean dentro de una feature con ruta
  `scripts/<slug>.mjs`, prefijo de verbo y Node stdlib; nunca se importan desde el
  código de la aplicación. Reglas en `docs/architecture.md` y `docs/conventions.md`.

## 8. Development

Cuando arranques el dev server del stack, usa el modo background indicado en los
comandos del proyecto (ver `package.json` del destino).

Comandos típicos del arnés:

| Comando | Acción |
|---------|--------|
| `./init.sh` | Verifica entorno, formato y tests. Ejecutar SIEMPRE |
| `node scripts/check-format.mjs` | Valida formato del backlog, progreso y specs |
| `<gestor-paquetes> test` | Tests automáticos (node:test) |
| `<gestor-paquetes> build` | Build de producción |

Consulta la documentación oficial del framework del stack del proyecto antes de
tareas relacionadas con él (rutas, componentes, estilos).