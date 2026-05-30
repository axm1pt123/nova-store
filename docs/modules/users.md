# Modulo Users

Responsable de registro, login, perfil del usuario, roles y administracion basica de usuarios.

## Archivos Clave

- `backend/src/modules/users/users.module.ts`
- `backend/src/modules/users/domain/entities/user.entity.ts`
- `backend/src/modules/users/domain/value-objects/email.vo.ts`
- `backend/src/modules/users/domain/repositories/user.repository.ts`
- `backend/src/modules/users/application/use-cases/register-user.use-case.ts`
- `backend/src/modules/users/application/use-cases/login-user.use-case.ts`
- `backend/src/modules/users/application/use-cases/get-user-profile.use-case.ts`
- `backend/src/modules/users/application/use-cases/update-user-profile.use-case.ts`
- `backend/src/modules/users/application/dtos/user.dtos.ts`
- `backend/src/modules/users/infrastructure/controllers/users.controller.ts`
- `backend/src/modules/users/infrastructure/persistence/prisma-user.repository.ts`
- `frontend/src/lib/store.ts`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/admin/users/page.tsx`

## Endpoints

- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/admin/list`
- `POST /api/v1/users/admin/create`

## Reglas

- Mantener validaciones de email y password en DTOs/use cases.
- No exponer `passwordHash` en responses.
- Usar `@Public()` solo en register/login.
- Usar `@Roles('ADMIN')` para endpoints administrativos.
- Si cambia `UserResponseDto`, actualizar `frontend/src/types/index.ts`.

## Pruebas Sugeridas

- Registro con email valido.
- Registro con email repetido.
- Login correcto e incorrecto.
- Perfil protegido sin token.
- Acceso admin con usuario customer debe fallar.
