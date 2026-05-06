import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Param, ParseUUIDPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, CurrentUser } from '@shared/application/decorators/current-user.decorator';
import { Roles } from '@shared/application/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/application/guards/roles.guard';
import { CreateInStoreSaleDto, CreateOrderDto, SubmitPaymentProofDto, UpdateOrderStatusDto } from '../../application/dtos/order.dtos';
import {
  CreateInStoreSaleUseCase,
  CreateOrderFromCartUseCase,
  GetOrderByIdUseCase,
  GetUserOrdersUseCase,
  ListAllOrdersUseCase,
  SubmitPaymentProofUseCase,
  UpdateOrderStatusUseCase,
  VerifyPaymentUseCase,
} from '../../application/use-cases/order.use-cases';

@ApiTags('Órdenes')
@ApiBearerAuth('JWT')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderFromCartUseCase,
    private readonly getMyOrders: GetUserOrdersUseCase,
    private readonly getOrder: GetOrderByIdUseCase,
    private readonly updateStatus: UpdateOrderStatusUseCase,
    private readonly listAll: ListAllOrdersUseCase,
    private readonly submitProof: SubmitPaymentProofUseCase,
    private readonly verifyPayment: VerifyPaymentUseCase,
    private readonly inStoreSale: CreateInStoreSaleUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear orden desde el carrito (checkout)' })
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.createOrder.execute(user.userId, dto);
  }

  @ApiOperation({ summary: '[ADMIN] Registrar venta en tienda física (descuenta stock)' })
  @Roles('ADMIN')
  @Post('pos')
  @HttpCode(HttpStatus.CREATED)
  createInStoreSale(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateInStoreSaleDto) {
    return this.inStoreSale.execute(user.userId, dto);
  }

  @ApiOperation({ summary: 'Enviar comprobante de pago' })
  @Post(':id/payment-proof')
  submitPaymentProof(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitPaymentProofDto,
  ) {
    return this.submitProof.execute(id, user.userId, dto);
  }

  @ApiOperation({ summary: '[ADMIN] Aprobar o rechazar comprobante de pago' })
  @Roles('ADMIN')
  @Patch(':id/verify-payment')
  verifyPaymentProof(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { approve: boolean },
  ) {
    return this.verifyPayment.execute(id, body.approve);
  }

  @ApiOperation({ summary: 'Listar mis órdenes' })
  @Get('my')
  myOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.getMyOrders.execute(user.userId);
  }

  @ApiOperation({ summary: 'Obtener detalle de una orden' })
  @Get(':id')
  getById(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.getOrder.execute(id, user.userId, user.role);
  }

  @ApiOperation({ summary: '[ADMIN] Listar todas las órdenes' })
  @Roles('ADMIN')
  @Get()
  listAllOrders(@Query() query: { skip?: string; take?: string; status?: string }) {
    return this.listAll.execute(
      { status: query.status as any },
      { skip: query.skip ? parseInt(query.skip, 10) : 0, take: query.take ? parseInt(query.take, 10) : 20 },
    );
  }

  @ApiOperation({ summary: '[ADMIN] Cambiar estado de una orden' })
  @Roles('ADMIN')
  @Patch(':id/status')
  changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.updateStatus.execute(id, dto);
  }
}
