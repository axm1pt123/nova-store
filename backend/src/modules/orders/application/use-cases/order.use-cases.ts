import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
  UnauthorizedDomainException,
} from '@shared/domain/exceptions/domain.exceptions';
import {
  CART_REPOSITORY,
  CartRepository,
} from '@modules/cart/domain/repositories/cart.repository';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '@modules/products/domain/repositories/product.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository';
import { Order, OrderItem } from '../../domain/entities/order.entity';
import {
  ORDER_REPOSITORY,
  OrderListFilters,
  OrderRepository,
} from '../../domain/repositories/order.repository';
import {
  NOTIFICATION_SERVICE,
  NotificationService,
} from '../ports/notification.port';
import {
  CreateOrderDto,
  OrderMapper,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from '../dtos/order.dtos';

/**
 * Caso de uso central del checkout: convertir el carrito en un pedido.
 *
 * Coordina múltiples agregados (Cart, Product, Order) y servicios externos
 * (notificaciones). Esto es típico de un caso de uso de aplicación.
 *
 * Flujo:
 *   1. Validar carrito no vacío
 *   2. Validar stock de cada producto
 *   3. Construir el Order (snapshot de precios y nombres)
 *   4. Descontar stock
 *   5. Limpiar carrito
 *   6. Persistir todo
 *   7. Disparar notificación (no bloqueante para el éxito del pedido)
 */
@Injectable()
export class CreateOrderFromCartUseCase {
  private readonly logger = new Logger(CreateOrderFromCartUseCase.name);

  constructor(
    @Inject(CART_REPOSITORY) private readonly carts: CartRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(NOTIFICATION_SERVICE) private readonly notifications: NotificationService,
  ) {}

  async execute(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const cart = await this.carts.findByUserId(userId);
    if (!cart || cart.isEmpty()) {
      throw new BusinessRuleViolationException('Cannot create order: cart is empty');
    }

    // Cargar productos y validar stock + construir items con snapshots
    const orderItems: OrderItem[] = [];
    const productsToUpdate = [];

    for (const cartItem of cart.items) {
      const product = await this.products.findById(cartItem.productId);
      if (!product) {
        throw new EntityNotFoundException('Product', cartItem.productId);
      }
      if (!product.hasEnoughStock(cartItem.quantity)) {
        throw new BusinessRuleViolationException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${cartItem.quantity}`,
        );
      }

      orderItems.push(
        OrderItem.create({
          id: uuidv4(),
          productId: product.id,
          productName: product.name,
          quantity: cartItem.quantity,
          unitPrice: product.price,
        }),
      );

      product.decreaseStock(cartItem.quantity);
      productsToUpdate.push(product);
    }

    const order = Order.create({
      id: uuidv4(),
      userId,
      items: orderItems,
      shippingAddress: dto.shippingAddress,
    });

    // Persistencia (en un escenario real, envolver en una transacción de aplicación)
    await this.orders.save(order);
    await Promise.all(productsToUpdate.map((p) => this.products.update(p)));
    cart.clear();
    await this.carts.saveAggregate(cart);

    // Notificación (errores no deben tumbar el pedido)
    this.sendConfirmationSafely(userId, order).catch((err) =>
      this.logger.error(`Failed to send order confirmation: ${err.message}`),
    );

    return OrderMapper.toResponseDto(order);
  }

  private async sendConfirmationSafely(userId: string, order: Order): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) return;
    await this.notifications.sendOrderConfirmation({
      toEmail: user.email.value,
      customerName: user.fullName,
      orderId: order.id,
      totalDecimal: order.total.toDecimal(),
      currency: order.total.currency,
    });
  }
}

@Injectable()
export class GetUserOrdersUseCase {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  async execute(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orders.findByUserId(userId);
    return orders.map(OrderMapper.toResponseDto);
  }
}

@Injectable()
export class GetOrderByIdUseCase {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  /**
   * Si requesterRole es CUSTOMER, sólo puede ver sus propios pedidos.
   * Los ADMIN ven cualquier pedido.
   */
  async execute(
    orderId: string,
    requesterId: string,
    requesterRole: 'ADMIN' | 'CUSTOMER',
  ): Promise<OrderResponseDto> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new EntityNotFoundException('Order', orderId);

    if (requesterRole !== 'ADMIN' && order.userId !== requesterId) {
      throw new UnauthorizedDomainException('You cannot access this order');
    }
    return OrderMapper.toResponseDto(order);
  }
}

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(NOTIFICATION_SERVICE) private readonly notifications: NotificationService,
  ) {}

  async execute(orderId: string, dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new EntityNotFoundException('Order', orderId);

    order.markAs(dto.status);
    await this.orders.update(order);

    const user = await this.users.findById(order.userId);
    if (user) {
      this.notifications
        .sendOrderStatusChanged({
          toEmail: user.email.value,
          orderId: order.id,
          newStatus: order.status.value,
        })
        .catch(() => undefined);
    }

    return OrderMapper.toResponseDto(order);
  }
}

@Injectable()
export class ListAllOrdersUseCase {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository) {}

  async execute(filters: OrderListFilters, pagination: { skip?: number; take?: number }) {
    const { items, total } = await this.orders.findMany(filters, pagination);
    return {
      items: items.map(OrderMapper.toResponseDto),
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }
}
