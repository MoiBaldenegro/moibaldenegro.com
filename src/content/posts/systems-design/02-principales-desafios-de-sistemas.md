---
slug: 02-desafios-en-sistemas
title: Los 4 desafíos del diseño de sistemas
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 4
description: "Los cuatro desafíos clásicos al diseñar sistemas a gran escala (usuarios simultáneos, volumen de datos, latencia y consistencia) y las estrategias más comunes para resolverlos.
tags: "#diseno-de-sistemas #arquitectura #software-design"
created: "23 Octubre 2026"
updated: "23 Octubre 2026"
next: "/posts/03-como-escalar-sistemas"
related: [/posts/00-systems-design-template]
---

## Desafío #1: Demasiados usuarios usan el sistema simultáneamente

Tener una cantidad masiva de usuarios puede generar muchos problemas, ya que una sola máquina tiene un límite de solicitudes que puede atender (medido en RPS o QPS: solicitudes o consultas por segundo). La solución es bastante intuitiva: **replicar los servicios en más instancias** cuando se superan esos límites.

Según lo que repliquemos, hablamos de dos técnicas distintas:

- **Balanceo de carga:** cuando replicamos los servicios con la lógica del servidor.
- **Replicación de bases de datos:** cuando replicamos las instancias de datos.

<figure class="post-image">
  <img src="/assets/balanceo-de-carga.webp" alt="Diagrama de balanceo de carga" loading="lazy" decoding="async" />
</figure>

<figure class="post-image">
  <img src="/assets/replicacion-bd.webp" alt="Diagrama de replicación de bases de datos" loading="lazy" decoding="async" />
</figure>

---

## Desafío #2: Demasiados datos, difíciles de mover

Habrá ocasiones en que la cantidad de datos sea tan masiva que no quepa en una sola máquina. Algunos ejemplos son todas las películas almacenadas en Netflix o todas las publicaciones de Instagram.

La solución en este caso es la **fragmentación** (*sharding*): particionar los datos según cierta lógica. Por ejemplo, un rango de IDs de usuario se guarda en una máquina y otro rango en una distinta.

<figure class="post-image">
  <img src="/assets/fragmentacion-bd.webp" alt="Diagrama de fragmentación de bases de datos" loading="lazy" decoding="async" />
</figure>

---

## Desafío #3: Sistemas rápidos y receptivos

Cualquier aplicación orientada a usuarios debe ser rápida. Como regla general, los tiempos de respuesta deberían ser de pocos cientos de milisegundos, algo que una persona percibe como instantáneo. Las guías de UX coinciden en que retrasos mayores a 1 segundo interrumpen el flujo del usuario.

> Estos límites son aproximados, no universales ni fijos: el nivel de latencia aceptable depende de la aplicación y del tipo de interacción.

A grandes rasgos, las operaciones de lectura suelen ser más rápidas que las de escritura, y ahí es donde aparece el problema. Una escritura normalmente implica muchas consultas y actualizaciones de datos, por lo que puede tardar bastante más que ese segundo. ¿La solución? **Asincronía**.

Cuando llega una solicitud de escritura, la colocamos en una **cola de procesos** y respondemos de inmediato. Mientras tanto, el procesamiento real continúa en el servidor. Del lado del cliente, podemos redirigir al usuario antes de mostrarle el resultado, lo que nos da entre 1 y 2 segundos, suficientes para completar la escritura y ofrecer una experiencia fluida.

Algunas herramientas que permiten implementar esta estrategia son:

- Amazon SQS
- Apache Kafka
- RabbitMQ

...entre otras.

<figure class="post-image">
  <img src="/assets/cola-mensajeria.webp" alt="Diagrama de cola de mensajería asíncrona" loading="lazy" decoding="async" />
</figure>

---

## Desafío #4: Estados inconsistentes u obsoletos

Este desafío aparece como consecuencia de resolver los desafíos 1 y 3 (sí, resolver un problema suele crear otro 😅).

Con la replicación de datos y las actualizaciones asíncronas, los datos pueden volverse inconsistentes o quedar desactualizados con facilidad. Podríamos consultar un servidor que aún no tiene la información más reciente, o que todavía conserva datos que ya fueron eliminados.

Aquí la solución está más del lado de la **capa de aplicación** que del sistema. Podemos diseñar experiencias en las que el usuario vea datos ligeramente obsoletos durante un periodo breve sin consecuencias, porque los servidores se ponen al día rápidamente. Un ejemplo es una búsqueda en Google. A este enfoque se le llama **consistencia eventual**, y la mayoría de las aplicaciones lo tolera bien durante un periodo corto.

Las excepciones son las aplicaciones bancarias o cualquier sistema con transacciones críticas, donde la inconsistencia es completamente inaceptable. Por eso, estas aplicaciones priorizan la consistencia fuerte, a costa de ser más lentas.

**Tags:** `#arquitectura` `#escalabilidad` `#software-design`