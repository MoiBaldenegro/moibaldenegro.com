# Diseño — feature 13 `mxvi-about`

## Contexto visual

- Fase 4 del refactor al design system MXVI: la página about (encabezado de
  perfil, cifras, experiencia, stack, proyectos, contenido, formación y
  filosofía) pasa a las clases `.mx-*`. El resultado visual no cambia
  (REQ-13-13).
- El design system recibe antes lo que no reproducía: el handle de texto del
  encabezado de perfil, las redes centradas en móvil, el título de sección sin
  margen dentro de `.mx-section` con su espaciado de letras y la medida de
  70ch del texto destacado.

## Tokens usados

Ninguno nuevo.

## Decisiones y constraints

- Decisión 1: `about.css` se conserva solo con el relleno vertical propio de la
  página (`.about`), distinto del de `.mx-page`; el ancho y el espaciado entre
  secciones vienen de `.mx-container` y `.mx-stack`.
- Decisión 2: las tarjetas de stack, proyectos, contenido y formación usan
  `mx-card mx-card--interactive` (la base de tarjeta del design system) más su
  variante.
- Restricciones: ≤100 líneas por archivo, estilos separados de la UI, sin
  dependencias, sin JavaScript de runtime.

## Alternativa descartada

- Usar `.mx-page` como contenedor.
- Motivo del descarte: su relleno (48/64 px) no es el de la página about
  (42/56 px) y movería todo el contenido.
