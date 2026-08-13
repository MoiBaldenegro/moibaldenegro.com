# Diseño — htb-stadistics-section

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La portada (`src/pages/index.astro`): nueva sección de estadísticas del perfil de Hack The Box bajo la sección de artículos.
- ¿Estado actual y estado deseado? Actual: `src/components/htb-stadistics.astro` reescrito manualmente — fetch directo a `https://labs.hackthebox.com/api/v4/user/profile/basic/${HTB_USER_ID}` con `Authorization: Bearer ${HTB_API_TOKEN}`, dos `console.log` que registran marca del token y el `HTB_USER_ID` completo (el id está clasificado `secret` en el esquema env), sin hoja CSS propia, sin feature en backlog, y lógica (getText/getNumber, try/catch, fetch) dentro del frontmatter. Deseado: sección conforme — repositorio de dominio con fetch inyectable y validación (error nombrado), componente sin lógica ni console, con hoja `src/styles/htb-stadistics.css` de tokens, render `server:defer` con slot de fallback.

## Tokens usados (solo de los tokens existentes del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | de tokens.css | Fondo de la tarjeta de la sección |
| `--color-text` | de tokens.css | Título de la sección y valores |
| `--color-text-secondary` | de tokens.css | Etiquetas de las métricas |
| `--color-border` | de tokens.css | Borde de la tarjeta |
| `--color-accent` | de tokens.css | Acento de las métricas/estado |
| `--radius-card` | de tokens.css | Radios de la tarjeta |
| `--gap-card` | de tokens.css | Espaciado interno de la lista de métricas |
| `--container-max` | de tokens.css | Ancho del contenido de la sección |

> **No se añaden tokens**: `tokens.css` está en 96/100 líneas (límite regla 12).
> La hoja nueva consume únicamente tokens existentes; `aspect-ratio` u otros
> valores propios de layout se justifican en esta spec si fueran necesarios.

## Decisiones y constraints

- Decisión 1 (capas): la lógica de red/validación vive en
  `src/domain/repositories/htb-profile-repository.ts` (clase `HtbProfileRepository`
  con `fetch` inyectable, URL de la API constante, decodificación y validación de
  la respuesta; error nombrado `HtbProfileDataError`). El componente
  `htb-stadistics.astro` solo importa el repositorio, lo instancia e interpola —
  cero lógica en el frontmatter (reglas: repositorios única vía de datos,
  lógica separada de la UI, función que puede fallar lanza error nombrado).
- Decisión 2 (secretos): se elimina todo `console.log`/`console.error` del
  componente y del repositorio. El token y el id se usan exclusivamente en la
  cabecera `Authorization` del fetch; nunca se registran ni se muestran
  (REQ-22-06). `HTB_USER_ID` sigue siendo `secret` en el esquema env (pese a ser
  semipúblico, mantener la clasificación evita futuras fugas).
- Decisión 3 (SSR + fallback): la sección se renderiza con `server:defer`
  (isla de servidor diferida; la portada permanece prerender) y un slot de
  fallback "Cargando estadísticas de HTB..." mientras resuelve — regla
  "Estático por defecto": el único JS/SSR de runtime es este fetch justificado
  (dato externo por API; véase la decisión SSR de la feature 21).
- Decisión 4 (env opcional): `HTB_API_TOKEN` y `HTB_USER_ID` son `optional` en
  el esquema (REQ-22-07/08): si faltan, la sección no rompe la página y muestra
  el estado de fallback.
- Decisión 5 (estilos): hoja `src/styles/htb-stadistics.css` (BEM ligero
  `htb-stadistics__*`, ≤100 líneas, solo `var()` de la tabla, sin hex/rgba
  sueltos), importada únicamente por el componente; media queries al final.
- Decisión 6 (datos mínimos): se muestran los campos reales que devuelve la API
  v4 (nombre, nivel/rank, puntos, owns user/root, país, fecha de alta) — sin
  inventar contenido; los campos ausentes muestran "N/D".
- Restricciones del proyecto aplicables: capas claras, errores explícitos,
  datos vía repositorio, lógica fuera de la UI, estilos separados, ≤100 líneas,
  tokens, estático por defecto con excepción aprobada.

## Alternativa descartada

- Alternativa considerada: conservar el fetch directo dentro del componente (arreglando solo los `console.log` y añadiendo una hoja CSS).
- Motivo del descarte: viola "Datos vía repositorio" y "Lógica separada de la
  UI" (frontmatter con fetch/try/catch), hace la capa de datos no testeable con
  node:test (REQ-22-03/04) y perpetúa la edición manual fuera del arnés — la
  feature la canaliza con spec (test-first).