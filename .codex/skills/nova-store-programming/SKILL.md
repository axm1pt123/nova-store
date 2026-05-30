---
name: nova-store-programming
description: Project-specific programming guidance for NOVA Store, a Clean Architecture e-commerce app with NestJS, Prisma, PostgreSQL, Next.js App Router, Tailwind and Zustand. Use when Codex is asked to continue development, add features, fix bugs, refactor, write tests, update API/frontend flows, or explain code in this repository.
---

# NOVA Store Programming

## Project Map

- Backend: `backend/`, NestJS + Prisma + PostgreSQL.
- Frontend: `frontend/`, Next.js 14 App Router + Tailwind + Zustand.
- Full project docs: `docs/project.md`.
- Backend docs: `docs/backend.md`.
- Frontend docs: `docs/frontend.md`.
- Frontend local docs: `frontend/DOCUMENTATION.md`.
- Module docs: `docs/modules/`.
- API base: `http://localhost:3001/api/v1`.
- Frontend local: `http://localhost:3000`.

## Module Skill Router

When the task targets a specific module, use this skill first to orient, then use the module-specific skill:

- Users/auth/profile/admin users: `$nova-store-users`.
- Frontend pages/components/stores/types/styles: `$nova-store-frontend`.
- Products/categories/catalog/search/admin products: `$nova-store-products`.
- Cart/add/remove/update checkout preparation: `$nova-store-cart`.
- Orders/checkout/POS/payment proof/statuses: `$nova-store-orders`.
- Payments/gateways/Stripe/simulated payment: `$nova-store-payments`.
- Reports/admin dashboard metrics: `$nova-store-reports`.
- Image upload/Cloudinary/local uploads: `$nova-store-upload`.
- Bank data/payment QR/store payment config: `$nova-store-store-config`.

If a task crosses modules, use every relevant module skill and keep API contracts synchronized with frontend types.

## Backend Rules

- Preserve Clean Architecture boundaries:
  - `domain`: entities, value objects, repository interfaces.
  - `application`: use cases, DTOs, ports, mappers.
  - `infrastructure`: controllers, Prisma repositories, gateways.
- Keep dependencies pointing inward: `infrastructure -> application -> domain`.
- Do not import Prisma, Nest controllers, HTTP details or external gateways into `domain`.
- Add business rules to entities/value objects or use cases, not controllers.
- Register new providers in the relevant module file.
- For protected endpoints, use the existing guards and decorators: `@Public()`, `@Roles('ADMIN')`, `@CurrentUser()`.
- Keep API paths under the global prefix configured by `API_PREFIX`, normally `/api/v1`.

## Frontend Rules

- Use `frontend/src/lib/api.ts` for HTTP calls.
- Use `frontend/src/lib/store.ts` for auth and cart state.
- Reuse types from `frontend/src/types/index.ts` and keep them aligned with backend DTO responses.
- Add pages under `frontend/src/app`.
- Keep admin-only UI under `frontend/src/app/admin`.
- Keep shared UI in `frontend/src/components`.
- Use Tailwind utilities and match the existing NOVA Store visual style.

## Feature Workflow

1. Read the relevant backend use case/controller and frontend page/component first.
2. If data shape changes, update backend DTOs/mappers and frontend types together.
3. If persistence changes, update `backend/prisma/schema.prisma`, then create/run a Prisma migration.
4. Add or adjust backend use cases before wiring controllers.
5. Update frontend API calls and UI after the backend contract is clear.
6. Add focused tests for domain rules or use cases when behavior changes.
7. Run `npm run build` in the touched app when possible.

## Common Commands

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

Root:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run db:migrate
npm run db:seed
```

## Runtime Notes

- Backend needs PostgreSQL on `localhost:5432`.
- If the backend fails with Prisma `P1001`, check that PostgreSQL is running and `backend/.env` has the correct `DATABASE_URL`.
- Swagger is available in development at `/api/docs`.
- Seed users:
  - Admin: `admin@ecommerce.local` / `Admin123!`
  - Customer: `customer@ecommerce.local` / `Customer123!`

## Before Finishing

- Mention changed files.
- Mention commands run and whether they passed.
- If backend could not run, state whether PostgreSQL was missing.
