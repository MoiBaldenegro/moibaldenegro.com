---
slug: 04-introduccion-al-diseño-de-api
title: Entrevista de diseño de sistemas
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 5
description: Una guía paso a paso para abordar el diseño de sistemas qué es, en qué se diferencia del diseño OOP, qué habilidades exige y qué requerimientos no funcionales debes considerar.
tags: "#api #rest #software-design #api-design"
created: "22 Octubre 2026"
updated: "22 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/00-systems-design-template]
---

# Introduccion
---
La disciplina del diseño de APIs se encarga de estructurar cómo interactúan los diferentes módulos de un sistema mediante la especificación de rutas, cargas útiles (payloads) y métodos permitidos. Dentro de las entrevistas de arquitectura y diseño de sistemas, sobre todo para candidatos junior, es un clásico resolver un caso práctico planteando una API RESTful. No obstante, a pesar de que GraphQL compite fuertemente en la industria actual, las entrevistas siguen girando mayoritariamente en torno a REST.



## Que es una API Rest?
---
Piensa en REST como una convención universal para estructurar la comunicación web. En lugar de inventar formas complejas de pedir información, REST aprovecha lo que el navegador ya sabe hacer: usa URLs para identificar los datos y los métodos HTTP estándar para realizar las operaciones básicas sobre ellos.



## Ejemplos de API RESTful
---
GET /users: Recuperar una lista de usuarios.
POST /users: Crea un nuevo usuario.
GET /users/{id}: Recuperar un usuario por ID.
PUT /users/{id}: Actualizar un usuario por ID.
DELETE /users/{id}: Eliminar un usuario por ID.


## Mejores Prácticas y Errores Comunes en API REST

Diseñar APIs RESTful suele ser sencillo, pero existen ciertos errores clásicos que es crucial evitar desde el principio. Uno de los más comunes tiene que ver con cómo nombramos las URLs.

---

### La regla de oro: Sustantivos, no verbos

En el diseño RESTful, **la URL representa un recurso (un sustantivo)**, mientras que **el método HTTP representa la acción (el verbo)** que ejecutamos sobre él. Incluir acciones dentro de la ruta es redundante y rompe el estándar REST.

---

### ❌ El camino equivocado (Tratar la URL como una acción)

Si incluyes verbos en la URL, estás duplicando la intención porque el método HTTP ya define la acción:

* `GET /getSongs` $\rightarrow$ *"Obtener todas las canciones"* (Redundante: `GET` ya significa obtener).
* `POST /createNewTrack` $\rightarrow$ *"Crear un nuevo track"* (Redundante: `POST` ya indica creación).
* `POST /deleteVessel/1` $\rightarrow$ *"Borrar a Vessel"* (Incorrecto: usar `POST` para eliminar en lugar del método apropiado).

---

### ✅ El camino correcto (Usar sustantivos y métodos HTTP)

La URL únicamente nombra la entidad o recurso, y el método HTTP se encarga de definir qué operación realizar:

| Método HTTP | Ruta (URL) | Acción del sistema (Ejemplo con Billie Eilish / Sleep Token) |
| :--- | :--- | :--- |
| **`GET`** | `/songs` | Recupera el listado completo de canciones. |
| **`POST`** | `/songs` | Agrega un nuevo track al catálogo (ej. *"Birds of a Feather"*). |
| **`GET`** | `/songs/take-me-back-to-eden` | Obtiene la información detallada de esa canción específica. |
| **`DELETE`** | `/songs/take-me-back-to-eden` | Elimina esa canción del catálogo. |

---

> 💡 Piensa en la URL como el estante de la tienda donde está guardado el disco (**el objeto**), y en el método HTTP como lo que haces con las manos (**la acción**: mirarlo con `GET`, agregar uno nuevo con `POST` o tirarlo a la basura con `DELETE`). **¡Jamás pongas la acción dentro de la etiqueta del estante!**


### 2. No utilizar métodos HTTP adecuados (Ignorar la semántica de la web)

#### ❌ El camino equivocado:
Usar siempre `POST` para todo y añadir la acción en la ruta:
* `POST /songs/take-me-back-to-eden/update` para actualizar los datos de una canción.

#### ✅ El camino correcto:
Aprovechar el propósito exacto de cada método HTTP:
* `PUT /songs/123` para actualizar el recurso de manera directa.

Cada verbo HTTP tiene una misión única: `GET` consulta, `POST` crea, `PUT` actualiza y `DELETE` elimina. Respetar esta regla hace que tu API sea intuitiva y fácil de usar para cualquier desarrollador.

---

### 3. Usar siempre el mismo código de estado (El clásico "Todo OK 200" para todo)

#### ❌ El camino equivocado:
Devolver siempre un código `200 OK` por pereza, incluso cuando creas algo nuevo o eliminas un registro.

#### ✅ El camino correcto:
Usar los códigos de estado HTTP para que hablen por sí mismos:
* `200 OK`: Para consultas exitosas (`GET`) o actualizaciones correctas (`PUT`).
* `201 Created`: Para indicar que un recurso se creó exitosamente con un `POST` (por ejemplo, al registrar una nueva pista en el sistema).
* `204 No Content`: Para confirmar que un elemento se eliminó con éxito (`DELETE`) y no hay contenido que devolver.
* `404 Not Found`: Cuando buscas una canción, artista o álbum que no existe.

Esto permite que la aplicación cliente entienda el resultado de inmediato con solo mirar el código, sin necesidad de abrir y analizar todo el cuerpo de la respuesta.

---

### 4. Convenciones de nomenclatura inconsistentes (Mezclar singular y plural)

#### ❌ El camino equivocado:
Alternar entre singular y plural de forma aleatoria en las rutas:
* `/song/123` y luego `/albums`.

#### ✅ El camino correcto:
Mantener una consistencia estricta, usando siempre **sustantivos en plural** para los recursos:
* `/songs/123` y `/albums`.

La coherencia en el diseño ahorra dolores de cabeza y permite a los equipos predecir cómo estructurar o consumir los puntos finales sin confusiones.

---

### 5. Olvidar la paginación (Devolver todo de un solo golpe)

#### ❌ El camino equivocado:
Intentar traer el catálogo masivo de miles de canciones o mercancía de Billie Eilish en una sola respuesta. Esto genera consultas lentas y puede colapsar el servidor o la red del cliente.

#### ✅ El camino correcto:
Implementar paginación mediante parámetros de consulta (*query parameters*):
* `GET /songs?page=2&limit=50`

Entregar la información por bloques manejables protege el rendimiento del sistema y mejora drásticamente la experiencia del usuario.

---

Veamos un ejemplo real de diseño de API REST en nuestro proximo articulo.




**Tags:** `#arquitectura` `#escalabilidad` `#software-design`