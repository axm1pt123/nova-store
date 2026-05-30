# Frontend Documentation

Frontend de NOVA Store construido con Next.js 14 App Router, React, TypeScript, Tailwind CSS y Zustand.

## Local

- App: `http://localhost:3000`
- API: `http://localhost:3001/api/v1`

## Comandos

Desde `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run start
```

## Estructura

```text
frontend/
  public/          Assets publicos
  src/
    app/           Rutas de Next.js App Router
    components/    Componentes reutilizables
    hooks/         Hooks de UI
    lib/           API client, store y utilidades
    types/         Tipos TypeScript compartidos
```

## Rutas

### Publicas

- `/`: home.
- `/products`: catalogo.
- `/products/[id]`: detalle de producto.
- `/cart`: carrito.
- `/login`: inicio de sesion.
- `/register`: registro.
- `/orders`: ordenes del cliente.
- `/pay/[orderId]`: pago y comprobante.

### Admin

- `/admin`: dashboard.
- `/admin/products`: gestion de productos.
- `/admin/categories`: gestion de categorias.
- `/admin/users`: gestion de usuarios.
- `/admin/ventas`: ventas y ordenes.
- `/admin/pos`: punto de venta.
- `/admin/configuracion-pago`: banco y QR de pago.

## Archivos Clave

- `src/lib/api.ts`: cliente HTTP del backend.
- `src/lib/store.ts`: Zustand para auth y carrito.
- `src/types/index.ts`: tipos compartidos por la UI.
- `src/components/Navbar.tsx`: navegacion, busqueda y carrito.
- `src/components/SearchModal.tsx`: busqueda de productos.
- `src/components/ConditionalLayout.tsx`: layout condicional.
- `src/app/layout.tsx`: layout raiz.
- `src/app/globals.css`: estilos globales Tailwind.

## Reglas de Desarrollo

- Usar `src/lib/api.ts` para llamadas HTTP.
- Usar `src/lib/store.ts` para autenticacion y carrito.
- Actualizar `src/types/index.ts` cuando cambien DTOs/responses del backend.
- Mantener paginas en `src/app/<ruta>/page.tsx`.
- Mantener componentes compartidos en `src/components`.
- Mantener rutas admin dentro de `src/app/admin`.
- Probar vistas mobile y desktop cuando se cambie layout.

## Flujo con Backend

1. El frontend lee `NEXT_PUBLIC_API_URL`.
2. `api.ts` agrega token JWT si existe en `localStorage`.
3. `useAuth` maneja login, registro, perfil y logout.
4. `useCart` maneja carrito.
5. Las paginas llaman `api` o stores, no deben duplicar logica del backend.

## Variables

Archivo: `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_BANK_NAME=Banco Mercantil Santa Cruz
NEXT_PUBLIC_BANK_ACCOUNT=1234567890
NEXT_PUBLIC_BANK_HOLDER=NOVA Store SRL
NEXT_PUBLIC_BANK_QR_URL=
```

## Skill Relacionado

Usar `$nova-store-frontend` cuando el trabajo toque paginas, componentes, estilos, stores, tipos o integracion con API desde el frontend.
