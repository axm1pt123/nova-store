import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '@modules/users/application/ports/password-hasher.port';

/**
 * Adaptador: implementación de PasswordHasher con bcrypt.
 * Si mañana queremos cambiar a argon2, sólo creamos otro adaptador.
 */
@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly SALT_ROUNDS = 10;

  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  compare(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
