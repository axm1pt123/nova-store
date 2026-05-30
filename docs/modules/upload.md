# Modulo Upload

Responsable de subir imagenes de producto. Usa Cloudinary si esta configurado y fallback local en desarrollo.

## Archivos Clave

- `backend/src/modules/upload/upload.module.ts`
- `backend/src/modules/upload/upload.controller.ts`
- `backend/public/uploads/.gitkeep`
- `frontend/src/app/admin/products/page.tsx`

## Endpoint

- `POST /api/v1/upload/image`

## Reglas

- Solo `ADMIN` puede subir imagenes.
- Campo multipart esperado: `file`.
- Tipos permitidos: JPG, JPEG, PNG, GIF, WEBP.
- Limite actual: 5 MB.
- Si Cloudinary no esta configurado, guardar en `backend/public/uploads`.
- La respuesta debe mantener el contrato `{ url: string }`.

## Pruebas Sugeridas

- Subida valida como admin.
- Customer recibe `403`.
- Archivo no imagen debe fallar.
- Archivo mayor al limite debe fallar.
- Fallback local devuelve URL publica.
