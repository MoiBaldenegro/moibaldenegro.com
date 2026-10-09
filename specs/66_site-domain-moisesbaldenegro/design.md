# Diseño — Dominio real moisesbaldenegro.com (feature 66 site-domain-moisesbaldenegro)

## Contexto visual

- Texto visible afectado: <title> de todas las páginas (composeTitle con BRAND), título de /about, alt del logo del header (lector de pantalla), name/short_name de la PWA instalada y og:site_name en tarjetas sociales.
- Estado actual: «moibaldenegro.com», dominio inexistente (NXDOMAIN).
- Estado deseado: «moisesbaldenegro.com». Sin cambios de layout, estilos ni tokens.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| (ninguno) | - | Cambio de texto, sin estilos |

## Decisiones y constraints

- Decisión 1 (revisable por el humano): la marca visible pasa a moisesbaldenegro.com porque es literalmente un nombre de dominio; mantener un dominio inexistente como marca confunde al lector.
- Decisión 2: los handles @moibaldenegro (X, hero.json, TWITTER_SITE) son identificadores de cuenta y no cambian.
- Decisión 3: el nombre del Worker y del paquete (moibaldenegro-web) no cambia: renombrar el Worker crea un despliegue nuevo en Cloudflare.
- Decisión 4: los tests que fijan el dominio viejo se actualizan dentro de esta feature con nota (precedente REQ-43-06).
- Restricciones: sin dependencias, ≤100 líneas por archivo, frontmatter solo con datos.

## Alternativa descartada

- Alternativa considerada: cambiar solo site (URLs) y conservar la marca moibaldenegro.com.
- Motivo del descarte: la marca es un nombre de dominio que no resuelve; se deja como opción si el humano revierte la Decisión 1.
