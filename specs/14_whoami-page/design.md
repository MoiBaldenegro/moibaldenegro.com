# Diseño — feature 14 `whoami-page`

## Contexto visual

- Petición humana (2026-11-11): la página «About» pasa a llamarse `whoami`,
  como el comando de Unix, por el juego de palabras con «quién soy» y el tono
  de ciberseguridad del sitio.
- Solo cambian el texto del enlace del header y del footer, el título de la
  pestaña y la URL. El contenido y el aspecto de la página no cambian.

## Tokens usados

Ninguno.

## Decisiones y constraints

- Decisión 1: el texto va en minúsculas, `whoami`, exactamente como el comando.
- Decisión 2: la URL también cambia a `/whoami`; `/about` y `/about/` responden
  301 a `/whoami` desde el middleware (mismo módulo que las redirecciones de
  slugs antiguos) para no romper enlaces externos ni el posicionamiento.
- Decisión 3: los componentes internos (`src/components/about/`, `about.json`,
  `AboutRepository`) conservan su nombre: son detalles de implementación que no
  ve el visitante.
- Restricciones: ≤100 líneas por archivo, sin dependencias.

## Alternativa descartada

- Cambiar solo el texto y conservar la URL `/about`.
- Motivo del descarte: el texto del enlace y la URL dejarían de coincidir.
