import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user.dtos';

/**
 * Mapeador de la entidad de dominio a DTO de respuesta.
 * Aísla la representación externa de la representación interna.
 */
export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      address: user.address,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
