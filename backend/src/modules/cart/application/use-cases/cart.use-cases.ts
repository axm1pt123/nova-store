import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '@shared/domain/exceptions/domain.exceptions';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '@modules/products/domain/repositories/product.repository';
import { Cart } from '../../domain/entities/cart.entity';
import {
  CART_REPOSITORY,
  CartRepository,
} from '../../domain/repositories/cart.repository';
import {
  AddToCartDto,
  CartMapper,
  CartResponseDto,
  UpdateCartItemDto,
} from '../dtos/cart.dtos';

/**
 * Helper interno: obtiene el carrito del usuario o lo crea si no existe.
 * Encapsula la lógica de "lazy creation" para no repetirla en cada use case.
 */
async function getOrCreateCart(
  carts: CartRepository,
  userId: string,
  currency = 'BOB',
): Promise<Cart> {
  const existing = await carts.findByUserId(userId);
  if (existing) return existing;
  const now = new Date();
  const cart = Cart.create({
    id: uuidv4(),
    userId,
    currency,
    createdAt: now,
    updatedAt: now,
  });
  await carts.save(cart);
  return cart;
}

@Injectable()
export class GetCartUseCase {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  async execute(userId: string): Promise<CartResponseDto> {
    const cart = await getOrCreateCart(this.carts, userId);
    return CartMapper.toResponseDto(cart);
  }
}

@Injectable()
export class AddToCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(userId: string, dto: AddToCartDto): Promise<CartResponseDto> {
    const product = await this.products.findById(dto.productId);
    if (!product) throw new EntityNotFoundException('Product', dto.productId);
    if (!product.isAvailable()) {
      throw new BusinessRuleViolationException(
        `Product "${product.name}" is not available for purchase`,
      );
    }

    const cart = await getOrCreateCart(this.carts, userId, product.price.currency);

    // Validar stock considerando la cantidad ya en el carrito
    const existingItem = cart.findItemByProductId(product.id);
    const totalRequested = (existingItem?.quantity ?? 0) + dto.quantity;
    if (!product.hasEnoughStock(totalRequested)) {
      throw new BusinessRuleViolationException(
        `Not enough stock for "${product.name}". Available: ${product.stock}, requested: ${totalRequested}`,
      );
    }

    cart.addItem({
      id: uuidv4(),
      productId: product.id,
      quantity: dto.quantity,
      unitPrice: product.price,
    });

    await this.carts.saveAggregate(cart);
    return CartMapper.toResponseDto(cart);
  }
}

@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.carts.findByUserId(userId);
    if (!cart) throw new EntityNotFoundException('Cart', `userId=${userId}`);

    const product = await this.products.findById(productId);
    if (!product) throw new EntityNotFoundException('Product', productId);
    if (!product.hasEnoughStock(dto.quantity)) {
      throw new BusinessRuleViolationException(
        `Not enough stock. Available: ${product.stock}, requested: ${dto.quantity}`,
      );
    }

    cart.updateItemQuantity(productId, dto.quantity);
    await this.carts.saveAggregate(cart);
    return CartMapper.toResponseDto(cart);
  }
}

@Injectable()
export class RemoveFromCartUseCase {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  async execute(userId: string, productId: string): Promise<CartResponseDto> {
    const cart = await this.carts.findByUserId(userId);
    if (!cart) throw new EntityNotFoundException('Cart', `userId=${userId}`);
    cart.removeItem(productId);
    await this.carts.saveAggregate(cart);
    return CartMapper.toResponseDto(cart);
  }
}

@Injectable()
export class ClearCartUseCase {
  constructor(@Inject(CART_REPOSITORY) private readonly carts: CartRepository) {}

  async execute(userId: string): Promise<CartResponseDto> {
    const cart = await this.carts.findByUserId(userId);
    if (!cart) throw new EntityNotFoundException('Cart', `userId=${userId}`);
    cart.clear();
    await this.carts.saveAggregate(cart);
    return CartMapper.toResponseDto(cart);
  }
}
