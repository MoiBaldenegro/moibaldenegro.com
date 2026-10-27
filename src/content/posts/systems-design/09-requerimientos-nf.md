---
slug: 06-requisitos-no-funcionales
title: Requisitos no funcionales en el diseño de sistemas
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 5
description: Disponibilidad, escalabilidad, latencia y consistencia: las cuatro grandes restricciones que definen la arquitectura de un sistema, qué estrategias las resuelven y qué compromisos implican.
tags: "#diseno-de-sistemas #arquitectura #requisitos-no-funcionales #escalabilidad #disponibilidad"
created: "23 Octubre 2026"
updated: "23 Octubre 2026"
next:
related: [/posts/00-systems-design-template, /posts/02-desafios-en-sistemas]
---

## Todo empieza con los requisitos

El diseño de un sistema comienza con los **requisitos funcionales**: qué características vamos a construir. Los **requisitos no funcionales** definen *cómo se comporta* el sistema: tiempos de respuesta, garantías de disponibilidad y cuántos usuarios debe soportar. Estas restricciones son las que determinan, de forma fundamental, las decisiones de arquitectura.

---

## La escala impulsa la complejidad

Un chat de fans de Billie Eilish para 100 usuarios se resuelve con un patrón básico de solicitud-respuesta. La misma aplicación para 100 millones de usuarios necesita capas de caché, colas de mensajes y bases de datos distribuidas.

Con las consultas simples a una base de datos alcanza para miles de usuarios, pero con millones hay que precalcular la información y tenerla lista en una caché (por ejemplo, un ranking de canciones en Redis) en lugar de calcularla en cada solicitud.

---

## Las cuatro grandes restricciones

La mayoría de los sistemas optimizan cuatro requisitos no funcionales clave:

- **Disponibilidad:** el tiempo que el sistema permanece en línea.
- **Escalabilidad:** la capacidad de manejar el crecimiento.
- **Latencia:** la velocidad de respuesta.
- **Consistencia:** la precisión de los datos.

Cada una implica compromisos (*trade-offs*) que influyen en todas las decisiones de arquitectura. Para verlas en acción usaremos una plataforma de música como ejemplo.

---

## Disponibilidad: permanecer en línea

La disponibilidad mide el tiempo de actividad del sistema como porcentaje. Una disponibilidad de **99.9%** permite aproximadamente 8.77 horas de inactividad al año, mientras que **99.99%** permite solo unos 52.6 minutos. Esa diferencia lleva a enfoques de arquitectura completamente distintos.

### La redundancia evita puntos únicos de falla

Los sistemas en producción usan múltiples servidores en distintos centros de datos. Cuando uno falla, el tráfico se redirige automáticamente a instancias saludables. Si nuestra plataforma de música corre servicios idénticos en tres zonas de disponibilidad y una zona completa se cae, los usuarios pueden seguir escuchando a Sleep Token sin notar nada.

### Los *health checks* permiten una recuperación rápida

Los balanceadores de carga consultan continuamente a los servidores backend cada pocos segundos. Cuando una comprobación de salud falla, el tráfico se redirige de forma automática, normalmente en segundos o decenas de segundos según la configuración. Así, las conexiones se redistribuyen antes de que el usuario note que algo se cayó.

### La distribución geográfica reduce el radio de explosión

Los sistemas críticos se replican en distintas regiones. Si una región completa tiene una interrupción, las demás siguen operando. Este aislamiento evita que la falla de una sola región se convierta en una caída global.

---

## Escalabilidad: manejar el crecimiento

Escalar significa mantener el rendimiento a medida que aumenta la carga. En la práctica, escalar con **muchos servidores pequeños** suele ser mejor que hacerlo con máquinas cada vez más grandes: permite un crecimiento elástico y reduce el impacto de las fallas.

Piensa en el día de lanzamiento de un álbum nuevo: el tráfico se dispara en minutos, y el sistema tiene que aguantarlo.

![Diagrama de escalado horizontal con servicios sin estado](/assets/escalado-horizontal.webp)

### Los servicios sin estado escalan horizontalmente

Cada servidor atiende las solicitudes de forma independiente, sin guardar sesiones de usuario ni datos temporales. Este diseño permite agregar o quitar servidores según la demanda, por ejemplo con escalado automático durante las horas pico.

### El caché reduce la presión sobre la base de datos

Los datos a los que se accede con frecuencia se guardan en memoria rápida en lugar de en disco. El ranking de canciones más escuchadas o el perfil de un artista se pueden servir desde una caché como Redis y así atender millones de solicitudes sin saturar la base de datos. En cargas con muchas lecturas, es común alcanzar tasas de acierto de caché superiores al 90%.

### El procesamiento asíncrono suaviza los picos de tráfico

Las colas de mensajes desacoplan la atención de la solicitud del trabajo en segundo plano. Cuando un artista sube una canción nueva, la carga se confirma de inmediato mientras el procesamiento del audio (convertir a distintos formatos y calidades) ocurre de forma asíncrona. Así, los retrasos en el procesamiento no afectan la experiencia del usuario durante los picos.

---

## Latencia: la velocidad importa

La latencia es el tiempo de respuesta: el retraso entre la solicitud y la respuesta. Los usuarios esperan respuestas en menos de un segundo para páginas web y en milisegundos para llamadas a una API. Una latencia alta mata la participación del usuario y las métricas del negocio.

### La cercanía geográfica reduce el retraso de red

Las redes de distribución de contenido (CDN) colocan recursos estáticos, como las portadas de los álbumes, cerca de los usuarios. Para quienes están lejos del servidor de origen, esto puede reducir la latencia de unos 200 ms a decenas de milisegundos. La distancia física crea retrasos inevitables, porque la luz viaja a una velocidad fija.

### Optimizar la base de datos elimina cuellos de botella

Las consultas lentas acaban con el rendimiento. Agregar índices y reducir los *joins* puede llevar una consulta de aproximadamente un segundo a decenas de milisegundos. Los perfiles de consulta (*query profiling*) muestran qué operaciones consumen más tiempo y permiten optimizar con precisión.

### El *edge computing* procesa los datos localmente

En lugar de mandar todas las solicitudes a servidores centrales, los nodos de borde resuelven parte del trabajo cerca del usuario y procesan solicitudes de API sin viajes de ida y vuelta al servidor de origen. Puede reducir mucho la latencia en aplicaciones distribuidas globalmente, aunque la mejora exacta depende de la carga de trabajo y de la ubicación de los usuarios.

---

## Consistencia: precisión de los datos

La consistencia garantiza que todas las réplicas del sistema muestren los mismos datos. En sistemas distribuidos esto se complica, porque las particiones de red y las fallas de servidores pueden causar desacuerdos temporales entre nodos.

### La consistencia fuerte sacrifica disponibilidad

El saldo de una cuenta bancaria o el cobro de una suscripción requieren aislamiento estricto de transacciones: un usuario no puede pagar dos veces ni quedarse sin plan por un error. En sistemas replicados, la consistencia fuerte suele depender de un líder, un quórum o un protocolo de consenso: una escritura se confirma solo cuando suficientes réplicas están de acuerdo. Esto protege la corrección, pero reduce la disponibilidad de escritura cuando las réplicas o enlaces de red necesarios están lentos o caídos.

### La consistencia eventual permite escalar

Muchas funciones toleran inconsistencias temporales a cambio de mejor rendimiento. Cuando alguien le da "me gusta" a una canción de Billie Eilish, es posible que el contador de likes se vea distinto en diferentes dispositivos durante unos segundos, hasta que la actualización se propaga entre los centros de datos. El sistema converge a un estado consistente en cuestión de segundos.

### Elegir el modelo adecuado

La mayoría de los sistemas combinan niveles de consistencia según el tipo de operación. En nuestra plataforma, las recomendaciones y los contadores usan consistencia eventual, mientras que el cobro de la suscripción requiere consistencia fuerte. Este enfoque híbrido optimiza tanto la experiencia del usuario como la exactitud de los datos.

---

## Patrones de diseño para cada requisito

Cada patrón de arquitectura atiende requisitos específicos. Entender estas relaciones ayuda a elegir las soluciones adecuadas.

| Requisito | Estrategia central | Tecnologías clave | Ejemplo en una app de música |
|---|---|---|---|
| **Disponibilidad** | Eliminar puntos únicos de falla | Balanceadores de carga, despliegue multirregión, health checks | Cada servicio corre en 3 zonas de disponibilidad |
| **Escalabilidad** | Escalar horizontalmente con servicios sin estado | Autoescalado, caché, colas de mensajes | Absorber el pico de tráfico del lanzamiento de un álbum |
| **Latencia** | Minimizar saltos de red y tiempo de procesamiento | CDN, índices en bases de datos, edge computing | Portadas y audio servidos desde un nodo cercano |
| **Consistencia** | Elegir el modelo de consistencia adecuado | Replicación síncrona, algoritmos de consenso | Fuerte para cobros, eventual para recomendaciones |

---

## Los compromisos le dan forma a la arquitectura

Estos requisitos suelen entrar en conflicto:

- Una consistencia fuerte reduce la disponibilidad cuando hay particiones de red.
- Una latencia baja aumenta la complejidad y el costo.

Los sistemas exitosos no intentan optimizarlo todo por igual: **priorizan los requisitos según las necesidades del negocio**.

**Tags:** `#arquitectura` `#escalabilidad` `#requisitos-no-funcionales`