# Modulo Reports

Responsable de reportes administrativos de ventas, productos mas vendidos y clientes frecuentes.

## Archivos Clave

- `backend/src/modules/reports/reports.module.ts`
- `backend/src/modules/reports/application/use-cases/reports.use-cases.ts`
- `backend/src/modules/reports/infrastructure/controllers/reports.controller.ts`
- `frontend/src/app/admin/page.tsx`
- `frontend/src/app/admin/ventas/page.tsx`

## Endpoints

- `GET /api/v1/reports/sales-by-date`
- `GET /api/v1/reports/top-products`
- `GET /api/v1/reports/frequent-customers`

## Query Params

- `fromDate`: fecha inicial opcional.
- `toDate`: fecha final opcional.
- `limit`: limite opcional para rankings.

## Reglas

- Todo el modulo requiere `ADMIN`.
- Validar fechas de forma tolerante: fechas invalidas no deben romper la app.
- Mantener reportes orientados a lectura; no cambiar estado desde este modulo.
- Si cambia el shape de reportes, actualizar paginas admin que consumen esos datos.

## Pruebas Sugeridas

- Admin consulta reporte sin filtros.
- Admin consulta reporte con rango.
- Customer recibe `403`.
- `limit` invalido usa valor por defecto o se ignora.
