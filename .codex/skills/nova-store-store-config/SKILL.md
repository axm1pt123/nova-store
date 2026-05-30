---
name: nova-store-store-config
description: Guidance for working on the NOVA Store store-config module: bank payment data, QR image URL, singleton configuration record, public read endpoint, admin update endpoint, payment configuration UI, and frontend payment page integration.
---

# NOVA Store Store Config

Read `docs/modules/store-config.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/store-config`.
- Prisma model: `StoreConfig`.
- Frontend pages: `frontend/src/app/pay/[orderId]/page.tsx`, `frontend/src/app/admin/configuracion-pago/page.tsx`.

## Rules

- Keep public `GET /store-config`.
- Protect `PUT /store-config` with `ADMIN`.
- Use singleton id `singleton`.
- Keep fields stable: `bankName`, `bankHolder`, `bankAccount`, `qrImageUrl`.
- Return defaults when no DB config exists.

## Validate

- Build backend after controller/schema changes.
- Build frontend after payment config UI changes.
