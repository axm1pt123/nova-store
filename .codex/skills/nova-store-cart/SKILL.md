---
name: nova-store-cart
description: Guidance for working on the NOVA Store cart module: authenticated carts, cart items, quantities, totals, add/update/remove/clear flows, stock-aware cart behavior, frontend cart page, cart Zustand store, and navbar cart count.
---

# NOVA Store Cart

Read `docs/modules/cart.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/cart`.
- Related product stock reads from `products`.
- Frontend state: `frontend/src/lib/store.ts`.
- Frontend UI: `frontend/src/app/cart/page.tsx`, `frontend/src/components/Navbar.tsx`.

## Rules

- Require authentication for every cart endpoint.
- Keep carts scoped to the current user.
- Validate positive quantities.
- Keep totals calculated consistently from cents.
- Sync `CartDto` changes with frontend `Cart` and `CartItem`.

## Validate

- Run cart entity/use-case tests when cart rules change.
- Build frontend if cart display or state shape changes.
