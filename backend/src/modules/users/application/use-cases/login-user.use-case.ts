import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { PASSWORD_HASHER, PasswordHasher } from '../ports/password-hasher.port';
import { TOKEN_SERVICE, TokenService } from '../ports/token-service.port';
import { UnauthorizedDomainException } from '@shared/domain/exceptions/domain.exceptions';
import { AuthResponseDto, LoginUserDto } from '../dtos/user.dtos';
import { UserMapper } from '../dtos/user.mapper';

/**
 * Caso de uso: Iniciar sesión.
 *
 * Devuelve un token JWT y los datos del usuario.
 * Usa mensajes genéricos de error por seguridad (no revela si el email existe).
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedDomainException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedDomainException('Account is deactivated');
    }

    const valid = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedDomainException('Invalid credentials');
    }

    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email.value,
      role: user.role,
    });

    return {
      user: UserMapper.toResponseDto(user),
      accessToken,
    };
  }
}
