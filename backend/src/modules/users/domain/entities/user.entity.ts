import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';
import { Email } from '../value-objects/email.vo';

export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de dominio: User
 *
 * Es una clase POJO sin dependencias de NestJS, Prisma, ni HTTP.
 * Toda la lógica del negocio relacionada al usuario vive aquí.
 * La validación se hace en construcción para garantizar invariantes.
 */
export class User {
  private constructor(private props: UserProps) {}

  static create(props: UserProps): User {
    User.validate(props);
    return new User({ ...props });
  }

  /** Reconstrucción desde persistencia (sin re-validar invariantes que ya fueron validados) */
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  private static validate(props: UserProps): void {
    if (!props.firstName || props.firstName.trim().length < 2) {
      throw new BusinessRuleViolationException('First name must be at least 2 characters');
    }
    if (!props.lastName || props.lastName.trim().length < 2) {
      throw new BusinessRuleViolationException('Last name must be at least 2 characters');
    }
    if (!props.passwordHash) {
      throw new BusinessRuleViolationException('Password hash is required');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get email(): Email { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get fullName(): string { return `${this.props.firstName} ${this.props.lastName}`; }
  get role(): UserRole { return this.props.role; }
  get phone(): string | null { return this.props.phone ?? null; }
  get address(): string | null { return this.props.address ?? null; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Comportamiento del dominio
  isAdmin(): boolean {
    return this.props.role === 'ADMIN';
  }

  deactivate(): void {
    if (!this.props.isActive) {
      throw new BusinessRuleViolationException('User is already inactive');
    }
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.isActive) {
      throw new BusinessRuleViolationException('User is already active');
    }
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  updateProfile(data: { firstName?: string; lastName?: string; phone?: string; address?: string }): void {
    if (data.firstName !== undefined) {
      if (data.firstName.trim().length < 2) {
        throw new BusinessRuleViolationException('First name must be at least 2 characters');
      }
      this.props.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      if (data.lastName.trim().length < 2) {
        throw new BusinessRuleViolationException('Last name must be at least 2 characters');
      }
      this.props.lastName = data.lastName.trim();
    }
    if (data.phone !== undefined) this.props.phone = data.phone;
    if (data.address !== undefined) this.props.address = data.address;
    this.props.updatedAt = new Date();
  }

  changePassword(newPasswordHash: string): void {
    if (!newPasswordHash) {
      throw new BusinessRuleViolationException('Password hash cannot be empty');
    }
    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
  }
}
