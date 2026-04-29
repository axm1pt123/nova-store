# 🛍️ E-commerce — Clean Architecture

Sistema de e-commerce completo construido con **Clean Architecture**, principios **SOLID** y **Clean Code**. Pensado para ser modular, mantenible y preparado para escalar a microservicios.

## 🧱 Stack

| Capa     | Tecnología                                         |
| -------- | -------------------------------------------------- |
| Backend  | Node.js + TypeScript + NestJS                      |
| BD       | PostgreSQL + Prisma                                |
| Auth     | JWT + Passport + bcrypt                            |
| Pagos    | Stripe (real) / Simulado (dev)                     |
| Frontend | Next.js 14 (App Router) + Tailwind + Zustand       |
| Tests    | Jest                                               |

## 🚀 Setup rápido

### 1. Levantar PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run start:dev
```

API disponible en `http://localhost:3001/api/v1`.

**Credenciales demo** (creadas por el seed):
- Admin: `admin@ecommerce.local` / `Admin123!`
- Cliente: `customer@ecommerce.local` / `Customer123!`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App en `http://localhost:3000`.

### 4. Tests

```bash
cd backend
npm test                # todos los tests
npm run test:cov        # con cobertura
```

---

## 🏛️ Arquitectura

Clean Architecture con 4 capas, cada módulo es autónomo:

```
src/modules/<modulo>/
├── domain/                    ← núcleo, sin dependencias externas
│   ├── entities/              Entidades y aggregates con lógica de negocio
│   ├── value-objects/         Money, Email, OrderStatus...
│   └── repositories/          Interfaces (puertos) que dominio define
├── application/               ← orquestación
│   ├── use-cases/             Un caso de uso = una operación de negocio
│   ├── dtos/                  Contratos de entrada/salida + mappers
│   └── ports/                 Abstracciones de servicios externos
└── infrastructure/            ← detalles técnicos
    ├── persistence/           Implementaciones Prisma de los repos
    ├── controllers/           Adaptadores HTTP (NestJS)
    ├── mappers/               Persistence ↔ Domain
    └── gateways/              Adaptadores externos (Stripe, etc.)
```

### Regla de oro

Las dependencias **siempre apuntan hacia adentro**:
`infrastructure → application → domain`

El dominio no sabe nada de NestJS, Prisma ni HTTP. Esto permite:
- Tests unitarios sin DB (ver `register-user.use-case.spec.ts`)
- Cambiar Prisma por TypeORM sin tocar el dominio
- Cambiar Stripe por PayPal cambiando una variable

### Inversión de dependencias en NestJS

Los puertos se definen como `Symbol` en el dominio:

```typescript
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export interface UserRepository { /* ... */ }
```

Los casos de uso reciben la abstracción:

```typescript
constructor(
  @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
) {}
```

El módulo enchufa la implementación concreta:

```typescript
providers: [
  { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
]
```

---

## 📦 Módulos

| Módulo     | Responsabilidad                                                          |
| ---------- | ------------------------------------------------------------------------ |
| `users`    | Registro, login JWT, perfil, roles ADMIN/CUSTOMER                        |
| `products` | Catálogo CRUD, categorías, búsqueda, filtros, stock                      |
| `cart`     | Carrito por usuario con cálculo automático de totales                    |
| `orders`   | Checkout desde carrito, historial, máquina de estados                    |
| `payments` | Stripe + Simulado, intercambiables vía configuración                     |
| `reports`  | Ventas por fecha, top productos, clientes frecuentes (sólo ADMIN)        |

---

## 🌐 API endpoints

Todos los endpoints están bajo `/api/v1`.

### Auth

```
POST   /users/register          público
POST   /users/login             público
GET    /users/me                JWT
PATCH  /users/me                JWT
```

### Productos y categorías

```
GET    /products                público (filtros: search, categoryId, minPrice, maxPrice, skip, take)
GET    /products/:id            público
POST   /products                ADMIN
PATCH  /products/:id            ADMIN
DELETE /products/:id            ADMIN

GET    /categories              público
POST   /categories              ADMIN
```

### Carrito

```
GET    /cart                    JWT
POST   /cart/items              JWT  body: { productId, quantity }
PATCH  /cart/items/:productId   JWT  body: { quantity }
DELETE /cart/items/:productId   JWT
DELETE /cart                    JWT  vacía el carrito
```

### Pedidos

```
POST   /orders/checkout         JWT  body: { shippingAddress }
GET    /orders/my               JWT
GET    /orders/:id              JWT  (customer ve los suyos, admin ve todos)
GET    /orders                  ADMIN
PATCH  /orders/:id/status       ADMIN  body: { status }
```

### Pagos

```
POST   /payments/initiate       JWT  body: { orderId }
POST   /payments/:id/confirm    JWT
```

### Reportes (sólo ADMIN)

```
GET    /reports/sales-by-date?fromDate=&toDate=
GET    /reports/top-products?limit=10&fromDate=&toDate=
GET    /reports/frequent-customers?limit=10
```

---

## 🔄 Flujo end-to-end de checkout

1. Usuario hace login → recibe JWT
2. Lista productos: `GET /products`
3. Agrega al carrito: `POST /cart/items`
4. Inicia checkout: `POST /orders/checkout` → crea Order en estado `PENDING`, descuenta stock, vacía carrito
5. Inicia pago: `POST /payments/initiate` → crea Payment, contacta gateway
6. En modo `SIMULATED`: el pago se confirma inmediatamente y el pedido pasa a `PAID`
7. En modo `STRIPE`: el frontend usa el `clientSecret` con Stripe.js, luego llama a `/payments/:id/confirm`
8. Admin marca el pedido como `SHIPPED` y luego `DELIVERED` desde el panel

---

## 💳 Cambiar de Stripe a Simulado

En `backend/.env`:

```
PAYMENT_PROVIDER=SIMULATED   # o STRIPE
```

El módulo `PaymentsModule` selecciona el adaptador correcto en runtime. Los casos de uso (`InitiatePaymentUseCase`, `ConfirmPaymentUseCase`) no cambian.

Para agregar PayPal:
1. Crear `infrastructure/gateways/paypal-payment.gateway.ts` que implemente `PaymentGateway`
2. Agregarlo al `useFactory` del módulo
3. Listo. Cero cambios en dominio o aplicación.

---

## 🧪 Testing

Los casos de uso son **trivialmente testeables** porque dependen de interfaces, no de Prisma:

```typescript
// register-user.use-case.spec.ts
const userRepo: jest.Mocked<UserRepository> = { /* mocks */ };
const hasher: jest.Mocked<PasswordHasher> = { /* mocks */ };
const useCase = new RegisterUserUseCase(userRepo, hasher);

await useCase.execute({ email: 'x@y.com', password: '12345678', ... });
expect(userRepo.save).toHaveBeenCalled();
```

Tests incluidos como muestra:
- `shared/domain/value-objects/money.vo.spec.ts` — value object inmutable
- `modules/users/application/use-cases/register-user.use-case.spec.ts` — caso de uso con mocks
- `modules/cart/domain/entities/cart.entity.spec.ts` — aggregate con reglas

---

## 🚦 Roadmap a microservicios

La estructura ya está preparada. Para escalar:

1. **Extraer un módulo a un servicio independiente**: cada `modules/<x>` se vuelve su propio repo + Dockerfile.
2. **Reemplazar imports cruzados por mensajería**: hoy `OrdersModule` importa `CartModule` y `ProductsModule`. En microservicios, esos imports se reemplazan por puertos `CartClient`, `ProductClient` con adaptadores HTTP/gRPC/Kafka.
3. **Base de datos por servicio**: el schema actual se separa por bounded context.
4. **Eventos de dominio**: `OrderPlaced`, `PaymentCompleted` — el código ya está listo para emitirlos desde los aggregates.

El dominio y los casos de uso **no cambian**: sólo se reemplazan adaptadores. Esto es el valor real de Clean Architecture.

---

## 📂 Estructura de carpetas

```
ecommerce-clean-arch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── modules/
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   └── reports/
│   │   ├── shared/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                # App Router de Next.js 14
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

---

## 📜 Licencia

MIT — usá este proyecto como base para lo que necesites.
