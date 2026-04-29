import { Order } from '../entities/order.entity';
import { OrderStatusValue } from '../value-objects/order-status.vo';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderListFilters {
  userId?: string;
  status?: OrderStatusValue;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findMany(
    filters: OrderListFilters,
    pagination: { skip?: number; take?: number },
  ): Promise<PaginatedOrders>;
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
}
