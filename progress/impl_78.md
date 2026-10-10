# Informe de implementación — feature 78 site-menu-state

Implementado por el líder en rol de implementer (autorización humana; subagente implementer no
disponible). Lógica y wiring del menú hamburguesa móvil; la UI es la feature 79.

## Ciclo rojo/verde (REQ-78-23)

- tests/site-menu-state.test.mjs (100 líneas) escrito primero, con fakes de DOM contables
  (patrón code-copy). ROJO: pass 0 / fail 5 (no existían los módulos).
- VERDE: 5/5. Suite completa 845/845; ./init.sh en verde.

## Cambios

- src/domain/site-menu.ts (34 líneas), puro, sin document, window ni location:
  - nextMenuState: toggle alterna y escape, outside, link, focus-out y desktop cierran;
  - MenuStateError con el valor recibido en el mensaje;
  - menuAttributes (aria-expanded y aria-label «Abrir menú» / «Cerrar menú»);
  - menuEscapeAction.
- src/components/site-menu/site-menu.ts (78 líneas): initSiteMenu(root, media, searchWillHandle),
  con valores por defecto document, matchMedia('(max-width: 768px)') y una coordinación con la
  búsqueda que importa isSearchFocus, escapeAction, activeTerm y escapeContext de search-escape.ts.
  - El estado vive en data-menu del header (un re-init sobre el mismo header comparte el estado).
  - Cada cambio aplica a la vez data-menu, aria-expanded y aria-label.
  - Al abrir, el foco va al primer a, input o button del panel.
  - Escape cierra y devuelve el foco al botón, salvo si la búsqueda lo consume.
  - Los listeners de keydown y focusout van en el header, no en document (REQ-78-16).
  - Cierran también el clic en el documento fuera del header, el clic en un enlace del panel, el
    focusout con relatedTarget fuera del header y el change de la consulta a escritorio.
  - Sin header, botón o panel: no lanza y no registra nada.
  - Listeners únicos: WeakSet por header, por root y por consulta. El listener de documento actúa
    sobre el header vigente.
- Sin cambios en Layout.astro, src/styles, los componentes de búsqueda ni package.json
  (REQ-78-24/25). El módulo aún no se importa desde ningún .astro: lo conecta la 79.

Nota: git status muestra src/styles/layout.css y tokens.css como modificados; son cambios de la feature 77 (header de 64 px, aprobada) aún sin commitear, no de la 78.
