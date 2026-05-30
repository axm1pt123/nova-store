# Modulo Store Config

Responsable de datos bancarios y QR usados para pagos manuales.

## Archivos Clave

- `backend/src/modules/store-config/store-config.module.ts`
- `backend/src/modules/store-config/store-config.controller.ts`
- `backend/prisma/schema.prisma`
- `frontend/src/app/pay/[orderId]/page.tsx`
- `frontend/src/app/admin/configuracion-pago/page.tsx`

## Endpoints

- `GET /api/v1/store-config`
- `PUT /api/v1/store-config`

## Reglas

- Lectura publica para mostrar datos de pago.
- Actualizacion solo `ADMIN`.
- Usar registro unico con id `singleton`.
- Si no existe config en base, devolver valores por defecto.
- Mantener campos compatibles con el frontend: `bankName`, `bankHolder`, `bankAccount`, `qrImageUrl`.

## Pruebas Sugeridas

- GET devuelve config existente.
- GET devuelve defaults si no existe.
- PUT como admin actualiza.
- PUT como customer falla.
