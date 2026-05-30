---
name: nova-store-users
description: Guidance for working on the NOVA Store users module: authentication, registration, login, JWT, profile updates, roles, admin user management, user DTOs, frontend auth store, login/register pages, and admin users UI.
---

# NOVA Store Users

Read `docs/modules/users.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/users`.
- Shared auth infrastructure: `backend/src/shared/infrastructure/auth`.
- Auth guards/decorators: `backend/src/shared/application`.
- Frontend auth state: `frontend/src/lib/store.ts`.
- Frontend pages: `frontend/src/app/login`, `frontend/src/app/register`, `frontend/src/app/admin/users`.

## Rules

- Keep password hashes private and never return `passwordHash`.
- Use `@Public()` only for register and login.
- Use `@Roles('ADMIN')` for admin user endpoints.
- Keep `UserResponseDto`, mappers, and `frontend/src/types/index.ts` aligned.
- Put business decisions in use cases or domain objects, not controllers.

## Validate

- Build backend if DTOs/controllers/providers changed.
- Run user use-case tests when auth behavior changes.
