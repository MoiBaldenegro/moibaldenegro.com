# Informe de implementación — feature 7 posts-domain

- **Feature:** 7 — posts-domain (dominio de artículos sobre la colección `architecture`)
- **Spec:** `specs/07_posts-domain/requirements.md` (REQ-07-01..05)
- **Estado previo:** `pending` → marcada `in_progress` al inicio de la sesión.
- **Fecha:** 2026-08-10

## Verificación de sesión concurrente

Antes de escribir nada se comprobó en disco que no existía trabajo previo de la
sesión concurrente: `src/domain/entities/post.ts`, `src/domain/repositories/posts-repository.ts`,
`tests/posts-repository.test.mjs` ni `progress/impl_posts-domain.md` → **implementación desde cero**.

## Contexto leído

- `docs/architecture.md` (capas, errores explícitos, inmutabilidad, ≤100 líneas) y `docs/conventions.md`
  (nombres: `*DataError`, mensajes en español, PascalCase clases).
- `src/content.config.ts`: colección `architecture` con schema Zod (title, author, img, readtime,
  description, tags con transform a arreglo, created, updated) — NO modificado (feature previa content-config).
- `src/content/architecture/00-agilismo.md`: único artículo real de la colección.
- Patrón de los repositorios previos (features 5 y 6): constructor con inyección, validación de forma
  con helpers `expectString/expectNumber`, error nombrado con mensajes en español.

## Decisión de diseño (documentada en el test)

`astro:content` es un módulo virtual de Astro que **solo se resuelve dentro del build**; los tests
`node --test` corren con Node puro (fuera de Vite/Astro). Para que el ciclo rojo/verde funcione y el
repositorio siga siendo la única vía a la colección en runtime:

- `PostsRepository` recibe un `loadEntries` inyectable en el constructor (patrón de inyección de los
  repositorios previos, que reciben la `dataUrl`).
- El default `loadArchitectureEntries()` envuelve `getCollection('architecture')` de `astro:content`
  vía **import dinámico** (solo se ejecuta en runtime Astro, nunca en los tests).
- El test verifica por inspección (REQ-07-02) que el repositorio envuelve `astro:content` +
  `getCollection` + la colección `architecture`.

## Ciclo rojo/verde

### ROJO (antes del código de la feature)

`node --test tests/posts-repository.test.mjs` con el test recién escrito y sin repositorio:

```
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module
# 'C:\Users\Moises\Desktop\moibaldenegro.com\src\domain\repositories\posts-repository.ts'
# imported from C:\Users\Moises\Desktop\moibaldenegro.com\tests\posts-repository.test.mjs
...
# tests 1
# pass 0
# fail 1
```

### Implementación

- `src/domain/entities/post.ts` (11 líneas): `interface Post` con los 8 campos readonly
  (title, author, img, readtime, description, tags, created, updated) — REQ-07-01.
- `src/domain/repositories/posts-repository.ts` (89 líneas): `PostsRepository.getPosts()` entrega
  `Post[]` validando cada entrada; `PostsDataError` nombrado (REQ-07-03) con mensajes en español;
  default = `getCollection('architecture')` de `astro:content` (REQ-07-02) — REQ-07-04 garantizada
  como única vía para la UI (la feature 10 conectará el componente).

### VERDE

```
# node --test tests/posts-repository.test.mjs
# tests 8
# pass 8
# fail 0

# node --test "tests/**/*.test.mjs"  (suite completa)
# tests 47
# pass 47
# fail 0

# ./init.sh
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Alcance respetado

- `src/content.config.ts` NO se modificó (aprobado en la feature content-config).
- `latest-articles.astro` NO se tocó (se conectará al repositorio en la feature 10).
- Sin dependencias nuevas (astro ya es dependencia del proyecto).
- Entidad y repositorio ≤ 100 líneas (REQ-07-05, verificado por test).

## Pendiente

Revisión externa del reviewer (el líder la lanza).
