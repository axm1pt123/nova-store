# Modulo Cart

Responsable del carrito de compras por usuario autenticado.

## Archivos Clave

- `backend/src/modules/cart/cart.module.ts`
- `backend/src/modules/cart/domain/entities/cart.entity.ts`
- `backend/src/modules/cart/domain/repositories/cart.repository.ts`
- `backend/src/modules/cart/application/use-cases/cart.use-cases.ts`
- `backend/src/modules/cart/application/dtos/cart.dtos.ts`
- `backend/src/modules/cart/infrastructure/controllers/cart.controller.ts`
- `backend/src/modules/cart/infrastructure/persistence/prisma-cart.repository.ts`
- `frontend/src/lib/store.ts`
- `frontend/src/app/cart/page.tsx`
- `frontend/src/components/Navbar.tsx`

## Endpoints

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/:productId`
- `DELETE /api/v1/cart/items/:productId`
- `DELETE /api/v1/cart`

## Reglas

- Todo el modulo requiere usuario autenticado.
- El carrito pertenece a un usuario.
- No duplicar items: producto repetido debe actualizar/agrupar cantidad segun el caso de uso.
- Validar cantidad mayor a cero.
- El subtotal y total deben calcularse desde precios guardados de forma consistente.
- Si cambia `CartDto`, actualizar `Cart` y `CartItem` en frontend.

## Pruebas Sugeridas

- Agregar producto.
- Actualizar cantidad.
- Eliminar item.
- Vaciar carrito.
- Agregar producto sin stock suficiente debe fallar.
