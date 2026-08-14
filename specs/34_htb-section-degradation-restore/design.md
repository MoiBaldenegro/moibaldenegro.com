# Diseño — Restauración de la degradación elegante de la sección HTB (feature 34)

## Contexto visual

- Componente: `src/components/htb-stadistics.astro`, sección «Estadísticas de
  Hack The Box» en la portada (`index.astro`, isla `server:defer`).
- Estado actual (modificado manualmente): la sección se renderiza SIEMPRE y
  cada campo muestra `profile?.x ?? 'N/D'` aunque el perfil sea null.
- Estado deseado (canónico de las features 27/32): la sección se renderiza
  solo cuando hay perfil (`{profile && ...}`); con perfil presente, los
  campos ausentes individuales muestran «N/D» (Decisión 6 de la feature 22).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Uso |
|-------|-----|
| `--color-surface` | fondo de la tarjeta de la sección |
| `--color-border` | borde de la tarjeta |
| `--radius-card` | radio de la tarjeta |
| `--color-text` / `--color-text-secondary` | título/intro y etiquetas |
| `--color-accent` | valores de las estadísticas |
| `--gap-card` | espaciados internos de la lista |
| `--container-max` | ancho máximo de la sección |

(La hoja `src/styles/htb-stadistics.css` ya los consume; no cambia.)

## Decisiones y constraints

- Decisión 1: el marcado condicional es `{profile && (<section ...>)}` —
  patrón exacto exigido por REQ-27-08 y REQ-32-04 (los tests lo fijan con
  regex `\{profile\s*&&`). No se usan `{#if}` de Astro ni lógica extra.
- Decisión 2: los seis campos conservan el fallback individual `?? 'N/D'`
  (Decisión 6 de la feature 22): con perfil presente, un campo que la API no
  devuelve se muestra como «N/D» sin romper la sección.
- Decisión 3: el frontmatter queda solo con imports, alias de envs con
  fallback `cloudflare:workers` (REQ-32-02/03) y la llamada a
  `getProfileOrNull()` — sin `console.*` ni lógica (REQ-22-06).
- Restricción del proyecto: estilos separados de la UI (la hoja ya existe y
  no cambia), ≤100 líneas por archivo, sin JS de runtime añadido.
- La normalización de la indentación (tabs → 2 espacios) de este componente
  se canaliza en la feature 37 `visual-polish-refactor` para no mezclar
  cambios.

## Alternativa descartada

- Alternativa considerada: mantener la tabla con «N/D» en todos los campos
  cuando no hay perfil (estado actual manual).
- Motivo del descarte: el contrato canónico (features 27/32) exige ocultar la
  sección sin perfil; los tests REQ-27-07/10 y REQ-32-04 lo fijan, y la
  experiencia visual es mejor (no se muestra una tabla vacía de datos de la
  API).
