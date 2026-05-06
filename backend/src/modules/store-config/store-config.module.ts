import { Module } from '@nestjs/common';
import { StoreConfigController } from './store-config.controller';
import { PrismaModule } from '@shared/infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StoreConfigController],
})
export class StoreConfigModule {}
