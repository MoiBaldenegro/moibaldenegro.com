---
slug: 00-systems-design-template
title:  Mi plantilla para diseñar sistemas
author: Moises Baldenegro Melendez
img: arch00.webp
readtime: 4
description: Describimos una secuencia de pasos para el diseño de sistemas.
tags: "#diseno-de-sistemas #arquitectura #software-design"
created: "16 Octubre 2026"
updated: "16 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/02-principios-del-diseno-de-software]
---

## Características que esperamos
- Casos de uso
- Escenarios que no vamos a cubrir
- Quienes van a ser los usuarios que lo van a usar
- Cuantas usuarios lo van a utilizar
- Patrones comunes de este tipo de sistemas
- Durante cuanto tiempo se deben almacenar los datos.



## Objetivos de diseño
- Latency and Throughput requirements
- Consistency vs Availability  [Weak/strong/eventual => consistency | Failover/replication => availability]



## Estimaciones
- Throughput (QPS for read and write queries)
- Read/Write ratio
- Traffic estimates
                - Write (QPS, Volume of data)
                - Read  (QPS, Volume of data)
- Storage estimates
- Memory estimates
                - If we are using a cache, what is the kind of data we want to store in cache
                - How much RAM and how many machines do we need for us to achieve this ?
                - Amount of data you want to store in disk/ssd


## Diseño de alto nivel
- APIs for Read/Write scenarios for crucial components
- Database schema
- Basic algorithm
- High level design for Read/Write scenario


##  Diseño detallado

#### Scaling the algorithm

#### Scaling individual components: 
- Availability, Consistency and Scale story for each component
- Consistency and availability patterns

#### Think about the following components, how they would fit in and how it would help
- a) DNS
- b) CDN [Push vs Pull]
- c) Load Balancers [Active-Passive, Active-Active, Layer 4, Layer 7]
- d) Reverse Proxy
- e) Application layer scaling [Microservices, Service Discovery]
- f) DB [RDBMS, NoSQL]
        > RDBMS 
            >> Master-slave, Master-master, Federation, Sharding, Denormalization, SQL Tuning
        > NoSQL
            >> Key-Value, Wide-Column, Graph, Document
                Fast-lookups:
                -------------
                >>> RAM  [Bounded size] => Redis, Memcached
                >>> AP [Unbounded size] => Cassandra, RIAK, Voldemort
                >>> CP [Unbounded size] => HBase, MongoDB, Couchbase, DynamoDB
- g) Caches
        > Client caching, CDN caching, Webserver caching, Database caching, Application caching, Ca@Query level, Cache @Object level
        > Eviction policies:
                >> Cache aside
                >> Write through
                >> Write behind
                 >> Refresh ahead
- h) Asynchronism
        > Message queues
        > Task queues
        > Back pressure
- i) Communication
        > TCP
        > UDP
        > REST
        > RPC


## Justificaion de las decisiones
- Throughput of each layer
- Latency caused between each layer
- Overall latency justification


**Tags:** `#arquitectura` `#agilismo` `#software-design`


