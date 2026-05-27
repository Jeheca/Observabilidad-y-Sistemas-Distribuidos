# Servicio de Órdenes · Taracea

Microservicio de **pedidos** de la tienda Taracea. Construido con NestJS + TypeORM sobre
PostgreSQL. Al crear una orden se comunica con el **servicio de productos** para validar
el stock y descontarlo.

## Modelo de datos

- **`orders`** — una orden de compra: usuario al que pertenece, nombre del cliente,
  total (COP), estado y fecha de creación. Toda orden queda asociada a un usuario.
- **`order_items`** — líneas de la orden, con clave primaria compuesta
  `(order_id, product_id)`. Guardan una "foto" del nombre y el precio del producto al
  momento de la compra, para que la orden no cambie si el catálogo se actualiza después.

## Flujo de creación de una orden

`POST /orders` →

1. Consulta cada producto en el servicio de productos (`GET /products/:id`) para obtener
   precio y nombre vigentes, y validar el stock disponible.
2. Descuenta el stock en el servicio de productos (`PATCH /products/:id/stock`).
3. Guarda la orden y sus líneas en PostgreSQL.

Esta llamada entre servicios es un buen punto para observar **trazas distribuidas**
durante el taller.

## Endpoints

| Método | Ruta          | Descripción                                                       |
|--------|---------------|-------------------------------------------------------------------|
| `GET`  | `/`           | Health check.                                                     |
| `GET`  | `/orders`     | Todas las órdenes (más recientes primero).                        |
| `GET`  | `/orders/:id` | Una orden por su id.                                              |
| `POST` | `/orders`     | Crea una orden. Body: `{ userId, customerName, items[] }`.        |

Cada elemento de `items` es `{ productId, quantity }`.

## Variables de entorno

| Variable               | Descripción                                            |
|------------------------|--------------------------------------------------------|
| `PORT`                 | Puerto HTTP del servicio.                              |
| `DB_HOST`              | Host de PostgreSQL.                                    |
| `DB_PORT`              | Puerto de PostgreSQL.                                  |
| `DB_USER`              | Usuario de la base de datos.                           |
| `DB_PASSWORD`          | Contraseña de la base de datos.                        |
| `DB_NAME`              | Nombre de la base de datos.                            |
| `PRODUCTS_SERVICE_URL` | URL base del servicio de productos.                    |

## Desarrollo local

```bash
npm install
npm run start:dev
```

Lo normal es levantarlo junto al resto del sistema con `docker compose up` desde la raíz
del repositorio.
