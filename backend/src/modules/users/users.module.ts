import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@shared/infrastructure/auth/jwt.strategy';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { BcryptPasswordHasher } from '@shared/infrastructure/auth/bcrypt-password-hasher';
import { NestJwtTokenService } from '@shared/infrastructure/auth/nest-jwt-token-service';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port';
import { TOKEN_SERVICE } from './application/ports/token-service.port';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { UsersController } from './infrastructure/controllers/users.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';

/**
 * Módulo de Users.
 *
 * Aquí se hace el "wiring": inyectamos las implementaciones concretas
 * (PrismaUserRepository, BcryptPasswordHasher, etc.) bajo los Symbols
 * que los casos de uso esperan. Esto materializa la inversión de dependencias.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION', '7d') },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    JwtStrategy,
    PrismaService,
    // Use cases
    RegisterUserUseCase,
    LoginUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    // Adapters bajo sus Symbols (DIP)
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: NestJwtTokenService },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
