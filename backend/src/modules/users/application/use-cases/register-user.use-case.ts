import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { PASSWORD_HASHER, PasswordHasher } from '../ports/password-hasher.port';
import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';
import { RegisterUserDto, UserResponseDto } from '../dtos/user.dtos';
import { UserMapper } from '../dtos/user.mapper';

/**
 * Caso de uso: Registrar un nuevo usuario.
 *
 * Reglas de negocio:
 *  - El email debe ser único en el sistema.
 *  - La contraseña se almacena hasheada.
 *  - Por defecto, los usuarios nuevos son CUSTOMER.
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(dto: RegisterUserDto): Promise<UserResponseDto> {
    const email = Email.create(dto.email);

    const existing = await this.userRepository.findByEmail(email.value);
    if (existing) {
      throw new BusinessRuleViolationException(
        `An account with email "${email.value}" already exists`,
      );
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const now = new Date();

    const user = User.create({
      id: uuidv4(),
      email,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      role: 'CUSTOMER',
      phone: dto.phone ?? null,
      address: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await this.userRepository.save(user);
    return UserMapper.toResponseDto(user);
  }
}
