---
name: nova-store-upload
description: Guidance for working on the NOVA Store upload module: admin image uploads, multipart file handling, Cloudinary configuration, local development fallback, file validation, upload URL contracts, and admin product image UI.
---

# NOVA Store Upload

Read `docs/modules/upload.md` before changing this module.

## Scope

- Backend module: `backend/src/modules/upload`.
- Local files: `backend/public/uploads`.
- Frontend usage: `frontend/src/app/admin/products/page.tsx`.

## Rules

- Require `ADMIN`.
- Keep field name `file` unless frontend is updated too.
- Preserve response contract `{ url: string }`.
- Validate image mime type and size.
- Use local fallback only for development when Cloudinary is not configured.

## Validate

- Build backend after controller changes.
- Manually test multipart upload when changing upload behavior.
