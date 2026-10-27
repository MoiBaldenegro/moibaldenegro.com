---
slug: 04-paginacion-en-apis
title: Paginación en APIs
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 5
description: "Cómo devolver grandes volúmenes de datos sin saturar al servidor ni al cliente. Comparamos la paginación por offset, por cursor y por keyset, y cuándo conviene cada una."
tags: "#diseno-de-sistemas #arquitectura #apis #paginacion #escalabilidad"
created: "23 Octubre 2026"
updated: "23 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/02-desafios-en-sistemas]
---

## ¿Por qué necesitamos paginación?

Al diseñar sistemas a gran escala, tarde o temprano nos topamos con el reto de devolver grandes conjuntos de datos a través de una API. Imagina que estamos construyendo el feed de Twitter o el de fotos de Instagram: no podemos devolver millones de registros en una sola solicitud. Aquí es donde entra la **paginación**.

Piensa en cómo haces scroll en tu feed de Instagram. La app no carga miles de fotos de golpe; carga unas 20 o 30 al inicio y va trayendo más conforme avanzas. Este enfoque resuelve varios problemas importantes:

- El servidor no se satura procesando conjuntos de resultados enormes.
- El cliente (app móvil o navegador) no se cae por intentar manejar demasiados datos a la vez.
- El ancho de banda se usa de forma eficiente.
- El usuario tiene una experiencia fluida y receptiva.

Veamos cómo se implementa en la práctica.

---

## Estrategias de paginación

### Paginación por offset: el enfoque simple

Es la forma más intuitiva de paginar y se parece a cómo pensamos las páginas de un libro. Se ve así:

```
GET /api/feed?limit=10&offset=20
```

En el feed de Instagram, esto equivaldría a decir: "dame 10 publicaciones, a partir de las primeras 20". En SQL:

```sql
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10 OFFSET 20;
```

Es un enfoque directo, pero tiene un problema serio. Imagina que el usuario está en la página 1,000 de su feed: la base de datos tendría que recorrer y descartar 10,000 filas antes de devolver las siguientes 10 publicaciones. Cuanto más profundo se pagina, más lenta se vuelve la consulta, y por eso este método escala mal en feeds muy grandes.

### Paginación por cursor: la solución escalable

Es lo que verás normalmente en las APIs modernas que alimentan feeds de scroll infinito. En lugar de contar cuántos registros saltar, llevamos el control de dónde nos quedamos con un **cursor**, que funciona como un marcador:

```
GET /api/feed?limit=10&cursor=eyJpZCI6MTAwfQ==
```

**¿Cómo funciona?** El cursor lo entrega la propia API en su respuesta y representa la posición del último elemento devuelto:

1. En la primera solicitud no enviamos cursor.
2. La respuesta incluye un `next_cursor`.
3. Usamos ese `next_cursor` en la siguiente solicitud para obtener la página que sigue.

Así se forma una cadena donde cada respuesta nos da el cursor para la siguiente solicitud.

![Diagrama de paginación por cursor](/assets/paginacion-cursor.webp)

Normalmente el cursor es un valor codificado que representa el último elemento que vimos. En el feed de Instagram podría codificar la fecha y el ID de la última publicación:

```python
# Ejemplo de implementación con cursor
def get_feed(limit=10, cursor=None):
    if cursor:
        last_post = decode_cursor(cursor)  # ej. {"timestamp": "2024-03-15", "id": 123}
        query = """
            SELECT * FROM posts
            WHERE (created_at, id) < (:timestamp, :id)
            ORDER BY created_at DESC, id DESC
            LIMIT :limit
        """
        params = {"timestamp": last_post["timestamp"], "id": last_post["id"], "limit": limit}
    else:
        query = "SELECT * FROM posts ORDER BY created_at DESC, id DESC LIMIT :limit"
        params = {"limit": limit}

    posts = execute_query(query, params)

    next_cursor = encode_cursor({
        "timestamp": posts[-1].created_at,
        "id": posts[-1].id
    }) if posts else None

    return {
        "posts": posts,
        "pagination": {"next_cursor": next_cursor}
    }
```

Este método es mucho más eficiente porque filtra directamente con campos indexados hasta el punto exacto donde nos quedamos, en lugar de contar offsets.

### Paginación por keyset: optimizada para series de tiempo

Cuando trabajamos con datos de series de tiempo (como un sistema de chat o un feed de actividad), podemos optimizar aún más usando directamente las marcas de tiempo:

```
GET /api/messages?limit=50&before=2024-03-15T00:00:00Z
```

Funciona especialmente bien combinada con un índice en la base de datos:

```sql
CREATE INDEX idx_messages_timestamp ON messages(created_at DESC);
```

---

## Consideraciones del mundo real

Al implementar paginación en una entrevista de diseño de sistemas, conviene hablar de estos puntos.

### Consistencia

¿Qué pasa si se agregan elementos nuevos mientras alguien está paginando? La paginación por cursor lo maneja muy bien, porque mantiene una vista consistente: el cursor apunta a un elemento concreto, no a una posición que cambia.

### Rendimiento

Hay que explicar cómo escala la estrategia conforme crece la cantidad de datos:

```sql
-- Malo: el rendimiento se degrada con el offset
SELECT * FROM posts LIMIT 10 OFFSET 1000000;  -- Tiene que recorrer 1M de filas

-- Bueno: rendimiento constante con cursores
SELECT * FROM posts WHERE id < :last_seen_id LIMIT 10;  -- Usa el índice
```

### Formato de la respuesta

Conviene incluir metadatos que ayuden al cliente:

```json
{
  "data": [
    /* publicaciones */
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6MTAwfQ==",
    "has_more": true
  }
}
```

---

## ¿Cómo elegir?

En una entrevista, la estrategia que elijas debe corresponder con el caso de uso:

- **¿Un panel de administración con números de página?** La paginación por offset es suficiente.
- **¿Diseñando el próximo feed de Twitter?** Lo que necesitas es paginación por cursor.
- **¿Un sistema de chat?** Considera la paginación por keyset con marcas de tiempo.

Y no olvides explicar tu razonamiento. Por ejemplo: *"Elijo paginación por cursor para este feed social porque esperamos que los usuarios recorran miles de publicaciones y necesitamos un rendimiento constante sin importar qué tan lejos hagan scroll."*

Lo importante es demostrar que entiendes los *trade-offs* y que sabes elegir la herramienta adecuada para el problema concreto que estás resolviendo.

**Tags:** `#arquitectura` `#escalabilidad` `#apis`