# Review — feature 78

**Veredicto:** APPROVED

## Checkpoints
- Estilos en src/styles, ningún .astro con `<style>`: [x] (la 78 no toca .astro ni CSS)
- Sin lógica en UI; frontmatter solo importa: [x] (lógica pura en `src/domain/site-menu.ts`, wiring en `src/components/site-menu/site-menu.ts`; aún no hay .astro, lo crea la 79)
- Ningún componente lee JSON directamente: [x] (no aplica)
- Tokens, sin valores hardcodeados: [x] (no aplica, sin CSS)
- Archivos <= 100 líneas: [x] (`src/domain/site-menu.ts` 34, `src/components/site-menu/site-menu.ts` 78, `tests/site-menu-state.test.mjs` 100; el propio test lo verifica en REQ-78-25)
- Sin dependencias externas: [x] (`git diff package.json` vacío)
- Datos JSON válidos y tipados: [x] (no aplica)
- Errores nombrados `*Error`, sin fallos silenciosos: [x] (`MenuStateError`, mensajes en español con el valor recibido, site-menu.ts:20 y :23)
- `./init.sh` en verde: [x] (entorno, formato, tests al 100% y build OK; `node --test tests/site-menu-state.test.mjs` 5/5)
- Página correcta en desktop y móvil sin errores de consola: [ ] ← No aplica a la 78: no cambia nada visible y el módulo aún no se importa desde ningún .astro; la verificación en navegador pertenece a la 79.
- `feature_list.json` con la tarea en `done`: [ ] ← La 78 sigue en `in_progress`; el cierre lo hace el líder tras este APPROVED. No hay otra feature a medias (77 done, 79 pending).
- `progress/current.md` documenta la sesión: [x]
- Sin temporales, debug ni TODOs: [x]

## Pregunta de revisión
- Test antes que el código y en rojo: sí. `progress/impl_78.md` registra ROJO pass 0 / fail 5 antes de crear los módulos y VERDE 5/5 (suite 845/845) al final (REQ-78-23).
- Dependencias: la 78 no tiene `depends_on`; no se salta ninguna dependencia pendiente.

## Contraste con la spec (REQ-78-01..25)
- REQ-78-01..06: funciones puras sin `document`/`window`/`location` (el test lo comprueba en la línea 43). Toggle, cierres, `menuAttributes` y `menuEscapeAction` coinciden con la spec.
- REQ-78-07..10: firma `initSiteMenu(root, media, searchWillHandle)` con valores por defecto del navegador (site-menu.ts:26-30). La guarda de la línea 34 sale antes de registrar cualquier listener. `apply` sincroniza `data-menu`, `aria-expanded` y `aria-label` en la misma llamada (líneas 37-42).
- REQ-78-11/12: al abrir enfoca el primer `a, input, button` del panel (línea 46); al cerrar no enfoca nada del panel.
- REQ-78-13..16: el keydown se registra en el header (línea 55), no en document, así que se ejecuta antes que el listener de document de search-escape. `defaultSearchWillHandle` reutiliza por import `isSearchFocus`, `escapeAction`, `activeTerm` y `escapeContext` (líneas 7 y 20-24) sin redefinirlos.
- REQ-78-17..19: cierran el clic en document fuera del header, el clic en un enlace del panel y el focusout con relatedTarget fuera del header. Con relatedTarget null o dentro del header no cierra.
- REQ-78-20..22: `WeakSet` por root, por media y por header. `current`/`currentHeader` apuntan al header vigente. El test cubre tres inits con headers distintos (1 click y 1 change) y el doble init sobre el mismo header.
- REQ-78-24: `git diff` muestra cambios en `src/styles/layout.css` y `src/styles/tokens.css`, pero son de la feature 77 (sin commitear: token 64px y regla del logo). Ni la 78 ni sus archivos tocan Layout.astro, src/styles ni search-*.

## Observaciones no bloqueantes
1. `src/components/site-menu/site-menu.ts:11`: en el tipo `Header = HTMLElement & { dataset: DOMStringMap }`, la intersección con `dataset` es redundante y no se usa (el estado se lee con `getAttribute`). Se puede simplificar a `HTMLElement` si se vuelve a tocar el archivo.
2. Cada `initSiteMenu` vuelve a fijar `apply('closed')` (línea 49), también al reinicializar sobre el mismo header. Esto cumple REQ-78-08 y es lo correcto en cada navegación. Lo dejo anotado porque el informe dice que el re-init «comparte el estado»: comparte el atributo, pero lo deja en `closed`.

## Cambios requeridos (si aplica)
Ninguno.
