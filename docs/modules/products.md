# Modulo Products

Responsable del catalogo, categorias, filtros, stock, precios, imagenes y descuentos.

## Archivos Clave

- `backend/src/modules/products/products.module.ts`
- `backend/src/modules/products/domain/entities/product.entity.ts`
- `backend/src/modules/products/domain/entities/category.entity.ts`
- `backend/src/modules/products/domain/repositories/product.repository.ts`
- `backend/src/modules/products/domain/repositories/category.repository.ts`
- `backend/src/modules/products/application/use-cases/product.use-cases.ts`
- `backend/src/modules/products/application/use-cases/category.use-cases.ts`
- `backend/src/modules/products/application/dtos/product.dtos.ts`
- `backend/src/modules/products/infrastructure/controllers/products.controller.ts`
- `backend/src/modules/products/infrastructure/persistence/prisma-product.repository.ts`
- `backend/src/modules/products/infrastructure/persistence/prisma-category.repository.ts`
- `frontend/src/app/products/page.tsx`
- `frontend/src/app/products/[id]/page.tsx`
- `frontend/src/app/admin/products/page.tsx`
- `frontend/src/app/admin/categories/page.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/SearchModal.tsx`

## Endpoints

- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:id`
- `DELETE /api/v1/products/:id`
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `DELETE /api/v1/categories/:id`

## Reglas

- Los precios se guardan en centavos (`priceCents`) y se muestran como decimal en responses.
- Las rutas publicas de lectura usan `@Public()`.
- Crear, editar y borrar productos/categorias requiere `ADMIN`.
- Mantener slug unico en productos y categorias.
- Si cambia la respuesta de productos, actualizar `Product`, `Category` y `PaginatedProducts` en frontend.

## Pruebas Sugeridas

- Listado publico con filtros.
- Crear producto como admin.
- Crear producto como customer debe fallar.
- Stock negativo debe rechazarse.
- Categoria inexistente debe fallar al crear producto.
