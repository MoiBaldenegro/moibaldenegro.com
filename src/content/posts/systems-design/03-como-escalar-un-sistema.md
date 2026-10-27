---
slug: 03-como-escalar-sistemas
title: Entrevista de diseño de sistemas
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 5
description: "Una guía paso a paso para abordar el diseño de sistemas qué es, en qué se diferencia del diseño OOP, qué habilidades exige y qué requerimientos no funcionales debes considerar."
tags: "#diseno-de-sistemas #arquitectura #software-design #escalabilidad"
created: "22 Octubre 2026"
updated: "22 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/00-systems-design-template]
---

# Como escalar un sistema
Escalar un sistema el aspecto mas critico cuando se trata de resolver los requisitos no funcionales, po lo que la escalabilidad es 
de las mayores prioridades que tendremos al hacer diseño de sistemas, asi es que hablemos de algunas estrategias para escalar sistemas.

---

## Descomposicion
Aca nos referimos a los famosos microservicios, la idea es descomponer nuestra aplicaciones en multiples servicios separados
donde cada uno maneja unicamente una responsabilidad y nada mas, de esta manera su disponibilidad y la forma enq ue ramos escalar es individual, 
y ningun cambio en estos afectarana los demas debido a que son completamente independeientes.


// diagrama

---


## Escalado vertical 
Es escalamiento vertical hace referencia a poder bruto. Aqui lo que hacemos es incrementar los recursos de las maquinas que corren nuestros sistemas, si bien en el pasado esto podia resultar tedioso o muy costoso, al dia de hoy las grandes nubes como Azure, AWS, GCP, etc, etc, 
podemos hacer estos incrementos de recursos en segundos y en cuestion de unos clicks, incluso de forma elastica o dinamica.


// diagrama


---


## Escalado horizontal
El escalado horizontal se centra en lugar de aumentar los recursos de una maquina, ejecutar multiples instancias identicas.
Tiene sus particularidades y retos como el echo de no tener estado en estancias y poder centralizarlo como fuente de verdad para todas 
las instancias.

// diagrama


---

## Particion
Ya en el articulo anterior sobre los principales desafios del diseño de sistemas hablamos de la fragmentacion o sharding de datos, esta es una 
forma de particionar bases de datos, pero podemos tambien particionar nuestros servicios, hablaremos a detalle de este concepto en posteriores 
articulos.

---


##  Almacenamiento en caché.
El almacenamiento en cache nos permite mejorar el rendiento en las operaciones de lectura al almacenar los datos que se consultan muy frecuentemente, en un almacenamiento en memoria mucho mas rapido. tenemos soluciones como memcached o redis, que nos permiten almacenar estos datos calientes y reducir esta carga a nuestra base de datos operacional.

// diagrama


---


## Buffer con colas de mensajes.
Cuando un sistema experimenta un alto volumen de tráfico concurrente, las operaciones de escritura intensiva pueden saturar la E/S del disco en la base de datos. Una estrategia efectiva es introducir colas de mensajes como capa intermedia de amortiguación: al pasar de un enfoque sincrónico a uno asincrónico, suavizamos las picos de carga y enviamos las escrituras a la base de datos a una velocidad controlada para evitar colapsos. Más adelante exploraremos esta técnica en detalle.


// diagrama


---


## Separacion de lectura y escritura (CQRS)
Saber si un sistema demandará más operaciones de lectura o de escritura depende directamente de su caso de uso. En las redes sociales, por ejemplo, el consumo de datos es muy superior a la publicación. Sin embargo, en un sistema de IoT ocurre lo contrario: los dispositivos envían datos constantemente, priorizando la escritura. Separar estas responsabilidades nos otorga la flexibilidad necesaria para diseñar soluciones específicas según el tipo de tráfico.


// diagrama



**Tags:** `#arquitectura` `#escalabilidad` `#software-design`