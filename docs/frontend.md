# Documentacion Frontend

Frontend de NOVA Store construido con Next.js 14 App Router, React, TypeScript, Tailwind CSS y Zustand.

## Local

- App: `http://localhost:3000`
- API consumida: `http://localhost:3001/api/v1`

## Comandos

Desde `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run start
```

Desde la raiz:

```bash
npm run dev:frontend
```

## Variables de entorno

Archivo: `frontend/.env.local`

Variables principales:

- `NEXT_PUBLIC_API_URL`: URL base del backend.
- `NEXT_PUBLIC_BANK_NAME`: banco para pago manual.
- `NEXT_PUBLIC_BANK_ACCOUNT`: cuenta bancaria.
- `NEXT_PUBLIC_BANK_HOLDER`: titular de la cuenta.
- `NEXT_PUBLIC_BANK_QR_URL`: URL del QR de pago.

Ejemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Estructura

```text
frontend/src/
  app/          Rutas y paginas de Next App Router
  components/   Componentes reutilizables
  hooks/        Hooks especificos del frontend
  lib/          Cliente API, store y utilidades
  types/        Tipos compartidos por la UI
```

## Rutas principales

| Ruta | Descripcion |
| --- | --- |
| `/` | Home y catalogo destacado |
| `/products` | Listado de productos con filtros |
| `/products/[id]` | Detalle de producto |
| `/cart` | Carrito |
| `/login` | Login |
| `/register` | Registro |
| `/orders` | Ordenes del cliente |
| `/pay/[orderId]` | Pago manual/comprobante |
| `/admin` | Dashboard admin |
| `/admin/products` | Gestion de productos |
| `/admin/categories` | Gestion de categorias |
| `/admin/users` | Gestion de usuarios |
| `/admin/ventas` | Ventas y ordenes |
| `/admin/pos` | Venta en tienda fisica |
| `/admin/configuracion-pago` | Datos bancarios y QR |

## Cliente API

Archivo: `frontend/src/lib/api.ts`

Responsabilidades:

- Define `API_URL` desde `NEXT_PUBLIC_API_URL`.
- Guarda el token JWT en `localStorage` con la clave `ecommerce_access_token`.
- Agrega `Authorization: Bearer <token>` automaticamente si existe.
- Convierte errores HTTP en `ApiError`.
- Expone metodos `get`, `post`, `patch`, `put` y `delete`.

Uso:

```ts
const products = await api.get<PaginatedProducts>('/products');
await api.post('/users/login', { email, password });
```

## Estado global

Archivo: `frontend/src/lib/store.ts`

Stores:

- `useAuth`: usuario, login, registro, logout y carga de perfil.
- `useCart`: carrito, agregar, actualizar, eliminar y vaciar items.

Flujo de autenticacion:

1. Login llama a `/users/login`.
2. Se guarda `accessToken` en `localStorage`.
3. `loadProfile` llama a `/users/me`.
4. Logout limpia token y usuario.

## Tipos

Archivo: `frontend/src/types/index.ts`

Incluye:

- `User`
- `AuthResponse`
- `Product`
- `PaginatedProducts`
- `Category`
- `Cart`
- `CartItem`
- `Order`
- `OrderStatus`

Mantener estos tipos alineados con los DTOs del backend.

## Componentes importantes

- `Navbar.tsx`: navegacion principal, mega menu, busqueda, auth y contador del carrito.
- `SearchModal.tsx`: busqueda de productos.
- `ConditionalLayout.tsx`: decide layout segun la ruta.

## Estilos

Tailwind CSS se configura en:

- `frontend/tailwind.config.js`
- `frontend/src/app/globals.css`

Usar clases utilitarias de Tailwind y mantener componentes simples. Evitar duplicar logica de negocio en la UI; la UI debe llamar a `api` y stores.

## Flujo de compra

1. Usuario entra al catalogo.
2. Agrega productos al carrito.
3. Hace checkout desde `/cart`.
4. Se crea una orden con `/orders/checkout`.
5. En `/pay/[orderId]` se muestra la informacion bancaria.
6. El usuario sube o registra comprobante.
7. Un admin verifica el pago desde el panel.

## Admin

Las rutas `/admin/*` consumen endpoints protegidos por rol `ADMIN`.

Funciones principales:

- Crear y editar productos.
- Crear y borrar categorias.
- Listar usuarios.
- Revisar ventas y estados.
- Registrar ventas POS.
- Configurar datos de pago.

## Como agregar una pagina

1. Crear carpeta en `frontend/src/app/<ruta>/page.tsx`.
2. Reutilizar `api` para llamadas al backend.
3. Reutilizar tipos desde `src/types`.
4. Usar stores existentes si toca auth o carrito.
5. Agregar enlaces en `Navbar` o panel admin si corresponde.
6. Probar en desktop y mobile.

## Problemas frecuentes

- Pantalla carga pero no hay datos: revisar que backend este activo en `3001`.
- `ERR_CONNECTION_REFUSED` al API: backend apagado o PostgreSQL caido.
- Login falla: revisar seed, credenciales y `JWT_SECRET`.
- Productos sin imagen local: revisar upload local en `backend/public/uploads` o Cloudinary.
