import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '@shared/application/decorators/current-user.decorator';
import { Roles } from '@shared/application/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/application/guards/roles.guard';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
} from '../../application/dtos/order.dtos';
import {
  CreateOrderFromCartUseCase,
  GetOrderByIdUseCase,
  GetUserOrdersUseCase,
  ListAllOrdersUseCase,
  UpdateOrderStatusUseCase,
} from '../../application/use-cases/order.use-cases';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderFromCartUseCase,
    private readonly getMyOrders: GetUserOrdersUseCase,
    private readonly getOrder: GetOrderByIdUseCase,
    private readonly updateStatus: UpdateOrderStatusUseCase,
    private readonly listAll: ListAllOrdersUseCase,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.createOrder.execute(user.userId, dto);
  }

  @Get('my')
  myOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.getMyOrders.execute(user.userId);
  }

  @Get(':id')
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getOrder.execute(id, user.userId, user.role);
  }

  @Roles('ADMIN')
  @Get()
  listAllOrders(@Query() query: { skip?: string; take?: string; status?: string }) {
    return this.listAll.execute(
      { status: query.status as any },
      {
        skip: query.skip ? parseInt(query.skip, 10) : 0,
        take: query.take ? parseInt(query.take, 10) : 20,
      },
    );
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateStatus.execute(id, dto);
  }
}
