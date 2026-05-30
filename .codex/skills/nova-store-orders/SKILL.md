---
name: nova-store-orders
description: Guidance for working on the NOVA Store orders module: checkout, order ownership, POS sales, order statuses, payment proof submission and verification, admin order management, customer order history, and order frontend pages.
---

# NOVA Store Orders

Read `docs/modules/orders.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/orders`.
- Related modules: `cart`, `products`, `payments`, `users`.
- Frontend pages: `frontend/src/app/orders`, `frontend/src/app/pay/[orderId]`, `frontend/src/app/admin/ventas`, `frontend/src/app/admin/pos`.

## Rules

- Checkout must consume the authenticated user's cart.
- Customer users may only read their own orders.
- Admin users may list and update order status.
- Stock changes belong in checkout/POS workflows, not report/payment views.
- Sync order DTO changes with frontend `Order` and `OrderStatus`.

## Validate

- Test status transitions and ownership behavior when changed.
- Build backend after order use-case/controller changes.
