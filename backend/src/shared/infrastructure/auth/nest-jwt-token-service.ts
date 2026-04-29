import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenPayload,
  TokenService,
} from '@modules/users/application/ports/token-service.port';

/**
 * Adaptador: implementación de TokenService usando @nestjs/jwt.
 */
@Injectable()
export class NestJwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token);
  }
}
