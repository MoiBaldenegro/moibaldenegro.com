---
slug: 05-api-gateway
title: API Gateway
author: Moises Baldenegro Melendez
img: 01design.webp
readtime: 5
description: Qué es un API Gateway, por qué es clave en una arquitectura de microservicios y cuáles son sus funciones principales: enrutamiento, autenticación, límite de velocidad, traducción de protocolos y monitoreo.
tags: "#diseno-de-sistemas #arquitectura #api-gateway #microservicios #apis"
created: "23 Octubre 2026"
updated: "23 Octubre 2026"
next: /posts/01-diseno-detallado
related: [/posts/04-paginacion-en-apis]
---

## ¿Por qué necesitamos un API Gateway?

Ya vimos los conceptos básicos del diseño de APIs, así que ahora toca hablar del **API Gateway**. En la mayoría de las arquitecturas de microservicios tenemos múltiples servicios, y los clientes necesitan comunicarse con ellos.

Imagina una plataforma de música con servicios separados para usuarios, catálogo de canciones, playlists y pagos. Sin una capa intermedia, el cliente (la app móvil o el navegador) tendría que:

- Conocer las direcciones de todos los microservicios.
- Manejar distintos protocolos y formatos de datos.
- Implementar autenticación y autorización para cada servicio.
- Gestionar por su cuenta el límite de velocidad y el seguimiento de solicitudes.
- Resolver temas transversales como el registro de logs y la seguridad.

Todo esto crea un **acoplamiento fuerte** entre clientes y servicios, y hace que el sistema sea más difícil de mantener y de evolucionar. El API Gateway resuelve este problema al ofrecer **un único punto de entrada** para todas las solicitudes de los clientes, y además nos ayuda a implementar funciones comunes como autenticación, autorización, limitación de velocidad y monitoreo.

---

## ¿Qué es un API Gateway?

Es un servidor que actúa como punto de entrada a una arquitectura de microservicios. Se ubica entre los clientes y los servicios backend, recibe todas las solicitudes y las enruta al microservicio adecuado. Puedes pensar en él como un **proxy inverso** con capacidades adicionales pensadas específicamente para la gestión de APIs.

![Diagrama de un API Gateway como único punto de entrada](/assets/api-gateway.webp)

---

## Características clave

### 1. Enrutamiento de solicitudes

El gateway dirige cada solicitud al servicio backend correcto según criterios como la ruta URL, el método HTTP, los encabezados o los parámetros de consulta:

```
GET  /api/users/123      → User Service
GET  /api/playlists/456  → Playlist Service
POST /api/subscriptions  → Payment Service
```

### 2. Balanceo de carga

Un API Gateway puede repartir las solicitudes entre varias instancias del mismo servicio, así que incluye capacidades de balanceo de carga de forma nativa. Ya hablamos de este tema en la entrada sobre [los desafíos en sistemas](/posts/02-desafios-en-sistemas).

### 3. Autenticación y autorización

Centralizar estas funciones evita que cada microservicio las implemente por separado. Aquí es donde el gateway se vuelve especialmente poderoso:

- **Autenticación:** verificar la identidad del usuario (tokens JWT, API keys, OAuth).
- **Autorización:** verificar si el usuario autenticado tiene permiso para acceder a un recurso específico.

### 4. Limitación de velocidad (*rate limiting*)

Protege a los servicios backend para que no se vean abrumados, aplicando políticas como estas:

```
Por usuario:    100 solicitudes / minuto
Por IP:         1,000 solicitudes / hora
Por servicio:   10,000 solicitudes / hora para el servicio de búsqueda
```

Los algoritmos de contador, las actualizaciones atómicas y los compromisos en entornos multirregión detrás de esta función dan para una entrada aparte.

### 5. Traducción de protocolos

El gateway puede convertir entre distintos protocolos y formatos de datos:

- HTTP a gRPC
- REST a GraphQL
- JSON a XML
- Conexiones WebSocket

**Ejemplo: de HTTP a gRPC.** Muchos servicios backend usan gRPC para su comunicación interna de alto rendimiento, pero los clientes esperan APIs HTTP REST sencillas.

![Diagrama de traducción de protocolo HTTP a gRPC en el API Gateway](/assets/api-gateway-protocolo.webp)

```
Solicitud del cliente (HTTP REST):
GET /api/songs/456

El API Gateway la traduce a:
Servicio backend (gRPC): songService.GetSong(songId=456)

El gateway recibe la respuesta gRPC y la convierte a JSON sobre HTTP:
{
  "id": 456,
  "title": "Granite",
  "artist": "Sleep Token"
}
```

Esto permite que:

- Los servicios backend usen gRPC, más eficiente, para la comunicación interna.
- Los clientes sigan usando APIs HTTP REST que ya conocen.
- Los equipos elijan los protocolos óptimos sin afectar la experiencia del cliente.

### 6. Transformación de solicitudes y respuestas

El gateway puede modificar las solicitudes y respuestas que pasan por él, y actúa como traductor entre lo que envían y esperan los clientes y lo que requieren y devuelven los servicios backend. Algunos ejemplos:

- Agregar encabezados de autenticación.
- Transformar formatos de respuesta.
- Agregar datos de varios servicios.
- Filtrar información confidencial.

**Ejemplo: inyección de encabezados y filtrado de respuesta.**

![Diagrama de transformación de solicitud y respuesta en el API Gateway](/assets/api-gateway-transformacion.webp)

```javascript
// Solicitud del cliente
// GET /api/users/123

// El API Gateway transforma la solicitud agregando encabezados
const backendRequest = {
  url: '/internal/users/123',
  headers: {
    'Authorization': 'Bearer internal-service-token',
    'X-Request-ID': 'req-12345',
    'X-User-Role': 'listener'  // extraído del JWT del cliente
  }
};

// Respuesta del servicio backend
{
  "id": 123,
  "username": "billie_fan_99",
  "email": "fan@example.com",
  "internalId": "USR-567890",
  "paymentToken": "tok_a1b2c3d4",
  "role": "listener"
}

// El API Gateway transforma la respuesta (filtra datos sensibles)
{
  "id": 123,
  "username": "billie_fan_99",
  "email": "fan@example.com",
  "role": "listener"
}
```

Esto nos permite:

- Agregar autenticación sin modificar los servicios backend.
- Filtrar datos sensibles (IDs internos, tokens de pago) de las respuestas.
- Inyectar metadatos de la solicitud para seguimiento y monitoreo.
- Estandarizar los formatos de respuesta entre distintos servicios.

### 7. Monitoreo y analítica

Centraliza el registro de logs, la recolección de métricas y el análisis de todo el tráfico de la API:

- Registros de solicitudes y respuestas.
- Métricas de rendimiento.
- Tasas de error.
- Analítica de uso.

---

## Soluciones populares

### En la nube

- **AWS API Gateway:** servicio totalmente administrado con escalado automático.
- **Google Cloud Endpoints:** integrado con los servicios de Google Cloud.
- **Azure API Management:** funciones y analítica de nivel empresarial.

### Código abierto

- **Kong:** arquitectura basada en plugins con un ecosistema amplio.
- **Zuul:** el API Gateway de Netflix, con integración con Spring Cloud.
- **Traefik:** nativo de la nube, con descubrimiento automático de servicios.
- **Envoy Proxy:** proxy de alto rendimiento con balanceo de carga avanzado.

### Autoalojadas

- **Nginx Plus:** versión comercial con funciones de API Gateway.
- **HAProxy:** alta disponibilidad y enfoque en el rendimiento.
- **Ambassador:** API Gateway nativo de Kubernetes.

---

## El API Gateway en una entrevista de diseño de sistemas

En las entrevistas, el foco suele estar en que el diseño responda a los requisitos del negocio y a la escalabilidad. Normalmente el API Gateway se dibuja como **una sola caja** que enruta las solicitudes a los microservicios correspondientes, mientras se encarga de la autenticación, la autorización, el límite de velocidad y el monitoreo.

![Diagrama de API Gateway en una entrevista de diseño de sistemas](/assets/api-gateway-entrevista.webp)

Si el entrevistador te pide profundizar en el gateway, puedes apoyarte en las funciones que vimos arriba para guiar tu diseño.

**Tags:** `#arquitectura` `#microservicios` `#api-gateway`