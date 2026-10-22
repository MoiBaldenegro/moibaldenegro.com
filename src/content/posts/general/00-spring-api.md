---
slug: 00-spring-boot
title:  Creando una API RESTful con Spring Boot
author: Moises Baldenegro Melendez
img: spring00.webp
readtime: 12
description: Veremos como crear un servicio RESTful con Spring Boot y JAVA 21.
tags: "#diseno-de-sistemas #spring #java #software-design"
created: "16 Septiembre 2026"
updated: "16 Septiembre 2026"
next: /posts/01-diseno-detallado
related: [/posts/02-principios-del-diseno-de-software]

---

En este post construimos (y explicamos) una API REST de productos en **Spring Boot**
siguiendo una arquitectura por capas. El proyecto se llama **`lamar-api`** y usa:

- **Spring Web MVC** para exponer los endpoints REST.
- **Spring Data JPA** para hablar con la base de datos sin SQL manual.
- **H2** (base de datos en memoria) para no depender de un motor externo.
- **DTOs** (records de Java) para separar la entidad de lo que se expone.
- **Java 21** y **Maven**.

Al final dejo una **guía de prueba** con URLs y `body` listos para copiar.

---

## 1. La idea: separar responsabilidades en capas

Cuando el proyecto crece, meter todo en un solo archivo se vuelve insostenible.
La solución es dividir el código según su responsabilidad. En esta API cada
petición HTTP atraviesa las capas en orden, de arriba hacia abajo:

```
Cliente (curl / Postman / frontend)
        │
        ▼
┌───────────────────┐
│   Controller      │  HTTP: recibe RequestDTO y responde ResponseDTO
└───────────────────┘
        │  ProductRequestDTO / ProductResponseDTO
        ▼
┌───────────────────┐
│     Service       │  Reglas de negocio + mapeo Entidad ⇄ DTO
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Repository      │  Acceso a datos (Spring Data JPA)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Base de datos    │  H2 en memoria
└───────────────────┘
```

La regla de oro: **cada capa solo conoce a la que tiene justo debajo**.
El controller no sabe de SQL; el repositorio no sabe de HTTP.

### Estructura de paquetes

```
src/main/java/com/example/lamar_api/
├── LamarApiApplication.java        # Punto de entrada
├── models/
│   └── Product.java                # Entidad JPA
├── dtos/
│   ├── ProductRequestDTO.java      # Lo que entra (entrada)
│   └── ProductResponseDTO.java     # Lo que sale (salida)
├── repositories/
│   └── ProductRepository.java      # Acceso a datos
├── services/
│   └── ProductService.java         # Lógica de negocio
└── controllers/
    └── ProductController.java      # Endpoints REST
```

---

## 2. La capa de modelo (entidad JPA)

`Product` representa un producto **y** una tabla en la base de datos. Las
anotaciones de JPA le dicen a Hibernate cómo mapearla.

```java
package com.example.lamar_api.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Double precio;

    public Product() {
    }

    public Product(Long id, String nombre, Double precio) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
    }

    // getters y setters...
}
```

Puntos clave:

- `@Entity` → la clase se convierte en la tabla `product`.
- `@Id` + `@GeneratedValue(IDENTITY)` → el `id` lo genera la base de datos
  automáticamente; nosotros nunca lo enviamos al crear.
- El **constructor vacío** es obligatorio para que JPA pueda instanciar la entidad.
- La entidad vive **detrás** de la API: nunca la exponemos directamente al cliente
  (para eso están los DTOs de la siguiente sección).

---

## 3. La capa de DTOs (entrada y salida)

Un **DTO** (*Data Transfer Object*) es un objeto simple que define **qué datos
cruzan la frontera de la API**. En lugar de exponer la entidad `Product`, usamos
dos DTOs:

- **`ProductRequestDTO`**: lo que el cliente envía (sin `id`, porque lo genera la BD).
- **`ProductResponseDTO`**: lo que la API devuelve (incluye el `id` generado).

Usamos **records** de Java: son inmutables, concisos y Jackson los serializa y
deserializa sin problema.

```java
package com.example.lamar_api.dtos;

public record ProductRequestDTO(String nombre, Double precio) {
}
```

```java
package com.example.lamar_api.dtos;

public record ProductResponseDTO(Long id, String nombre, Double precio) {
}
```

### ¿Por qué no usar la entidad directamente?

| Motivo | Sin DTO | Con DTO |
|--------|---------|---------|
| **Seguridad** | Expone todos los campos de la tabla | Expone solo lo que decides |
| **Desacoplamiento** | Cambiar la BD rompe la API | El contrato de la API es estable |
| **Validación** | Validación mezclada con la entidad | Validación clara en el DTO de entrada |
| **Claridad** | Entrada y salida son iguales | Queda explícito qué entra y qué sale |

Los accesores de un record se llaman como el campo, sin `get`:
`request.nombre()`, `request.precio()`.

---

## 4. La capa de repositorio

Aquí está la magia de Spring Data: **no escribimos implementación**. Solo
declaramos una interfaz que extiende `JpaRepository` y el framework genera el CRUD.

```java
package com.example.lamar_api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.lamar_api.models.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

Con solo esa línea ya tenemos gratis:

| Método         | Qué hace                  |
|----------------|---------------------------|
| `findAll()`    | Devuelve todos los registros |
| `findById(id)` | Busca uno por id          |
| `save(entidad)`| Inserta o actualiza       |
| `deleteById(id)`| Elimina por id           |

Los genéricos `<Product, Long>` significan: entidad `Product` y su id es `Long`.

---

## 5. La capa de servicio

El service ya no guarda datos en memoria (adiós al `List.of(...)` hardcodeado).
Ahora **delega en el repositorio**, añade reglas de negocio y hace de traductor
entre **DTOs** y **entidades**.

```java
package com.example.lamar_api.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.lamar_api.dtos.ProductRequestDTO;
import com.example.lamar_api.dtos.ProductResponseDTO;
import com.example.lamar_api.models.Product;
import com.example.lamar_api.repositories.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponseDTO> getProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        Product product = new Product();
        product.setNombre(request.nombre());
        product.setPrecio(request.precio());
        return toResponse(productRepository.save(product));
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        return productRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(request.nombre());
                    existing.setPrecio(request.precio());
                    return toResponse(productRepository.save(existing));
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id " + id));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private ProductResponseDTO toResponse(Product product) {
        return new ProductResponseDTO(product.getId(), product.getNombre(), product.getPrecio());
    }
}
```

Detalle importante: el constructor recibe el repositorio y Spring lo inyecta
automáticamente (**inyección por constructor**, la forma recomendada).

---

## 6. La capa de controlador

El controller es la puerta de entrada HTTP. Recibe el `ProductRequestDTO`,
llama al service y devuelve un `ProductResponseDTO`, todo en JSON gracias a
`@RestController`.

```java
package com.example.lamar_api.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.lamar_api.dtos.ProductRequestDTO;
import com.example.lamar_api.dtos.ProductResponseDTO;
import com.example.lamar_api.services.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponseDTO> getProducts() {
        return productService.getProducts();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponseDTO createProduct(@RequestBody ProductRequestDTO product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public ProductResponseDTO updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
```

### El flujo completo de una petición

Ejemplo con `POST /products`:

1. **Controller**: Spring convierte el JSON entrante a un `ProductRequestDTO`
   (`@RequestBody`) y llama a `productService.createProduct(request)`.
2. **Service**: mapea el `ProductRequestDTO` a una entidad `Product` y ejecuta
   `productRepository.save(product)`.
3. **Repository**: Spring Data JPA traduce ese `save` a un `INSERT` en H2.
4. **H2**: guarda la fila y devuelve el `id` generado.
5. **Service**: mapea la entidad guardada a un `ProductResponseDTO`.
6. **Controller**: devuelve ese DTO como JSON con código `201 Created`.

Cada capa hizo **una sola cosa**, y los DTOs mantienen limpia la frontera:
el cliente nunca ve la entidad. Ese es el objetivo de la arquitectura.

---

## 7. Configuración de la base de datos H2

En `src/main/resources/application.properties`:

```properties
spring.application.name=lamar-api

spring.datasource.url=jdbc:h2:mem:lamardb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

- `jdbc:h2:mem:...` → base de datos **en memoria**: rápida y sin instalar nada,
  pero se borra al reiniciar la app.
- `ddl-auto=update` → Hibernate crea la tabla `product` automáticamente al arrancar.
- `show-sql=true` → imprime el SQL en consola, ideal para aprender.

---

## 8. Guía de prueba (copiar y pegar)

> 💡 Los bloques de código de abajo incluyen el **botón de copiar** que GitHub y
> muchos visores de Markdown añaden en la esquina superior derecha.

Primero levanta la aplicación:

```bash
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

### 8.1 Crear un producto — `POST /products`

```bash
curl -X POST http://localhost:8080/products \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Cafe", "precio": 12.5}'
```

Crea otro para tener varios registros:

```bash
curl -X POST http://localhost:8080/products \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Te verde", "precio": 8.0}'
```

Body por si lo usas en Postman/Thunder Client (equivalente al `ProductRequestDTO`):

```json
{
  "nombre": "Cafe",
  "precio": 12.5
}
```

Respuesta esperada (código `201 Created`, equivale al `ProductResponseDTO`):

```json
{
  "id": 1,
  "nombre": "Cafe",
  "precio": 12.5
}
```

### 8.2 Listar productos — `GET /products`

```bash
curl http://localhost:8080/products
```

Respuesta esperada:

```json
[
  { "id": 1, "nombre": "Cafe", "precio": 12.5 },
  { "id": 2, "nombre": "Te verde", "precio": 8.0 }
]
```

### 8.3 Actualizar un producto — `PUT /products/{id}`

```bash
curl -X PUT http://localhost:8080/products/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Cafe premium", "precio": 15.0}'
```

Body para Postman:

```json
{
  "nombre": "Cafe premium",
  "precio": 15.0
}
```

### 8.4 Eliminar un producto — `DELETE /products/{id}`

```bash
curl -X DELETE http://localhost:8080/products/1
```

Respuesta: `204 No Content`.

### 8.5 Ver la base de datos — consola H2

Abre en el navegador:

```
http://localhost:8080/h2-console
```

Usa estos datos en el formulario de conexión:

| Campo    | Valor               |
|----------|---------------------|
| JDBC URL | `jdbc:h2:mem:lamardb` |
| User     | `sa`                |
| Password | *(vacío)*           |

Haz clic en **Connect** y podrás ejecutar:

```sql
SELECT * FROM PRODUCT;
```

---

## Resumen

| Capa        | Archivo                       | Responsabilidad                    |
|-------------|-------------------------------|------------------------------------|
| Controller  | `ProductController.java`      | HTTP y JSON                        |
| Service     | `ProductService.java`         | Reglas de negocio + mapeo DTO⇄Entidad |
| Repository  | `ProductRepository.java`      | Acceso a datos (JPA)               |
| Model       | `Product.java`                | Entidad / tabla                    |
| DTO         | `dtos/*.java`                 | Contrato de entrada y salida       |
| Config      | `application.properties`      | Conexión a H2                      |

Separar en capas hace el código más legible, testeable y fácil de cambiar:
si mañana migras de H2 a PostgreSQL, **solo tocas la configuración**;
y si cambia la forma del JSON, **solo tocas los DTOs**. 🚀

**Tags:** `#spring` `#java` `#software-design` `#api` `#services`