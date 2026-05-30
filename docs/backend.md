# Documentacion Backend

Backend de NOVA Store construido con NestJS, TypeScript, Prisma y PostgreSQL. Expone una API REST bajo el prefijo `/api/v1` y sigue una organizacion inspirada en Clean Architecture.

## Locales

- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`
- Base de datos esperada: PostgreSQL en `localhost:5432`

## Comandos

Desde `backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run start:dev
```

Desde la raiz del proyecto tambien existen:

```bash
npm run dev:backend
npm run db:migrate
npm run db:seed
```

## Variables de entorno

Archivo: `backend/.env`

Variables principales:

- `PORT`: puerto HTTP del backend. Por defecto `3001`.
- `API_PREFIX`: prefijo global. Por defecto `api/v1`.
- `DATABASE_URL`: conexion PostgreSQL usada por Prisma.
- `JWT_SECRET`: secreto para firmar tokens JWT.
- `JWT_EXPIRATION`: duracion del token. Ejemplo: `7d`.
- `FRONTEND_URL`: origen permitido en produccion.
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`: configuracion de Stripe.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: subida de imagenes. Si no estan configuradas, upload usa almacenamiento local en desarrollo.

Ejemplo de base local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"
```

## Arquitectura

Cada modulo vive en `backend/src/modules/<modulo>` y se divide en:

- `domain`: entidades, value objects y contratos de repositorios.
- `application`: casos de uso, DTOs, mappers y puertos.
- `infrastructure`: controladores HTTP, persistencia Prisma, gateways y adaptadores.

La regla general es que las dependencias apunten hacia adentro:

```text
infrastructure -> application -> domain
```

El dominio no debe depender de NestJS, Prisma, HTTP ni librerias externas de infraestructura.

## Modulos

- `users`: registro, login, perfil y administracion de usuarios.
- `products`: productos y categorias.
- `cart`: carrito del usuario autenticado.
- `orders`: checkout, ventas POS, comprobantes y estados de orden.
- `payments`: inicio y confirmacion de pagos.
- `reports`: reportes administrativos.
- `upload`: subida de imagenes para productos.
- `store-config`: configuracion bancaria y QR de pago.

## Autenticacion y roles

El backend usa JWT con Passport. En `main.ts` se registra un guard global `JwtAuthGuard`.

- Endpoints publicos usan el decorador `@Public()`.
- Endpoints administrativos usan `@Roles('ADMIN')` y `RolesGuard`.
- El usuario actual se inyecta con `@CurrentUser()`.

Credenciales del seed:

- Admin: `admin@ecommerce.local` / `Admin123!`
- Cliente: `customer@ecommerce.local` / `Customer123!`

## Endpoints principales

Todos los endpoints estan bajo `/api/v1`.

### Usuarios

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | `/users/register` | Publico | Registrar usuario |
| POST | `/users/login` | Publico | Login y JWT |
| GET | `/users/me` | JWT | Perfil actual |
| PATCH | `/users/me` | JWT | Actualizar perfil |
| GET | `/users/admin/list` | ADMIN | Listar usuarios |
| POST | `/users/admin/create` | ADMIN | Crear usuario manualmente |

### Productos y categorias

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/products` | Publico | Listar productos con filtros |
| GET | `/products/:id` | Publico | Detalle de producto |
| POST | `/products` | ADMIN | Crear producto |
| PATCH | `/products/:id` | ADMIN | Actualizar producto |
| DELETE | `/products/:id` | ADMIN | Eliminar producto |
| GET | `/categories` | Publico | Listar categorias |
| POST | `/categories` | ADMIN | Crear categoria |
| DELETE | `/categories/:id` | ADMIN | Eliminar categoria |

Filtros comunes de productos: `search`, `categoryId`, `slug`, `minPrice`, `maxPrice`, `skip`, `take`, `offers`.

### Carrito

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/cart` | JWT | Obtener carrito |
| POST | `/cart/items` | JWT | Agregar producto |
| PATCH | `/cart/items/:productId` | JWT | Cambiar cantidad |
| DELETE | `/cart/items/:productId` | JWT | Quitar producto |
| DELETE | `/cart` | JWT | Vaciar carrito |

### Ordenes

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | `/orders/checkout` | JWT | Crear orden desde carrito |
| POST | `/orders/pos` | ADMIN | Registrar venta en tienda |
| POST | `/orders/:id/payment-proof` | JWT | Enviar comprobante |
| PATCH | `/orders/:id/verify-payment` | ADMIN | Aprobar o rechazar comprobante |
| GET | `/orders/my` | JWT | Mis ordenes |
| GET | `/orders/:id` | JWT | Detalle de orden |
| GET | `/orders` | ADMIN | Listar todas las ordenes |
| PATCH | `/orders/:id/status` | ADMIN | Cambiar estado |

Estados de orden:

```text
PENDING, PENDING_VERIFICATION, PAID, SHIPPED, DELIVERED, CANCELLED
```

### Pagos

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | `/payments/initiate` | JWT | Iniciar pago |
| POST | `/payments/:id/confirm` | JWT | Confirmar pago |

### Reportes

Todos requieren `ADMIN`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/reports/sales-by-date` | Ventas por rango |
| GET | `/reports/top-products` | Productos mas vendidos |
| GET | `/reports/frequent-customers` | Clientes frecuentes |

Query params: `fromDate`, `toDate`, `limit`.

### Upload y configuracion

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | `/upload/image` | ADMIN | Subir imagen |
| GET | `/store-config` | Publico | Obtener datos bancarios |
| PUT | `/store-config` | ADMIN | Actualizar datos bancarios |

## Base de datos

El schema esta en `backend/prisma/schema.prisma`.

Modelos principales:

- `User`
- `Category`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`
- `StoreConfig`

Los precios se guardan en centavos (`priceCents`, `totalCents`) para evitar errores de punto flotante.

## Testing

Desde `backend/`:

```bash
npm test
npm run test:cov
npm run test:e2e
```

Hay ejemplos de pruebas en:

- `src/shared/domain/value-objects/money.vo.spec.ts`
- `src/modules/users/application/use-cases/register-user.use-case.spec.ts`
- `src/modules/cart/domain/entities/cart.entity.spec.ts`

## Como agregar una funcionalidad

1. Modelar reglas en `domain` si hay logica de negocio nueva.
2. Crear o actualizar DTOs en `application/dtos`.
3. Implementar caso de uso en `application/use-cases`.
4. Agregar metodos al contrato de repositorio si hace falta.
5. Implementar persistencia en `infrastructure/persistence`.
6. Exponer el endpoint en `infrastructure/controllers`.
7. Registrar providers en el modulo Nest correspondiente.
8. Agregar pruebas del caso de uso o entidad si toca reglas importantes.

## Problemas frecuentes

- `PrismaClientInitializationError P1001`: PostgreSQL no esta corriendo o `DATABASE_URL` no coincide.
- `401 Unauthorized`: falta token JWT o el token expiro.
- `403 Forbidden`: el usuario no tiene rol `ADMIN`.
- Upload guarda localmente si Cloudinary no esta configurado.
