import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/application/guards/roles.guard';
import { Roles } from '@shared/application/decorators/roles.decorator';

@ApiTags('StoreConfig')
@Controller('store-config')
export class StoreConfigController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getConfig() {
    const config = await this.prisma.storeConfig.findUnique({ where: { id: 'singleton' } });
    if (!config) {
      return {
        bankName: 'Banco Mercantil Santa Cruz',
        bankHolder: 'NOVA Store SRL',
        bankAccount: '1234567890',
        qrImageUrl: null,
      };
    }
    return config;
  }

  @Put()
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[ADMIN] Actualizar configuración de pagos' })
  async updateConfig(
    @Body() body: { bankName?: string; bankHolder?: string; bankAccount?: string; qrImageUrl?: string | null },
  ) {
    return this.prisma.storeConfig.upsert({
      where: { id: 'singleton' },
      update: body,
      create: { id: 'singleton', ...body },
    });
  }
}
