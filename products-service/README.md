# Servicio de Productos · Taracea

Microservicio del **catálogo de muebles** de la tienda Taracea. Construido con NestJS +
TypeORM sobre PostgreSQL.

## Modelo de datos

- **`products`** — un producto del catálogo: nombre, descripción, precio (COP, entero),
  stock, categoría, dimensiones (`height` / `width` / `depth` en cm), tiempo de entrega
  y color de marca.
- **`product_materials`** — materiales de cada producto, con clave primaria compuesta
  `(product_id, material_id)`. El `material_id` es un consecutivo dentro del producto y
  la descripción del material se guarda como texto (sin catálogo de materiales).

Al arrancar, si la tabla `products` está vacía, se carga un catálogo semilla de 9 muebles
(ver `src/products/seed-data.ts`).

## Endpoints

| Método  | Ruta                       | Descripción                                            |
|---------|----------------------------|--------------------------------------------------------|
| `GET`   | `/`                        | Health check.                                          |
| `GET`   | `/products`                | Todos los productos.                                   |
| `GET`   | `/products?category=salas` | Productos de una categoría.                            |
| `GET`   | `/products/:id`            | Un producto por su id.                                 |
| `POST`  | `/products`                | Crea un producto (incluye su lista de `materials`).    |
| `PATCH` | `/products/:id/stock`      | Descuenta stock. Body: `{ quantity }`.                 |

Categorías válidas: `salas`, `comedores`, `dormitorios`.

## Variables de entorno

| Variable      | Descripción                     |
|---------------|---------------------------------|
| `PORT`        | Puerto HTTP del servicio.       |
| `DB_HOST`     | Host de PostgreSQL.             |
| `DB_PORT`     | Puerto de PostgreSQL.           |
| `DB_USER`     | Usuario de la base de datos.    |
| `DB_PASSWORD` | Contraseña de la base de datos. |
| `DB_NAME`     | Nombre de la base de datos.     |

## Desarrollo local

```bash
npm install
npm run start:dev
```

Lo normal es levantarlo junto al resto del sistema con `docker compose up` desde la raíz
del repositorio.
