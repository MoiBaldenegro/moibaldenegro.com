# Arquitectura — Qué significa "hacer un buen trabajo"

> Este documento define el estándar de calidad. Los agentes revisores
> evalúan código contra este archivo. Si no está aquí, no es un requisito.
> La tabla de carpetas es una **recomendación para un stack Astro/Node**;
> el proyecto destino la adapta a su stack (ver `docs/conventions.md`).

## Principios

1. **Capas claras.** Para un stack Astro/Node, el proyecto recomienda tener la
   siguiente estructura de carpetas (adaptable al stack real del destino):

   | Carpeta | Rol |
   |---------|-----|
   | `public/` | Archivos que se sirven tal cual en la raíz (SVG, favicons, logos). Nunca procesados ni hasheados por el build. |
   | `scripts/` | Scripts del arnés: validación, generación y orquestación (`check-format.mjs`). Se ejecutan con Node (`node scripts/<slug>.mjs`) y nunca se importan desde el código de la aplicación. |
   | `src/assets/` | Imágenes y recursos importados desde el código. El build los optimiza y hashea. Lo que se sirve tal cual va en `public/`, no aquí. |
   | `src/components/` | Componentes de UI del stack que no son layouts ni vistas de ruta. Cada uno importa su propia hoja de estilos del directorio de estilos. |
   | `src/domain/entities/` | Entidades del dominio: modelos tipados que mapean el contenido estructurado (`<Entidad>`). |
   | `src/domain/repositories/` | Repositorios: única vía de acceso a los datos. Entregan entidades leyendo desde archivos JSON. |
   | `src/data/` | Archivos JSON: única fuente de contenido estructurado. Los componentes jamás leen JSON directamente. |
   | `src/layouts/` | Componentes de layout. Todo el chrome compartido vive aquí (uno solo). |
   | `src/pages/` | Rutas. Un archivo por URL. |
   | `src/styles/` | Estilos. Tokens del diseño en un archivo central + un archivo por componente. |

2. **Sin dependencias externas.** Si una feature requiere una dependencia, primero se discute (estado `blocked`).

3. **Errores explícitos.** Las funciones que pueden fallar (un JSON malformado, un id que no existe, un recurso ausente) lanzan errores nombrados (`<Nombre>Error`), no devuelven valores falsy silenciosos. Un fallo silencioso es un bug disfrazado.

4. **Inmutabilidad por defecto.** `const` por defecto, tipos `readonly` para props y estructuras de datos. Las entidades son inmutables. Modificar = crear una nueva instancia. Nunca mutar props ni estado compartido.

5. **Atomicidad en disco.** El directorio de build (`dist/` o equivalente) es un artefacto generado: nunca se edita, ni se crea contenido en él a mano, ni se repara a medias. El build siempre regenera el directorio completo.

6. **Tokens, no valores sueltos.** Colores, espaciados, radios, sombras y tipografías solo desde las custom properties de los tokens del proyecto (definidos en su documento de diseño). Queda prohibido hardcodear valores.

7. **Estilos separados de la UI.** Nunca combinar estilos y marcado en el mismo archivo. Un componente solo contiene marcado; sus estilos viven en un archivo de estilos separado que el componente importa.

8. **Lógica separada de la UI.** JavaScript o lógica jamás en el mismo archivo que la UI o los estilos. El frontmatter/script de un componente se limita a imports y paso de datos. La lógica (parseo, transformación, validación, acceso a datos) se extrae a módulos del dominio o utilidades.

9. **Estático por defecto.** Cero JavaScript de runtime salvo justificación. No añadir frameworks ni scripts para interacción trivial.

10. **Rutas explícitas.** Una página por archivo en la carpeta de rutas, una URL por página. Sin lógica de routing manual.

11. **Un solo layout.** El chrome compartido (head, fuentes, estructura base) vive solo en el layout del proyecto. No crear layouts nuevos para variaciones menores; reutilizar el existente.

12. **Modularización estricta.** Ningún archivo supera las 100 líneas de código. Si es extremadamente necesario superarlas, se discute primero (estado `blocked`).

13. **Scripts del arnés.** Los scripts de `scripts/` son herramientas de validación, generación y orquestación que se ejecutan con Node (`node scripts/<slug>.mjs`) y **nunca se importan desde el código de la aplicación**: no forman parte del build ni del runtime. Usan únicamente la librería estándar de Node (`node:*` o rutas relativas), sin dependencias externas. Objetivo ≤100 líneas, con excepciones documentadas en la spec de la feature que las autoriza.

## Flujo de datos

```
JSON, Markdown (datos del dominio)
      │
      ▼
repositorio (repositorios del dominio)  →  entidades tipadas (entidades del dominio)
      │
      ▼
componentes de UI (importan estilos separados)
      │
      ▼
páginas → layout → HTML estático
```

```
build del stack
   ├─ código de la app → HTML/estáticos del build
   └─ public/ → copiado tal cual
      ↓
   dist/ (artefacto generado, nunca se edita a mano)
```

## Qué NO hacer

- No hardcodear colores, radios, espaciados ni fuentes — siempre tokens.
- No poner estilos embebidos dentro de un componente de UI — van en el directorio de estilos.
- No meter lógica en un archivo de UI — va en módulos separados.
- No superar las 100 líneas por archivo sin discusión previa.
- No hacer que los componentes lean JSON directamente — siempre vía repositorio.
- No editar el directorio de build a mano ni con scripts de terceros.
- No añadir frameworks o JS de runtime para interacción trivial.
- No CSS global para estilos que pertenecen a un componente.
- No crear layouts nuevos para variaciones menores — reutilizar un solo layout.
- No devolver fallos silenciosos: si algo puede fallar, que falle con un error nombrado.