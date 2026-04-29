import { User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';

/**
 * Mapper entre el modelo de Prisma y la entidad de dominio.
 * Es el "anti-corruption layer" entre persistencia y dominio.
 */
export class UserPersistenceMapper {
  static toDomain(raw: PrismaUser): User {
    return User.reconstitute({
      id: raw.id,
      email: Email.create(raw.email),
      passwordHash: raw.passwordHash,
      firstName: raw.firstName,
      lastName: raw.lastName,
      role: raw.role,
      phone: raw.phone,
      address: raw.address,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(user: User): Omit<PrismaUser, never> {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      address: user.address,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
