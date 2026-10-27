---
slug: 05-introduccion-al-diseño-de-api
title: Diseñando API REST
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 5
description: "Una guía paso a paso para abordar el diseño de sistemas qué es, en qué se diferencia del diseño OOP, qué habilidades exige y qué requerimientos no funcionales debes considerar."
tags: "#api #rest #software-design #api-design"
created: "22 Octubre 2026"
updated: "22 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/00-systems-design-template]
---

## Ejemplo de diseño de API
Pongamos en práctica lo aprendido en la sección anterior y diseñemos una API REST con un feed de las canciones agregadas a mi lista de reproduccion.

## Requerimientos y Diseño de Endpoints

### Requerimientos funcionales
* **Listado ordenado:** Las canciones se muestran ordenadas de la más votada a la menos votada, incluyendo el número total de votos.
* **Formato de datos:** Estructura en JSON limpia y fácil de analizar.
* **Paginación:** Capacidad de gestionar catálogos masivos de canciones sin colapsar el sistema.
* **Actualización en tiempo real:** Soporte para reflejar cambios instantáneos (ej. mediante WebSockets o SSE).
* **Novedades:** Sección o filtro para consultar las últimas canciones agregadas.

---

### Endpoints

#### Obtener listado de canciones de una playlist
* **Método:** `GET`
* **URL:** `https://api.moisesbaldenegro.com/users/:id/playlists/:playlistId/songs`
* **Parámetros de consulta (*Query Parameters*):** `?page=1&limit=20&sort=votes_desc`

---

### Ejemplo de Respuesta JSON

El siguiente ejemplo muestra la estructura estándar con los metadatos de paginación y la lista de canciones (utilizando el universo de **Sleep Token** y **Billie Eilish** para mantener la línea):

```json
{
  "meta": {
    "total_records": 10,
    "current_page": 1,
    "per_page": 10,
    "total_pages": 1,
    "has_next_page": false,
    "has_previous_page": false
  },
  "data": [
    {
      "id": "song_01",
      "title": "Take Me Back To Eden",
      "artist": "Sleep Token",
      "votes": 1420,
      "added_at": "2026-10-15T22:30:00Z"
    },
    {
      "id": "song_02",
      "title": "BIRDS OF A FEATHER",
      "artist": "Billie Eilish",
      "votes": 1380,
      "added_at": "2026-10-18T14:15:00Z"
    },
    {
      "id": "song_03",
      "title": "The Summoning",
      "artist": "Sleep Token",
      "votes": 1250,
      "added_at": "2026-10-10T18:20:00Z"
    },
    {
      "id": "song_04",
      "title": "LUNCH",
      "artist": "Billie Eilish",
      "votes": 1190,
      "added_at": "2026-10-19T09:00:00Z"
    },
    {
      "id": "song_05",
      "title": "Granite",
      "artist": "Sleep Token",
      "votes": 980,
      "added_at": "2026-10-12T11:45:00Z"
    },
    {
      "id": "song_06",
      "title": "CHIHIRO",
      "artist": "Billie Eilish",
      "votes": 920,
      "added_at": "2026-10-20T16:00:00Z"
    },
    {
      "id": "song_07",
      "title": "Chokehold",
      "artist": "Sleep Token",
      "votes": 850,
      "added_at": "2026-10-08T08:10:00Z"
    },
    {
      "id": "song_08",
      "title": "WILDFLOWER",
      "artist": "Billie Eilish",
      "votes": 790,
      "added_at": "2026-10-21T12:30:00Z"
    },
    {
      "id": "song_09",
      "title": "Euclid",
      "artist": "Sleep Token",
      "votes": 740,
      "added_at": "2026-10-14T20:00:00Z"
    },
    {
      "id": "song_10",
      "title": "BLUE",
      "artist": "Billie Eilish",
      "votes": 680,
      "added_at": "2026-10-22T10:00:00Z"
    }
  ]
}

```

**Tags:** `#arquitectura` `#escalabilidad` `#software-design`
