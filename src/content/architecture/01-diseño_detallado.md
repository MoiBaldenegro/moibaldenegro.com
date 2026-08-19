---
slug: 01-diseño-detallado
title:  Diseño detallado
author: Moises Baldenegro Melendez
img: arch00.webp
readtime: 7
description: En este capitulo hablamos sobre el contexto de arquitectura y diseño de software.
tags: "#arquitectura #software-design" 
created: "19 Agosto 2026"
updated: "19 Agosto 2026"
---
# Niveles de Abstracción y Enfoques de Diseño en Arquitectura de Software

Existen dos niveles de abstracción: **alto nivel** y **bajo nivel**. Esta diferenciación, por alguna razón, normalmente tarda mucho en explicarse y, a mi parecer, es lo que haría a los profesionales entender mucho más fácilmente el rol de la Arquitectura de Software. Así que hablemos de ello desde ya.

---

## Alto Nivel vs. Bajo Nivel

### 1. Arquitectura de Software (Alto Nivel)
La arquitectura sería la capa de alto nivel donde planeamos cómo se comunicarán las distintas partes en las que estará dividido el software. Aquí acompañamos la definición de concretamente qué servicios se van a utilizar, la selección de las tecnologías, los **requerimientos NO funcionales** (aquellos que van más allá de las reglas de negocio y son más como atributos de calidad, como escalabilidad o rendimiento) y, muy importante, **prever los potenciales riesgos**.

En un rol de Arquitectura de Software, los entregables principales son:
* **La planeación de los subsistemas** en los que se divide el sistema completo.
* **Las interfaces de alto nivel** que definen el comportamiento y la conexión con servicios externos de ser necesario.
* **Definición del stack tecnológico:** lenguajes, frameworks y herramientas para llevar a cabo el desarrollo.
* **Un prototipo arquitectónico (PoC)** con base en todo lo anterior definido.

---

### 2. Diseño de Software (Bajo Nivel)
Si nos vamos al diseño de software, hablamos de la capa de bajo nivel: las características del *"CÓMO"* va a estructurarse internamente nuestro sistema para cumplir los requerimientos funcionales del negocio. Nos enfocamos en los detalles de lo que llamamos "diseño detallado", abordando componentes concretos que podrán representarse directamente en código fuente.

Sus entregables son:
* **Diseño al detalle** de componentes concretos que cumplen una función específica (clases, firmas de métodos e interfaces).
* **Especificaciones de codificación** para los programadores: patrones de diseño, convenciones, restricciones y tipos de datos.

---

Entonces podemos entender que, para cada problema, tomaremos requerimientos y de cada requerimiento encontraremos un enfoque para solucionarlo.

---

## La Analogía del Café y los Enfoques de Diseño

Pongámonos en modo analogía y hablemos de café (me encanta el café). 

Si me levanto en la mañana y necesito prepararme un café, puedo evaluar las diferentes maneras de resolver esa necesidad: 
* Podría simplemente hacer un café soluble.
* Podría usar un molino y mi cafetera espresso para prepararme algo más fuerte o quizá un latte.
* Podría solo pasar por mi cafetería favorita y comprarlo.

Son diferentes aproximaciones para solucionar un mismo requerimiento. En software a esto se le llama tal cual: **Aproximaciones de Diseño** o **Enfoques de Diseño** (*Design Approaches*), lo que nos abre la puerta a dos conceptos fundamentales: el enfoque **Top-Down** (de arriba hacia abajo) y el **Bottom-Up** (de abajo hacia arriba).

---

### Enfoque Bottom-Up (De abajo hacia arriba)
Hablemos de este segundo primero. Es especialmente útil para los desarrolladores. Espero que su nombre te sea bastante descriptivo: acá vamos desde el nivel más bajo, desde las partes más concretas del código. 

Está muy apegado a la **Programación Orientada a Objetos (POO)**, donde el objeto es precisamente la parte mínima de nuestro software: la mínima parte funcional, indivisible, el átomo o el Lego de nuestro desarrollo. Mucho se habla sobre la recomendación de aprender POO y comprenderla antes de adentrarte en diseño de software, y no podría estar más de acuerdo. 

Una vez que definimos los objetos más pequeños, los vamos uniendo y definiendo cómo interactúan para ir construyendo partes funcionales de abajo hacia arriba: un conjunto de objetos forma módulos, que a su vez formarán componentes, que terminarán por formar un sistema completo. Espectacular. 

Sin embargo, tiene también desventajas: cualquier cambio de requerimiento en la base nos obligará a cambiar siempre estas piezas pequeñas de nuestro sistema, lo que genera un efecto dominó de versionamiento y cambios en cascada.

---

### Enfoque Top-Down (De arriba hacia abajo)
El enfoque *Top-Down* es el que usamos en arquitectura. Es ideal para proyectos de largo alcance y alta complejidad, y parte de la premisa de **divide y vencerás**. 

Queremos visualizar el producto como un todo. Partiremos desde lo más alto, dividiendo la complejidad en unidades cada vez más pequeñas para reducir su dificultad y así poder organizar el desarrollo.

---

## El Reto Práctico y la Heurística

El reto es tratar de tomar en cada momento lo mejor de ambos mundos, algo que suena fácil pero llevarlo a la práctica es realmente complejo. 

Normalmente, para asumir este rol de arquitecto es conveniente tener suficiente experiencia desarrollando, ya que el conocimiento práctico combinado con estos enfoques teóricos termina formando a profesionales altamente competentes en esta área. 

A esto se le conoce como **Heurística**: traer aquello que con la experiencia has aprendido y aplicarlo a estos enfoques de diseño. Por ejemplo:
* Saber cuándo un objeto o componente empieza a crecer demasiado y tomar la decisión de particionarlo.
* Evaluar cuándo unir varios componentes que son demasiado pequeños.
* Identificar el uso de algún patrón de diseño para un caso antes visto o crear un patrón propio adaptado al contexto.

Todas estas son prácticas exitosas y validadas por la experiencia, lo cual es increíblemente valioso.



**Tags:** `#arquitectura` `#software-design` `#agilismo`
