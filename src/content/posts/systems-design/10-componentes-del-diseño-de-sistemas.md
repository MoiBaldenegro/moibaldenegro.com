---
slug: 07-componentes-del-diseno-de-sistemas
title: Componentes del diseño de sistemas
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 6
description: "Balanceo de carga, caché, particionamiento, replicación, colas de mensajes y procesamiento por lotes: cómo cada componente afecta la disponibilidad, escalabilidad, latencia y consistencia de un sistema."
tags: "#diseno-de-sistemas #arquitectura #componentes #escalabilidad #consistencia"
created: "23 Octubre 2026"
updated: "23 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/06-requisitos-no-funcionales, /posts/02-desafios-en-sistemas]
---

## Los bloques con los que se construye un sistema

En la entrada anterior vimos los requisitos no funcionales. Ahora toca ver con qué piezas los resolvemos. Cada componente que agregamos a una arquitectura mejora unos requisitos y complica otros, y entender ese balance es lo que nos permite justificar las decisiones de diseño.

Para los ejemplos seguiremos con una plataforma de música: canciones de Billie Eilish y Sleep Token, playlists, historial de reproducciones y un montón de usuarios escuchando al mismo tiempo.

---

## Balanceo de carga

El balanceo de carga **distribuye el tráfico** de red o de aplicaciones entre varios servidores, de modo que ninguno se convierta en un cuello de botella o en un punto único de falla.

Imagina el día que sale un álbum nuevo: miles de usuarios abren la app al mismo tiempo. El balanceador reparte esas solicitudes entre todas las instancias disponibles.

![Diagrama de balanceo de carga entre varios servidores](/assets/balanceo-de-carga-componentes.webp)

**Cómo afecta a los requisitos no funcionales:**

- **Disponibilidad:** si un servidor falla, el balanceador redirige el tráfico a los servidores que siguen operando.
- **Escalabilidad:** al repartir la carga de forma pareja, el sistema atiende más solicitudes simultáneas y puede crecer agregando servidores.
- **Latencia:** al evitar que un solo servidor se sature, se mantienen tiempos de respuesta rápidos.

---

## Almacenamiento en caché

El caché guarda una **copia de los datos en un almacenamiento temporal y rápido**, para que las siguientes solicitudes de esos datos se resuelvan más rápido. Por ejemplo, la portada de un álbum o el ranking de las canciones más escuchadas de la semana no necesitan consultarse a la base de datos en cada solicitud.

**Cómo afecta a los requisitos no funcionales:**

- **Disponibilidad:** de forma indirecta, al reducir la carga del sistema ayuda a prevenir sobrecargas y fallas.
- **Escalabilidad:** al servir rápido los datos más consultados, descarga a la fuente principal y permite atender a más usuarios.
- **Latencia:** entregar datos desde el caché es mucho más rápido que ir a la fuente principal, así que baja de forma notable el tiempo de respuesta.
- **Consistencia:** aquí está el costo. Puede aparecer el problema de los **datos obsoletos**: si cambia el dato original en la base de datos pero el caché no se actualiza, los usuarios ven información desactualizada. Imagina que el nombre de una playlist cambia y el caché sigue mostrando el anterior.

---

## Particionamiento (*sharding*)

El particionamiento divide una base de datos en **partes más pequeñas y manejables**. Permite almacenar y procesar más datos de los que podría manejar un solo sistema de base de datos. Por ejemplo, podemos guardar el historial de reproducciones separando a los usuarios por rangos de ID.

**Cómo afecta a los requisitos no funcionales:**

- **Disponibilidad:** si una partición falla, las demás siguen sirviendo sus datos. Si además la combinamos con replicación, una réplica puede seguir atendiendo cuando una partición cae.
- **Escalabilidad:** los datos se reparten entre varios nodos y, conforme el sistema crece, se pueden agregar más particiones.
- **Latencia:** al mantener juntos los datos relacionados, las consultas se enrutan directo a la partición donde viven los datos y no hay que buscar en todo el conjunto.
- **Rendimiento:** al repartir los datos, distintas consultas se ejecutan en paralelo en distintas particiones, lo que aumenta las operaciones por segundo que el sistema puede manejar.
- **Consistencia:** se vuelve más difícil mantenerla cuando los datos están repartidos entre varios nodos. Con buen diseño y protocolos como la confirmación en dos fases (*two-phase commit*) se puede lograr consistencia fuerte. Una buena práctica es mantener en la misma partición los datos que deben leerse y escribirse de forma consistente.

---

## Replicación

La replicación consiste en **crear y mantener múltiples copias de los datos**. Si la fuente principal falla, hay respaldos disponibles, y las lecturas se pueden repartir entre las copias.

**Cómo afecta a los requisitos no funcionales:**

- **Disponibilidad:** si la fuente principal se cae, el sistema sigue funcionando con las copias de respaldo.
- **Escalabilidad:** las solicitudes de lectura se distribuyen entre varias copias, lo que reduce la carga de cada servidor. Piensa en miles de usuarios consultando la misma playlist popular.
- **Consistencia:** el reto principal. Cuando hay varias copias del mismo dato, todas deben cambiar juntas, y eso es complicado, sobre todo en las escrituras. Si se actualiza una copia y las otras no, distintas personas verán cosas diferentes. Para esto existen reglas como la **consistencia fuerte**, la **consistencia eventual** y la **consistencia causal**, que buscan que las copias sean iguales o, al menos, que lo sean con el tiempo.

---

## Cola de mensajes

Una cola de mensajes ofrece **comunicación asíncrona**: quien envía el mensaje y quien lo recibe no necesitan interactuar con la cola al mismo tiempo. Un ejemplo es registrar cada reproducción para las estadísticas del artista. El servicio responde de inmediato al usuario, y el registro se procesa después.

**Cómo afecta a los requisitos no funcionales:**

- **Disponibilidad:** muchas colas conservan los mensajes hasta que se procesan, así que no se pierden tareas importantes aunque un componente falle.
- **Escalabilidad:** al sacar tareas de los hilos principales de la aplicación y atenderlas de forma asíncrona, el sistema puede manejar volúmenes mayores de trabajo.

---

## Procesamiento por lotes

El procesamiento por lotes (*batch*) ejecuta **una serie de trabajos todos juntos**, en lugar de uno por uno, normalmente en horarios de poca actividad. Es útil para tareas no interactivas, donde el tiempo de entrega es menos crítico. Por ejemplo, generar cada semana el resumen de las canciones más escuchadas de cada usuario o hacer copias de seguridad.

**Cómo afecta a los requisitos no funcionales:**

- **Escalabilidad:** al agrupar tareas similares y procesarlas como una unidad, se manejan grandes volúmenes de datos de forma más eficiente que procesando cada tarea por separado.
- **Latencia:** el costo. Cada tarea individual dentro del lote tiene que esperar su turno, así que su latencia puede aumentar.

---

## Resumen: qué mejora cada componente y qué cuesta

| Componente | Disponibilidad | Escalabilidad | Latencia | Consistencia |
|---|---|---|---|---|
| **Balanceo de carga** | Mejora | Mejora | Mejora | n/a |
| **Caché** | Mejora (indirecta) | Mejora | Mejora | Puede empeorar (datos obsoletos) |
| **Particionamiento** | Mejora | Mejora | Mejora | Más difícil de mantener |
| **Replicación** | Mejora | Mejora | n/a | Más difícil de mantener |
| **Cola de mensajes** | Mejora | Mejora | n/a | n/a |
| **Procesamiento por lotes** | n/a | Mejora | Puede empeorar | n/a |

Como ves, **ningún componente es gratis**: la caché, el particionamiento y la replicación mejoran el rendimiento y la escalabilidad, pero complican la consistencia. En una entrevista de diseño, la clave está en saber qué componente elegir para cada problema y explicar claramente qué estás ganando y qué estás sacrificando.

**Tags:** `#arquitectura` `#escalabilidad` `#consistencia`