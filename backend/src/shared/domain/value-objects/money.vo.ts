import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

/**
 * Value Object: Money
 *
 * Representa una cantidad monetaria de forma inmutable y segura.
 * Almacena valores en centavos (enteros) para evitar errores de punto flotante.
 *
 * Principios aplicados:
 *  - Inmutabilidad: cada operación retorna una nueva instancia.
 *  - Validación en construcción: imposible tener un Money inválido.
 *  - Encapsulación: la lógica monetaria vive aquí, no dispersa por el código.
 */
export class Money {
  private constructor(
    private readonly _amountCents: number,
    private readonly _currency: string,
  ) {}

  static fromCents(amountCents: number, currency = 'BOB'): Money {
    if (!Number.isInteger(amountCents)) {
      throw new InvalidValueObjectException('Amount in cents must be an integer');
    }
    if (amountCents < 0) {
      throw new InvalidValueObjectException('Amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new InvalidValueObjectException('Currency must be a 3-letter ISO code');
    }
    return new Money(amountCents, currency.toUpperCase());
  }

  static fromDecimal(amount: number, currency = 'BOB'): Money {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new InvalidValueObjectException('Amount must be a valid number');
    }
    return Money.fromCents(Math.round(amount * 100), currency);
  }

  static zero(currency = 'BOB'): Money {
    return Money.fromCents(0, currency);
  }

  get amountCents(): number {
    return this._amountCents;
  }

  get currency(): string {
    return this._currency;
  }

  toDecimal(): number {
    return this._amountCents / 100;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromCents(this._amountCents + other._amountCents, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromCents(this._amountCents - other._amountCents, this._currency);
  }

  multiply(factor: number): Money {
    if (typeof factor !== 'number' || factor < 0) {
      throw new InvalidValueObjectException('Factor must be a non-negative number');
    }
    return Money.fromCents(Math.round(this._amountCents * factor), this._currency);
  }

  equals(other: Money): boolean {
    return this._amountCents === other._amountCents && this._currency === other._currency;
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amountCents > other._amountCents;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new InvalidValueObjectException(
        `Cannot operate on different currencies: ${this._currency} vs ${other._currency}`,
      );
    }
  }
}
