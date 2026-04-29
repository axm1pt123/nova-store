import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AuthenticatedUser,
  CurrentUser,
} from '@shared/application/decorators/current-user.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { AddToCartDto, UpdateCartItemDto } from '../../application/dtos/cart.dtos';
import {
  AddToCartUseCase,
  ClearCartUseCase,
  GetCartUseCase,
  RemoveFromCartUseCase,
  UpdateCartItemUseCase,
} from '../../application/use-cases/cart.use-cases';

@ApiTags('Carrito')
@ApiBearerAuth('JWT')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly getCart: GetCartUseCase,
    private readonly addToCart: AddToCartUseCase,
    private readonly updateItem: UpdateCartItemUseCase,
    private readonly removeItem: RemoveFromCartUseCase,
    private readonly clearCart: ClearCartUseCase,
  ) {}

  @ApiOperation({ summary: 'Obtener carrito del usuario autenticado' })
  @Get()
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.getCart.execute(user.userId);
  }

  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @Post('items')
  add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddToCartDto) {
    return this.addToCart.execute(user.userId, dto);
  }

  @ApiOperation({ summary: 'Actualizar cantidad de un item del carrito' })
  @Patch('items/:productId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.updateItem.execute(user.userId, productId, dto);
  }

  @ApiOperation({ summary: 'Eliminar un item del carrito' })
  @Delete('items/:productId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.removeItem.execute(user.userId, productId);
  }

  @ApiOperation({ summary: 'Vaciar el carrito completo' })
  @Delete()
  clear(@CurrentUser() user: AuthenticatedUser) {
    return this.clearCart.execute(user.userId);
  }
}
