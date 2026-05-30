# Modulo Orders

Responsable de checkout, ordenes de usuario, ventas POS, comprobantes de pago y cambios de estado.

## Archivos Clave

- `backend/src/modules/orders/orders.module.ts`
- `backend/src/modules/orders/domain/entities/order.entity.ts`
- `backend/src/modules/orders/domain/value-objects/order-status.vo.ts`
- `backend/src/modules/orders/domain/repositories/order.repository.ts`
- `backend/src/modules/orders/application/use-cases/order.use-cases.ts`
- `backend/src/modules/orders/application/dtos/order.dtos.ts`
- `backend/src/modules/orders/application/ports/notification.port.ts`
- `backend/src/modules/orders/infrastructure/controllers/orders.controller.ts`
- `backend/src/modules/orders/infrastructure/persistence/prisma-order.repository.ts`
- `frontend/src/app/orders/page.tsx`
- `frontend/src/app/pay/[orderId]/page.tsx`
- `frontend/src/app/admin/ventas/page.tsx`
- `frontend/src/app/admin/pos/page.tsx`

## Endpoints

- `POST /api/v1/orders/checkout`
- `POST /api/v1/orders/pos`
- `POST /api/v1/orders/:id/payment-proof`
- `PATCH /api/v1/orders/:id/verify-payment`
- `GET /api/v1/orders/my`
- `GET /api/v1/orders/:id`
- `GET /api/v1/orders`
- `PATCH /api/v1/orders/:id/status`

## Estados

- `PENDING`
- `PENDING_VERIFICATION`
- `PAID`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

## Reglas

- Checkout crea orden desde carrito y debe descontar stock.
- Venta POS requiere `ADMIN` y tambien descuenta stock.
- Un customer solo puede ver sus propias ordenes.
- Admin puede listar y cambiar estados.
- Comprobante enviado debe dejar la orden lista para verificacion.
- Si cambia `OrderDto`, actualizar `Order` y `OrderStatus` en frontend.

## Pruebas Sugeridas

- Checkout con carrito valido.
- Checkout con carrito vacio debe fallar.
- Usuario no debe ver orden ajena.
- Admin puede cambiar estado.
- Verificacion de comprobante aprueba/rechaza correctamente.
