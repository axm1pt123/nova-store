import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '@shared/application/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/application/guards/roles.guard';
import {
  FrequentCustomersReportUseCase,
  SalesByDateReportUseCase,
  TopSellingProductsReportUseCase,
} from '../../application/use-cases/reports.use-cases';

interface DateRangeQueryDto {
  fromDate?: string;
  toDate?: string;
  limit?: string;
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

function parseLimit(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

@ApiTags('Reportes')
@ApiBearerAuth('JWT')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(
    private readonly salesByDate: SalesByDateReportUseCase,
    private readonly topProducts: TopSellingProductsReportUseCase,
    private readonly frequentCustomers: FrequentCustomersReportUseCase,
  ) {}

  @ApiOperation({ summary: '[ADMIN] Reporte de ventas por rango de fechas' })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-12-31' })
  @Get('sales-by-date')
  getSalesByDate(@Query() q: DateRangeQueryDto) {
    return this.salesByDate.execute({
      fromDate: parseDate(q.fromDate),
      toDate: parseDate(q.toDate),
    });
  }

  @ApiOperation({ summary: '[ADMIN] Productos más vendidos' })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @Get('top-products')
  getTopProducts(@Query() q: DateRangeQueryDto) {
    return this.topProducts.execute({
      fromDate: parseDate(q.fromDate),
      toDate: parseDate(q.toDate),
      limit: parseLimit(q.limit),
    });
  }

  @ApiOperation({ summary: '[ADMIN] Clientes más frecuentes' })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @Get('frequent-customers')
  getFrequentCustomers(@Query() q: DateRangeQueryDto) {
    return this.frequentCustomers.execute({
      fromDate: parseDate(q.fromDate),
      toDate: parseDate(q.toDate),
      limit: parseLimit(q.limit),
    });
  }
}
