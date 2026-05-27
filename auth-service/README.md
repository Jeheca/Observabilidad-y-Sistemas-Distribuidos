# Servicio de Autenticación · Taracea

Microservicio de **inicio de sesión** de la tienda Taracea. Construido con NestJS + TypeORM
sobre PostgreSQL.

> Para el taller las contraseñas **no se encriptan**: se guardan y comparan en texto plano.
> En un entorno real irían siempre con hash + salt.

## Endpoints

| Método | Ruta             | Descripción                                              |
|--------|------------------|----------------------------------------------------------|
| `GET`  | `/`              | Health check (`{ "status": "ok", "service": "..." }`).   |
| `GET`  | `/metrics`       | Métricas en formato Prometheus.                          |
| `POST` | `/auth/register` | Crea un usuario. Body: `{ name, email, password }`.      |
| `POST` | `/auth/login`    | Inicia sesión. Body: `{ email, password }`.              |

`POST /auth/login` responde con `{ user: { id, name, email }, token }`. El `token` es un
identificador de sesión opaco (no es un JWT firmado).

## Observabilidad

Este servicio está instrumentado como ejemplo de referencia del taller:

- **Métricas** — expone `GET /metrics` en formato Prometheus (peticiones HTTP, latencia,
  logins, registros y métricas de Node.js). La instrumentación vive en `src/observabilidad/`.
- **Logs estructurados** — emite logs en JSON (Pino), incluidos los eventos
  `login_success`, `login_failed` y `register_success`.

El procedimiento completo está documentado en [`OBSERVABILIDAD.md`](../OBSERVABILIDAD.md).

## Variables de entorno

| Variable      | Descripción                          |
|---------------|--------------------------------------|
| `PORT`        | Puerto HTTP del servicio.            |
| `DB_HOST`     | Host de PostgreSQL.                  |
| `DB_PORT`     | Puerto de PostgreSQL.                |
| `DB_USER`     | Usuario de la base de datos.         |
| `DB_PASSWORD` | Contraseña de la base de datos.      |
| `DB_NAME`     | Nombre de la base de datos.          |

## Desarrollo local

```bash
npm install
npm run start:dev
```

Lo normal es levantarlo junto al resto del sistema con `docker compose up` desde la raíz
del repositorio.
