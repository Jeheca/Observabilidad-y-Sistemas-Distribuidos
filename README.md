# Taller de Observabilidad

El objetivo de este taller es implementar un sistema de observabilidad sobre la tienda de muebles de **Taracea**.

## Sujeto de observación: la tienda Taracea

Este repositorio contiene una SPA de un catálogo de muebles con filtros por categoría, búsqueda, detalle de producto, formulario de productos, carrito de compra e inicio de sesión.
El catálogo, las órdenes y los usuarios viven en una base de datos PostgreSQL, expuesta a través de tres APIs en NestJS.

## Arquitectura

El sistema se compone de un frontend, **tres microservicios** y una base de datos compartida. Todo se orquesta con `docker-compose.yaml`.

| Componente                    | Carpeta             | Puerto | Responsabilidad                                                           |
|-------------------------------|---------------------|--------|---------------------------------------------------------------------------|
| **Web app**                   | `web-app/`          | `8080` | SPA en Angular: catálogo, detalle, creación de productos, carrito, login. |
| **Servicio de Autenticación** | `auth-service/`     | `3001` | Registro e inicio de sesión de usuarios.                                  |
| **Servicio de Productos**     | `products-service/` | `3002` | Catálogo de muebles: consulta por categoría y registro de productos.      |
| **Servicio de Órdenes**       | `orders-service/`   | `3003` | Pedidos del carrito: creación y seguimiento de órdenes de compra.         |
| **PostgreSQL**                | —                   | `5432` | Base de datos compartida por los tres microservicios.                     |

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

### APIs

**Autenticación** (`auth-service`)

| Método | Ruta             | Descripción                                    |
|--------|------------------|------------------------------------------------|
| `POST` | `/auth/register` | Crea un usuario (`{ name, email, password }`). |
| `POST` | `/auth/login`    | Inicia sesión (`{ email, password }`).         |

**Productos** (`products-service`)

| Método  | Ruta                       | Descripción                     |
|---------|----------------------------|---------------------------------|
| `GET`   | `/products`                | Todos los productos.            |
| `GET`   | `/products?category=salas` | Productos de una categoría.     |
| `GET`   | `/products/:id`            | Un producto por su id.          |
| `POST`  | `/products`                | Registra un producto nuevo.     |
| `PATCH` | `/products/:id/stock`      | Descuenta stock de un producto. |

**Órdenes** (`orders-service`)

| Método | Ruta          | Descripción               |
|--------|---------------|---------------------------|
| `GET`  | `/orders`     | Todas las órdenes.        |
| `GET`  | `/orders/:id` | Una orden por su id.      |
| `POST` | `/orders`     | Crea una orden de compra. |

El detalle de cada API está en el `README.md` de su carpeta.

## Cómo levantar el sistema

Con [Docker](https://docs.docker.com/) instalado, desde la raíz del repositorio:

```bash
docker compose up --build
```

Esto levanta todos los contenedores: PostgreSQL, los tres microservicios, la web app y el stack de observabilidad (Prometheus, Loki, Promtail y Grafana). Cuando todo esté arriba:

- Tienda: <http://localhost:8080>
- APIs: <http://localhost:3001>, <http://localhost:3002>, <http://localhost:3003>
- Grafana: <http://localhost:3000>

La primera vez, el servicio de productos carga un catálogo semilla de 9 muebles si la base de datos está vacía. Para detener y limpiar:

```bash
docker compose down        # detiene los contenedores
docker compose down -v     # además borra los datos de PostgreSQL
```

## Instrucciones del Taller

El sistema base era funcional pero carecía de visibilidad interna. El objetivo del taller fue instrumentar el código y la infraestructura para dotar al sistema de métricas cuantitativas y logs centralizados, tomando como referencia la instrumentación ya existente en el servicio de autenticación (`auth-service`).

### 1. Solución Implementada

#### 1.1 Requisitos

Se seleccionó el `products-service` como microservicio a instrumentar, dado que concentra la mayor cantidad de operaciones de lectura y escritura del sistema. La misma estrategia puede aplicarse de forma análoga al `orders-service`.

#### 1.2 Implementación de Logs Estructurados

Se modificó el microservicio para emitir logs en formato JSON estructurado, reemplazando el logger por defecto de NestJS por una implementación basada en `nestjs-pino` y `pino`. Cada entrada de log incluye contexto del servicio, eventos de negocio y mensajes de operación, lo que facilita su indexación y búsqueda.

Para centralizar los logs, se configuró un stack compuesto por Promtail y Loki dentro de `docker-compose.yaml`. Promtail actúa como agente de recolección, leyendo los logs del contenedor del microservicio y enviándolos a Loki, que los almacena y los pone a disposición de Grafana para su consulta mediante LogQL.

#### 1.3 Visualización en Grafana

Se conectó Grafana a dos fuentes de datos: Prometheus (para métricas) y Loki (para logs). Se creó un dashboard dedicado al microservicio instrumentado con paneles para:

- Tasa de peticiones por minuto (`http_requests_total`).
- Latencia promedio y percentil 95 de las respuestas.
- Tasa de errores HTTP en el tiempo.
- Explorador de logs en tiempo real con filtros por servicio y eventos de negocio.

El dashboard permite observar de manera unificada tanto el comportamiento cuantitativo (métricas de Prometheus) como el cualitativo (logs de Loki), facilitando la identificación de anomalías y la correlación de eventos en el sistema.

### 2. Conclusiones

La implementación de observabilidad sobre `products-service` permitió:

1. Visibilidad de rendimiento: ahora es posible monitorear la tasa de peticiones, latencia, errores HTTP y uso de recursos (CPU, memoria) en tiempo real.
2. Auditabilidad de eventos de negocio: cada operación relevante (creación de producto, actualización de stock y errores de inventario) queda registrada como un log estructurado con contexto completo.
3. Métricas de negocio cuantificables: se pueden medir indicadores como el número de productos creados por minuto o la tasa de fallos de stock.
4. Correlación métricas-logs: Grafana permite navegar de una anomalía en una métrica a los logs correspondientes en el mismo dashboard.
5. Dashboard reutilizable: el dashboard creado para `products-service` sirve como plantilla para instrumentar otros microservicios del sistema.
