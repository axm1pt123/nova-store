import { Money } from './money.vo';
import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

describe('Money', () => {
  describe('creation', () => {
    it('creates money from cents', () => {
      const m = Money.fromCents(1500, 'USD');
      expect(m.amountCents).toBe(1500);
      expect(m.currency).toBe('USD');
      expect(m.toDecimal()).toBe(15);
    });

    it('creates money from decimal', () => {
      const m = Money.fromDecimal(19.99);
      expect(m.amountCents).toBe(1999);
    });

    it('rejects non-integer cents', () => {
      expect(() => Money.fromCents(10.5)).toThrow(InvalidValueObjectException);
    });

    it('rejects negative amounts', () => {
      expect(() => Money.fromCents(-100)).toThrow(InvalidValueObjectException);
    });

    it('rejects invalid currency', () => {
      expect(() => Money.fromCents(100, 'DOLLARS')).toThrow(InvalidValueObjectException);
    });
  });

  describe('arithmetic', () => {
    it('adds amounts in same currency', () => {
      const result = Money.fromCents(1000).add(Money.fromCents(500));
      expect(result.amountCents).toBe(1500);
    });

    it('multiplies by integer factor', () => {
      const result = Money.fromCents(250).multiply(3);
      expect(result.amountCents).toBe(750);
    });

    it('rounds correctly when multiplying by decimal', () => {
      const result = Money.fromCents(333).multiply(1.5);
      expect(result.amountCents).toBe(500); // 499.5 → 500
    });

    it('rejects mixing currencies', () => {
      expect(() => Money.fromCents(100, 'USD').add(Money.fromCents(100, 'EUR'))).toThrow(
        InvalidValueObjectException,
      );
    });
  });

  describe('immutability', () => {
    it('does not mutate the original on add', () => {
      const a = Money.fromCents(1000);
      a.add(Money.fromCents(500));
      expect(a.amountCents).toBe(1000);
    });
  });
});
