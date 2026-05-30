---
name: nova-store-frontend
description: Guidance for working on the NOVA Store frontend: Next.js App Router pages, React components, Tailwind UI, Zustand stores, API client integration, frontend types, public routes, admin routes, cart/auth UI, responsive layout, and frontend build validation.
---

# NOVA Store Frontend

Read `frontend/DOCUMENTATION.md` and `docs/frontend.md` before changing frontend code.

## Scope

- App root: `frontend/`.
- Routes: `frontend/src/app`.
- Components: `frontend/src/components`.
- Hooks: `frontend/src/hooks`.
- API client and stores: `frontend/src/lib`.
- Types: `frontend/src/types`.
- Styling: `frontend/src/app/globals.css`, `frontend/tailwind.config.js`.

## Rules

- Use `frontend/src/lib/api.ts` for backend requests.
- Use `frontend/src/lib/store.ts` for auth and cart state.
- Keep frontend types aligned with backend DTOs.
- Put new pages under `frontend/src/app/<route>/page.tsx`.
- Put shared UI in `frontend/src/components`.
- Keep admin UI under `frontend/src/app/admin`.
- Use Tailwind and match the existing NOVA Store style.
- Avoid duplicating backend business rules in components.

## Route Areas

- Catalog: `/`, `/products`, `/products/[id]`.
- Account: `/login`, `/register`, `/orders`.
- Cart and payment: `/cart`, `/pay/[orderId]`.
- Admin: `/admin`, `/admin/products`, `/admin/categories`, `/admin/users`, `/admin/ventas`, `/admin/pos`, `/admin/configuracion-pago`.

## Validate

- Run `npm run build` from `frontend/` when pages, components, types, or config change.
- Check `http://localhost:3000` after visual/layout changes.
- If API calls fail, verify backend is running on `http://localhost:3001/api/v1`.
