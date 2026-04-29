import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '@modules/users/application/ports/token-service.port';
import { AuthenticatedUser } from '@shared/application/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'fallback-secret',
    });
  }

  /**
   * El valor que devuelve este método se inyecta en request.user.
   * Lo convertimos a AuthenticatedUser, que es la forma esperada en los controladores.
   */
  async validate(payload: TokenPayload): Promise<AuthenticatedUser> {
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
