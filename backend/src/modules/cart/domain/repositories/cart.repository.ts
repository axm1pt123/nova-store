import { Cart } from '../entities/cart.entity';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  findById(id: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  /** Persistencia atómica del aggregate completo: items se sincronizan con el estado del cart */
  saveAggregate(cart: Cart): Promise<void>;
  delete(id: string): Promise<void>;
}
