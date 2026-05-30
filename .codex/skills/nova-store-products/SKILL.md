---
name: nova-store-products
description: Guidance for working on the NOVA Store products module: catalog, categories, product filters, slug handling, stock, price cents, discounts, product images, search, frontend products pages, admin product/category UI, and navbar category menus.
---

# NOVA Store Products

Read `docs/modules/products.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/products`.
- Prisma models: `Product`, `Category`.
- Frontend pages: `frontend/src/app/products`, `frontend/src/app/admin/products`, `frontend/src/app/admin/categories`.
- Shared UI: `frontend/src/components/Navbar.tsx`, `frontend/src/components/SearchModal.tsx`.

## Rules

- Store money as cents in backend persistence.
- Expose decimal display values only through DTO/mappers.
- Keep public read endpoints marked with `@Public()`.
- Protect write endpoints with `ADMIN`.
- Keep product/category response types aligned with frontend types.

## Validate

- Build backend after DTO/repository/controller changes.
- Build frontend after changing product pages or shared product types.
