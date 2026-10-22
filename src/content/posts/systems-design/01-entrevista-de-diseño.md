---
slug: 00-entrevista-de-diseno-de-sistemas
title: Entrevista de diseño de sistemas
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 3
description: Una guía paso a paso para abordar el diseño de sistemas qué es, en qué se diferencia del diseño OOP, qué habilidades exige y qué requerimientos no funcionales debes considerar.
tags: "#diseno-de-sistemas #arquitectura #software-design"
created: "22 Octubre 2026"
updated: "22 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/00-systems-design-template]
---

## ¿Qué es una entrevista de diseño de sistemas?

Es un proceso en el que se diseña la arquitectura y se planifica una aplicación. Para lograrlo, se seleccionan e integran con cuidado los requerimientos del sistema, de modo que pueda cubrir de forma eficiente sus necesidades de procesamiento y almacenamiento de datos. También implica identificar y gestionar las herramientas necesarias para que todos los componentes trabajen en conjunto de la mejor manera posible.

---

## Diseño de sistemas vs. diseño OOP

Ambos son diseño, pero se enfocan en niveles distintos del problema.

| | Diseño OOP | Diseño de sistemas |
|---|---|---|
| **Ejemplos** | Diseñar un estacionamiento o una máquina expendedora | Diseñar WhatsApp o Uber |
| **Habilidades** | Escribir código, interfaces, clases, etc. | Arquitectura, flujo de datos, escalabilidad y manejo de cuellos de botella |
| **Entregables** | Código, interfaces y clases | Diagramas de arquitectura, diseño del almacenamiento, cálculo de recursos, discusión de diseño, compensaciones (*trade-offs*) y análisis detallado de rendimiento y escalabilidad |

---

## ¿Quién necesita aprender diseño de sistemas?

Con la automatización del código, es cada vez más esencial que distintos roles de la ingeniería de software dominen el diseño de sistemas, entre ellos:

- Ingenieros de software
- Gerentes de ingeniería
- Líderes técnicos

---

## ¿Qué habilidades necesitas?

- **Diseñar servicios:** distribuir componentes y aplicaciones, y diseñar APIs.
- **Analizar el flujo de datos:** entender cómo interactúan los datos entre los distintos servicios y a través de ellos.
- **Definir estrategias de almacenamiento:** diseñar bases de datos, cachés y sistemas de archivos.
- **Seleccionar tecnologías adecuadas:** modelar datos y garantizar cohesión, escalabilidad y mantenibilidad.

---

## Requerimientos no funcionales

No basta con que el sistema funcione: también debe cumplir requisitos no funcionales como los siguientes.

### Escalabilidad

Un sistema bien diseñado está preparado para recibir cargas de trabajo cada vez mayores.

### Disponibilidad

Una alta disponibilidad es esencial. Debemos asegurar que el sistema siga dando servicio ante distintos tipos de fallas.

### Rendimiento y latencia

La **latencia** es el tiempo que tarda el sistema en responder a una solicitud, mientras que el **rendimiento** (*throughput*) es la cantidad de trabajo que puede manejar en un tiempo determinado.

**Tags:** `#arquitectura` `#agilismo` `#software-design`