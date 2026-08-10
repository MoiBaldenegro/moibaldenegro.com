# Verificación — Cómo comprobar que el trabajo funciona

> Antes de declarar cualquier tarea como `done`, pasa por esta lista.
> La puerta de entrada es SIEMPRE `./init.sh`.

## 1. Entorno y formato (siempre)

```
./init.sh
```

Comprueba, en orden:

1. Herramientas disponibles (node y el gestor de paquetes del proyecto) y
   dependencias instaladas.
2. Existencia de los archivos del harness (`AGENTS.md`, `feature_list.json`,
   `progress/current.md`).
3. Formato correcto de `feature_list.json`, `progress/current.md` y specs EARS
   (`scripts/check-format.mjs`, que integra la validación de
   `specs/<NN>_<name>/requirements.md` de toda feature no-done).
4. Tests automáticos al 100% (node:test).
5. Build de producción del stack.

Resultado:

- Todo verde → `El entorno está perfecto. Podemos empezar a trabajar.`
- Cualquier fallo → reporta exactamente qué falla y **no se debe continuar**
  hasta resolverlo.

## 2. Regresión visual (si tocas UI)

- Arranca el dev server del stack en modo background y revisa la página.
- Responsive: prueba el breakpoint móvil del stack.
- Verifica en los logs del dev server que no hay errores.

## 3. Convenciones

- `docs/architecture.md` y `docs/conventions.md` (estilos separados de la UI,
  lógica en módulos del dominio, tokens, ≤100 líneas por archivo, datos vía
  repositorio, scripts del arnés en `scripts/`).
- La implementación es coherente con su spec `specs/<NN>_<name>/requirements.md`
  (y `design.md` si existe) y con la estructura `specs/` de
  `docs/conventions.md`.

## 4. Estado del harness

- `feature_list.json` refleja el estado real de la tarea.
- **Test-first (TDD):** los tests se escriben contra la spec (`design.md` si
  existe) ANTES del código y se observan **en rojo** antes de implementar; la
  suite queda **en verde** al terminar; el informe
  `progress/impl_<feature>.md` incluye la evidencia del ciclo rojo/verde
  (salida del test en rojo y de la suite en verde).
- El reviewer valida la implementación contra `specs/<NN>_<name>/requirements.md`
  (`design.md` si existe) y la coherencia entre los `acceptance` de
  `feature_list.json` y los REQ de la spec (trazabilidad acceptance↔REQ).
- `progress/current.md` documenta la sesión.
- `progress/history.md` recibe el resumen al cerrar.
- **Ninguna tarea se da por cerrada** sin `progress/review_<feature>.md`
  con veredicto `APPROVED` (lo lanza el líder, nunca el implementer).