---
slug: 02-principios-del-diseno-de-software
title: Principios del diseño de software
author: Moises Baldenegro Melendez
img: entry-02.webp
readtime: 9
description: Exploramos los tres pilares fundamentales del diseño de software abstracción, encapsulamiento y modularización, y cómo aplicarlos para construir sistemas desacoplados y mantenibles.
tags: "#arquitectura #software-design #abstraccion #encapsulamiento #modularizacion"
created: "20 Agosto 2026"
updated: "20 Agosto 2026"
---

# 01. Principios del diseño de software

Independientemente del enfoque que se utilice, un buen diseño de software debe seguir tres principios que nos permitirán tener diseños robustos, con calidad y, muy importante, desacoplados de las herramientas concretas o de las tecnologías.

Estos principios son:

* **Modularización**
* **Abstracción**
* **Encapsulamiento**

Estos principios no tienen relación alguna con una técnica específica y pueden seguirse independientemente de ello.

---

## Abstracción

Hablemos primero sobre la **abstracción**, un concepto muy importante para el diseño de software que todo el mundo cree o finge comprender. Vamos a arreglar eso, porque es otro concepto muy potente que le da sentido a la comunicación entre piezas de software, permite crear piezas reutilizables, desacoplar nuestro código de tecnologías concretas y proporciona flexibilidad para modificar o extender las funcionalidades de un sistema.

Pero basta de argumentos y démosle una definición. ¿Cómo puedes entender, por fin, qué es la abstracción?

Hablaremos hoy de mi cantante favorita: **Billie Eilish**.

Y escuchemos su canción *Bad Guy*:

<div class="video-container">
  <iframe
    src="https://www.youtube.com/embed/DyDfgMOUjCI"
    title="Billie Eilish - bad guy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

Imagina que estás escuchando *Bad Guy*. Sientes el bajo, la voz casi susurrada de Billie y ese ritmo hipnótico. Para ti, como oyente, la canción es un bloque unitario, una experiencia fluida. Simplemente le das al botón de **Play** y todo funciona.

Ese botón de **Play** es tu interfaz.

Pero si nos adentramos en el estudio de grabación de su hermano Finneas, detrás de esos tres minutos de canción existen cientos de tomas de audio grabadas, procesadores de dinámica, sintetizadores ajustados a frecuencias muy específicas y microajustes de producción que hacen sonar la canción de esa manera.

Si Billie tuviera que pensar en todos esos detalles, no podría concentrarse en lo verdaderamente importante: **la música**.

En arquitectura de software, la abstracción consiste exactamente en eso:

> **Separar la intención de lo que queremos hacer de la implementación, es decir, del cómo lo hacemos.**

Ahora que entendemos cómo funciona, podemos ponerla sobre una aburrida definición.

> **La abstracción es la extracción de las propiedades esenciales de un concepto, eliminando cualquier elemento innecesario y concentrándose únicamente en aquello que resulta relevante para el contexto actual.**

Vamos a pensar solo en las acciones necesarias que resuelven un problema que queremos solucionar. Esto nos va a permitir atacarlo de mejor manera, sin distraernos con detalles que no nos interesan.

Hablemos de objetos, que eran nuestra unidad mínima, como mencionábamos en el capítulo anterior, y pensemos en el **motor de un auto**.

Aquellos que tengan nociones de mecánica quizá sepan cómo funciona internamente un motor. Pueden hablar de válvulas de admisión y escape, de cómo funciona un pistón, etc.

Pero, desde el punto de vista del negocio, no nos interesan estos detalles. Nos interesa cómo es el vehículo desde la parte externa.

Y aquí vamos con otro concepto importantísimo: ¿cuáles son esas **interfaces públicas** que ofrece ese auto a los usuarios, como el botón de *Play* del ejemplo anterior?

Un auto tendrá un volante para poder mover la dirección del vehículo, pedales para poder acelerar o frenar y, en algunas ocasiones, palancas para cambiar de velocidad.

Estos niveles de abstracción están condicionados por las **reglas de negocio**.

Para nosotros, como usuarios, estos elementos serán los importantes. Pero para los servicios de registro vehicular serán importantes otros datos, como la matrícula y el año del auto.

Para un taller mecánico serán importantes otro tipo de características, como el cilindraje o el tipo de motor.

En nuestro rol como arquitectos, al hacer diseño de software, precisamente una de nuestras responsabilidades es **modelar esas interfaces públicas**.

---

## Encapsulamiento

Quedando claro este primer principio de **abstracción**, pasemos ahora al principio de **encapsulamiento**.

No debemos confundirlo con los principios de la programación orientada a objetos, aunque se parezca bastante, porque normalmente este es el primer error que se comete al relacionar directamente el encapsulamiento con la POO.

En programación orientada a objetos, el encapsulamiento suele asociarse con las características de acceso a un objeto y muchas veces se limita a definir si los métodos son públicos o privados.

Pero el principio de encapsulamiento en el diseño de software va más allá:

> **Ocultar la complejidad y los detalles internos de implementación.**

¿Y por qué queremos ocultarlos?

Ocultar comportamientos complejos nos permite minimizar las dependencias de comunicación con sistemas externos. De esa manera, resulta mucho más fácil comprender nuestro sistema.

Si regresamos al ejemplo del auto, yo no necesito saber cómo funciona el motor para poder conducirlo. Solamente me interesa saber cómo utilizar las velocidades, cómo frenar y cómo se comporta el volante.

Son responsabilidades distintas.

El conductor no tiene por qué saber al detalle cómo funciona el sistema de frenado del auto. Esas serían características que le importan más al rol de un mecánico.

O, como lo mencionó **Steve McConnell**:

> "The interface to a class should reveal as little as possible about its inner workings."

> *"La interfaz de una clase debería revelar lo menos posible sobre su funcionamiento interno."*

Él presenta una metáfora de un **iceberg**, donde una clase tiene ocho métodos, pero siete de ellos son privados y forman parte de la implementación interna.

Mediante una interfaz, solamente se expone un método público que permite acceder a toda la funcionalidad necesaria.

```text
        INTERFAZ PÚBLICA
       ┌─────────────────┐
       │  Método público │  ← 1/8 visible
       └────────┬────────┘
                │
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

             /───────────\
            /             \
           / Implementación \
          /      interna     \  ← 7/8 oculto
         /   Lógica privada   \
        /     BD, estado,      \
       /     dependencias      \
      /_________________________\
```

Esto es potentísimo porque podemos hacer cualquier cambio en la implementación interna, dentro de todos esos métodos privados, y nada fuera de ella se verá afectado.

De la misma manera, si existen cambios en algún elemento externo, estos no afectan directamente al funcionamiento interno, porque los detalles están ocultos detrás de la interfaz.

---

## La relación entre abstracción y encapsulamiento

A este punto, probablemente ya te diste cuenta de que el **encapsulamiento tiene una relación directa con la abstracción** y también con la **modularidad**, de la que ahora hablaremos.

Estamos separando nuestras implementaciones en piezas que pueden ser reutilizables y que exponen únicamente aquello que resulta necesario para interactuar con ellas.

---

## Modularización

Finalmente, hablemos de la **modularización**, que está directamente relacionada con el concepto de **divide y vencerás**.

No es más que particionar un gran problema en problemas más manejables y simples que nos permitan encontrar soluciones de manera independiente.

Lo mismo ocurre con el software.

¿Para qué modularizamos?

Bueno, principalmente para permitir la **reutilización** de estas piezas, partes o módulos.

Además, en caso de que tengamos diferentes equipos, podemos trabajar en paralelo. Una vez divididas estas piezas, pueden asignarse a diferentes equipos para trabajar distintas partes al mismo tiempo, sin necesidad de hacerlo por fases o de que una parte tenga que esperar a la otra.

Asimismo, esto hace que el software sea más simple, dado que cada módulo puede encargarse solamente de una funcionalidad específica: **una sola responsabilidad**.

> **Entre menos responsabilidades tenga un elemento, más simple será y más fácil será de mantener.**

También podemos reutilizar estos módulos en diferentes contextos.

Y esto, amigos, **es un verdadero golazo**.


**Tags:** `#arquitectura` `#software-design` `#abstraccion` `#encapsulamiento` `#modularizacion`
