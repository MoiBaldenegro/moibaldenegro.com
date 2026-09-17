---
slug: 03-principios solid
title:  Principios solid
author: Moises Baldenegro Melendez
img: arch03.webp
readtime: 4
description: En este capitulo aprenderemos los conceptos fundamentales de la arquitectura de software.
tags: "#arquitectura #agilismo #solid"
created: "21 Agosto 2026"
updated: "21 Agosto 2026"
related: [/posts/00-agilismo, /posts/01-diseño-detallado]

---

Ademas de la abstraccion, la modularizacion y el encapsulamiento, existen otro sprincipios que nos ayudaran a tener muchas mas calidad en el codigo yb en general en nuestros desarrollo y estos son lops principios SOLID. los cuales fueron recopilados por Robert C. Martin, conocido como el "tio bob", author del legendario libro Clean Code entre otro mas, y buscan crear arquitecturas que puedan ser facilmente manipuladas, que nos permitan realizar modificaciones a futuro comodamente.

casi el 80% del costo del software se da en el mantenimento, hacemos modificaciones precisamente por eso es tan importante. Se llaman principios SOLID por su acronimo:

- **S**ingle Responsability Principle. (Principio de responsabilidad unica).
- **O**pen Closed Principle. (Principio abierto/cerrado)
- **L**iskov Sustitution Principle.
- **I**interface Segregation Principle.
- **D**ependency Inversion Principle.


## Principio de responsabilidad unica
Este principio nos refuerza la idea de tener en un elemento de software solo una responsabilidad bien delimitada, solo una y bien concreta. y aca lo que sucede es que cuando no le damos la suficiente importancia a la etapa de diseño, y muy seguido sucede que necesitamos implementar por ejemplo un nuevo metodo para alguna nueva funcionalidad ya sea por flojera, por facilidad o rapidez terminamos codificandolo en el primer elemento o clase que tenemos enfrente de nuestra pantalla, y sin darnos cuenta si ese metodo realmente corresponde como una responsabilidad dentro este elemento o tal ves que en ese preciso momento creemos que es algo que no se va a volver a necesitar en ninguna otra parte y que no afectar a nadie, y aqui es donde viene el problema, surge cuando este metodo empieza a ser reutilizado, cuando empieza a utilizarse en otras clases. En este caso ahora tenemos relaciones entre clases que tal ves no tienen ninguna relacion entre ellas o no lo necesitan, simplemente por que no codificamos ese metodo pensando correctamente en donde deberia estar esa responsabilidad o peor empezamos a crear copias de ese mismo codigo en diferentes partes lo cual hace que sean funcionalidades muy dificiles de detectar y nos obliga a memorizar donde es que estan escritos esos metodos, lo cual hace muy dificil de mantener ya que viene una nueva persona a hacer cualquier modificacion no sabra donde se encuentran. 

Existe una arquitectura muy conocida que es la arquitectura por capas donde separamos el codigo que renderiza talves la interfaz grafica como al capa de presentacion, otra ddonde tenemos la logica del negocio o el dominio, y otra mas exclusivamente con el acceso a los datos, bases de datos etc. 

- Presentacion
- Dominio
- Acceso a datos

Esta es una clara separacion de responsabilidades y hace muy llevadero comprender el concepto de responsabilidad unica, donde cada capa se sabe que tiene una responsabilidad concreta y para lo cual fue creada.


## Principio Abierto - Cerrado
El principio abierto/cerrado no hablas de que nuestro codigo este abierto a modificaciones o a crecer sin la necesidad de reescribir lo que ya esta echo. Y aunque de priomera mano suene algo complicado la realidad es que es algo qu epodemos lograr facilmente utilizando polimorfismo utlizando herencia, sobrecarga de metodos, o patrones de diseño como el patron adaptador por ejemplo, a los cuales se dedican articulos especializados, pero por ejemplo veamos un ejemplo implementado en codigo, esta ves usaremos C# ya que posee palabras reservadas para la sobreescritura o sobrecarga de metodos y lo hara mas legible.


``` c#

public class Sale
{
    protected Dictionary<string, decimal> items;

    public Sale()
    {
        items = new Dictionary<string, decimal>();
    }

    public virtual void Add(string item, decimal price)
    {
        items[item] = price;
    }
}

public class SaleInfo : Sale
{
    public string GetInfo()
    {
        string info = "";
        foreach (var item in items)
        {
            info += $"{item.Key}: {item.Value}\n";
        }
        return info;
    }

    public override void Add(string item, decimal price)
    {
        base.Add("Item: " + item, price);
    }

    public void Add(string item)
    {
        base.Add("Item: " + item, 0);
    }
}

public class SaleUpper : SaleInfo
{
    public override void Add(string item, decimal price)
    {
        base.Add(item.ToUpper(), price);
    }
}


```

Como se puede ver tenemos clases hijas y nietas donde el comportamiento del metodo Add tiene distintas funcionalidades sobreescribiendo la del padre, permitiendonos extender la funcionalidad sin modificar el codigo existente.

Entender este princpio nos da las bases tambien para entender el siguiente prinpio de la sustitucion de Liskov.


## Principio de Sustitucion de Liskov
Este principio lo que busca es controlar le herencia como vimos en el anterior princpio abierto/cerrado para que no cresca de una manera descontrolado, y la es que cualquier hijo pueda ser reemplazado en cualquier momento por su padre, y si te das cuenta estos dos principios van de la mano, la violacion de uno representa una violacion del otro tambien.

basicamente pone limites y nos obliga a pensar de forma ordenada como utilizar la herencia para evitar que cresca desordenadamente.


## Principio de Segregacion de Interfaces
Es muy comun el uso de interfaces para plasmar las funcionalidades de un modulo
