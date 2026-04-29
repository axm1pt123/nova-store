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

  @Get()
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.getCart.execute(user.userId);
  }

  @Post('items')
  add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddToCartDto) {
    return this.addToCart.execute(user.userId, dto);
  }

  @Patch('items/:productId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.updateItem.execute(user.userId, productId, dto);
  }

  @Delete('items/:productId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.removeItem.execute(user.userId, productId);
  }

  @Delete()
  clear(@CurrentUser() user: AuthenticatedUser) {
    return this.clearCart.execute(user.userId);
  }
}
