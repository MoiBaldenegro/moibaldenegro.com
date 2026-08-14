# Diseño — view-transitions

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? Todo el sitio (chrome del layout) y las cards de artículos de la portada (`src/components/latest-articles.astro`).
- ¿Estado actual y estado deseado? Actual: `ClientRouter` de `astro:transitions` en `Layout.astro` (head) y atributos `transition:name` en las cards (img/title) añadidos manualmente fuera del arnés — JS de runtime sin justificación ni spec. Deseado: el mecanismo canalizado como feature con spec/design/tests y la excepción a "Estático por defecto" aprobada y documentada; la feature 20 elimina primero los atributos sueltos del componente y esta feature los reincorpora según este design.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--transition-default` | de tokens.css (.28s cubic-bezier(.2,.8,.2,1)) | Duración/timing de las animaciones de transición de vista |

> No se añaden tokens: tokens.css está en 96/100 líneas. El token de
> transición ya existe (grupo transición) y se aplica a las animaciones
> `view-transition-*` vía una regla en una hoja del proyecto (o la animación
> por defecto del framework si la duración del token no aplica); el test
> verifica estructura, no valores.

## Decisiones y constraints

- Decisión 1 (mecanismo): se mantiene `ClientRouter` en la cabecera del layout
  único (import de `astro:transitions` + `<ClientRouter />` en `<head>`), que
  habilita las transiciones de vista entre páginas del sitio.
- Decisión 2 (alcance): los atributos `transition:name` se aplican a las cards
  de `latest-articles` — pares `img-${post.id}` (imagen) y `title-${post.id}`
  (título) por card, tal como los añadió el usuario, ahora definidos en spec.
- Decisión 3 (justificación de la excepción a "Estático por defecto", regla 9
  de docs/architecture.md): View Transitions es una API declarativa y nativa
  del framework que anima la navegación entre páginas sin escribir JavaScript
  manual; el usuario pidió explícitamente el mecanismo (añadido manualmente y
  confirmado al líder: canalizarlo como feature con spec). El coste se limita a
  las páginas que declaran atributos `transition:*`.
- Decisión 4 (dependencia con la feature 20): la restauración de
  `latest-articles.astro` primero elimina los `transition:name` sueltos; esta
  feature los reincorpora según este design, de modo que cada cambio queda
  cubierto por su spec y sus tests (test-first, ciclo rojo/verde).
- Decisión 5 (verificación): `tests/view-transitions.test.mjs` inspecciona
  `Layout.astro` (import + `<ClientRouter />` en la cabecera) y
  `latest-articles.astro` (pares transition:name definidos), sin build ni
  navegador — patrón de inspección de las features previas.
- Restricciones del proyecto aplicables: estático por defecto con excepción
  aprobada y documentada, ≤100 líneas por archivo, sin dependencias nuevas
  (astro:transitions es parte de Astro, no una dependencia externa), tokens.

## Alternativa descartada

- Alternativa considerada: eliminar las transiciones por completo (volver al
  estado canónico sin `ClientRouter` ni atributos).
- Motivo del descarte: el usuario incorporó el mecanismo deliberadamente y,
  consultado el líder, la decisión fue canalizarlo como feature con spec — no
  revertirlo. Eliminarlo sin consulta habría descartado trabajo intencional del
  usuario.