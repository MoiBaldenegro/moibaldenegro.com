# Convenciones — Reglas de estilo, nombres y estructura

> Complementa `docs/architecture.md`. Aquí viven las decisiones concretas de
> estilo y nombres. Si algo contradice a `architecture.md`, manda la arquitectura.
> Se adaptan al stack del proyecto destino (ver `docs/architecture.md`).

## Nombres

| Qué | Convención | Ejemplo |
|-----|-----------|---------|
| Carpetas | kebab-case, plural | `src/components/`, `src/styles/` |
| Componentes de UI del stack | PascalCase | `<Componente>.astro` (o extensión del stack) |
| Archivos de estilos | kebab-case, nombre del componente | `<componente>.css` |
| Archivos del dominio | PascalCase para clases/entidades, camelCase para utilidades | `<Entidad>.ts`, `<entidad>Repository.ts` |
| Archivos de `scripts/` | kebab-case, prefijo de verbo, ruta `scripts/<slug>.mjs` | `scripts/validate-feature-list.mjs`, `scripts/check-format.mjs` |
| Tipos e interfaces | PascalCase | `<Tipo>` |
| Funciones | camelCase, verbo primero | `getDatos()`, `parseEntidad()` |
| Errores | Clase PascalCase + sufijo `Error`, nombre en español | `<Entidad>DataError` |
| Custom properties | `--grupo-nombre`, kebab-case | `--color-principal`, `--sombra-tarjeta` |
| Clases CSS | BEM ligero: bloque, `--` para variantes | `.tarjeta`, `.tarjeta-icono--rojo` |
| Mensajes de error/UI | Español | `datos.json: la entidad "x" tiene un valor inválido` |

## Estructura

- **Un componente = un archivo de componente + una o más hojas en el directorio
  de estilos del stack**.
- **Una entidad = un archivo** en el directorio de entidades del dominio.
- **Un repositorio = un archivo** en el directorio de repositorios del dominio,
  una única responsabilidad (una fuente de datos).
- **Un dato = una entrada** en los datos estructurados del proyecto (`*.json`),
  tipada por su entidad.
- **Un script = un archivo** en `scripts/`, nombrado `scripts/<slug>.mjs`
  (kebab-case con prefijo de verbo). Verbos admitidos (lista cerrada): `check-`,
  `validate-`, `generate-`, `build-`, `deploy-`, `audit-`. Un verbo nuevo se
  añade a esta lista y a la auditoría de la convención como extensión de
  contrato, nunca en silencio. Todo script nuevo se declara en la spec de la
  feature con su ruta completa y acceptance (nunca ad-hoc en implementación).
- **Una spec por feature** en `specs/<NN>_<name>/`: `requirements.md`
  (SIEMPRE, EARS estricto: una línea = un requerimiento = exactamente un
  `SHALL`, IDs `REQ-<NN>-<xx>`, sin verbos vagos) y `design.md` (solo si la
  feature toca UI/presentación). `<NN>` = id con padding a 2 dígitos,
  `<name>` = slug kebab-case del `name` de la feature. Las plantillas viven
  en `specs/_template/`.

## Orden dentro de un archivo de componente

1. Frontmatter/encabezado: imports de estilos, imports de dominio, `const` de datos.
2. Marcado semántico.
3. Sin estilos embebidos, sin lógica, sin scripts.

## Estilos

- Todo valor de color, espaciado, radio, sombra o fuente sale de los tokens del
  diseño del proyecto.
- Media queries y estados (hover/active) al final del archivo de estilos.
- Responsive: breakpoint móvil del stack, en orden móvil-primero.

## Commits

- Mensajes en inglés, verbos imperativos, concisos: `add sección principal`,
  `fix ventana ultra ancha`.
- Un commit por feature o fix; sin cambios no relacionados mezclados.