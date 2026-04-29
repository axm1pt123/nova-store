import { InvalidValueObjectException } from '@shared/domain/exceptions/domain.exceptions';

/**
 * Value Object: Email
 * Garantiza que un email es válido en construcción.
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly _value: string) {}

  static create(value: string): Email {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException('Email is required');
    }
    const normalized = value.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(normalized)) {
      throw new InvalidValueObjectException(`Invalid email format: ${value}`);
    }
    return new Email(normalized);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
