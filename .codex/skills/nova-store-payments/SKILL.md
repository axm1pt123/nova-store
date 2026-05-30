---
name: nova-store-payments
description: Guidance for working on the NOVA Store payments module: payment initiation, confirmation, simulated gateway, Stripe gateway, payment repository, payment DTOs, order payment integration, and frontend payment page behavior.
---

# NOVA Store Payments

Read `docs/modules/payments.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/payments`.
- Payment gateways: `infrastructure/gateways`.
- Related order flows: `backend/src/modules/orders`.
- Frontend page: `frontend/src/app/pay/[orderId]/page.tsx`.

## Rules

- Keep gateway details behind `PaymentGateway`.
- Do not put Stripe-specific logic in domain or generic use cases.
- Confirm payment through use cases so payment and order state remain consistent.
- Keep payment responses stable for the frontend.

## Validate

- Build backend after gateway/provider changes.
- Test simulated gateway paths without requiring Stripe credentials.
