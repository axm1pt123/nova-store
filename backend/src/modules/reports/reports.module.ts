import { Module } from '@nestjs/common';
import {
  FrequentCustomersReportUseCase,
  SalesByDateReportUseCase,
  TopSellingProductsReportUseCase,
} from './application/use-cases/reports.use-cases';
import { ReportsController } from './infrastructure/controllers/reports.controller';

@Module({
  controllers: [ReportsController],
  providers: [
    SalesByDateReportUseCase,
    TopSellingProductsReportUseCase,
    FrequentCustomersReportUseCase,
  ],
})
export class ReportsModule {}
