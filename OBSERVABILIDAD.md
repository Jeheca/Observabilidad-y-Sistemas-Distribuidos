# Guía de Observabilidad — Taller Taracea

Esta guía explica cómo se instrumentó el **`auth-service`** como ejemplo de referencia, para
que en el taller se replique el mismo procedimiento sobre `products-service` u `orders-service`.

Cubre tres cosas:

1. **Métricas** — el servicio expone un endpoint `/metrics` que Prometheus recolecta.
2. **Logs estructurados** — el servicio emite logs en JSON que Loki centraliza.
3. **Visualización** — Grafana gráfica métricas (Prometheus) y logs (Loki).

```
   auth-service ──/metrics──▶ Prometheus ──┐
        │                                  ├──▶ Grafana(http://localhost:3000)
        └──logs JSON ──▶ Loki ─────────────┘
```

---

## 1. Dependencias

Todas las dependencias del lado de la aplicación se instalan **dentro del servicio** que se va a instrumentar (en el ejemplo, `auth-service/`).

### Métricas

```bash
cd auth-service
npm install @willsoto/nestjs-prometheus prom-client
```

- **`prom-client`** — cliente oficial de Prometheus para Node.js. Define contadores,
  histogramas, etc. y genera el texto del formato Prometheus.
- **`@willsoto/nestjs-prometheus`** — integra `prom-client` con NestJS: registra
  automáticamente el endpoint `GET /metrics` y permite inyectar métricas como providers.

### Logs estructurados

```bash
cd auth-service
npm install nestjs-pino pino pino-http
```

- **`pino`** — logger JSON para Node.js.
- **`pino-http`** — middleware que registra automáticamente cada petición HTTP.
- **`nestjs-pino`** — integra Pino con NestJS y lo conecta al sistema de logging de Nest.

### Infraestructura

Prometheus, Loki, Promtail y Grafana corren como **contenedores**. No requieren instalación manual: están definidos en `docker-compose.yaml` y sus archivos de
configuración viven en la carpeta `observability/`.

---

## 2. Configuración del código (`auth-service`)

### 2.1 Métricas

**`src/observabilidad/metrics.module.ts`** — un módulo `@Global()` que:

- importa `PrometheusModule.register()`, que crea el endpoint `GET /metrics` y publica las métricas por defecto de Node.js (CPU, memoria, *event loop*…);
- declara las métricas propias con `makeCounterProvider` / `makeHistogramProvider`;
- registra un *interceptor* global que mide todas las peticiones HTTP.

Métricas definidas:

| Métrica                         | Tipo      | Para qué sirve                                   |
|---------------------------------|-----------|--------------------------------------------------|
| `http_requests_total`           | Counter   | Tasa de peticiones y de errores (por `status`).  |
| `http_request_duration_seconds` | Histogram | Latencia de las peticiones (p95, p99…).          |
| `auth_logins_total`             | Counter   | Logins, etiquetados `result="success\|failure"`. |
| `auth_registrations_total`      | Counter   | Registros de usuario exitosos.                   |

**`src/observabilidad/http-metrics.interceptor.ts`** — interceptor que, en cada petición, incrementa `http_requests_total` y observa `http_request_duration_seconds`,
etiquetando por método, ruta y código de estado.

Las métricas de negocio (`auth_logins_total`, `auth_registrations_total`) se inyectan en `AuthService` con `@InjectMetric(...)` y se incrementan en cada evento.

### 2.2 Logs estructurados

En **`src/app.module.ts`** se importa `LoggerModule.forRoot(...)` de `nestjs-pino`. Con eso:

- cada petición HTTP genera un log JSON automáticamente con `pino-http`, que incluye método, ruta, código de estado, latencia…
- todos los logs llevan el campo `service: "auth-service"`.

En **`src/main.ts`** se sustituye el logger de Nest por el de Pino (`app.useLogger(app.get(Logger))`) con `bufferLogs: true`.

En **`AuthService`** se inyecta `PinoLogger` y se emiten tres eventos de negocio, cada uno como un objeto JSON con un campo `event`:

| Evento             | Nivel  | Campos            |
|--------------------|--------|-------------------|
| `login_success`    | `info` | `userId`, `email` |
| `login_failed`     | `warn` | `email`           |
| `register_success` | `info` | `userId`, `email` |

Ejemplo de línea de log emitida:

```json
{
  "level": 30,
  "time": 1718000000000,
  "service": "auth-service",
  "event": "login_success",
  "userId": 1,
  "email": "ana@taracea.co",
  "msg": "Inicio de sesión exitoso"
}
```

---

## 3. Infraestructura: Prometheus, Loki, Promtail y Grafana

Se añadieron cuatro contenedores a `docker-compose.yaml`. Sus archivos de configuración están en `observability/`:

```
observability/
├── prometheus.yml                         # qué servicios scrapea Prometheus
├── promtail-config.yml                    # cómo Promtail recoge los logs
└── grafana/
    ├── provisioning/
    │   ├── datasources/datasources.yml     # Prometheus + Loki como fuentes de datos
    │   └── dashboards/dashboards.yml       # carga automática de dashboards
    └── dashboards/
        └── auth-service.json               # dashboard de ejemplo del auth-service
```

| Contenedor   | Puerto | Rol                                                           |
|--------------|--------|---------------------------------------------------------------|
| `prometheus` | `9090` | Recolecta (`scrape`) el endpoint `/metrics` de cada servicio. |
| `loki`       | `3100` | Almacena y consulta los logs.                                 |
| `promtail`   | —      | Lee los logs de todos los contenedores y los envía a Loki.    |
| `grafana`    | `3000` | Visualiza métricas y logs.                                    |

- **Prometheus** está configurado para scrapear los tres microservicios. Solo `auth-service` responde en `/metrics`; `products-service` y `orders-service`
  aparecerán como `DOWN` hasta que se instrumenten (esa es la tarea del taller).
- **Promtail** descubre los contenedores por el *socket* de Docker y etiqueta cada log con el nombre del servicio, así que no hay que tocarlo al instrumentar
  un servicio nuevo.

---

## 4. Conexión y uso de Grafana

Grafana queda **conectado automáticamente** mediante *provisioning*: al levantar el sistema ya tiene las fuentes de datos Prometheus y Loki configuradas y un
dashboard cargado. No hay que configurar nada a mano.

1. Levantar todo el sistema:

   ```bash
   docker compose up --build
   ```

2. Abrir Grafana en <http://localhost:3000> (acceso anónimo habilitado, sin login).

3. **Métricas** — en el menú *Dashboards* → *Taracea* → **“Auth Service · Observabilidad”**. Muestra tasa de peticiones, latencia p95, errores, CPU/RAM y
   eventos de login/registro.

4. **Logs** — en *Explore*, elegir la fuente **Loki** y consultar:

   ```logql
   {service="auth-service"}                                 # todos los logs del servicio
   {service="auth-service"} | json | event=`login_failed`   # solo logins fallidos
   ```

5. **Estado de Prometheus** — en <http://localhost:9090/targets> se ve qué servicios están `UP` o `DOWN`.

Para generar tráfico y ver datos: usar la tienda en <http://localhost:8080> (registrarse, iniciar sesión con credenciales correctas e incorrectas).

---

## 5. Cómo replicarlo en `products-service` u `orders-service`

El procedimiento es el mismo:

1. Instalar las dependencias (`@willsoto/nestjs-prometheus`, `prom-client`, `nestjs-pino`, `pino`, `pino-http`) en el servicio elegido.
2. Copiar la carpeta `src/observabilidad/` y adaptar las métricas de negocio (como `products_created_total`, `orders_created_total`).
3. Configurar `LoggerModule` en su `app.module.ts` y el logger en su `main.ts`.
4. Emitir logs estructurados en los puntos de interés (crear producto, crear orden…).
5. El servicio ya está en `prometheus.yml`: en cuanto exponga `/metrics`, su *target* pasará de `DOWN` a `UP` solo.
6. Crear un dashboard propio en Grafana (se puede partir de `auth-service`).