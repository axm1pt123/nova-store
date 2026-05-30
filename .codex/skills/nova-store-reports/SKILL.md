---
name: nova-store-reports
description: Guidance for working on the NOVA Store reports module: admin sales reports, top products, frequent customers, date filters, limits, dashboard metrics, read-only reporting use cases, and frontend admin reporting views.
---

# NOVA Store Reports

Read `docs/modules/reports.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/reports`.
- Frontend admin pages: `frontend/src/app/admin/page.tsx`, `frontend/src/app/admin/ventas/page.tsx`.

## Rules

- Require `ADMIN` for every report endpoint.
- Keep reports read-only.
- Parse optional dates and limits defensively.
- Do not change order/payment/product state from report code.
- Sync response shape with admin dashboard views.

## Validate

- Build backend after report use-case/controller changes.
- Build frontend after dashboard/report UI changes.
