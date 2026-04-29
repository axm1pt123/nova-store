import { Cart } from './cart.entity';
import { Money } from '@shared/domain/value-objects/money.vo';
import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';

describe('Cart', () => {
  function newCart(): Cart {
    const now = new Date();
    return Cart.create({
      id: 'cart-1',
      userId: 'user-1',
      currency: 'USD',
      createdAt: now,
      updatedAt: now,
    });
  }

  it('starts empty with total zero', () => {
    const cart = newCart();
    expect(cart.isEmpty()).toBe(true);
    expect(cart.itemCount()).toBe(0);
    expect(cart.total().amountCents).toBe(0);
  });

  it('adds items and computes total', () => {
    const cart = newCart();
    cart.addItem({
      id: 'item-1',
      productId: 'p1',
      quantity: 2,
      unitPrice: Money.fromCents(1000),
    });
    cart.addItem({
      id: 'item-2',
      productId: 'p2',
      quantity: 1,
      unitPrice: Money.fromCents(500),
    });

    expect(cart.itemCount()).toBe(3);
    expect(cart.total().amountCents).toBe(2500);
  });

  it('merges quantity when adding the same product twice', () => {
    const cart = newCart();
    const price = Money.fromCents(1000);
    cart.addItem({ id: 'a', productId: 'p1', quantity: 2, unitPrice: price });
    cart.addItem({ id: 'b', productId: 'p1', quantity: 3, unitPrice: price });

    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(5);
  });

  it('updates and removes items', () => {
    const cart = newCart();
    cart.addItem({
      id: 'a',
      productId: 'p1',
      quantity: 1,
      unitPrice: Money.fromCents(1000),
    });
    cart.updateItemQuantity('p1', 4);
    expect(cart.items[0].quantity).toBe(4);

    cart.removeItem('p1');
    expect(cart.isEmpty()).toBe(true);
  });

  it('rejects mixing currencies', () => {
    const cart = newCart();
    expect(() =>
      cart.addItem({
        id: 'x',
        productId: 'p',
        quantity: 1,
        unitPrice: Money.fromCents(100, 'EUR'),
      }),
    ).toThrow(BusinessRuleViolationException);
  });
});
