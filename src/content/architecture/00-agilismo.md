---
slug: 00-agilismo
title:  Agilismo, diseño y fragilidad
author: Moises Baldenegro Melendez
img: arch00.webp
readtime: 5
description: En este capitulo aprenderemos los conceptos fundamentales de la arquitectura de software.
tags: "#arquitectura #agilismo #software-design"
created: "10 Agosto 2026"
updated: "10 Agosto 2026"

---

# 00. Agilismo, diseño y fragilidad

Es fundamental familiarizarnos con los conceptos y principios que conforman el rol de la arquitectura de software; solo así podremos entender el impacto y nivel de importancia que tiene dentro de una organización o en el ciclo de desarrollo.

En esta etapa suelen presentarse diversos problemas críticos, y de eso es precisamente de lo que quiero hablarte aquí.

## El falso agilismo: ¿Rapidez o prisa?

Muchos ingenieros se han dejado influenciar por el mal uso de las llamadas **metodologías ágiles**. Mucho más seguido de lo que me gustaría, se confunde el "agilismo" con la "rapidez", lo que empuja a los equipos a saltar directamente al desarrollo de código. 

Esto es un grave error. Las metodologías ágiles reales hacen un gran énfasis en el **análisis** y el **diseño** antes de tirar la primera línea de código. 

> **Producto vs. Proyecto**
> El software debe verse siempre como un producto. Cuando en un desarrollo se deja de lado la calidad interna y el valor real que se aporta al usuario, el software deja de ser un *producto* y se convierte solo en un *proyecto* que hay que entregar lo antes posible.

En el proceso de arquitectura hay demasiadas variables que nos afectan constantemente: desde cambios imprevistos en las necesidades del cliente hasta la dinámica de cada persona involucrada en el equipo. Cualquier modificación aquí afecta directamente al resultado final del sistema.

---

## Definiendo el "Diseño" en dos niveles

El **diseño** es el proceso donde planeamos, describimos y organizamos los componentes de un sistema, definiendo cómo van a interactuar unos con otros (más adelante entraremos en detalle sobre a qué nos referimos exactamente con el término *componente*).

Suele haber mucha confusión con este concepto porque rara vez se explica que el diseño se debe abordar desde **dos puntos de vista distintos**:

### 1. El nivel macro (Diseño Estratégico)
Es el diseño visto desde el área de conocimiento puro. Aquí definimos los componentes de manera estratégica bajo un enfoque conceptual o teórico. Imagínalo como un mapa satelital: vemos todo el panorama desde una gran altura y obtenemos una vista completa y sistémica del ecosistema.

### 2. El nivel micro (Diseño Técnico Detallado)
Es el diseño desde el lado técnico y táctico. Aquí hacemos referencia al diseño detallado de un componente en concreto una vez que ya fue delimitado en la etapa macro. Hablamos de la definición de clases, interfaces y patrones que construyen la funcionalidad a un nivel de detalle tan fino que permite a los desarrolladores materializar dicho componente en código fuente.

---

## La regla de oro

Es precisamente en la etapa de diseño donde se deberían identificar y mitigar los errores arquitectónicos, **no en las etapas de implementación o de pruebas**. El peor de los escenarios (y lamentablemente el más común cuando se corre sin diseñar) es que estos fallos no se detecten a tiempo y terminen propagándose directamente al entorno de producción.

---

**Tags:** `#arquitectura` `#agilismo` `#software-design`
