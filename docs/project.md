# Documentacion Completa del Proyecto

NOVA Store es un e-commerce full stack con backend NestJS y frontend Next.js. El proyecto esta pensado para separar reglas de negocio, casos de uso, infraestructura y experiencia de usuario.

## Stack

- Backend: NestJS, TypeScript, Prisma, PostgreSQL, JWT, Passport, Swagger.
- Frontend: Next.js 14 App Router, React, TypeScript, Tailwind CSS, Zustand.
- Base de datos: PostgreSQL.
- Pagos: pago simulado, comprobante manual y estructura para Stripe.
- Upload: Cloudinary si esta configurado; almacenamiento local en desarrollo.

## Locales

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`
- PostgreSQL: `localhost:5432`

## Estructura General

```text
ecommerce-clean-arch/
  backend/      API NestJS, Prisma y modulos de negocio
  frontend/     App Next.js
  docs/         Documentacion general y por modulo
  .codex/skills Skills de IA para continuar el desarrollo
```

## Comandos Principales

Desde la raiz:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run db:migrate
npm run db:seed
```

Backend:

```bash
cd backend
npm run build
npm test
npm run start:dev
```

Frontend:

```bash
cd frontend
npm run build
npm run dev
```

## Flujo de Desarrollo

1. Identificar el modulo afectado.
2. Leer su documentacion en `docs/modules/<modulo>.md`.
3. Usar el skill del modulo en `.codex/skills/nova-store-<modulo>/SKILL.md`.
4. Cambiar backend y frontend juntos si cambia el contrato de API.
5. Actualizar tipos del frontend si cambian DTOs o responses.
6. Probar build o tests segun el area tocada.

## Modulos del Backend

- `users`: autenticacion, perfil, roles y administracion de usuarios.
- `products`: catalogo, categorias, stock, precios e imagenes.
- `cart`: carrito de compras por usuario.
- `orders`: checkout, ordenes, venta POS, comprobantes y estados.
- `payments`: inicio y confirmacion de pagos.
- `reports`: metricas administrativas.
- `upload`: subida de imagenes.
- `store-config`: datos bancarios y QR de pago.

## Frontend

El frontend consume la API desde `frontend/src/lib/api.ts` y centraliza autenticacion/carrito en `frontend/src/lib/store.ts`.

Rutas publicas principales:

- `/`
- `/products`
- `/products/[id]`
- `/cart`
- `/login`
- `/register`
- `/orders`
- `/pay/[orderId]`

Rutas admin:

- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/users`
- `/admin/ventas`
- `/admin/pos`
- `/admin/configuracion-pago`

## Skills de IA

Skill principal:

- `.codex/skills/nova-store-programming/SKILL.md`
- `.codex/skills/nova-store-frontend/SKILL.md`

Skills por modulo:

- `.codex/skills/nova-store-users/SKILL.md`
- `.codex/skills/nova-store-products/SKILL.md`
- `.codex/skills/nova-store-cart/SKILL.md`
- `.codex/skills/nova-store-orders/SKILL.md`
- `.codex/skills/nova-store-payments/SKILL.md`
- `.codex/skills/nova-store-reports/SKILL.md`
- `.codex/skills/nova-store-upload/SKILL.md`
- `.codex/skills/nova-store-store-config/SKILL.md`

Cuando el trabajo sea de un modulo concreto, usar primero el skill principal para ubicarse y despues el skill especifico del modulo.
