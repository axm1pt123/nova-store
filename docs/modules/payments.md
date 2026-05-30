# Modulo Payments

Responsable de iniciar y confirmar pagos de ordenes. Tiene gateway simulado y estructura para Stripe.

## Archivos Clave

- `backend/src/modules/payments/payments.module.ts`
- `backend/src/modules/payments/domain/entities/payment.entity.ts`
- `backend/src/modules/payments/domain/repositories/payment.repository.ts`
- `backend/src/modules/payments/application/use-cases/payment.use-cases.ts`
- `backend/src/modules/payments/application/dtos/payment.dtos.ts`
- `backend/src/modules/payments/application/ports/payment-gateway.port.ts`
- `backend/src/modules/payments/infrastructure/controllers/payments.controller.ts`
- `backend/src/modules/payments/infrastructure/persistence/prisma-payment.repository.ts`
- `backend/src/modules/payments/infrastructure/gateways/simulated-payment.gateway.ts`
- `backend/src/modules/payments/infrastructure/gateways/stripe-payment.gateway.ts`
- `frontend/src/app/pay/[orderId]/page.tsx`

## Endpoints

- `POST /api/v1/payments/initiate`
- `POST /api/v1/payments/:id/confirm`

## Reglas

- Todo endpoint requiere usuario autenticado.
- El pago pertenece a una orden.
- El gateway debe depender del puerto `PaymentGateway`, no de la infraestructura en casos de uso.
- No mezclar detalles de Stripe dentro del dominio.
- Si se agrega otro proveedor, crear gateway nuevo e inyectarlo desde el modulo.

## Pruebas Sugeridas

- Iniciar pago para orden existente.
- No iniciar pago para orden ajena.
- Confirmar pago cambia estado de pago.
- Pago simulado responde sin depender de Stripe.
