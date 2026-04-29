import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(
    private readonly salesByDate: SalesByDateReportUseCase,
    private readonly topProducts: TopSellingProductsReportUseCase,
    private readonly frequentCustomers: FrequentCustomersReportUseCase,
  ) {}

  @Get('sales-by-date')
  getSalesByDate(@Query() q: DateRangeQueryDto) {
    return this.salesByDate.execute({
      fromDate: parseDate(q.fromDate),
      toDate: parseDate(q.toDate),
    });
  }

  @Get('top-products')
  getTopProducts(@Query() q: DateRangeQueryDto) {
    return this.topProducts.execute({
      fromDate: parseDate(q.fromDate),
      toDate: parseDate(q.toDate),
      limit: parseLimit(q.limit),
    });
  }

  @Get('frequent-customers')
  getFrequentCustomers(@Query() q: DateRangeQueryDto) {
    return this.frequentCustomers.execute({
      fromDate: parseDate(q.fromDate),
      toDate: parseDate(q.toDate),
      limit: parseLimit(q.limit),
    });
  }
}
