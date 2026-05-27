# Taller de Observabilidad - Taracea

## Integrantes

- 20211020110 - Daniel Felipe Sanchez Garcia
- 20212020096 - Kevin Santiago Avella Torres
- 20212020151 - Samuel Antonio Sanchez Peña

## Solucion implementada

Se instrumentaron los tres microservicios (auth-service, products-service, orders-service) con metricas (Prometheus) y logs estructurados (Pino -> Loki), siguiendo la guia de [`OBSERVABILIDAD.md`](OBSERVABILIDAD.md).

### Arquitectura

```
                    ┌─────────────┐
   navegador ─────▶ │   web-app   │ (nginx, :8080)
                    └──────┬──────┘
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌────────────┐ ┌──────────────┐ ┌──────────────┐
     │auth-service│ │products-svc  │ │orders-service│
     │   :3001    │ │    :3002     │ │    :3003     │
     └─────┬──────┘ └──────┬───────┘ └──────┬───────┘
           │               │   ▲            │
           │               │   └────────────┘  orders consulta y
           ▼               ▼      products      descuenta stock
        ┌───────────────────────────────┐
        │      PostgreSQL  (:5432)      │
        └───────────────────────────────┘
```

### Stack de observabilidad

```
   auth-service    ──/metrics──▶ Prometheus ──┐
   products-service──/metrics──▶               ├──▶ Grafana (http://localhost:3000)
   orders-service  ──/metrics──▶               │
        │                                     │
        └──logs JSON ──▶ Promtail ──▶ Loki ───┘
```

| Contenedor   | Puerto | Rol                                                        |
|--------------|--------|------------------------------------------------------------|
| `prometheus` | `9090` | Recolecta el endpoint `/metrics` de cada servicio.         |
| `loki`       | `3100` | Almacena y consulta los logs.                              |
| `promtail`   | --     | Lee los logs de todos los contenedores y los envia a Loki. |
| `grafana`    | `3000` | Visualiza metricas y logs con dashboards pre-cargados.     |

### Como levantar el sistema

```bash
docker compose up --build
```

Servicios disponibles:

- Tienda: http://localhost:8080
- APIs: http://localhost:3001, http://localhost:3002, http://localhost:3003
- Grafana: http://localhost:3000 (acceso anonimo, sin login)
- Prometheus: http://localhost:9090/targets

Para detener y limpiar:

```bash
docker compose down        # detiene los contenedores
docker compose down -v     # ademas borra los datos de PostgreSQL
```

### Metricas por servicio

**auth-service** (referencia original)

| Metrica                         | Tipo      | Descripcion                                      |
|---------------------------------|-----------|--------------------------------------------------|
| `http_requests_total`           | Counter   | Peticiones HTTP por metodo, ruta y status.       |
| `http_request_duration_seconds` | Histogram | Latencia p95 de peticiones HTTP.                 |
| `auth_logins_total`             | Counter   | Intentos de login (`success`/`failure`).         |
| `auth_registrations_total`      | Counter   | Registros de usuario exitosos.                   |

**products-service**

| Metrica                         | Tipo      | Descripcion                                      |
|---------------------------------|-----------|--------------------------------------------------|
| `http_requests_total`           | Counter   | Peticiones HTTP por metodo, ruta y status.       |
| `http_request_duration_seconds` | Histogram | Latencia p95 de peticiones HTTP.                 |
| `products_created_total`        | Counter   | Productos creados.                               |
| `products_stock_updates_total`  | Counter   | Actualizaciones de stock (`success`/`failure`).  |

**orders-service**

| Metrica                         | Tipo      | Descripcion                                      |
|---------------------------------|-----------|--------------------------------------------------|
| `http_requests_total`           | Counter   | Peticiones HTTP por metodo, ruta y status.       |
| `http_request_duration_seconds` | Histogram | Latencia p95 de peticiones HTTP.                 |
| `orders_created_total`          | Counter   | Ordenes creadas, etiquetadas por `status`.       |
| `orders_amount`                 | Histogram | Monto de las ordenes de compra.                  |

### Logs estructurados

Cada servicio emite logs en formato JSON con Pino:

- Campos base: `service`, `level`, `time`.
- Eventos de negocio con campo `event` para filtrar en Loki.
- Peticiones HTTP registradas automaticamente por `pino-http`.
- El endpoint `/metrics` se excluye del log automatico.

| Servicio           | Evento                    | Nivel | Campos clave                                   |
|--------------------|---------------------------|-------|------------------------------------------------|
| `auth-service`     | `login_success`           | info  | `userId`, `email`                             |
| `auth-service`     | `login_failed`            | warn  | `email`                                       |
| `auth-service`     | `register_success`        | info  | `userId`, `email`                             |
| `products-service` | `product_created`         | info  | `productId`, `name`, `category`               |
| `products-service` | `stock_updated`           | info  | `productId`, `newStock`, `deducted`           |
| `products-service` | `stock_update_failed`     | warn  | `productId`, `available`, `requested`         |
| `products-service` | `product_not_found`       | warn  | `productId`                                   |
| `orders-service`   | `order_created`           | info  | `orderId`, `userId`, `total`, `items`         |
| `orders-service`   | `order_stock_insufficient`| warn  | `productId`, `productName`, `available`, `requested` |
| `orders-service`   | `order_not_found`         | warn  | `orderId`                                     |

### Dashboards en Grafana

Grafana se aprovisiona automaticamente con tres dashboards (carpeta `Taracea`):

1. **Auth Service · Observabilidad** -- Logins, registros, tasa de peticiones, latencia, errores, CPU/RAM.
2. **Products Service · Observabilidad** -- Productos creados, stock actualizado/fallido, tasa de peticiones, latencia, errores, CPU/RAM.
3. **Orders Service · Observabilidad** -- Ordenes creadas, monto total, monto promedio, distribucion de montos, tasa de peticiones, latencia, errores, CPU/RAM.

Cada dashboard incluye un panel de logs de Loki.

### Como verificar

1. Levantar el sistema: `docker compose up --build`
2. Usar la tienda en http://localhost:8080 para generar trafico (registrarse, iniciar sesion, crear productos, generar ordenes).
3. Abrir Grafana en http://localhost:3000 > Dashboards > Taracea.
4. Verificar que los tres servicios aparecen `UP` en http://localhost:9090/targets.
5. En Grafana Explore, usar Loki para consultar logs:
   ```logql
   {service="products-service"}
   {service="orders-service"} | json | event="order_created"
   ```

### APIs

**Autenticacion** (`auth-service`)

| Metodo | Ruta             | Descripcion                                    |
|--------|------------------|------------------------------------------------|
| `POST` | `/auth/register` | Crea un usuario (`{ name, email, password }`). |
| `POST` | `/auth/login`    | Inicia sesion (`{ email, password }`).         |

**Productos** (`products-service`)

| Metodo  | Ruta                       | Descripcion                     |
|---------|----------------------------|---------------------------------|
| `GET`   | `/products`                | Todos los productos.            |
| `GET`   | `/products?category=salas` | Productos de una categoria.     |
| `GET`   | `/products/:id`            | Un producto por su id.          |
| `POST`  | `/products`                | Registra un producto nuevo.     |
| `PATCH` | `/products/:id/stock`      | Descuenta stock de un producto. |

**Ordenes** (`orders-service`)

| Metodo | Ruta          | Descripcion               |
|--------|---------------|---------------------------|
| `GET`  | `/orders`     | Todas las ordenes.        |
| `GET`  | `/orders/:id` | Una orden por su id.      |
| `POST` | `/orders`     | Crea una orden de compra. |
